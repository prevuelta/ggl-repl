import React, { Component } from 'react';
// import { POINT_TYPES } from '../../../util/constants';
import { Node } from '../overlayHelperShapes';

// const pointStrings = {
//     [POINT_TYPES.STRAIGHT]: (mX, mY) => `L ${mX} ${mY}`,
//     [POINT_TYPES.ARC]: (mX, mY) => `A 50 50 0 0 1 ${mX} ${mY}`,
// };

const OverlayLayer = props => {
    let { height, width, lexed} = props;
    let currentValue = [0, 0];
    const points = lexed
        .filter(g => g.type === 'path')
        .reduce((array1, newGroup) => {
            const reduced = newGroup.tokens
                .filter(t => ['vector', 'point'].includes(t.type))
                .reduce((array2, token) => {
                    if (token.type === 'point') {
                        currentValue = token.args;
                    } else if (token.type === 'vector') {
                        currentValue = currentValue.map(
                            (v, i) => v + token.args[i]
                        );
                    } else if (token.tupe === 'arc'){
                      currentValue = [token.args[0], token.args[1]];
                    }
                    return [...array2, currentValue];
                }, []);
            return [...array1, ...reduced];
        }, []);

    return (
        <svg id="overlay" height={height} width={width}>
            {points.map((point, i) => (
                <Node key={i} location={point} />
            ))}
        </svg>
    );
};

export default OverlayLayer;
