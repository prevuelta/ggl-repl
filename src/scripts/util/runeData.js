export default {
  getRunes: project => {
    return fetch(`/${project}/runes`).then(res => res.json());
  },
  getProjects: async () => {
    const response = await fetch("/projects", {
      "Content-Type": "application/json",
    });
    const projects = await response.json();
    return projects;
  },
  newProject() {
    const projectName = window
      .prompt("Create a new project")
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "");
    if (projectName) {
      return fetch(`/projects/create/${projectName}`, {
        method: "put",
      });
    }
  },
  new: project => {
    console.log("Creating rune");
    return fetch(`/project/${project}`, {
      method: "put",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        group: "ungrouped",
        source: "d:a a 0\n  sg:4 4 40 1",
      }),
    });
  },
  delete: (id, project) => {
    const confirm = window.confirm("Are you sure to delete?");
    if (confirm) {
      return fetch(`/project/${project}`, {
        method: "delete",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
    } else {
      return Promise.reject();
    }
  },
  save: (payload, project) => {
    return fetch(`/project/${project}`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
};
