import React, { useState } from 'react';

export default props => {
    return (
        <div className="browser">
            <ul>
                {props.runes.map(r => (
                    <li key={r.id}>{r.id}</li>
                ))}
            </ul>
        </div>
    );
};
