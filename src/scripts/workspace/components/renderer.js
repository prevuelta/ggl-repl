import React, { useState } from 'react';

import { COLORS, POINT_TYPES } from '../../util/constants';
import { OverlayLayer, GridLayer, RenderLayer } from './layers';
import { Data } from '../../data';

const SLUG = 20;

const POINT_TYPE_STRING = {
    [POINT_TYPES.STRAIGHT]: (mX, mY) => `L ${mX} ${mY}`,
    [POINT_TYPES.ARC]: (mX, mY) => `A 50 50 0 0 1 ${mX} ${mY}`,
};

function Renderer(props) {
    const { rune, lexed } = props;
    const height = rune.y * rune.gridUnit;
    const width = rune.x * rune.gridUnit;
    const verticalPadding = height / rune.y / 2;
    const horizontalPadding = width / rune.x / 2;

    console.log(lexed);

    let currentValue = [0, 0];
    const points = lexed.reduce((array1, newGroup) => {
        const reduced = newGroup.tokens
            .filter(t => ['vector', 'point'].includes(t.type))
            .reduce((array2, token) => {
                if (token.type === 'point') {
                    currentValue = token.args;
                } else if (token.type === 'vector') {
                    currentValue = currentValue.map(
                        (v, i) => v + token.args[i]
                    );
                }
                return [...array2, currentValue];
            }, []);
        return [...array1, ...reduced];
    }, []);

    return (
        <div className="renderer">
            <div
                className="canvas"
                style={{
                    width,
                    height,
                    padding: `${verticalPadding}px ${horizontalPadding}px`,
                }}>
                <p className="canvas-label">
                    {rune.name}{' '}
                    <span className="canvas-size">
                        ({rune.x}x{rune.y})
                    </span>
                </p>
                <GridLayer
                    width={width}
                    height={height}
                    gridUnit={rune.gridUnit}
                    xUnits={rune.x}
                    yUnits={rune.y}
                    divisions={rune.divisions}
                />
                <RenderLayer
                    width={width}
                    height={height}
                    elements={props.elements}
                />
                <OverlayLayer width={width} height={height} points={points} />
            </div>
        </div>
    );
}

export default Renderer;
