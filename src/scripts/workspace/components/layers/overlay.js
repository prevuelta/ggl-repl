import React, { Component } from 'react';
// import { POINT_TYPES } from '../../../util/constants';
import { getDistance } from '../../../util/trig';
import { Node } from '../overlayHelperShapes';
const { Fragment } = React;

// const pointStrings = {
//     [POINT_TYPES.STRAIGHT]: (mX, mY) => `L ${mX} ${mY}`,
//     [POINT_TYPES.ARC]: (mX, mY) => `A 50 50 0 0 1 ${mX} ${mY}`,
// };

const OverlayLayer = props => {
    let { height, width, lexed } = props;
    let currentValue = [0, 0];
    const paths = lexed.filter(g => g.type === 'path');
    const points = paths.reduce((array1, newGroup) => {
        const reduced = newGroup.tokens
            .filter(t => ['vector', 'point', 'arc'].includes(t.type))
            .reduce((array2, token) => {
                let point = {};
                console.log('Token', token);
                if (token.type === 'point') {
                    currentValue = token.args;
                    point.x = currentValue[0];
                    point.y = currentValue[1];
                } else if (token.type === 'vector') {
                    currentValue = currentValue.map(
                        (v, i) => v + token.args[i]
                    );
                    point.x = currentValue[0];
                    point.y = currentValue[1];
                } else if (token.type === 'arc') {
                    currentValue = [token.args[0], token.args[1]];
                    const start = { x: token.args[0], y: token.args[1] };
                    const center = { x: token.args[2], y: token.args[3] };
                    const radius = getDistance(start, center);
                    point = [
                        {
                            ...start,
                            color: 'orange',
                        },
                        {
                            ...center,
                            circle: {
                                ...center,
                                radius,
                            },
                            color: 'pink',
                        },
                    ];
                }
                return [...array2, ...(Array.isArray(point) ? point : [point])];
            }, []);
        return [...array1, ...reduced];
    }, []);

    console.log('POints', points);

    const elements = [
        ...points.map((point, i) => (
            <Fragment>
                {point.circle && (
                    <circle
                        cx={point.circle.x}
                        cy={point.circle.y}
                        r={point.circle.radius}
                        fill="none"
                        stroke="red"
                        opacity="0.2"
                    />
                )}
                <Node key={i} location={point} color={point.color} />
            </Fragment>
        )),
    ];

    return (
        <svg id="overlay" height={height} width={width}>
            {elements}
        </svg>
    );
};

export default OverlayLayer;
