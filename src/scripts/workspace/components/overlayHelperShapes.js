import React from 'react';
import { COLORS } from '../../util/constants';

export const Node = props => {
    const { location, size = 5, color = COLORS.BLUE } = props;
    return (
        <rect
            className="node"
            x={location.x - size / 2}
            y={location.y - size / 2}
            width={size}
            height={size}
            fill={color}
        />
    );
};

export const Cross = props => {
    const { location, size = 5, color = COLORS.BLUE } = props;
    return (
        <g stroke={color} transform={`rotate(45, ${location.x} ${location.y})`}>
            <line
                x1={location.x}
                x2={location.x}
                y1={location.y - size / 2}
                y2={location.y + size / 2}
                fill="none"
            />
            <line
                x1={location.x - size / 2}
                x2={location.x + size / 2}
                y1={location.y}
                y2={location.y}
                fill="none"
            />
        </g>
    );
};
