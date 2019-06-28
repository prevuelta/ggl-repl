import React, { Component } from 'react';
// import { POINT_TYPES } from '../../../util/constants';
import { Node } from '../overlayHelperShapes';

// const pointStrings = {
//     [POINT_TYPES.STRAIGHT]: (mX, mY) => `L ${mX} ${mY}`,
//     [POINT_TYPES.ARC]: (mX, mY) => `A 50 50 0 0 1 ${mX} ${mY}`,
// };

const OverlayLayer = props => {
    let { height, width, points } = props;

    return (
        <svg id="overlay" height={height} width={width}>
            {points.map((point, i) => (
                <Node key={i} location={point} />
            ))}
        </svg>
    );
};

export default OverlayLayer;
