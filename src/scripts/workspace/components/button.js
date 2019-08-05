import React from 'react';

export default function(props) {
    const classes = `button ${props.icon ? 'icon' : ''}`;
    return (
        <div className={classes} onClick={props.onClick}>
            {props.children || props.symbol}
        </div>
    );
}
