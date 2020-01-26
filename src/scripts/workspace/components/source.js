import React, { useState } from 'react';
import RuneEditor from './runeEditor';

export default props => {
    return (
        <div className="source-inspector">
            <RuneEditor
                tabSize={2}
                className="editable"
                value={props.value}
                onChange={(value, editor) => props.parseInput(value, editor)}
                onCursorChange={(v, h) => props.handleCursorChange(v, h)}
            />
        </div>
    );
};
