import React, { useState } from 'react';
import AceEditor from 'react-ace';

export default props => {
    return (
        <div className="source-inspector">
            <textarea onChange={e => props.parseInput(e.target.value)} />
            <AceEditor onChange={value => props.parseInput(value)} />
        </div>
    );
};
