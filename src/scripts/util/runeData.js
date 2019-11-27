export default {
    get: () => {
        return fetch('/runes').then(res => res.json());
    },
    new: () => {
        return fetch('/rune', {
            method: 'put',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ group: 'ungrouped' }),
        });
    },
    delete: id => {
        return fetch('/rune', {
            method: 'delete',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }),
        });
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
