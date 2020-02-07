import React from 'react';
import { pathCommands, tokenNames } from '../lexer/commands';
import { mapChildren } from '../../util';
import { radToDeg } from '../../util';

const { REFLECT, ROTATE, SCALE, TRANSLATE } = tokenNames;

export default {
    [TRANSLATE]: ({ token }, children = []) => props => {
        const [x = 0, y = 0] = token.args;
        return (
            <g transform={`translate(${x} ${y})`}>
                {children.map(Child => (
                    <Child />
                ))}
            </g>
        );
    },
    [SCALE]: ({ token }, children = []) => props => {
        const [scaleX, scaleY] = token.args;
        return (
            <g transform={`scale(${scaleX} ${scaleY || scaleX})`}>
                {children.map(Child => (
                    <Child />
                ))}
            </g>
        );
    },
    [ROTATE]: ({ token }, children = []) => props => {
        const [angle, x = 0, y = 0] = token.args;
        return (
            <g transform={`rotate(${radToDeg(token.args[0])} ${x} ${y})`}>
                {children.map(Child => (
                    <Child />
                ))}
            </g>
        );
    },
    [REFLECT]: ({ token }, children = []) => props => {
        const [distance] = token.args;
        const axis = token.data;
        const scale = { x: '1, -1', y: '-1, 1' }[axis];
        const distancePx = `${distance}px`;
        const origin = `${axis === 'y' ? distancePx : '0'} ${
            axis === 'x' ? distancePx : '0'
        }`;

        return (
            <>
                <g transform={`scale(${scale})`} transform-origin={origin}>
                    {children.map(Child => (
                        <Child />
                    ))}
                </g>
                {mapChildren(children)}
            </>
        );
    },
};
