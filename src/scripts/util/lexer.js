const unit = 10;
const height = 40;
const width = 100;

const regEx = {
    comment: /^\/\//,
    emptyLine: /^\r$/,
};

const clamp = function(val, min, max) {
    return Math.min(Math.max(val, min), max);
};

const mappings = {
    '\\d+u$': str => {
        const arr = str.split('u');
        return +arr[0] * unit;
    },
    '\\d+w$': str => {
        const arr = str.split('w');
        return clamp(+arr[0], 0, 1) * width;
    },
    '\\d+h$': str => {
        const arr = str.split('h');
        return clamp(+arr[0], 0, 1) * height;
    },
    w: str => {
        return width;
    },
    h: str => {
        return height;
    },
};

// draw: [
//   {
//     command: 'move',
//     arg:
//   },
//   {
//     command: 'point',
//     arg:
//   },
//   {
//     command: 'vector',
//     arg
//   },
//   {
//     command: 'arc'
//   }
// ];

export default function(string) {
    const lines = string.trim().split('\n');
    const command = 'move';
    const tokens = lines
        .filter(
            line => !(regEx.comment.test(line) || regEx.emptyLine.test(line))
        )
        .map(line => {
            line = line.replace(/\r|\n/, '');
            if (/^\d/.test(line)) {
                line = `p ${line}`;
            }
            const pairs = /(.+? .+?)/g.exec(line);
            console.log(pairs);
            let args = line.split(' ');
            const ref = args.shift();
            args = args.map(arg => {
                let newArg = arg;
                for (const regStr in mappings) {
                    const reg = new RegExp(regStr);
                    if (reg.test(arg)) {
                        const raw = reg.exec(arg)[0];
                        const fn = mappings[regStr];
                        newArg = fn(arg);
                        // console.log(regStr, arg, newArg);
                        break;
                    }
                }
                return newArg;
            });
            return {
                ref,
                draw: args.join(' '),
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
