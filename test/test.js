import lexer from '../src/scripts/util/lexer';
import fs from 'fs';

const example = fs.readFileSync('./language.1.example', 'UTF-8');

console.log(lexer(example));
