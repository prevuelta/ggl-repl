import React from 'react';

export default function RenderLayer(props) {
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
