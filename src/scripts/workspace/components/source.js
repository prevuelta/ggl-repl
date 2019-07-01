import React, { useState } from 'react';
// import AceEditor from 'react-ace';

export default props => {
    return (
        <div className="source-inspector">
            <ul className="test-examples">
                <li>
                    <button onClick={e => props.setExample('')}>Clear</button>
                    <button onClick={e => props.setExample('G100 100 10 5')}>
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
            <textarea
                value={props.value}
                onChange={e => props.parseInput(e.target.value)}
            />
        </div>
    );
};
// <AceEditor onChange={value => props.parseInput(value)} />
