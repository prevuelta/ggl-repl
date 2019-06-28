import React, { useState } from 'react';
// import AceEditor from 'react-ace';

export default props => {
    return (
        <div className="source-inspector">
            <ul className="test-examples">
                <li>
                    <button
                        data-string="p0 0,10 0,10 10,0 10,0 0"
                        onClick={e =>
                            props.setExample(e.target.dataset.string)
                        }>
                        Basic Rect
                    </button>
                    <button
                        data-string="p0 0,vw 0,0 h,-w 0,0 -h"
                        onClick={e =>
                            props.setExample(e.target.dataset.string)
                        }>
                        Substitution
                    </button>
                </li>
            </ul>
            <textarea
                value={props.value}
                onChange={e => props.parseInput(e.target.value)}
            />
        </div>
    );
};
// <AceEditor onChange={value => props.parseInput(value)} />
