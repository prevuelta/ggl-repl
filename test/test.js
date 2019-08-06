import matchAll from 'string.prototype.matchall';

matchAll.shim();

import lex from '../src/scripts/compiler/lexer';
import fs from 'fs';

const example = fs.readFileSync('./test/example.rs', 'UTF-8');

const tokenGroups = lex(example);
console.log('Lexemes', JSON.stringify(tokenGroups, null, 2));
// console.log('Parsed input', parse(tokenGroups));
