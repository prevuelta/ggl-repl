'use strict';

import {views} from '../util/constants';

export default {
  view: views.DRAFT,
  _state: {
    history: [],
    current: [],
  },
  _update() {
    // noop
  },
  addRune(rune) {
    this._state.history.push(rune);
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
