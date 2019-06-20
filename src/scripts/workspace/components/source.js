import React, { useState } from 'react';

export default props => {
    return (
        <div className="source-inspector">
            <textarea onChange={e => props.parseInput(e.target.value)} />
        </div>
    );
};
