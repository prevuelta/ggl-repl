import React, { useState } from 'react';
import { X, Cross } from '../icons';
import Button from './button';

export default props => {
    return (
        <div className="browser">
            <ul>
                <li className="add-rune" onClick={props.newRune}>
                    Add Rune +
                </li>
                {props.runes.map(r => (
                    <li
                        key={r.id}
                        onClick={() => (window.location.hash = r.id)}
                        className={r.id === props.active ? 'active' : ''}>
                        <img src={`/thumbs/${r.thumb}`} className="thumbnail" />
                        {r.name}
                        <Button
                            icon="true"
                            onClick={e => {
                                e.preventDefault();
                                props.deleteRune(r.id);
                            }}>
                            <X />
                        </Button>
                    </li>
                ))}
            </ul>
        </div>
    );
};
