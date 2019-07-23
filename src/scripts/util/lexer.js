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
    G: 'grid',
    F: 'fill',
};

const commandRefs = {
  G: {
    name: 'grid',
    argsRegEx: /\s?(\d+\s\d+\s\d+\s\d+)/
  },
  P: {
    name: 'point',
    argsRegEx: /\s?([\d|a-z|\*|\/]+\s[\d|a-z|\*|\/]+)\s?/g
  },
  '+' : {
    name: 'vector',
    argsRegEx: /\s?([\d|a-z|\*|\/]+\s[\d|a-z|\*|\/]+)\s?/g
  },
  C: {
    name: 'corner',
    argsRegEx: /\s?([\d|a-z|\*|\/|\s]+?)$/
  },
  A: {
    name: 'arc',
    argsRegEx: /\s?([\d|a-z|\*|\/|\s]+?)$/
  }
}

const { PI } = Math;
const HALF_PI = PI / 2;
const TWO_PI = PI * 2;

const negative = str => str[0] === '-';

const tokenReplacements = [
    {
        name: 'Silver Ratio',
        regex: /sr/,
        fn(str, matches) {
            // console.log(matches);
            const result = str.replace(matches[0], Math.sqrt(2));
            // console.log("reult", result);
            return result;
        },
    },
    {
        regex: /(-?\d*)u((\d+)y)*/,
        fn(str, matches, { gridUnit }) {
            console.log(str);
            return str.replace(matches[0], +matches[1] * gridUnit);
        },
    },
    {
        regex: /(-?[\d|\.]*)([w|h])$/,
        fn(str, matches, { width, height }) {
            return (
                clamp(+matches[1] || 1, -1, 1) *
                { w: width, h: height }[matches[2]]
            );
        },
    },
    {
        regex: /^(-?[\d|\.]*)pi$/,
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
            return `${gridUnit * xUnits / 2} ${gridUnit * yUnits / 2}`;
        },
    },
    // Multiplication & division
    {
        regex: /^(.+?)[\*|\/](.+?)$/,
        fn(str, matches) {
            const isMultiplication = str.includes('*');
            console.log("Multmatch", str, matches);
            if (isMultiplication) {
              return +matches[1] * +matches[2];
            } else {
              return +matches[1] / +matches[2];
            }
        },
    },
];

function getCommand() {}

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
                depth
              });
            }

            const commands = line.split(
                new RegExp(
                    `[ |^](?=[${Object.keys(commandRefs).join('|')}])`
                )
            );

            commands.forEach(command => {
                let [_, ref, argStr] = command.trim().split(/^(.)/);
                const commandRef = commandRefs[ref];
                const { name, argsRegEx }= commandRef;
                let tokenArgs = [],
                    matches;

                tokenArgs = [...argStr.matchAll(argsRegEx)].map(
                    match => match[1]
                ).filter(match => !!match);

                tokenArgs = tokenArgs.map(arg => {
                    return arg
                        .trim()
                        .split(' ')
                        .map(str => {
                            return +tokenReplacements.reduce((a, b) => {
                                return b.regex.test(a) ? 
                                b.fn(a, b.regex.exec(a), { ...gridContext }) : a;
                            }, str);
                        });
                });
                if (name === 'grid') {
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
                        depth
                    })),
                ];
            });
        });

    return tokens;
}
