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
            body: JSON.stringify({ group: 'ungrouped', source: 'd:a a 0\n  sg:4 4 40 1' }),
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
