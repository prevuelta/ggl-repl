import { Store } from '../data';
import { modes } from '../util/constants';

export default {
    get isDrawingMode() {
        return Store.getState().app.mode === modes.DRAW;
    },
    get isArcMode() {
        return Store.getState().app.node === modes.ARC;
    },

    get isDocumentMode() {
        return Store.getState().app.node === modes.DOCUMENT;
    },
};

export const Position = {
    get runeSize() {
        return { width: this.runeWidth, height: this.runeHeight };
    },
    getRune() {
        const state = Store.getState();
        return state.runes.all[state.runes.current];
    },
    get runeWidth() {
        const rune = this.getRune();
        return rune.gridUnit * rune.x;
    },
    get runeHeight() {
        const rune = this.getRune();
        return rune.gridUnit * rune.y;
    },
    getAbsolute(coord) {
        return {
            x: coord.x * this.runeWidth,
            y: coord.y * this.runeHeight,
        };
    },
};
