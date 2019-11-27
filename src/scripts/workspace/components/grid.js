import React from 'react';
import { Line, Vline, Hline, Group } from '../components';
import { COLORS } from '../../util';
import { withRune } from '../../hocs';
import WorkspaceUtil from '../workspaceUtil';

export function GridLines(props) {
    const { gridUnit, xUnits, yUnits, height, width, divisions, padding } = props;
    console.log('Padding', padding);
    const newHeight = height - padding * 2;
    const newWidth = width - padding * 2;
    const lines = [];
    for (let i = 0; i <= Math.max(xUnits, yUnits); i++) {
        for (let j = 0; j < divisions; j++) {
            if (i < xUnits) lines.push(<Vline key={lines.length} x={i * gridUnit + (j * gridUnit) / divisions} opacity={0.2} color={COLORS.BLUE} length={newHeight} />);
            if (i < yUnits) lines.push(<Hline key={lines.length} y={i * gridUnit + (j * gridUnit) / divisions} opacity={0.2} color={COLORS.BLUE} length={width} />);
        }
        // if (i <= yUnits) lines.push(<Hline key={lines.length} y={i * gridUnit - padding} color={COLORS.BLUE} length={newWidth} />);
        // if (i <= xUnits) lines.push(<Vline key={lines.length} x={i * gridUnit - padding} color={COLORS.BLUE} length={newHeight} />);
    }

    console.log('Should happen once');
    lines.push(
        <Hline key={lines.length} y={newHeight / 2 - padding} color={COLORS.RED} length={newWidth} />,
        <Vline key={lines.length + 1} x={newWidth / 2 - padding * 2} color={COLORS.RED} length={newHeight} />
    );

    return <Group>{lines}</Group>;
}

export default function Grid(props) {
    const { height, width } = props;
    return (
        <svg className="background-svg" height={height} width={width}>
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
