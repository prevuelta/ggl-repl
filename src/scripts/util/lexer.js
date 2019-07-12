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
    G: 'grid',
    F: 'fill',
};

const { PI } = Math;
const HALF_PI = PI / 2;
const TWO_PI = PI * 2;

const negative = str => str[0] === '-';

const tokenReplacements = [
    {
        regex: /(\d|\.+)u((\d+)y)*/,
        fn(str, matches, { gridUnit }) {
            const mul = matches[1];
            return +mul * gridUnit;
        },
    },
    {
        regex: /\d+?u$/,
        fn(str, matches, { gridUnit }) {
            const arr = str.split('u');
            return +arr[0] * gridUnit;
        },
    },
    {
        regex: /\d+?w$/,
        fn(str, matches, { width }) {
            const arr = str.split('w');
            return clamp(+arr[0], -1, 1) * width;
        },
    },
    {
        regex: /\d+?h$/,
        fn(str, matches, { height }) {
            const arr = str.split('h');
            return clamp(+arr[0], -1, 1) * height;
        },
    },
    {
        regex: /-?w$/,
        fn(str, matches, { width }) {
            return negative(str) ? -width : width;
        },
    },
    {
        regex: /-?h$/,
        fn(str, matches, { height }) {
            return negative(str) ? -height : height;
        },
    },
    {
        regex: /^-?[\d|\.]*pi$/,
        fn(str, matches) {
            const mult = +str.split('pi')[0];
            return (mult || 1) * (negative(str) ? -PI : PI);
        },
    },
    {
        regex: /-?hpi/,
        fn(str, matches) {
            return +str.replace('hpi', HALF_PI);
        },
    },
    {
        regex: /^c$/,
        fn(str, matches, { gridUnit, yUnits, xUnits }) {
            return `${(gridUnit * xUnits) / 2} ${(gridUnit * yUnits) / 2}`;
        },
    },
];

const tokenTypeMappings = {
    G: 'grid',
    P: 'point',
    '+': 'vector',
    A: 'arc',
    F: 'fill',
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
                line = `P${line}`;
            }

            const typeRef = line.substr(0, 1);

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

                tokenArgs = [...argStr.matchAll(pairRegEx)].map(
                    match => match[1]
                );
                tokenArgs = tokenArgs.map(arg => {
                    return arg
                        .trim()
                        .split(' ')
                        .map(str => {
                            let newArg = str;
                            for (let tr of tokenReplacements) {
                                if (tr.regex.test(str)) {
                                    const matches = tr.regex.exec(str);
                                    newArg = tr.fn(str, matches, {
                                        ...gridContext,
                                    });
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
