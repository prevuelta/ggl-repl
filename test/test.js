import lexer from '../src/scripts/util/lexer';
import fs from 'fs';

const example = fs.readFileSync('./test/example.rs', 'UTF-8');

const tokenGroups = lexer(example);
console.log('Lexemes', tokenGroups);
// console.log('Parsed input', parser(tokenGroups));
