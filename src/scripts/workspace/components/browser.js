import React, { useState } from 'react';
import { X, Cross, Pencil } from '../icons';
import Button from './button';

export default props => {
    const { isGroupView, rune } = props;
    return (
        <div className="browser">
            <header className="flex-row">
                <Button onClick={props.newRune}>New Rune +</Button>
                {rune && <Button onClick={props.editRune}>Edit Rune +</Button>}
            </header>
            <ul>
                {props.runes.map(r => (
                    <li
                        key={r.id}
                        onClick={() => (window.location.hash = r.id)}
                        className={r.id === props.active ? 'active' : ''}>
                        <img src={`/thumbs/${r.thumb}`} className="thumbnail" />
                        {r.name} {r.group}
                        <div className="actions">
                            <Button
                                icon="true"
                                className="red"
                                onClick={e => {
                                    e.preventDefault();
                                    props.deleteRune(r.id);
                                }}>
                                <X />
                            </Button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};
