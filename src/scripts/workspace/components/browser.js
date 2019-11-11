import React, { useState } from 'react';
import { X, Cross } from '../icons';
import Button from './button';

export default props => {
    const { isGroupView } = props;
    return (
        <div className="browser">
            <header className="flex-row">
                <Button onClick={props.newGroup}>New Group +</Button>
                <Button onClick={props.newRune}>New Rune +</Button>
            </header>
            <ul>
                {props.runes.map(r => (
                    <li key={r.id} onClick={() => (window.location.hash = r.id)} className={r.id === props.active ? 'active' : ''}>
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
