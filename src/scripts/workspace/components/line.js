import React from 'react';

export function Line({ opacity, color, ...restProps }) {
  return (
    <line
      {...restProps}
      strokeOpacity={opacity}
      stroke={color}
      strokeWidth="1"
      pointerEvents="none"
    />
  );
}

export function Vline({ x, y = 0, opacity, length, color }) {
  return (
    <line
      x1={x}
      y1={y || 0}
      x2={x}
      y2={length + y}
      strokeOpacity={opacity}
      stroke={color}
      strokeWidth="1"
      pointerEvents="none"
    />
  );
}

export function Hline({ x = 0, y, opacity, length, color }) {
  return (
    <line
      x1={x}
      y1={y}
      x2={length + x}
      y2={y}
      strokeOpacity={opacity}
      stroke={color}
      strokeWidth="1"
      pointerEvents="none"
    />
  );
}
