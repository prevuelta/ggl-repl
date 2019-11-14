import React, { useState } from 'react';
import { X, Cross, Pencil } from '../icons';
import Button from './button';

export default props => {
    const { isGroupView } = props;
    return (
        <div className="browser">
            <header className="flex-row">
                <Button onClick={props.newRune}>New Rune +</Button>
            </header>
            <ul>
                {props.runes.map(r => (
                    <li
                        key={r.id}
                        onClick={() => (window.location.hash = r.id)}
                        className={r.id === props.active ? 'active' : ''}>
                        <img src={`/thumbs/${r.thumb}`} className="thumbnail" />
                        {r.name}
                        <div className="actions">
                            <Button
                                icon="true"
                                onClick={e => {
                                    console.log('Edit group');
                                }}>
                                <Pencil />
                            </Button>
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
