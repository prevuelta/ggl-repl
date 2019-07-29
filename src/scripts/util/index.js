export { default as lex } from './lexer';
export { default as parse } from './parser';

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
        return localStorage[ref] && typeof localStorage[ref] === 'string'
            ? JSON.parse(localStorage[ref])
            : null;
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
    return a
        ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
        : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, guid);
}
