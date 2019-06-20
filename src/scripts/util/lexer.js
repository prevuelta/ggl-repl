const grammar = {
    line: {
        name: 'line',
        ref: 'l',
        map([x1, x2, y1, y2]) {
            return {
                x1,
                x2,
                y1,
                y2,
            };
        },
    },
};

export default function(string) {
    const lines = string.split('\n');
    const tokens = lines.map(line => {
        const [ref, ...args] = line.split(' ');
        return {
            ref,
            args: args.join(' '),
            // args: args.map(arg => +arg),
        };
    });
    // lexemes
    // { ref: 'l', args: ['', '', 0] }
    // { name: 'line', args: [0, 0, 100, 100 ] }
    // { name: 'path', nested: true, args: }
    // tokens.forEach(
    // string.forEach(l => {
    // console.log(l);
    // });

    // Expected
    // {
    // name: '',
    // value: '',
    // }

    return tokens;
}
