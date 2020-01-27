import React from 'react';
import { Line, Vline, Hline, Group } from '../../components';
import { COLORS } from '../../../util';

const UNIT_LINE_OPACITY = 1;
const DIVISION_LINE_OPACITY = 0.3;
const UNIT_LINE_COLOR = COLORS.BLUE;
const DIVISION_LINE_COLOR = COLORS.BLUE;

export function TriGridLines(props) {
    const { gridUnit, xUnits, yUnits, height, width, divisions } = props;
    const lines = [];
    for (let i = 0; i <= Math.max(xUnits, yUnits); i++) {
        for (let j = 0; j < divisions; j++) {
            if (i < xUnits && j)
                if (i < yUnits && j)
                    // lines.push(
                    //     <Vline key={lines.length} x={i * gridUnit + (j * gridUnit) / divisions} y={0} opacity={DIVISION_LINE_OPACITY} color={DIVISION_LINE_COLOR} length={height} />
                    // );
                    lines.push(
                        <Hline key={lines.length} x={0} y={i * gridUnit + (j * gridUnit) / divisions} opacity={DIVISION_LINE_OPACITY} color={DIVISION_LINE_COLOR} length={width} />
                    );
        }
        // if (i <= yUnits) lines.push(<Hline key={lines.length} y={i * gridUnit} x={0} color={UNIT_LINE_COLOR} length={width} opacity={UNIT_LINE_OPACITY} />);
        // if (i <= xUnits) lines.push(<Vline key={lines.length} x={i * gridUnit} y={0} color={UNIT_LINE_COLOR} length={height} opacity={UNIT_LINE_OPACITY} />);
    }

    // lines.push(
    //     <Hline key={lines.length} y={height / 2} x={0} color={COLORS.RED} length={width} />,
    // <Vline key={lines.length + 1} x={width / 2} y={0} color={COLORS.RED} length={height} />
    // );

    return <Group>{lines}</Group>;
}

export default function TriGrid(props) {
    const [xUnits, yUnits, gridUnit = 20, divisions = 1, offsetX = 0, offsetY = 0] = props.args;
    const width = xUnits * gridUnit;
    const height = yUnits * gridUnit;
    const newProps = {
        width,
        height,
        gridUnit,
        xUnits,
        yUnits,
        divisions,
        offsetX,
        offsetY,
    };

    consoe.log('TRI GRID PROPS', newProps);

    return (
        <svg className="background-svg" height={height} width={width} background="teal">
            <g transform={`translate(${offsetX}, ${offsetY})`}>
                <TriGridLines {...newProps} />
            </g>
        </svg>
    );
}
