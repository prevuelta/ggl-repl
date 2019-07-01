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

const mappings = {
    '\\d+?u$': (str, { unit }) => {
        const arr = str.split('u');
        return +arr[0] * unit;
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

export default function(
    string,
    globals = { unit: 10, width: 100, height: 100 }
) {
    const lines = string.trim().split('\n');
    console.log('Lines', lines);
    const tokenGroups = lines
        .filter(
            line => !(regEx.comment.test(line) || regEx.emptyLine.test(line))
        )
        .map(line => {
            line = line.replace(/\r|\n/, '');
            if (/^\d/.test(line)) {
                line = `p ${line}`;
            }

            const typeRef = /^(.)/.exec(line)[1];
            const type = typeDefinitions[typeRef];

            const commands = line.split(
                new RegExp(
                    `/[,| |^](?=[${Object.keys(tokenTypeMappings).join('|')}])/`
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
                            for (const regStr in mappings) {
                                const reg = new RegExp(regStr);
                                if (reg.test(a)) {
                                    const raw = reg.exec(a)[0];
                                    const fn = mappings[regStr];
                                    newArg = fn(a, globals);
                                    break;
                                }
                            }

                            return +newArg;
                        });
                });
                tokens = [
                    ...tokens,
                    ...tokenArgs.map(args => ({
                        type,
                        args,
                    })),
                ];
            });

            return {
                type,
                tokens,
            };
        });

    return tokenGroups;
}
