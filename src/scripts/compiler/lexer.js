const regEx = {
    comment: /^\/\//,
    emptyLine: /^(\t| |\r)*$/,
};

const clamp = function(val, min, max) {
    return Math.min(Math.max(val, min), max);
};

const typeDefinitions = {
    '+': 'path',
    P: 'path',
    A: 'path',
    C: 'path',
    O: 'circle',
    G: 'grid',
    F: 'fill',
    R: 'rotate',
    T: 'translate',
};

const multiArgRegEx = /\s?([-|\d|\.|a-z|\*|\/|\s]+?),?$/;
const pairArgRegEx = /\s?([-|\d|\.|a-z|\*|\/]+\s[-|\d|\.|a-z|\*|\/]+)\s?/g;

const commandRefs = {
    G: {
        name: 'grid',
        argsRegEx: /\s?(\d+\s\d+\s\d+\s\d+)/,
    },
    R: {
        name: 'rotate',
        argsRegEx: multiArgRegEx,
    },
    T: {
        name: 'translate',
        argsRegEx: pairArgRegEx,
    },
    P: {
        name: 'point',
        argsRegEx: pairArgRegEx,
    },
    '+': {
        name: 'vector',
        argsRegEx: pairArgRegEx,
    },
    C: {
        name: 'circle',
        argsRegEx: multiArgRegEx,
    },
    L: {
        name: 'corner',
        argsRegEx: multiArgRegEx,
    },
    A: {
        name: 'arc',
        argsRegEx: multiArgRegEx,
    },
};

const { PI } = Math;
const HALF_PI = PI / 2;
const QUARTER_PI = PI / 4;
const TWO_PI = PI * 2;

const negative = str => str[0] === '-';

const tokenReplacements = [
    {
        name: 'Silver Ratio',
        regex: /sr/,
        fn(str, matches) {
            const result = str.replace(matches[0], Math.sqrt(2));
            return result;
        },
    },
    {
        regex: /(-?[\d|\.]*)u/,
        fn(str, matches, { gridUnit }) {
            return str.replace(matches[0], +matches[1] * gridUnit);
        },
    },
    {
        regex: /(-?[\d|\.]*)([w|h])$/,
        fn(str, matches, { width, height }) {
            console.log('W|H', str, matches);
            const multiplier = matches[1]
                ? matches[1] === '-'
                    ? -1
                    : matches[1]
                : 1;
            return (
                clamp(+multiplier, -1, 1) * { w: width, h: height }[matches[2]]
            );
        },
    },
    {
        regex: /-?([h|q])pi/,
        fn(str, matches) {
            const result = str.replace(
                /.pi/,
                { h: HALF_PI, q: QUARTER_PI }[matches[1]]
            );
            console.log('[h|q]pi matching:', matches, result);
            return result;
        },
    },
    {
        regex: /(-?[\d|\.]*)pi/,
        fn(str, matches) {
            console.log('PI', str, matches);
            const mult = +matches[1];
            return str.replace(/-?[\d|\.]*pi/, str => {
                return (mult || 1) * PI;
            });
        },
    },
    // Multiplication & division
    {
        regex: /^(.+?)[\*|\/](.+?)$/,
        fn(str, matches) {
            const isMultiplication = str.includes('*');
            console.log('MULT/DIV', str, matches);
            if (isMultiplication) {
                return +matches[1] * +matches[2];
            } else {
                return +matches[1] / +matches[2];
            }
        },
    },
];

// TODO: Break token replacement into replace, compute

export default function(string) {
    let gridContext = {
        gridUnit: 10,
        x: 10,
        y: 10,
    };

    const lines = string
        .replace(/-\s*\n\s+?/g, ',')
        .trim()
        .split('\n');
    let tokens = [];
    lines
        .filter(
            line =>
                !(regEx.comment.test(line.trim()) || regEx.emptyLine.test(line))
        )
        .map(line => {
            const depth = (line.match(/ {2}/g) || []).length;
            line = line.trim().replace(/\r|\n/, '');

            if (/^\d/.test(line)) {
                line = `P ${line}`;
            }

            const typeRef = line.substr(0, 1);

            if (!typeRef) return;

            const type = typeDefinitions[typeRef];

            if (/[A|P|\+|C]/.test(typeRef)) {
                tokens.push({
                    name: 'path',
                    depth,
                });
            }

            const commands = line.split(
                new RegExp(`[ |^]?(?=[${Object.keys(commandRefs).join('|')}])`)
            );

            commands.forEach(command => {
                let [_, ref, argStr] = command.trim().split(/^(.)/);

                if (!commandRefs[ref]) return;

                const commandRef = commandRefs[ref];
                const { name = '', argsRegEx } = commandRef;
                let tokenArgs = [],
                    matches;

                tokenArgs = [...argStr.matchAll(argsRegEx)]
                    .map(match => match[1])
                    .filter(match => match !== undefined);

                tokenArgs = tokenArgs.map(arg => {
                    return arg
                        .trim()
                        .split(' ')
                        .map(str => {
                            console.log('Arg Str', str);
                            return +tokenReplacements.reduce((a, b) => {
                                return b.regex.test(a)
                                    ? b.fn(a, b.regex.exec(a), {
                                          ...gridContext,
                                      })
                                    : a;
                            }, str);
                        });
                });
                if (name === 'grid') {
                    if (!tokenArgs.length) return;
                    const [xUnits, yUnits, gridUnit] = tokenArgs[0];
                    gridContext = {
                        width: xUnits * gridUnit,
                        height: yUnits * gridUnit,
                        xUnits,
                        yUnits,
                        gridUnit,
                    };
                }
                tokens = [
                    ...tokens,
                    ...tokenArgs.map(args => ({
                        name,
                        args,
                        depth,
                    })),
                ];
            });
        });

    return tokens;
}
