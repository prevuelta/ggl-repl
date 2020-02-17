import commands, { tokenNames } from './commands';
import { commentRegEx, emptyLineRegEx, pathTypesRegEx } from './regex';

const { SQUARE_GRID, TRI_GRID, CIRCLE_GRID, GRID_UNIT } = tokenNames;

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

const chars = '[0-9a-z*/+-.{}]';

const pairArgReplacements = [
    {
        name: 'XY',
        regex: `(${chars}+)xy`,
        parse(str) {
            const matches = [...str.matchAll(this.regex)];
            console.log('XY matches', matches);
            matches.forEach(match => {
                str = this.replace(str, match);
            });
            console.log(str);
            return str;
        },
        replace(str, matches) {
            const replacement = `${matches[1]} ${matches[1]}`;
            return str.replace(matches[0], replacement);
        },
    },
    {
        name: 'Center',
        regex: /c/,
        replace(str, matches, vars) {
            const { width, height } = vars || vars.circleGridContext;
            const center = `${width / 2} ${height / 2}`;
            const result = str.replace(matches[0], center);
            return result;
        },
    },
    {
        name: 'Loop interpolation',
        regex: '{(.)}',
        parse(str, vars) {
            const matches = [...str.matchAll(this.regex)];
            console.log('Matches', matches, vars);
            matches.forEach(match => {
                str = this.replace(str, match, vars);
            });
            return str;
        },
        replace(str, matches, { loopContext }) {
            console.log(str, matches, loopContext);
            return str.replace(matches[0], loopContext.count);
        },
    },
    {
        name: 'Circle unit',
        regex: /([0-9.]*)r([0-9.]*)/,
        replace(str, matches, { circleGridContext }) {
            const { radius, rings, segments, offset } = circleGridContext;
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
            // console.log('Single axis match', str, matches);
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
        regex: '([0-9.]*)u([0-9.]*)',
        parse(str, { type, gridUnit, gridDivisions }) {
            let replaceFn = match => {
                str = str.replace(match[0], +match[1] * gridUnit + +match[2] * (gridUnit / gridDivisions));
            };
            // if (type === TRI_GRID) {
            // replaceFn = match => {
            //   str = str.replace(match[0], +match[1] * gridUnit + +match

            // };
            // }

            const matches = [...str.matchAll(this.regex)];
            matches.forEach(replaceFn);
            return str;
        },
        replace(str, matches, { gridUnit, gridDivisions }) {
            const result = str.replace(matches[0], +matches[1] * gridUnit + +matches[2] * (gridUnit / gridDivisions));
            return result;
        },
    },
    {
        name: 'Center',
        regex: /^c([x|y])$/,
        replace(str, matches, { width, height, gridUnit }) {
            return str.replace(matches[0], { x: width, y: height }[matches[1]] / 2);
        },
    },
    {
        name: 'Parts of PI',
        regex: /-?([h|q])pi/,
        replace(str, matches) {
            const result = str.replace(/.pi/, { h: HALF_PI, q: QUARTER_PI }[matches[1]]);
            return result;
        },
    },
    {
        name: 'Width & Height',
        regex: /(-?[\d|.]*)([w|h])/,
        replace(str, matches, { width, height }) {
            // console.log('Width & height', str, matches, width, height);
            const multiplier = matches[1] ? (matches[1] === '-' ? -1 : matches[1]) : 1;
            const replacement = clamp(+multiplier, -1, 1) * { w: width, h: height }[matches[2]];
            return str.replace(matches[0], replacement);
        },
    },
    {
        name: 'Pi',
        regex: /(-?[\d|.]*)pi/,
        replace(str, matches) {
            const multiplier = matches[1] ? (matches[1] === '-' ? -1 : matches[1]) : 1;
            return str.replace(matches[0], str => {
                return (multiplier || 1) * PI;
            });
        },
    },
    {
        name: 'Arithmetic operations',
        regex: /([\d|.]+)([\*|/|\-|\+])([\d|.]+)/,
        parse(str, vars) {
            try {
                return eval(str); // Use mathjs for this at some point
            } catch (error) {
                return '';
            }
        },
        replace(str, matches) {
            console.log('Operations', str, matches);
            const result = {
                '*': (a, b) => a * b,
                '+': (a, b) => a + b,
                '-': (a, b) => a - b,
                '/': (a, b) => a / b,
            }[matches[2]](+matches[1], +matches[3]);
            return str.replace(matches[0], result);
        },
    },
];

function argReducerFactory(vars) {
    return (a, b) => {
        const regex = typeof b.regex === 'string' ? new RegExp(b.regex, 'g') : b.regex;
        /* console.log(regex.test(a), regex.exec(a), b.regex, a); */
        if (regex.test(a)) {
            if (b.parse) {
                return b.parse(a, vars);
            } else {
                return b.replace(a, regex.exec(a), vars);
            }
        } else {
            return a;
        }
    };
}

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
    let isRepeating = false;
    let loopContext;
    let exitLoopDepth;
    let loopLimit;

    console.log('lines', lines);

    lines
        .filter(line => !(commentRegEx.test(line.trim()) || emptyLineRegEx.test(line)))
        .map(line => {
            const depth = (line.match(/ {2}/g) || []).length;
            line = line.trim().replace(/\r|\n/, '');

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

            const commandRegEx = /^([a-z]{1,2})[:|=]/;

            if (!commandRegEx.test(line)) {
                return;
            }

            const lineMatches = line.match(commandRegEx);

            const command = lineMatches[1];

            // const type = commandTypes[typeRef];
            const idMatches = /=(.+?)(?=:)/.exec(line);

            if (command === 're') {
                isRepeating = true;
                loopLimit = +line.split(':')[1].split(' ')[0];
                exitLoopDepth = depth;
                tokens.push({
                    name: 'repeat',
                    depth,
                });
                return;
            } else {
                if (isRepeating && depth <= exitLoopDepth) {
                    isRepeating = false;
                }
            }

            if (isRepeating) {
                loopContext = {
                    count: 0,
                    increment: 1,
                    limit: loopLimit,
                    ref: 'x',
                };
                for (let i = 0; i < loopContext.limit; i++) {
                    processLine();
                    loopContext.count += loopContext.increment;
                }
            } else {
                processLine();
            }

            function processLine() {
                let id;
                if (idMatches) {
                    id = idMatches[1];
                    line = line.replace(idMatches[0], '');
                }

                if (pathTypesRegEx.test(command)) {
                    tokens.push({
                        name: 'path',
                        depth,
                        id,
                        closed: false,
                    });
                }

                const commandLines = line.split(new RegExp(`^|[, ](?=[${Object.keys(commands).join('')}]:)`));

                console.log('Command lines', commandLines);

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

                    const vars = {
                        ...gridContext,
                        circleGridContext,
                        loopContext,
                    };

                    const argReducer = argReducerFactory(vars);

                    tokenArgs = tokenArgs.map(argStr => {
                        argStr.trim();
                        argStr = pairArgReplacements.reduce(argReducer, argStr);
                        const parsedStr = argStr.split(' ').map(str => {
                            const arg = singleArgReplacements.reduce(argReducer, str);

                            return isNaN(arg) ? arg : +arg;
                        });
                        return parsedStr;
                    });

                    if (name === GRID_UNIT) {
                        gridContext.gridUnit = +tokenArgs[0];
                    }

                    if (name === CIRCLE_GRID) {
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

                        console.log(circleGridContext);
                    }
                    if (name === SQUARE_GRID || name === TRI_GRID) {
                        if (!tokenArgs.length) return;
                        const [xUnits, yUnits, gridUnit, gridDivisions = 1, offsetX = 0, offsetY = 0] = tokenArgs[0];

                        gridContext = {
                            type: name,
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
            }
        });

    return tokens;
}
