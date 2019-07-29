import React, { useState } from 'react';
import AceEditor from 'react-ace';

// import 'brace/theme/github';

export default props => {
    return (
        <div className="source-inspector">
            <AceEditor
                tabSize={2}
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
