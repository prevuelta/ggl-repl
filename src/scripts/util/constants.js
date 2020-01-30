export default {
    SILVER_RATIO: Math.sqrt(2),
    GOLDEN_RATIO: (1 + Math.sqrt(5)) / 2,
    DEFAULT_ZOOM_LEVEL: 24,
    CANVAS_SIZE: 280,
};

export const COLORS = {
    BLACK: '#000000',
    WHITE: '#fff000',
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

const { PI } = Math;
const HALF_PI = PI / 2;
const QUARTER_PI = PI / 4;
const TWO_PI = PI * 2;

export { PI, HALF_PI, TWO_PI, QUARTER_PI };
