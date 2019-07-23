import {  modes } from '../util/constants';

function Rune() {
    return {
        x: 8,
        y: 10,
        gridUnit: 30,
        divisions: 5,
    };
}

export default {
    _state: {
        runes: [],
        app: {
            mode: modes.DOCUMENT,
        },
    },
    setMode(mode) {
        this._state.app.mode = mode;
        this._update();
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
