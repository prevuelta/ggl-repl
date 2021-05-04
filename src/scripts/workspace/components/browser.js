import React, { useState, useEffect } from 'react';
import { X, Cross, Pencil } from '../icons';
import Button from './button';
import { nanoid } from 'nanoid';

const Project = ({
  project,
  runes,
  activeRune,
  activeProject,
  setActiveProject,
  deleteRune,
}) => {
  const [expanded, setExpanded] = useState(true);
  const projectClickHandler = () => {
    setExpanded(!expanded);
    setActiveProject(project);
  };
  console.log('Active project', activeProject);
  return (
    <>
      <li onClick={projectClickHandler} key={project} className="heading">
        {project.replace(/^./, g => g.toUpperCase())}
        {activeProject === project && (
          <span className="active-project">ACTIVE</span>
        )}
      </li>
      {expanded &&
        runes.map(rune => {
          const { id, thumb, name } = rune;
          return (
            <li
              key={id}
              onClick={() => (window.location.hash = `${project}/${id}`)}
              className={id === activeRune ? 'active' : ''}
            >
              <img src={`/thumbs/${thumb}`} className="thumbnail" />
              {name}
              <div className="actions">
                <Button
                  icon="true"
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

export default ({
  isGroupView,
  rune,
  newRune,
  newProject,
  deleteProject,
  active,
  runes,
  deleteRune,
}) => {
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);

  useEffect(() => {
    console.log('Use effect');
    async function getProjects() {
      console.log('Getting projects...');
      const response = await fetch('/projects', {
        'Content-Type': 'application/json',
      });
      const projects = await response.json();
      setProjects(projects);
    }
    getProjects();
  }, []);

  return (
    <div className="browser">
      <header className="flex-row">
        <Button onClick={newRune}>New Rune +</Button>
        <Button onClick={newProject}>New Project +</Button>
      </header>
      <ul>
        {Object.entries(projects).map(([k, runes]) => (
          <Project
            activeRune={active}
            activeProject={activeProject}
            setActiveProject={setActiveProject}
            key={k}
            project={k}
            runes={runes}
            deleteRune={deleteRune}
          />
        ))}
      </ul>
    </div>
  );
};
