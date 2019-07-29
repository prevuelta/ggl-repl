import React from 'react';
import { Store } from '../../../data';

export default function RenderLayer(props) {
    const { height, width, grids, PathElements } = props;
    const viewBox = `0 0 ${width} ${height}`;

    console.log('Path Elements', PathElements);

    return (
        <svg
            className="renderer-svg"
            height={height}
            width={width}
            viewBox={viewBox}>
            {grids && grids.map((Element, i) => <Element key={i} />)}
            {PathElements && <PathElements />}
        </svg>
    );
}
