const gridCommands = {
    sg: {
        name: 'squaregrid',
        type: 'grid',
    },
    cg: {
        name: 'circlegrid',
        type: 'grid',
    },
    tg: {
        name: 'trigrid',
        type: 'grid',
    },
    gu: {
        name: 'gridunit',
        type: 'grid',
    },
};

export const pathCommands = {
    p: {
        name: 'point',
        type: 'path',
    },
    '+': {
        name: 'addvector',
        type: 'path',
    },
    '-': {
        name: 'subvector',
        type: 'path',
    },
    b: {
        name: 'bezier',
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

export default {
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
