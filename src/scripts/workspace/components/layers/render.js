import React from 'react';
import { Store } from '../../../data';
import { modes } from '../../../util/constants';

export default function RenderLayer(props) {
    const { height, width, grids, paths } = props;

    const { app } = Store.getState();
    const fill = app.mode === modes.DOCUMENT ? 'none' : 'black';
    const stroke = app.mode === modes.DOCUMENT ? 'black' : 'none';

    return (
        <svg
            className="renderer-svg"
            height={height}
            width={width}
            viewBox={`0 0 ${width} ${height}`}>
            <g fill={fill} stroke={stroke}>
                {grids && grids.map((Element, i) => <Element key={i} />)}
                {paths.map((Element, i) => <Element key={i} />)}
            </g>
        </svg>
    );
}
