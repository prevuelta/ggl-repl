import commands from './commands';
import { commentRegEx, emptyLineRegEx, pathTypesRegEx } from './regex';

const clamp = function(val, min, max) {
    return Math.min(Math.max(val, min), max);
};

const commandTypes = Object.keys(commands).reduce((a, b) => {
    a[b] = commands[b].type;
    return a;
}, {});

const { PI } = Math;
const HALF_PI = PI / 2;
const QUARTER_PI = PI / 4;
const TWO_PI = PI * 2;

const pairArgReplacements = [
    {
        name: 'Center',
        regex: /c/,
        replace(str, matches, { width, height }) {
            const center = `${width / 2} ${height / 2}`;
            return str.replace(matches[0], center);
        },
    },
    {
        name: 'Circle unit',
        regex: /^(.+?)r(.+?)$/,
        replace(str, matches, vars) {
            const { radius, rings, segments, offset } = vars.circleGridContext;
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
        regex: /(-?.+?)([x|y])/,
        replace(str, matches) {
            console.log('Single axis match', str, matches);
            const isY = matches[2] === 'y';
            const result = `${isY ? '0 ' : ''}${matches[1]}${!isY ? ' 0' : ''}`;
            return str.replace(matches[0], result);
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
        replace(str, matches, { gridUnit, gridDivisions }) {
            console.log(str, matches, gridUnit, gridDivisions);
            const result = str.replace(
                matches[0],
                +matches[1] * gridUnit +
                    +matches[2] * (gridUnit / gridDivisions)
            );

            console.log(result);

            return result;
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
    };

    let circleGridContext = {};

    const lines = string
        .replace(/-\s*[\n|\r]\s*/g, ',')
        .trim()
        .split('\n');
    let tokens = [];
    lines
        .filter(
            line =>
                !(commentRegEx.test(line.trim()) || emptyLineRegEx.test(line))
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

                const vars = { ...gridContext, circleGridContext };

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

                if (name === 'gridunit') {
                    gridContext.gridUnit = +tokenArgs[0];
                }

                if (name === 'circlegrid') {
                    if (!tokenArgs.length) return;

                    const [radius, rings, segments, offset = 0] = tokenArgs[0];

                    circleGridContext = {
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
                        gridDivisions = 1,
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
                        id,
                    })),
                ];
            });
        });

    return tokens;
}
