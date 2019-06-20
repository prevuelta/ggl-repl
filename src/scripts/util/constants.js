export default {
    SILVER_RATIO: Math.sqrt(2),
    GOLDEN_RATIO: (1 + Math.sqrt(5)) / 2,
    DEFAULT_ZOOM_LEVEL: 24,
    CANVAS_SIZE: 280,
};

export const COLORS = {
    BLUE: '#27dded',
    RED: '#e13d1c',
    GREEN: '#14bb5b',
    CREAM: '#ece5d4',
};

export const views = {
    DRAFT: 'draft',
    PROOF: 'proof',
};

export const modes = {
    DOCUMENT: 'document',
    PATH: 'path',
    DRAW: 'draw',
    ARC: 'arc',
};

export const MODE_TAGS = {
    [modes.DOCUMENT]: 'Document',
    [modes.PATH]: 'Path',
    [modes.DRAW]: 'Draw',
    [modes.ARC]: 'Arc',
};

export const POINT_TYPES = {
    STRAIGHT: 0,
    ARC: 1,
};
