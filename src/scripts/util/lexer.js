const regEx = {
    comment: /^\/\//,
    emptyLine: /^\r$/,
};

const clamp = function(val, min, max) {
    return Math.min(Math.max(val, min), max);
};

const typeDefinitions = {
    v: 'path',
    p: 'path',
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

            const commands = line.split(/(?=[ |^][a-z].)/);

            let tokens = [];

            commands.forEach(command => {
                let [_, ref, argStr] = command.trim().split(/^(.)/);
                const type = tokenTypeMappings[ref];
                console.log(type, ref, argStr);
                let args = [],
                    matches,
                    pairRegEx = /(.+?),/g;

                while ((matches = pairRegEx.exec(argStr))) {
                    args.push(matches[1]);
                }
                args = args.map(arg => {
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
                    ...args.map(arg => ({
                        type,
                        arg,
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
