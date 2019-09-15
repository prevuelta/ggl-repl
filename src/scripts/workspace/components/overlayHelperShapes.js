import React from 'react';
import { COLORS } from '../../util/constants';

export const Node = props => {
    const { x, y, size = 5, color = COLORS.BLUE } = props;
    return (
        <rect
            className="node"
            x={x - size / 2}
            y={y - size / 2}
            width={size}
            height={size}
            fill={color}
            stroke="none"
        />
    );
};

export const Cross = props => {
    const { x, y, size = 5, color = COLORS.RED } = props;
    return (
        <g stroke={color} opacity="0.5" transform={`rotate(45, ${x} ${y})`}>
            <line
                x1={x}
                x2={x}
                y1={y - size / 2}
                y2={y + size / 2}
                fill="none"
            />
            <line
                x1={x - size / 2}
                x2={x + size / 2}
                y1={y}
                y2={y}
                fill="none"
            />
        </g>
    );
};
