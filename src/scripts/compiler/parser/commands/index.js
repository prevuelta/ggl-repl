import { tokenNames } from '../../lexer/commands';
import tangent from './tangent';

const {
  ADD_VECTOR,
  ARC,
  BEZIER_CURVE,
  CIRCLE,
  CIRCLE_GRID,
  CORNER,
  DOCUMENT,
  FILL,
  INTERSECT,
  PATH,
  POINT,
  REPEAT,
  ROOT,
  SQUARE,
  SQUARE_GRID,
  STYLE,
  SUB_VECTOR,
  TANGENT,
  TRI_GRID,
} = tokenNames;

const parsers = {
  [TANGENT]: tangent,
};

export default function parseToken(token, context) {
  console.log('Parse token:', parsers, token.name);
  if (parsers[token.name]) {
    const tokenParser = parsers[token.name];
    return tokenParser(token, context);
  } else {
    throw new Error('Parser does not recognise this type of token');
  }
}
