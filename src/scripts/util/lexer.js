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

const unit = 10;

const mappings = {
    '\\d+u$': str => {
        const arr = str.split('u');
        return +arr[0] * unit;
    },
};

export default function(string) {
    const lines = string.split('\n');
    const tokens = lines.map(line => {
        let args, ref;
        if (/^\d/.test(string)) {
            ref = 'p';
            args = line.split(' ');
        } else {
            const arr = line.split(' ');
            ref = arr.shift();
            args = arr;
        }
        args = args.map(arg => {
            let newArg = arg;
            Object.keys(mappings).forEach(regStr => {
                const reg = new RegExp(regStr);
                if (reg.test(arg)) {
                    const raw = reg.exec(arg)[0];
                    console.log(raw);
                    const fn = mappings[regStr];
                    newArg = fn(arg);
                }
            });
            return newArg;
        });
        return {
            ref,
            args: args.join(' '),
            // args: args.map(arg => +arg),
        };
    });

    console.log('Tokens', tokens);
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
