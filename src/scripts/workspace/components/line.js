import React from 'react';

export function Line(props) {
    return <line {...props} strokeWidth="1" pointerEvents="none" />;
}

export function Vline(props) {
    let { x, y = 0, opacity, length, color } = props;
    return <line x1={x} y1={y || 0} x2={x} y2={length + y} strokeOpacity={opacity} stroke={color} strokeWidth="1" pointerEvents="none" />;
}

export function Hline(props) {
    let { x = 0, y, opacity, length, color } = props;
    return <line x1={x} y1={y} x2={length + x} y2={y} strokeOpacity={opacity} stroke={color} strokeWidth="1" pointerEvents="none" />;
}
