import React from 'react';
import { Store } from '../../../data';
import { modes } from '../../../util/constants';
import { withRune } from '../../../hocs';

function RenderLayer(props) {
    const { height, width, grids, PathElements, rune } = props;
    const padding = +rune.padding;

    const viewBox = `0 0 ${width} ${height}`;

    let state = Store.getState();
    const { app } = state;
    let fill = props.fill || (app.mode === modes.DOCUMENT ? 'none' : 'black');
    let stroke = props.stroke || (app.mode === modes.DOCUMENT ? 'black' : 'none');
    fill = 'none';
    stroke = 'none';

    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="renderer-svg" height={height} width={width} viewBox={viewBox}>
            {PathElements && <PathElements />}
        </svg>
    );
}

export default withRune(RenderLayer);
// <g id="style" fill={fill} stroke={stroke} transform={`translate(${padding} ${padding})`}>
// </g>
