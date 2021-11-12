const Lexer = require('lex');
const moo = require('moo');
// const testScript = fs.readFileSync('./test.ggl', 'utf8');

// console.log(testScript)

// const fs = require('fs');

// const tokens = {
//   COMMAND:  '',
//   COMMAND_ARG: '',
//   EOF: '<EOF>'
//   IDENT: '  ',
//   DEDENT: '  '
// };

// const state = {
//   loopContext: null,
//   squareGridContext: null,
//   circleGridContext: null
// };

// const lexer = (string) => {
//   return { 
//     pos: { line: 1, column: 0 },
//   }
// };

// const resetPosition = (l) {
//   l.pos.line++;
//   l.pos.column = 0;
// };


const testString = `d:a a 0
  sg:10 10 30 2
    sq:1u 1u
    p:0 0,1u 1u,+:2uxy,a:1u pi 1u
`;

const lexer = moo.compile({
  command: /[a-z]+?:/,
  arg: /[uaxypi0-9]+?[,| |\n]/,
  indent: /  /,
  // keyword: ['d:']
});

lexer.reset(testString);
// console.log(lexer.next());
// console.log(lexer.next());
// console.log(lexer.next());
for (let here of lexer) {
   console.log('HERE', here);
}
// const tokens = Array.from(lexer);


// lexer.addRule(/([a-z]+?):/i, lexeme => {
//     console.log(lexeme);
//   return {
//     type: 'COMMAND'
//   }
// })

// lexer.input = testString;

// console.log(output);
