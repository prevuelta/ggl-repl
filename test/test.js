import { lexer, parser } from '../src/scripts/util';
import fs from 'fs';

const example = fs.readFileSync('./language.1.example', 'UTF-8');

const tokenGroups = lexer(example);
console.log('Lexemes', tokenGroups);
console.log('Parsed input', parser(tokenGroups));
