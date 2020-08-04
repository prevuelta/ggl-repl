import React, { useState } from 'react';
import { X, Cross, Pencil } from '../icons';
import Button from './button';
import { nanoid } from 'nanoid';

export default ({ isGroupView, rune, newRune, active, runes, deleteRune }) => {
  let currentGroup;

  const sortedRunes = runes.reduce((a, b) => {
    if (b.group !== currentGroup) {
      currentGroup = b.group;
      return [...a, { heading: true, group: currentGroup }, b];
    }
    return [...a, b];
  }, []);

  return (
    <div className="browser">
      <header className="flex-row">
        <Button onClick={newRune}>New Rune +</Button>
      </header>
      <ul>
        {sortedRunes.map(r => {
          if (r.heading) {
            return (
              <li key={r.id} className="heading">
                {r.group}
              </li>
            );
          } else {
            return (
              <li
                key={r.id}
                onClick={() => (window.location.hash = r.id)}
                className={r.id === active ? 'active' : ''}
              >
                <img src={`/thumbs/${r.thumb}`} className="thumbnail" />
                {r.name}
                <div className="actions">
                  <Button
                    icon="true"
                    className="red"
                    onClick={e => {
                      e.preventDefault();
                      deleteRune(r.id);
                    }}
                  >
                    <X />
                  </Button>
                </div>
              </li>
            );
          }
        })}
      </ul>
    </div>
  );
};
