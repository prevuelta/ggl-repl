export default {
  get: () => {
    return fetch('/runes').then(res => res.json());
  },
  newProject() {
    const projectName = window
      .prompt('Create a new project')
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '');
    if (projectName) {
      return fetch(`/projects/create/${projectName}`, {
        method: 'put',
      });
    }
  },
  new: () => {
    return fetch('/rune', {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        group: 'ungrouped',
        source: 'd:a a 0\n  sg:4 4 40 1',
      }),
    });
  },
  delete: id => {
    const confirm = window.confirm('Are you sure to delete?');
    if (confirm) {
      return fetch('/rune', {
        method: 'delete',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
    } else {
      return Promise.reject();
    }
  },
  save: payload => {
    return fetch('/rune', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  },
};
