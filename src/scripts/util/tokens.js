import { tokenNames } from '../compiler/lexer/commands';
const { POINT } = tokenNames;

export function getStartPosition(token) {
  if (!token) return;
  if (token.name === POINT) {
    const [x, y] = token.args;
    return { x, y };
  }
}
