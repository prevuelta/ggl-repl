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

export const modes = {
    BROWSE: 'browse',
    DOCUMENT: 'document',
    EDIT: 'edit',
    PREVIEW: 'preview',
};

export const MODE_TAGS = {
    [modes.DOCUMENT]: 'Document',
    [modes.PREVIEW]: 'Preview',
};

export const POINT_TYPES = {
    STRAIGHT: 0,
    ARC: 1,
};
