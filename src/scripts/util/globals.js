export default {
    _globals: {
        rune: null,
    },
    set rune(rune) {
        this._globals.rune = rune;
    },
    get rune() {
        return this._globals.rune;
    },
};
