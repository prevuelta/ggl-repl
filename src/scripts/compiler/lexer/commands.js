const gridCommands = {
    sg: {
        name: 'squaregrid',
        type: 'grid',
    },
    cg: {
        name: 'circlegrid',
        type: 'grid',
    },
};

export const pathCommands = {
    p: {
        name: 'point',
        type: 'path',
    },
    '+': {
        name: 'vector',
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

export default {
    ...gridCommands,
    ...pathCommands,
    d: {
        name: 'document',
    },
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
    s: {
        name: 'stroke',
        type: 'style',
    },
    f: {
        name: 'fill',
        type: 'style',
    },
    ci: {
        name: 'circle',
        type: 'shape',
    },
    sq: {
        name: 'square',
        type: 'shape',
    },
};
