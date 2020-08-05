import { tokenNames } from '../compiler/lexer/commands';
const { POINT, TANGENT } = tokenNames;

export function getStartPosition(token) {
  if (!token) return;
  if (token.name === POINT) {
    const [x, y] = token.args;
    return { x, y };
  } else if (token.name === TANGENT) {
  }

  return;
}
