const regEx = {
    comment: /^\/\//,
    emptyLine: /^(\r| |\t)+$/,
};

const clamp = function(val, min, max) {
    return Math.min(Math.max(val, min), max);
};

const typeDefinitions = {
    v: 'path',
    p: 'path',
    a: 'path',
    g: 'grid',
};

const { PI } = Math;
const HALF_PI = PI / 2;
const TWO_PI = PI * 2;

const negative = str => str[0] === '-';

const tokenReplacements = [
    {
        regex: /\d+?U$/,
        fn(str, { gridUnit }) {
            const arr = str.split('U');
            return +arr[0] * gridUnit;
        },
    },
    {
        regex: /\d+?W$/,
        fn(str, { width }) {
            const arr = str.split('W');
            return clamp(+arr[0], -1, 1) * width;
        },
    },
    {
        regex: /\d+?H$/,
        fn(str, { height }) {
            const arr = str.split('H');
            return clamp(+arr[0], -1, 1) * height;
        },
    },
    {
        regex: /-?W$/,
        fn(str, { width }) {
            return negative(str) ? -width : width;
        },
    },
    {
        regex: /-?H$/,
        fn(str, { height }) {
            return negative(str) ? -height : height;
        },
    },
    {
        regex: /^-?[\d|\.]*PI$/,
        fn(str) {
            const mult = +str.split('PI')[0];
            return (mult || 1) * (negative(str) ? -PI : PI);
        },
    },
    {
        regex: /-?HPI/,
        fn(str) {
            return +str.replace('HPI', HALF_PI);
        },
    },
    {
        regex: /^C$/,
        fn(str, { gridUnit, yUnits, xUnits }) {
            return `${gridUnit * xUnits / 2} ${gridUnit * yUnits / 2}`;
        },
    },
];

const tokenTypeMappings = {
    g: 'grid',
    m: 'move',
    p: 'point',
    v: 'vector',
    a: 'arc',
    t: 'tangent',
    '': 'nest',
    '(': 'loop',
};

function getCommand() {}

export default function(string) {
    let gridContext = {
        gridUnit: 10,
        x: 10,
        y: 10,
    };

    const lines = string
        .replace(/-\n\s+?/g, ',')
        .trim()
        .split('\n');
    const tokenGroups = lines
        .filter(
            line =>
                !(regEx.comment.test(line.trim()) || regEx.emptyLine.test(line))
        )
        .map(line => {
            const nesting = (line.match(/ {2}/g) || []).length;
            line = line.trim().replace(/\r|\n/, '');

            if (/^\d/.test(line)) {
                line = `p${line}`;
            }

            const [_, typeRef] = /^(.)/.exec(line);

            if (!typeRef) return;

            const type = typeDefinitions[typeRef];

            const commands = line.split(
                new RegExp(
                    `[,| |^](?=[${Object.keys(tokenTypeMappings).join('|')}])`
                )
            );

            let tokens = [];

            commands.forEach(command => {
                let [_, ref, argStr] = command.trim().split(/^(.)/);
                const type = tokenTypeMappings[ref];
                let tokenArgs = [],
                    matches,
                    pairRegEx = /(.+?)(,|$)/g;

                while ((matches = pairRegEx.exec(argStr))) {
                    tokenArgs.push(matches[1]);
                }
                tokenArgs = tokenArgs.map(arg => {
                    return arg
                        .trim()
                        .split(' ')
                        .map(a => {
                            let newArg = a;
                            for (let tr of tokenReplacements) {
                                if (tr.regex.test(a)) {
                                    const raw = tr.regex.exec(a)[0];
                                    newArg = tr.fn(a, gridContext);
                                    break;
                                }
                            }

                            return +newArg;
                        });
                });
                if (type === 'grid') {
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
                        type,
                        args,
                    })),
                ];
            });

            return type === 'grid'
                ? { type, args: tokens[0].args, nesting }
                : {
                      type,
                      tokens,
                      nesting,
                  };
        });

    return tokenGroups;
}
