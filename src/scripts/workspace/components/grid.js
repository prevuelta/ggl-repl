import React from 'react';
import { Line, Vline, Hline, Group } from '../components';
import { COLORS } from '../../util';
import { withRune } from '../../hocs';
import WorkspaceUtil from '../workspaceUtil';

const UNIT_LINE_OPACITY = 1;
const DIVISION_LINE_OPACITY = 0.3;
const UNIT_LINE_COLOR = COLORS.BLUE;
const DIVISION_LINE_COLOR = COLORS.BLUE;

export function GridLines(props) {
    const { gridUnit, xUnits, yUnits, height, width, divisions, padding } = props;
    const lines = [];
    for (let i = 0; i <= Math.max(xUnits, yUnits); i++) {
        for (let j = 0; j < divisions; j++) {
            if (i < xUnits && j)
                lines.push(
                    <Vline
                        key={lines.length}
                        x={i * gridUnit + (j * gridUnit) / divisions + padding}
                        y={padding}
                        opacity={DIVISION_LINE_OPACITY}
                        color={DIVISION_LINE_COLOR}
                        length={height}
                    />
                );
            if (i < yUnits && j)
                lines.push(
                    <Hline
                        key={lines.length}
                        x={padding}
                        y={i * gridUnit + (j * gridUnit) / divisions + padding}
                        opacity={DIVISION_LINE_OPACITY}
                        color={DIVISION_LINE_COLOR}
                        length={width}
                    />
                );
        }
        if (i <= yUnits) lines.push(<Hline key={lines.length} y={i * gridUnit + padding} x={padding} color={UNIT_LINE_COLOR} length={width} opacity={UNIT_LINE_OPACITY} />);
        if (i <= xUnits) lines.push(<Vline key={lines.length} x={i * gridUnit + padding} y={padding} color={UNIT_LINE_COLOR} length={height} opacity={UNIT_LINE_OPACITY} />);
    }

    console.log('Should happen once');
    lines.push(
        <Hline key={lines.length} y={height / 2 + padding} x={padding} color={COLORS.RED} length={width} />,
        <Vline key={lines.length + 1} x={width / 2 + padding} y={padding} color={COLORS.RED} length={height} />
    );

    return <Group>{lines}</Group>;
}

export default function Grid(props) {
    const { height, width, padding } = props;
    return (
        <svg className="background-svg" height={height + padding * 2} width={width + padding * 2} background="teal">
            {padding && <rect stroke="#ff00ff" fill="none" x={0} y={0} width={width + padding * 2} height={height + padding * 2} strokeDasharray="2 2" />}
            <GridLines {...props} />
        </svg>
    );
}

export function GridContainer(props) {
    const [xUnits, yUnits, gridUnit = 20, divisions = 1, padding = 0] = props.args;
    const width = xUnits * gridUnit;
    const height = yUnits * gridUnit;
    const newProps = {
        width,
        height,
        gridUnit,
        xUnits,
        yUnits,
        divisions,
        padding,
    };
    return <Grid {...newProps} />;
}
