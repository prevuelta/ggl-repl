import matchAll from 'string.prototype.matchall';

matchAll.shim();

import { lex, parse } from '../src/scripts/compile';
import fs from 'fs';

const example = fs.readFileSync('./test/example.rs', 'UTF-8');

const tokenGroups = lex(example);
// console.log('Lexemes', JSON.stringify(tokenGroups, null, 2));
console.log('Parsed input', parse(tokenGroups));
