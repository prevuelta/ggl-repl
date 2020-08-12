import { tokenNames } from '../../lexer/commands';
import tangent from './tangent';
import arc from './arc';

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
  [ARC]: arc,
};

export default function parseToken(token, context) {
  if (parsers[token.name]) {
    const tokenParser = parsers[token.name];
    return tokenParser(token, context);
  } else {
    throw new Error('Parser does not recognise this type of token');
  }
}
