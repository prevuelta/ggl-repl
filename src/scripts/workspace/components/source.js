import React, { useState } from 'react';
import AceEditor from 'react-ace';

import 'brace/theme/github';

export default props => {
    return (
        <div className="source-inspector">
            <ul className="test-examples">
                <li>
                    <button onClick={e => props.setExample('')}>Clear</button>
                    <button onClick={e => props.setExample('G10 10 40 5')}>
                        Grid
                    </button>
                    <button
                        onClick={e =>
                            props.setExample('p0 0,10 0,10 10,0 10,0 0')
                        }>
                        Basic Rect
                    </button>
                    <button
                        onClick={e =>
                            props.setExample('p0 0,vw 0,0 h,-w 0,0 -h')
                        }>
                        Substitution
                    </button>
                </li>
            </ul>
            <AceEditor
                className="editable"
                value={props.value}
                onChange={(value, editor) => props.parseInput(value, editor)}
                onCursorChange={(v, h) => props.handleCursorChange(v, h)}
            />
        </div>
    );
};
// <textarea
//     value={props.value}
//     onChange={e => props.parseInput(e.target.value)}
// />
