import React from 'react';
import { COLORS } from '../../../util/constants';
import { Cross } from '../overlayHelperShapes';

export default props => {
    const { radius, segments, rings, offset } = props;
    const arr = new Array(rings).fill(0);
    const angleInc = (Math.PI * 2) / segments;
    return (
        <g>
            {arr.map((_, i) => {
                let angle = offset || 0;
                const ringRadius = (radius / rings) * (i + 1);
                const segmentArr = new Array(segments).fill(0).map(e => {
                    const x = Math.cos(angle) * ringRadius + radius;
                    const y = Math.sin(angle) * ringRadius + radius;
                    angle += angleInc;
                    return [x, y];
                });

                return (
                    <>
                        <circle cx={radius} cy={radius} r={ringRadius} stroke={COLORS.BLUE} fill="none" />
                        {segmentArr.map(s => (
                            <Cross x={s[0]} y={s[1]} color={COLORS.BLUE} />
                        ))}
                    </>
                );
            })}
        </g>
    );
};
