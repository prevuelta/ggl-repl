import { modes } from '../util/constants';

const MODIFIERS = ['shiftKey', 'ctrlKey', 'metaKey'];

const protectedElements = ['INPUT', 'TEXTAREA'];

export const keyCodes = {
  8: 'delete',
  13: 'enter',
  27: 'esc',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  65: 'a',
  66: 'b',
  67: 'c',
  68: 'd',
  69: 'e',
  70: 'f',
  71: 'h',
  75: 'k',
  76: 'l',
  77: 'm',
  78: 'n',
  79: 'o',
  80: 'p',
  86: 'v',
  187: '+',
  189: '-',
  219: '[',
  221: ']',
};

// const nudgeVectors = {
//     up: [0, -0.1],
//     down: [0, 0.1],
//     left: [-0.1, 0],
//     right: [0.1, 0],
//     'shiftKey+up': [0, -1],
//     'shiftKey+down': [0, 1],
//     'shiftKey+left': [-1, 0],
//     'shiftKey+right': [1, 0],
// };

// const keys = {};
// const nudgeActions = {};

// Object.keys(nudgeVectors).forEach(k => {
//     nudgeActions[k] = () => {
//         const state = Store.getState();
//         const rune = state.runes.all[state.runes.current];
//         const { x, y } = rune;
//         const v = nudgeVectors[k];
//         return {
//             type: 'NUDGE_POINTS',
//             vector: [v[0] * (1 / x), v[1] * (1 / y)],
//         };
//     };
// });

const globalActions = {
  'ctrlKey+p': () => {
    // const { app } = Store.getState();
    // Store.setMode(
    // app.mode === modes.DOCUMENT ? modes.PREVIEW : modes.DOCUMENT
    // );
  },
  // h: actions.toggleHelp,
  // esc: actions.setDocumentMode,
};

// const modeActions = {
//     [MODE.DRAW]: {
//         a: actions.drawArc,
//         p: actions.addPath,
//         ...nudgeActions,
//     },
//     [MODE.DOCUMENT]: {
//         d: actions.setDrawMode,
//         delete: actions.deleteSelectedPoints,
//         c: actions.togglePathClosed,
//         n: actions.nextPoint,
//         f: actions.togglePathFill,
//         right: actions.increaseX,
//         left: actions.decreaseX,
//         'ctrlKey+a': actions.selectAll,
//         down: actions.increaseY,
//         up: actions.decreaseY,
//         'ctrlKey++': actions.increaseGridUnit,
//         'ctrlKey+-': actions.decreaseGridUnit,
//         ...keys,
//     },
//     [MODE.ARC]: {
//         // f: actions.flipArc,
//         // c: actions.toggleCenterLock,
//     },
// };

document.addEventListener('keydown', function(e) {
  if (e.target.classList.contains('editable')) return;

  // console.log('Key code', e.keyCode, e.metaKey, e.target, e.currentTarget);

  // let mode = Store.getState().app.mode;
  if (!e.metaKey) {
    // e.preventDefault();
  }
  let hasModifier = MODIFIERS.filter(m => e[m]).join('+');
  let ref = `${hasModifier && hasModifier + '+'}${keyCodes[e.keyCode] ||
    e.keyCode}`;
  if (!protectedElements.includes(e.target.tagName)) {
    if (globalActions[ref]) {
      globalActions[ref]();
      e.preventDefault();
    }
    //         } else if (modeActions[mode][ref]) {
    //             action = modeActions[mode][ref]();
    //         }
    //         if (action) {
    //             e.preventDefault();
    //         }
  }
});
