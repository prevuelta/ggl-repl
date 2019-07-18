import matchAll from 'string.prototype.matchall';

matchAll.shim();

import lexer from '../src/scripts/util/lexer';
import fs from 'fs';

const example = fs.readFileSync('./test/example.rs', 'UTF-8');

const tokenGroups = lexer(example);
// console.log('Lexemes', JSON.stringify(tokenGroups, null, 2));
// console.log('Parsed input', parser(tokenGroups));
