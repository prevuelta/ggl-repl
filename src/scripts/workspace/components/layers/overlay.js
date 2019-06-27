import React, { Component } from 'react';
// import { POINT_TYPES } from '../../../util/constants';
import { Node } from '../overlayHelperShapes';

// const pointStrings = {
//     [POINT_TYPES.STRAIGHT]: (mX, mY) => `L ${mX} ${mY}`,
//     [POINT_TYPES.ARC]: (mX, mY) => `A 50 50 0 0 1 ${mX} ${mY}`,
// };

const OverlayLayer = props => {
    let { height, width, lexed } = props;
    console.log(lexed);

    return (
        <svg id="overlay" height={height} width={width}>
            {lexed.map(tokenGroup =>
                tokenGroup.tokens.map((token, i) => {
                    if (token.type === 'point') {
                        return <Node key={i} location={token.arg} />;
                    }
                })
            )}
        </svg>
    );
};

export default OverlayLayer;
