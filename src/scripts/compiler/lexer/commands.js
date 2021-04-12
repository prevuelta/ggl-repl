export const gridCommands = {
  sg: {
    name: 'square-grid',
    type: 'grid',
    title: 'Square grid',
    args: '[xUnits] [yUnits] [cellSize] [subdivisions]',
  },
  pg: {
    name: 'prop-grid',
    type: 'grid',
  },
  cg: {
    name: 'circle-grid',
    type: 'grid',
    title: 'Circle grid',
  },
  tg: {
    name: 'tri-grid',
    type: 'grid',
    name: 'Triangle grid',
  },
  gu: {
    name: 'grid-unit',
    type: 'grid',
  },
};

export const pathCommands = {
  '.': {
    name: 'close-path',
    type: 'path',
    argCount: 0,
    title: 'Closes path',
    args: 'No args',
  },
  p: {
    name: 'point',
    type: 'path',
    argCount: 2,
  },
  '+': {
    name: 'add-vector',
    type: 'path',
  },
  '-': {
    name: 'sub-vector',
    type: 'path',
  },
  b: {
    name: 'bezier-curve',
    type: 'path',
  },
  l: {
    name: 'corner',
    type: 'path',
  },
  a: {
    name: 'arc',
    type: 'path',
  },
  t: {
    name: 'tangent',
    type: 'path',
  },
  i: {
    name: 'intersect',
    type: 'path',
  },
};

const transformCommands = {
  r: {
    name: 'rotate',
    type: 'transform',
  },
  ry: {
    name: 'reflect-y',
    data: 'y',
    type: 'transform',
  },
  rx: {
    name: 'reflect-x',
    data: 'x',
    type: 'transform',
  },
  sc: {
    name: 'scale',
    type: 'transform',
  },
  tr: {
    name: 'translate',
    type: 'transform',
  },
};

const shapeCommands = {
  ci: {
    name: 'circle',
    type: 'shape',
  },
  sq: {
    name: 'square',
    type: 'shape',
  },
};

const allCommands = {
  ...gridCommands,
  ...pathCommands,
  ...transformCommands,
  ...shapeCommands,
  d: {
    name: 'document',
    args: '[width] [height] [bleed]',
  },
  re: {
    name: 'repeat',
    args: '[count]',
  },
  s: {
    name: 'style',
    type: 'style',
    args: '[fill] [stroke] [stroke width]',
  },
};

export const tokenNames = Object.values(allCommands)
  .map(c => c.name)
  .reduce(
    (a, b) => {
      const c = b.toUpperCase().replace('-', '_');
      return { ...a, [c]: b };
    },
    {
      PATH: 'path',
      ROOT: 'root',
    }
  );

export default allCommands;
