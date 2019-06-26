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
    '\\d+?u$': str => {
        const arr = str.split('u');
        return +arr[0] * unit;
    },
    '\\d+?w$': str => {
        const arr = str.split('w');
        return clamp(+arr[0], -1, 1) * width;
    },
    '\\d+?h$': str => {
        const arr = str.split('h');
        console.log(arr);
        return clamp(+arr[0], -1, 1) * height;
    },
    '-w|w': str => {
        return str.includes('-') ? -width : width;
    },
    '-h|h': str => {
        return str.includes('-') ? -height : height;
    },
};

const drawCommandsMapping = {
    m: 'move',
    p: 'point',
    v: 'vector',
    a: 'arc',
    t: 'tangent',
};

export default function(string) {
    const lines = string.trim().split('\n');
    const lexemes = lines
        .filter(
            line => !(regEx.comment.test(line) || regEx.emptyLine.test(line))
        )
        .map(line => {
            line = line.replace(/\r|\n/, '');
            if (/^\d/.test(line)) {
                line = `p ${line}`;
            }

            const commands = line.split(/(?=[ |^][a-z]\d)/);

            let draw = [];

            commands.forEach(command => {
                let [_, ref, argStr] = command.trim().split(/^(.)/);
                const commandRef = drawCommandsMapping[ref];
                let args = [],
                    matches,
                    pairRegEx = /(.+?\s.+?(\s|$))/g;

                while ((matches = pairRegEx.exec(argStr))) {
                    args.push(matches[1]);
                }
                args = args.map(arg => {
                    return arg
                        .trim()
                        .split(' ')
                        .map(a => {
                            let newArg = a;
                            for (const regStr in mappings) {
                                const reg = new RegExp(regStr);
                                if (reg.test(a)) {
                                    const raw = reg.exec(a)[0];
                                    const fn = mappings[regStr];
                                    newArg = fn(a);
                                    break;
                                }
                            }

                            return +newArg;
                        });
                });
                draw = [
                    ...draw,
                    ...args.map(arg => ({
                        commandRef,
                        arg,
                    })),
                ];
            });

            return draw;
        });

    return lexemes;
}
