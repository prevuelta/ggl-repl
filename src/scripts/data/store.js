import { views, modes } from '../util/constants';
import { generateName } from '../util';

function Rune() {
    return {
        x: 8,
        y: 10,
        gridUnit: 30,
        name: generateName(),
    };
}

export default {
    _state: {
        runes: [],
        current: Rune(),
        app: {
            view: views.DRAFT,
            mode: modes.DOCUMENT,
        },
    },
    _update() {
        // noop
    },
    addRune(rune) {
        this._state.runes.push(rune);
        this._state.current = rune;
        this._update();
    },

    onUpdate(fn) {
        this._update = fn;
    },
    getState() {
        return this._state;
    },
};
