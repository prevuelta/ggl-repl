import React from 'react';
import { Line, Vline, Hline, Group } from '../components';
import { COLORS } from '../../util';
import { withRune } from '../../hocs';
import WorkspaceUtil from '../workspaceUtil';

export function GridLines(props) {
    const { gridUnit, xUnits, yUnits, height, width, divisions } = props;
    const lines = [];
    for (let i = 0; i <= Math.max(xUnits, yUnits); i++) {
        for (let j = 0; j < divisions; j++) {
            if (i < xUnits) lines.push(<Vline key={lines.length} x={i * gridUnit + (j * gridUnit) / divisions} opacity={0.2} color={COLORS.BLUE} length={height} />);
            if (i < yUnits) lines.push(<Hline key={lines.length} y={i * gridUnit + (j * gridUnit) / divisions} opacity={0.2} color={COLORS.BLUE} length={width} />);
        }
        if (i <= yUnits) lines.push(<Hline key={lines.length} y={i * gridUnit} color={COLORS.BLUE} length={width} />);
        if (i <= xUnits) lines.push(<Vline key={lines.length} x={i * gridUnit} color={COLORS.BLUE} length={height} />);
    }

    lines.push(<Hline key={lines.length} y={height / 2} color={COLORS.RED} length={width} />, <Vline key={lines.length + 1} x={width / 2} color={COLORS.RED} length={height} />);

    return <Group>{lines}</Group>;
}

export default function Grid(props) {
    const { height, width, rune } = props;
    const padding = rune ? rune.padding : 0;
    return (
        <svg className="background-svg" height={height} width={width}>
            <GridLines {...props} />
            <rect stroke="#ff0000" fill="blue" opacity="0.2" x={0} y={0} width={width + padding * 2} height={height + padding * 2} />
        </svg>
    );
}

const GridWithRune = withRune(Grid);

export function GridContainer(props) {
    const [xUnits, yUnits, gridUnit = 20, divisions = 1] = props.args;
    const width = xUnits * gridUnit;
    const height = yUnits * gridUnit;
    return <GridWithRune width={width} height={height} gridUnit={gridUnit} xUnits={xUnits} yUnits={yUnits} divisions={divisions} />;
}
