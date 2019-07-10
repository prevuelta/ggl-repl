import React, { useState } from 'react';

export default props => {
    console.log(props);
    return (
        <div className="browser">
            <ul>
                {props.runes.map(r => (
                    <li
                        key={r.id}
                        onClick={() => props.setRune(r)}
                        className={r.id === props.active ? 'active' : ''}>
                        {r.name}
                    </li>
                ))}
                <li onClick={props.newRune}>+</li>
            </ul>
        </div>
    );
};
