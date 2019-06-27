import React from 'react';
import { Line, Vline, Hline } from '../../components';
import { Group } from '../../components';
import { COLORS, POINT_TYPES } from '../../../util/constants';
import WorkspaceUtil from '../../workspaceUtil';

export function GridLines(props) {
    const {
        rune: { gridUnit, x: tX, y: tY },
        height,
        width,
    } = props;
    const lines = [];
    for (let i = 0; i <= Math.max(tX, tY); i++) {
        for (let j = 0; j < 5; j++) {
            if (i < tX)
                lines.push(
                    <Vline
                        key={lines.length}
                        x={i * gridUnit + (j * gridUnit) / 5}
                        opacity={0.2}
                        color={COLORS.BLUE}
                        length={height}
                    />
                );
            if (i < tY)
                lines.push(
                    <Hline
                        key={lines.length}
                        y={i * gridUnit + (j * gridUnit) / 5}
                        opacity={0.2}
                        color={COLORS.BLUE}
                        length={width}
                    />
                );
        }
        if (i <= tY)
            lines.push(
                <Hline
                    key={lines.length}
                    y={i * gridUnit}
                    color={COLORS.BLUE}
                    length={width}
                />
            );
        if (i <= tX)
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
