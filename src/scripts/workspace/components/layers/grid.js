import React from 'react';
import { Line, Vline, Hline } from '../../components';
import { Group } from '../../components';
import { COLORS, POINT_TYPES } from '../../../util/constants';
import WorkspaceUtil from '../../workspaceUtil';

export function GridLines(props) {
    const { gridUnit, xUnits, yUnits, height, width, divisions } = props;
    const lines = [];
    for (let i = 0; i <= Math.max(xUnits, yUnits); i++) {
        for (let j = 0; j < divisions; j++) {
            if (i < xUnits)
                lines.push(
                    <Vline
                        key={lines.length}
                        x={i * gridUnit + (j * gridUnit) / divisions}
                        opacity={0.2}
                        color={COLORS.BLUE}
                        length={height}
                    />
                );
            if (i < yUnits)
                lines.push(
                    <Hline
                        key={lines.length}
                        y={i * gridUnit + (j * gridUnit) / divisions}
                        opacity={0.2}
                        color={COLORS.BLUE}
                        length={width}
                    />
                );
        }
        if (i <= yUnits)
            lines.push(
                <Hline
                    key={lines.length}
                    y={i * gridUnit}
                    color={COLORS.BLUE}
                    length={width}
                />
            );
        if (i <= xUnits)
            lines.push(
                <Vline
                    key={lines.length}
                    x={i * gridUnit}
                    color={COLORS.BLUE}
                    length={height}
                />
            );
    }

    lines.push(
        <Hline
            key={lines.length}
            y={height / 2}
            color={COLORS.RED}
            length={width}
        />,
        <Vline
            key={lines.length + 1}
            x={width / 2}
            color={COLORS.RED}
            length={height}
        />
    );

    return <Group>{lines}</Group>;
}

export default function GridLayer(props) {
    const { height, width } = props;
    return (
        <svg className="background-svg" height={height} width={width}>
            <GridLines {...props} />
        </svg>
    );
}
