import { tokenNames } from '../compiler/lexer/commands';

const { CIRCLE_GRID } = tokenNames;

export default {
    getIndices(points, gridPoints) {
        return points.map(function(point) {
            return gridPoints.indexOf(point);
        });
    },
    object(o) {
        function F() {}
        F.prototype = o;
        return new F();
    },
    getLocalData(ref) {
        return localStorage[ref] && typeof localStorage[ref] === 'string' ? JSON.parse(localStorage[ref]) : null;
    },
    debounce(func, wait, immediate) {
        let timeout;
        return function() {
            let context = this;
            let args = arguments;
            let later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            let callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    },
};

export function guid(a) {
    return a ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, guid);
}

export * from './constants';
export * from './trig';
export { default as globals } from './globals';
export { default as runeData } from './runeData';

const defaultHeight = 50;
const defaultWidth = 50;

export function getDocumentSize(tokens) {
    const size = tokens
        .filter(t => t.name.includes('grid'))
        .reduce(
            (a, b) => {
                if (b.name === CIRCLE_GRID) {
                    a.width = Math.max(b.args[0] * 2, a.width);
                    a.height = Math.max(b.args[0] * 2, a.height);
                } else {
                    const gridWidth = b.args[0] * b.args[2] + (b.args[5] || 0);
                    const gridHeight = b.args[1] * b.args[2] + (b.args[6] || 0);
                    a.width = Math.max(gridWidth, a.width);
                    a.height = Math.max(gridHeight, a.height);
                }
                return a;
            },
            { width: defaultWidth, height: defaultHeight }
        );
    return size;
}
