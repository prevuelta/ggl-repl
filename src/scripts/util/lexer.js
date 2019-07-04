const regEx = {
    comment: /^\/\//,
    emptyLine: /^(\r|)$/,
};

const clamp = function(val, min, max) {
    return Math.min(Math.max(val, min), max);
};

const typeDefinitions = {
    v: 'path',
    p: 'path',
    G: 'grid',
};

const tokenReplacements = {
    '\\d+?u$': (str, { gridUnit }) => {
        const arr = str.split('u');
        return +arr[0] * gridUnit;
    },
    '\\d+?w$': (str, { width }) => {
        const arr = str.split('w');
        return clamp(+arr[0], -1, 1) * width;
    },
    '\\d+?h$': (str, { height }) => {
        const arr = str.split('h');
        return clamp(+arr[0], -1, 1) * height;
    },
    '-w|w': (str, { width }) => {
        return str.includes('-') ? -width : width;
    },
    '-h|h': (str, { height }) => {
        return str.includes('-') ? -height : height;
    },
    '^\\d*PI$' : str => {
      const mult = str.split('PI')[0];
      console.log(str, mult);
      return (+mult || 1) * Math.PI;
    }
};

const tokenTypeMappings = {
    G: 'grid',
    m: 'move',
    p: 'point',
    v: 'vector',
    a: 'arc',
    t: 'tangent',
    '': 'nest',
    '(': 'loop',
};

export default function(string) {
    let globals = {
        gridUnit: 10,
        x: 10,
        y: 10,
    };
    const lines = string.trim().split('\n');
    const tokenGroups = lines
        .filter(
            line => !(regEx.comment.test(line.trim()) || regEx.emptyLine.test(line))
        )
        .map(line => {
            const nesting = (line.match(/ {2}/g) || []).length
            line = line.trim().replace(/\r|\n/, '');

            if (/^\d/.test(line)) {
                line = `p ${line}`;
            }

            const typeRef = /^(.)/.exec(line)[1];
            const type = typeDefinitions[typeRef];

            const commands = line.split(
                new RegExp(
                    `[,| |^](?=[${Object.keys(tokenTypeMappings).join('|')}])`
                )
            );

            console.log('Commands', commands);

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
                            for (const regStr in tokenReplacements) {
                                const reg = new RegExp(regStr);
                                if (reg.test(a)) {
                                    const raw = reg.exec(a)[0];
                                    const fn = tokenReplacements[regStr];
                                    newArg = fn(a, globals);
                                    break;
                                }
                            }

                            return +newArg;
                        });
                });
                if (type === 'grid') {
                    const [xUnits, yUnits, gridUnit] = tokenArgs[0];
                    globals = {
                        width: xUnits * gridUnit,
                        height: yUnits * gridUnit,
                        xUnits,
                        yUnits,
                        gridUnit,
                    };
                    // console.log(globals);
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
                ? { type, args: tokens[0].args, nesting}
                : {
                      type,
                      tokens,
                      nesting
                  };
        });

    return tokenGroups;
}
