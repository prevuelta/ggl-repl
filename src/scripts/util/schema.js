export default {
    p: {
        reference: 'p',
        type: 'path',
        svgElement: 'path'
        element: 'Path',
        matches: /p (\n) (\n)/,
        description: 'Draw a path',
        example: 'p 0 0 0 10',
        map(arg) {
            const [x1, y1, x2, y2] = arg;
            return {
                x1,
                x2,
                y1,
                y2,
            };
        },
    },
};
