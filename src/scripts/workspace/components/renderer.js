import React, { useState } from 'react';
import { modes } from '../../util/constants';
import { OverlayLayer, GridLayer, RenderLayer } from './layers';
import { Data } from '../../data';

function Renderer(props) {
  const { lexed, mode, elements, rune, width, height, ratio } = props;
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
        }}
      >
        <p className="canvas-label">
          {rune.name}{' '}
          <span className="canvas-size">
            ({width}x{height} {ratio.toFixed(2)})
          </span>
        </p>
        <RenderLayer
          width={width}
          height={height}
          PathElements={elements.paths}
          grids={elements.grids}
        />
      </div>
    </div>
  );
}

export default Renderer;
