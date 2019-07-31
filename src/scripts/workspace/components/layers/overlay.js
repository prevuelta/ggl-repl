import React, { Component } from 'react';
// import { POINT_TYPES } from '../../../util/constants';
import { getDistance } from '../../../util/trig';
import { Node, Cross } from '../overlayHelperShapes';
import { getArcEndpoint } from '../../../util/parser';
const { Fragment } = React;

const OverlayLayer = props => {
    let { height, width, lexed: tokens } = props;
    let currentValue = [0, 0];
    const points = tokens.reduce((array, token) => {
        let point = {};
        if (token.name === 'point') {
            currentValue = token.args;
            point.x = currentValue[0];
            point.y = currentValue[1];
        } else if (token.name === 'vector') {
            currentValue = currentValue.map((v, i) => v + token.args[i]);
            point.x = currentValue[0];
            point.y = currentValue[1];
        } else if (token.name === 'rotate') {
            if (token.args.length === 3) {
                point.x = token.args[1];
                point.y = token.args[2];
                point.type = 'cross';
                point.color = 'red';
            }
        } else if (token.name === 'corner') {
            currentValue = token.args;
            point.x = currentValue[0];
            point.y = currentValue[1];
            point.color = 'teal';
        } else if (token.name === 'arc') {
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
        return [...array, ...(Array.isArray(point) ? point : [point])];
    }, []);

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
                {point.type === 'node' && (
                    <Node key={i} location={point} color={point.color} />
                )}
                {point.type === 'cross' && (
                    <Cross location={point} color={point.color} size={10} />
                )}
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
