import React from 'react';
import { Store } from '../../../data';
import { modes } from '../../../util/constants';

export default function RenderLayer(props) {
    const { height, width, grids, paths } = props;
    const { app } = Store.getState();
    const fill = app.mode === modes.DOCUMENT ? 'none' : 'black';
    const stroke = app.mode === modes.DOCUMENT ? 'black' : 'none';
    const viewBox = `0 0 ${width} ${height}`;

    return (
        <svg
            className="renderer-svg"
            height={height}
            width={width}
            viewBox={viewBox}>
            <g fill={fill} stroke={stroke}>
                {grids && grids.map((Element, i) => <Element key={i} />)}
                {paths}
            </g>
        </svg>
    );
}
                // {paths.map((Element, i) => <Element key={i} />)}
