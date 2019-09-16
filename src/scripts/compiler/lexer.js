const regEx = {
    comment: /^\/\//,
    emptyLine: /^(\t| |\r)*$/,
};

const clamp = function(val, min, max) {
    return Math.min(Math.max(val, min), max);
};

const typeDefinitions = {
    P: 'path',
    v: 'path',
    A: 'path',
    a: 'path',
    C: 'path',
    G: 'grid',
    g: 'circlegrid',
    F: 'flip',
    R: 'rotate',
    T: 'translate',
    S: 'scale',
    D: 'difference',
    U: 'union',
    I: 'intersect',
};

const multiArgRegEx = /\s?([-|\d|\.|a-z|\*|\/|\s]+?),?$/;
const pairArgRegEx = /\s?([-|\d|\.|a-z|\*|\/]+\s[-|\d|\.|a-z|\*|\/]+)\s?/g;
const singleArgRegEx = /\s?([-|\d|\.|a-z|\*|\/]+)\s?$/g;
const singleOrPairArgRegEx = /\s?([-|\d|\.|a-z|\*|\/]+\s?[-|\d|\.|a-z|\*|\/]+)?\s?/g;

const commandRefs = {
    G: {
        name: 'grid',
        argsRegEx: /\s?(\d+\s\d+\s[\d|u|\.|w|h]+\s\d+)/,
    },
    g: {
        name: 'circlegrid',
        argsRegEx: multiArgRegEx,
    },
    R: {
        name: 'rotate',
        argsRegEx: multiArgRegEx,
    },
    F: {
        name: 'flip',
        argsRegEx: pairArgRegEx,
    },
    S: {
        name: 'scale',
        argsRegEx: singleArgRegEx,
    },
    I: {
        name: 'intersect',
        argsRegEx: multiArgRegEx,
    },
    T: {
        name: 'translate',
        argsRegEx: pairArgRegEx,
    },
    P: {
        name: 'point',
        argsRegEx: singleOrPairArgRegEx,
    },
    v: {
        name: 'vector',
        argsRegEx: singleOrPairArgRegEx,
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
    a: {
        name: 'varc',
        argsRegEx: multiArgRegEx,
    },
};

const { PI } = Math;
const HALF_PI = PI / 2;
const QUARTER_PI = PI / 4;
const TWO_PI = PI * 2;

const negative = str => str[0] === '-';

const preSplitReplacements = [
    {
        name: 'Single axis',
        regex: /^(.+?)([x|y])$/,
        replace(str, matches) {
            const isY = matches[2] === 'y';
            const result = `${isY ? '0 ' : ''}${matches[1]}${!isY ? ' 0' : ''}`;
            return result;
        },
    },
];

const tokenReplacements = [
    {
        name: 'Silver Ratio',
        regex: /sr/,
        replace(str, matches) {
            const result = str.replace(matches[0], Math.sqrt(2));
            return result;
        },
    },
    {
        name: 'Grid Units',
        regex: /(-?[\d|\.]*)u/,
        replace(str, matches, { gridUnit }) {
            return str.replace(matches[0], +matches[1] * gridUnit);
        },
    },
    {
        name: 'Center',
        regex: /^c([x|y])$/,
        replace(str, matches, { width, height, gridUnit }) {
            return str.replace(
                matches[0],
                { x: width, y: height }[matches[1]] / 2
            );
        },
    },
    {
        name: 'Parts of PI',
        regex: /-?([h|q])pi/,
        replace(str, matches) {
            const result = str.replace(
                /.pi/,
                { h: HALF_PI, q: QUARTER_PI }[matches[1]]
            );
            return result;
        },
    },
    {
        name: 'Width & Height',
        regex: /(-?[\d|\.]*)([w|h])/,
        replace(str, matches, { width, height }) {
            const multiplier = matches[1]
                ? matches[1] === '-'
                    ? -1
                    : matches[1]
                : 1;
            const replacement =
                clamp(+multiplier, -1, 1) * { w: width, h: height }[matches[2]];
            return str.replace(matches[0], replacement);
        },
    },
    {
        name: 'Pi',
        regex: /(-?[\d|\.]*)pi/,
        replace(str, matches) {
            console.log('PI', str, matches);
            const multiplier = matches[1]
                ? matches[1] === '-'
                    ? -1
                    : matches[1]
                : 1;
            return str.replace(matches[0], str => {
                return (multiplier || 1) * PI;
            });
        },
    },
    // Multiplication & division
    {
        regex: /^(.+?)([\*|\/|\-|\+])(.+?)$/,
        replace(str, matches) {
            // const isMultiplication = str.includes('*');
            return {
                '*': (a, b) => a * b,
                '+': (a, b) => a + b,
                '-': (a, b) => a - b,
                '/': (a, b) => a / b,
            }[matches[2]](+matches[1], +matches[3]);
            // if (isMultiplication) {
            //     return +matches[1] * +matches[3];
            // } else {
            //     return +matches[1] / +matches[3];
            // }
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
        .replace(/-\s*[\n|\r]\s*/g, ' ')
        .trim()
        .split('\n');
    let tokens = [];
    console.log(lines);
    lines
        .filter(
            line =>
                !(regEx.comment.test(line.trim()) || regEx.emptyLine.test(line))
        )
        .map(line => {
            const depth = (line.match(/ {2}/g) || []).length;
            line = line.trim().replace(/\r|\n/, '');

            if (/^[\d]/.test(line)) {
                line = `P ${line}`;
            }

            if (/^[v]/.test(line)) {
                line = `P 0 0,${line}`;
            }

            const typeRef = line.substr(0, 1);

            if (!typeRef) return;

            const type = typeDefinitions[typeRef];

            if (/[AaPvL]/.test(typeRef)) {
                tokens.push({
                    name: 'path',
                    depth,
                });
            }

            const commands = line.split(
                new RegExp(`^|[, ](?=[${Object.keys(commandRefs).join('')}])`)
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

                console.log('Token args', tokenArgs);

                tokenArgs = tokenArgs.map(arg => {
                    console.log(arg);
                    arg.trim();
                    arg = preSplitReplacements.reduce((a, b) => {
                        return b.regex.test(a)
                            ? b.replace(a, b.regex.exec(a))
                            : a;
                    }, arg);
                    console.log('ARG', arg);

                    return arg.split(' ').map(str => {
                        console.log(str);
                        return +tokenReplacements.reduce((a, b) => {
                            if (b.regex.test(a)) {
                                const matches = b.regex.exec(a);
                                const vars = { ...gridContext };
                                console.log(
                                    b.name,
                                    b.regex.toString(),
                                    matches,
                                    b.replace(a, matches, vars)
                                );
                                return b.replace(a, matches, vars);
                            } else {
                                return a;
                            }
                        }, str);
                    });
                });
                if (name === 'circlegrid') {
                    if (!tokenArgs.length) return;
                    const [radius, xUnits, yUnits] = tokenArgs[0];
                    gridContext = {
                        // width: xUnits * gridUnit,
                        // height: yUnits * gridUnit,
                        radius,
                        xUnits,
                        yUnits,
                        gridUnit,
                    };
                }
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
