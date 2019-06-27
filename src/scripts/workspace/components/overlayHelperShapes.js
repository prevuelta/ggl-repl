import React from 'react';
import { COLORS } from '../../util/constants';

export const Node = props => {
    const { location, size = 5 } = props;
    return (
        <path
            className="node"
            x={location[0] - size / 2}
            y={location[1] - size / 2}
            width={size}
            height={size}
            fill={COLORS.BLUE}
        />
    );
};
