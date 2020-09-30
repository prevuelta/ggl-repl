import React, { useState } from "react";
import { X, Cross, Pencil } from "../icons";
import Button from "./button";
import { nanoid } from "nanoid";

const Group = ({ group, runes, active, deleteRune }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <li
        onClick={() => setExpanded(!expanded)}
        key={group}
        className="heading"
      >
        {group}
      </li>
      {expanded &&
        runes.map(rune => {
          const { id, thumb, name } = rune;
          return (
            <li
              key={id}
              onClick={() => (window.location.hash = id)}
              className={id === active ? "active" : ""}
            >
              <img src={`/thumbs/${thumb}`} className="thumbnail" />
              {name}
              <div className="actions">
                <Button
                  icon="true"
                  className="red"
                  onClick={e => {
                    e.preventDefault();
                    deleteRune(id);
                  }}
                >
                  <X />
                </Button>
              </div>
            </li>
          );
        })}
    </>
  );
};

export default ({ isGroupView, rune, newRune, active, runes, deleteRune }) => {
  let currentGroup;

  const sortedRunes = runes.reduce((a, b) => {
    const { group } = b;
    if (a[group]) {
      a[group].push(b);
    } else {
      a[group] = [b];
    }
    return a;
  }, {});

  console.log(sortedRunes);

  return (
    <div className="browser">
      <header className="flex-row">
        <Button onClick={newRune}>New Rune +</Button>
      </header>
      <ul>
        {Object.entries(sortedRunes).map(([k, runes]) => (
          <Group
            active={active}
            key={k}
            group={k}
            runes={runes}
            deleteRune={deleteRune}
          />
        ))}
      </ul>
    </div>
  );
};
