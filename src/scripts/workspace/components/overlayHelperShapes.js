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
