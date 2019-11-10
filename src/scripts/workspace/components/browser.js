import React, { useState } from 'react';
import { X, Cross } from '../icons';
import Button from './button';

export default props => {
    const { isGroupView } = props;
    return (
        <div className="browser">
            <ul>
                {isGroupView && (
                    <li className="add-group" onClick={props.newRune}>
                        Add Group +
                    </li>
                )}
                {!isGroupView && (
                    <li className="add-rune" onClick={props.newRune}>
                        Add Rune +
                    </li>
                )}
                {props.groups.map(g => (
                    <li>
                        {g}
                        <a href={`/${g}`}>{g}</a>
                    </li>
                ))}
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
