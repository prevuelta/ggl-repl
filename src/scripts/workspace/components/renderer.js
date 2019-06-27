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
    const { rune } = props;
    const height = rune.y * rune.gridUnit;
    const width = rune.x * rune.gridUnit;
    const verticalPadding = height / rune.y / 2;
    const horizontalPadding = width / rune.x / 2;

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
                <GridLayer width={width} height={height} rune={rune} />
                <RenderLayer
                    width={width}
                    height={height}
                    elements={props.elements}
                />
                <OverlayLayer
                    width={width}
                    height={height}
                    lexed={props.lexed}
                />
            </div>
        </div>
    );
}

export default Renderer;
