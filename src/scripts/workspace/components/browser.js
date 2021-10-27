import React, { useState, useEffect } from "react";
import { X, Cross, Pencil } from "../icons";
import Button from "./button";
import { nanoid } from "nanoid";

const Project = ({
  project,
  runes,
  setActiveRune,
  deleteRune,
  activeRune,
  activeProject,
}) => {
  return (
    <>
      <li key={project} className="heading">
        {project.replace(/^./, (g) => g.toUpperCase())}
        <span className="active-project">ACTIVE</span>
      </li>
      {runes.map((rune, i) => {
        const { id, thumb, name } = rune;
        // if (!i) console.log(rune);
        return (
          <li
            key={id}
            onClick={() => setActiveRune(rune)}
            className={rune.id === activeRune.id ? "active" : ""}
          >
            <img src={`/thumbs/${thumb}`} className="thumbnail" />
            {name}
            <div className="actions">
              <Button
                icon="true"
                onClick={(e) => {
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

export default ({
  isGroupView,
  rune,
  newRune,
  projects,
  activeProject,
  setActiveProject,
  newProject,
  deleteProject,
  activeRune,
  runes,
  setActiveRune,
  deleteRune,
}) => {
  return (
    <div className="browser">
      <header className="flex-row">
        <Button onClick={newRune}>New Graphic</Button>
        <Button onClick={newProject}>New Project</Button>
      </header>
      <header className="flex-row">
        <select
          value={activeProject}
          onChange={async (e) => await setActiveProject(e.target.value)}
        >
          {Object.keys(projects).map((key) => (
            <option value={key}>{key}</option>
          ))}
        </select>
      </header>
      <ul>
        <Project
          activeRune={activeRune}
          activeProject={activeProject}
          project={activeProject}
          runes={runes}
          setActiveRune={setActiveRune}
          deleteRune={deleteRune}
        />
      </ul>
    </div>
  );
};
