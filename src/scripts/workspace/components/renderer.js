import React, { useState } from 'react';
import { modes } from '../../util/constants';
import { OverlayLayer, GridLayer, RenderLayer } from './layers';
import { Data } from '../../data';

function Renderer(props) {
    const { lexed, mode, elements, rune, width, height } = props;
    const verticalPadding = 40;
    const horizontalPadding = 40;

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
                        ({width}x{height})
                    </span>
                </p>
                <RenderLayer
                    width={width}
                    height={height}
                    PathElements={props.elements.paths}
                    grids={props.elements.grids}
                />
                {mode !== modes.PREVIEW && (
                    <OverlayLayer width={width} height={height} lexed={lexed} />
                )}
            </div>
        </div>
    );
}

export default Renderer;
// <GridLayer
//     width={width}
//     height={height}
//     gridUnit={rune.gridUnit}
//     xUnits={rune.x}
//     yUnits={rune.y}
//     divisions={rune.divisions}
// />
