const commonRegEx = {
    comment: /^\/\//,
    emptyLine: /^(\t| |\r)*$/,
};

const clamp = function(val, min, max) {
    return Math.min(Math.max(val, min), max);
};

const commands = {
    d: {
        name: 'document',
    },
    sg: {
        name: 'squaregrid',
        type: 'grid',
    },
    cg: {
        name: 'circlegrid',
        type: 'grid',
    },
    r: {
        name: 'rotate',
        type: 'transform',
    },
    ry: {
        name: 'reflect',
        data: 'y',
        type: 'transform',
    },
    rx: {
        name: 'reflect',
        data: 'x',
        type: 'transform',
    },
    sc: {
        name: 'scale',
        type: 'transform',
    },
    tr: {
        name: 'translate',
        type: 'transform',
    },
    s: {
        name: 'stroke',
        type: 'style',
    },
    f: {
        name: 'fill',
        type: 'style',
    },
    p: {
        name: 'point',
        type: 'path',
    },
    '+': {
        name: 'vector',
        type: 'path',
    },
    l: {
        name: 'corner',
        type: 'path',
    },
    a: {
        name: 'arc',
        type: 'path',
    },
    ci: {
        name: 'circle',
        type: 'shape',
    },
    sq: {
        name: 'square',
        type: 'shape',
    },
};

const commandTypes = Object.keys(commands).reduce((a, b) => {
    a[b] = commands[b].type;
    return a;
}, {});

const pathTypesRegEx = /[ap\+l]/;

const { PI } = Math;
const HALF_PI = PI / 2;
const QUARTER_PI = PI / 4;
const TWO_PI = PI * 2;

const negative = str => str[0] === '-';

const pairArgReplacements = [
    {
        name: 'Circle unit',
        regex: /^(.+?)r(.+?)s$/,
        replace(str, matches, gridContext) {
            const { radius, rings, segments, offset } = gridContext;
            const r = +matches[1];
            const s = +matches[2];
            const sInterval = TWO_PI / segments;
            const rInterval = radius / rings;
            const theta = sInterval * s + offset;
            const newRadius = rInterval * r;
            const x = Math.cos(theta) * newRadius + radius;
            const y = Math.sin(theta) * newRadius + radius;
            const newStr = `${x.toFixed(4)} ${y.toFixed(4)}`;
            return newStr;
        },
    },
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

const singleArgReplacements = [
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
        regex: /((?:^-)?[\d|\.]*)u([\d|\.]*)/,
        replace(str, matches, { gridUnit, gridDivisions, gridPadding }) {
            console.log('Grid padding', gridPadding);
            return str.replace(
                matches[0],
                +matches[1] * gridUnit +
                    +matches[2] * (gridUnit / gridDivisions)
            );
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
            console.log('Width & height', str, matches, width, height);
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
    {
        name: 'Multiplication & division',
        regex: /^(.+?)([\*|\/|\-|\+])(.+?)$/,
        replace(str, matches) {
            return {
                '*': (a, b) => a * b,
                '+': (a, b) => a + b,
                '-': (a, b) => a - b,
                '/': (a, b) => a / b,
            }[matches[2]](+matches[1], +matches[3]);
        },
    },
];

// TODO: Break token replacement into replace, compute

export default function(string) {
    let gridContext = {
        gridUnit: 10,
        x: 10,
        y: 10,
        gridDivisions: 1,
        gridPadding: 0,
    };

    const lines = string
        .replace(/-\s*[\n|\r]\s*/g, ' ')
        .trim()
        .split('\n');
    let tokens = [];
    lines
        .filter(
            line =>
                !(
                    commonRegEx.comment.test(line.trim()) ||
                    commonRegEx.emptyLine.test(line)
                )
        )
        .map(line => {
            const depth = (line.match(/ {2}/g) || []).length;
            line = line.trim().replace(/\r|\n/, '');

            if (/^[\d]/.test(line)) {
                line = `p:${line}`;
            }

            if (/^[v]/.test(line)) {
                line = `p:0 0,${line}`;
            }

            const typeRef = line.substr(0, 1);

            if (!typeRef) return;

            const type = commandTypes[typeRef];
            const idMatches = /=(.+?)(?=:)/.exec(line);

            let id;
            if (idMatches) {
                id = idMatches[1];
                line = line.replace(idMatches[0], '');
            }

            if (pathTypesRegEx.test(typeRef)) {
                tokens.push({
                    name: 'path',
                    depth,
                    id,
                    closed: false,
                });
            }

            const refRegEx = /^#(.+?)\s?$/;

            if (refRegEx.test(line)) {
                const matches = refRegEx.exec(line);
                tokens.push({
                    name: '$ref',
                    depth,
                    id: matches[1],
                });
                return;
            }

            const commandLines = line.split(
                new RegExp(`^|[, ](?=[${Object.keys(commands).join('')}]:)`)
            );

            commandLines.forEach(command => {
                let [_, ref, argStr] = command.trim().split(/^(.{1,2}):/);

                if (!commands[ref]) {
                    console.warn(`Command not recognised - ${ref}`);
                    return;
                }

                const commandRef = commands[ref];
                const { name = '', argsRegEx } = commandRef;
                let tokenArgs = [],
                    matches;

                tokenArgs = argStr.trim().split(',');
                console.log('TokenArgs', tokenArgs);

                const vars = { ...gridContext };

                tokenArgs = tokenArgs.map(argStr => {
                    argStr.trim();
                    argStr = pairArgReplacements.reduce((a, b) => {
                        return b.regex.test(a)
                            ? b.replace(a, b.regex.exec(a), vars)
                            : a;
                    }, argStr);
                    return argStr.split(' ').map(str => {
                        const arg = singleArgReplacements.reduce((a, b) => {
                            if (b.regex.test(a)) {
                                const matches = b.regex.exec(a);
                                return b.replace(a, matches, vars);
                            } else {
                                return a;
                            }
                        }, str);

                        return isNaN(arg) ? arg : +arg;
                    });
                });
                if (name === 'circlegrid') {
                    if (!tokenArgs.length) return;

                    const [radius, rings, segments, offset = 0] = tokenArgs[0];

                    gridContext = {
                        width: radius * 2,
                        height: radius * 2,
                        radius,
                        segments,
                        rings,
                        offset,
                    };
                }
                if (name === 'squaregrid') {
                    if (!tokenArgs.length) return;
                    const [
                        xUnits,
                        yUnits,
                        gridUnit,
                        gridDivisions,
                        gridPadding,
                        offsetX = 0,
                        offsetY = 0,
                    ] = tokenArgs[0];

                    gridContext = {
                        width: xUnits * gridUnit,
                        height: yUnits * gridUnit,
                        xUnits,
                        yUnits,
                        gridUnit,
                        gridDivisions,
                        gridPadding,
                        offsetX,
                        offsetY,
                    };
                }
                tokens = [
                    ...tokens,
                    ...tokenArgs.map(args => ({
                        name,
                        data: commandRef.data,
                        args,
                        depth,
                    })),
                ];
            });
        });

    return tokens;
}
