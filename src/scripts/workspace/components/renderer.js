import React, {useState} from 'react';

// import {GridLines, GridNodes} from '../layers/grid';
// import {Group, Point} from '.';
import {COLORS, POINT_TYPES} from '../../util/constants';
import {Overlay} from '../layers';
import {Data} from '../../data';

const SLUG = 20;

const POINT_TYPE_STRING = {
  [POINT_TYPES.STRAIGHT]: (mX, mY) => `L ${mX} ${mY}`,
  [POINT_TYPES.ARC]: (mX, mY) => `A 50 50 0 0 1 ${mX} ${mY}`,
};

function BackgroundLayer(props) {
  const {height, width} = props;
  return (
    <svg id="background" height={height} width={width}>
      <GridLines {...props} />
    </svg>
  );
}

function RenderLayer(props) {
  const {height, width, paths, pathPoints} = props;

  let stroke;

  function _mouseEnter() {
    console.log('Path hover');
    stroke = 3;
  }

  return (
    <svg id="renderLayer" height={height} width={width}>
      {paths.map((path, i) => {
        const str = path.points.map(
          (p, i) =>
            `${i ? 'L' : 'M'} ${p.x * width} ${p.y * height}${
              path.isClosed ? ' Z' : ''
            }`,
        );
        return (
          <path
            key={i}
            d={str}
            stroke={stroke || path.stroke}
            strokeWidth={stroke || 1}
            fill={path.fill}
            onMouseEnter={_mouseEnter}
          />
        );
      })}
    </svg>
  );
}

function Rendering(props) {
  let {
    points,
    rune,
    pathPoints,
    paths,
    selectedPoints,
    proofView,
    currentPath,
    mode,
  } = props;
  let height = rune.y * rune.gridUnit;
  let width = rune.x * rune.gridUnit;
  let size = {width, height};

  return (
    <div
      className="rendering"
      style={{
        width,
        height,
        padding: `${height / rune.y / 2}px ${width / rune.x / 2}px`,
      }}>
      <p className="rendering-label">
        {rune.name}{' '}
        <span className="rendering-size">
          ({rune.x}x{rune.y})
        </span>
      </p>
    </div>
  );
}

// {!proofView && <BGLayer {...size} rune={rune} />}
// <RenderLayer {...size} paths={paths} />
// {!proofView && (
//   <OverlayLayer {...size} rune={rune} currentPath={currentPath} />
// )}

export default Renderer;
