import React from 'react';
import { Store } from '../../../data';
import { modes } from '../../../util/constants';

export default function RenderLayer(props) {
    const { height, width, grids, PathElements } = props;
    const viewBox = `0 0 ${width} ${height}`;

    let state = Store.getState();
    const { app } = state;
    const fill = props.fill || (app.mode === modes.DOCUMENT ? 'none' : 'black');
    const stroke =
        props.stroke || (app.mode === modes.DOCUMENT ? 'black' : 'none');

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="renderer-svg"
            height={height}
            width={width}
            viewBox={viewBox}>
            <g fill={fill} stroke={stroke}>
                {PathElements && <PathElements />}
            </g>
        </svg>
    );
}
// {grids && grids.map((Element, i) => <Element key={i} />)}
