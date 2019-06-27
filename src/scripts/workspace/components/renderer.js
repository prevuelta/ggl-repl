import React, { useState } from 'react';

import { GridLines } from './layers/grid';
// import {Group, Point} from '.';
import { COLORS, POINT_TYPES } from '../../util/constants';
// import { Overlay } from './layers';
import { Data } from '../../data';

const SLUG = 20;

const POINT_TYPE_STRING = {
    [POINT_TYPES.STRAIGHT]: (mX, mY) => `L ${mX} ${mY}`,
    [POINT_TYPES.ARC]: (mX, mY) => `A 50 50 0 0 1 ${mX} ${mY}`,
};

function GridLayer(props) {
    const { height, width } = props;
    return (
        <svg className="background-svg" height={height} width={width}>
            <GridLines {...props} />
        </svg>
    );
}

function RenderLayer(props) {
    const { height, width, elements } = props;

    let stroke;

    function _mouseEnter() {
        console.log('Path hover');
        stroke = 3;
    }

    return (
        <svg className="renderer-svg" height={height} width={width}>
            {elements.map((Element, i) => (
                <Element key={i} />
            ))}
        </svg>
    );
}

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
            </div>
        </div>
    );
}

// <RenderLayer {...size} paths={paths} />
// {!proofView && (
//   <OverlayLayer {...size} rune={rune} currentPath={currentPath} />
// )}

export default Renderer;
