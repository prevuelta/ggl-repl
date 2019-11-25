const globals = {
    _updateFunctions: [],
    set rune(rune) {
        this._globals.rune = rune;
    },
    get rune() {
        return this._globals.rune;
    },
    set onUpdate(fn) {
        this._updateFunctions.push(fn);
    },
};

globals._globals = new Proxy(
    {
        rune: null,
    },
    {
        set(obj, prop, value) {
            const result = Reflect.set(...arguments);
            globals._updateFunctions.forEach(fn => fn());
            return result;
        },
    }
);

export default globals;
