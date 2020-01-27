import React from 'react';
import { COLORS } from '../../../util/constants';

export default props => {
    const { radius, segments, rings } = props;
    const arr = new Array(rings).fill(0);
    return (
        <g>
            {arr.map((_, i) => (
                <circle cx={radius} cy={radius} r={(radius / rings) * (i + 1)} stroke={COLORS.BLUE} fill="none" />
            ))}
        </g>
    );
};
