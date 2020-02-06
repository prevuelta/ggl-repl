const gridCommands = {
    sg: {
        name: 'square-grid',
        type: 'grid',
    },
    pg: {
        name: 'prop-grid',
        type: 'grid',
    },
    cg: {
        name: 'circle-grid',
        type: 'grid',
    },
    tg: {
        name: 'tri-grid',
        type: 'grid',
    },
    gu: {
        name: 'grid-unit',
        type: 'grid',
    },
};

export const pathCommands = {
    p: {
        name: 'point',
        type: 'path',
    },
    '+': {
        name: 'add-vector',
        type: 'path',
    },
    '-': {
        name: 'sub-vector',
        type: 'path',
    },
    b: {
        name: 'bezier-curve',
        type: 'path',
    },
    l: {
        name: 'corner',
        type: 'path',
    },
    a: {
        name: 'arc',
        type: 'path',
    },
};

const transformCommands = {
    r: {
        name: 'rotate',
        type: 'transform',
    },
    ry: {
        name: 'reflect',
        data: 'y',
        type: 'transform',
    },
    rx: {
        name: 'reflect',
        data: 'x',
        type: 'transform',
    },
    sc: {
        name: 'scale',
        type: 'transform',
    },
    tr: {
        name: 'translate',
        type: 'transform',
    },
};

const shapeCommands = {
    ci: {
        name: 'circle',
        type: 'shape',
    },
    sq: {
        name: 'square',
        type: 'shape',
    },
};

const allCommands = {
    ...gridCommands,
    ...pathCommands,
    ...transformCommands,
    ...shapeCommands,
    re: {
        name: 'repeat',
    },
    d: {
        name: 'document',
    },
    s: {
        name: 'style',
        type: 'style',
    },
};

export const tokenNames = Object.values(allCommands)
    .map(c => c.name)
    .reduce(
        (a, b) => {
            const c = b.toUpperCase().replace('-', '_');
            return { ...a, [c]: b };
        },
        {
            PATH: 'path',
            ROOT: 'root',
        }
    );

export default allCommands;
