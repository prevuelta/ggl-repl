import React from 'react';
import ReactDOM from 'react-dom';
import { CircleGrid, SquareGrid, Line, TriGrid } from '../../workspace/components';
import { Node, Cross } from '../../workspace/components/overlayHelperShapes';
import { COLORS, HALF_PI, PI, TWO_PI, addVector, getAngle, getDistance, getDocumentSize, polarToCartesian, radToDeg, globals } from '../../util';
import { Store } from '../../data';
import { pathCommands } from '../lexer/commands';

const DEFAULT_DOC_ARGS = [100, 100, 0];

const { Fragment } = React;

const Helpers = ({ children, fill, stroke }) => {
    return (
        <g fill={fill || 'none'} stroke={stroke || 'red'} strokeWidth="1">
            {children}
        </g>
    );
};

export function tokenToArc(token, isFirst) {
    const [startX, startY, centerX, centerY, angle, largeArcFlag, sweep] = token.args;

    return describeArc({ x: startX, y: startY }, { x: centerX, y: centerY }, angle, largeArcFlag, sweep);
}

export function tokenToVArc(start, center, token) {
    const [_, __, angle, largeArcFlag, sweep] = token.args;

    return describeArc(start, center, angle, largeArcFlag, sweep);
}

function describeArc(start, center, angle, largeArcFlag = 0, sweep = 0) {
    const originalAngle = angle;
    const startAngle = getAngle(start, center);
    angle += startAngle;
    angle = angle % TWO_PI;

    if (originalAngle > PI || originalAngle < -PI) {
        // sweep = 1;
    }

    if (angle >= PI) {
        // largeArcFlag = largeArcFlag ? 0 : 1;
    }

    const radius = getDistance(start, center);
    var end = polarToCartesian(center, radius, angle);

    return {
        string: `${start.x} ${start.y} A ${radius} ${radius} 0 ${sweep} ${largeArcFlag} ${end.x} ${end.y}`,
        end,
        start,
        radius,
        center,
    };
}

function mapChildren(children) {
    return children.map((Child, i) => <Child key={i} />);
}

// TODO: generic transform element factory

const elements = {
    translate: ({ token }, children = []) => props => {
        const [x = 0, y = 0] = token.args;
        return (
            <g transform={`translate(${x} ${y})`}>
                {children.map(Child => (
                    <Child />
                ))}
            </g>
        );
    },
    reflect: ({ token }, children = []) => props => {
        const [distance] = token.args;
        const axis = token.data;
        const scale = { x: '1, -1', y: '-1, 1' }[axis];
        const distancePx = `${distance}px`;
        const origin = `${axis === 'y' ? distancePx : '0'} ${axis === 'x' ? distancePx : '0'}`;

        return (
            <>
                <g transform={`scale(${scale})`} transform-origin={origin}>
                    {children.map(Child => (
                        <Child />
                    ))}
                </g>
                {mapChildren(children)}
            </>
        );
    },
    fill: ({ token }, children = []) => props => {
        const [color = COLORS.BLACK] = token.args;
        return (
            <g fill={color}>
                {children.map(Child => (
                    <Child />
                ))}
            </g>
        );
    },
    style: ({ token }, children = []) => props => {
        const [fill = 'none', stroke = COLORS.RED, strokeWidth = 1, strokeOpacity = 1] = token.args;
        // const strokeAlignment = { c: 'center', i: 'inner', o: 'outer' }[rawStrokeAlignment];
        return (
            <g fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeOpacity={strokeOpacity}>
                {mapChildren(children)}
            </g>
        );
    },
    $ref: ({ token }) => props => {
        return <use href={`#${token.id}`} x="0" y="0" />;
    },
    rotate: ({ token }, children = []) => props => {
        const [angle, x = 0, y = 0] = token.args;
        return (
            <g transform={`rotate(${radToDeg(token.args[0])} ${x} ${y})`}>
                {children.map(Child => (
                    <Child />
                ))}
            </g>
        );
    },
    repeat: (args, children = []) => () => {
        return children.map(Child => <Child />);
    },
    scale: ({ token }, children = []) => props => {
        const [scaleX, scaleY] = token.args;
        return (
            <g transform={`scale(${scaleX} ${scaleY || scaleX})`}>
                {children.map(Child => (
                    <Child />
                ))}
            </g>
        );
    },
    square: ({ token }) => props => {
        const [x1, y1, x2, y2, cornerRadius = 0] = token.args;
        return <rect id={token.id} x={x1} y={y1} width={Math.max(0, x2)} height={Math.max(0, y2)} rx={cornerRadius} />;
    },
    circle: ({ token }) => props => {
        const [x, y, r] = token.args;
        return <circle cx={x} cy={y} r={r} />;
    },
    path: ({ tokens, token: path, showHelpers }, children = []) => {
        const pathString = [];
        let currentLocation = { x: 0, y: 0 };
        let helpers = [];
        const points = [];

        let previousToken;

        (tokens || []).forEach((token, idx) => {
            // console.log('Parsing path token');
            const { name, args } = token;
            let string = '';
            if (isPointOrVector(name)) {
                let [i, j] = args;
                let command;
                if (name === 'point') {
                    currentLocation.x = i;
                    currentLocation.y = j;
                    if (!idx) {
                        command = 'M';
                    } else {
                        command = 'L';
                    }
                } else if (name.includes('vector')) {
                    if (name === 'subvector') {
                        console.log('SIBTRAD');
                        currentLocation.x -= i;
                        currentLocation.y -= j;
                        i = -i;
                        j = -j;
                    } else {
                        currentLocation.x += i;
                        currentLocation.y += j;
                    }
                    if (!idx) {
                        command = 'm';
                    } else {
                        command = 'l';
                    }
                }
                string = `${command} ${i} ${j}`;
                points.push({ x: currentLocation.x, y: currentLocation.y });
            } else if (name === 'beziercurve') {
                let { x, y } = currentLocation;
                const [x2, y2, cx = 0, cy = 0, c2x = 0, c2y = 0] = token.args;
                if (previousToken.name === 'beziercurve') {
                    const prevCx = previousToken.args[4] || 0;
                    const prevCy = previousToken.args[5] || 0;
                    helpers.push(<circle cx={x - prevCx} cy={y - prevCy} r={4} />, <Line color={'green'} x1={x} y1={y} x2={x - prevCx} y2={y - prevCy} />);
                    x = x + x2;
                    y = y + y2;
                    currentLocation = { x, y };
                    string = `s ${cx},${cy} ${x2},${y2}`;
                } else {
                    currentLocation = { x: x + x2, y: y + y2 };
                    string = `M ${x} ${y} c ${cx},${cy} ${c2x + x2},${c2y + y2} ${x2},${y2}`;
                }
                if (cx || cy) {
                    helpers.push(<circle cx={x + cx} cy={y + cy} r={4} />, <Line color={'green'} x1={x} y1={y} x2={x + cx} y2={y + cy} />);
                }
                if (c2x || c2y) {
                    helpers.push(<circle cx={x + x2 + c2x} cy={y + y2 + c2y} r={4} />, <Line x1={x + x2} y1={y + y2} x2={x + x2 + c2x} y2={y + y2 + c2y} />);
                }
                console.log(string);
                points.push(currentLocation);
            } else if (name === 'arc') {
                const center = {
                    x: currentLocation.x + token.args[0],
                    y: currentLocation.y + token.args[1],
                };
                const arcData = tokenToVArc(currentLocation, center, token);
                string = `${idx ? 'L' : 'M'} ${arcData.string}`;
                currentLocation = arcData.end;
                points.push({ x: currentLocation.x, y: currentLocation.y }, arcData.start, arcData.end);
                helpers.push(
                    <circle cx={arcData.center.x} cy={arcData.center.y} r={arcData.radius} fill="none" stroke="red" strokeWidth="1" opacity="0.5" />,
                    <Cross x={arcData.center.x} y={arcData.center.y} size={10} />
                );
            } else if (name === 'corner') {
                // const nextToken = tokenGroup.tokens[idx + 1];
                const center = { x: args[0], y: args[1] };
                const dist = getDistance(currentLocation, center);
                const initialAngle = getAngle(currentLocation, center);
                const angle = args[2] || 0;
                const newAngle = angle + initialAngle;
                const newX = Math.cos(newAngle) * dist;
                const newY = Math.sin(newAngle) * dist;
                const end = addVector(center, { x: newX, y: newY });
                string = `L ${center.x} ${center.y} L ${end.x} ${end.y}`;
                points.push(center, end);
            } else if (name === 'intersect') {
                const [x1, y1, x2, y2, dist] = token.args;
                const p1 = {
                    x: x1,
                    y: y1,
                    color: 'green',
                };
                const p2 = {
                    x: x2,
                    y: y2,
                    color: 'purple',
                };
                helpers.push(<Cross x={p1.x} y={p1.y} color={p1.color} size={10} />, <Cross x={p2.x} y={p2.y} color={p2.color} size={10} />);
            }
            pathString.push(string);
            previousToken = token;
        });
        helpers = [...points.map(({ x, y }) => <Node x={x} y={y} color="red" />), ...helpers];
        helpers.push(<path d={pathString.join(' ')} stroke="red" fill="none" />);

        return props => (
            <Fragment>
                <path id={path.id} d={pathString.join(' ') + (path.closed ? ' Z' : '')} fillRule="evenodd" />
                {children.map((Child, i) => (
                    <Child key={i} />
                ))}
                {showHelpers && <Helpers children={helpers} />}
            </Fragment>
        );
    },
    trigrid: ({ token, showHelpers }, children = []) => props => {
        return (
            <Fragment>
                {showHelpers && <TriGrid args={token.args} />}
                {children.map((Child, i) => (
                    <Child key={i} />
                ))}
            </Fragment>
        );
    },
    squaregrid: ({ token, showHelpers }, children = []) => props => {
        return (
            <Fragment>
                {showHelpers && <SquareGrid args={token.args} />}
                {children.map((Child, i) => (
                    <Child key={i} />
                ))}
            </Fragment>
        );
    },
    circlegrid: ({ token, showHelpers }, children = []) => props => {
        const [radius, rings, segments, offset = 0] = token.args;
        const width = radius * 2;
        const height = radius * 2;
        return (
            <Fragment>
                {showHelpers && <CircleGrid width={width} height={height} radius={radius} segments={segments} rings={rings} />}
                {children.map((Child, i) => (
                    <Child key={i} />
                ))}
            </Fragment>
        );
    },
    root: ({ token }, children = []) => props => {
        return children.map(Child => <Child />);
    },
    document: ({ token, size, showHelpers }, children = []) => props => {
        let [width, height, padding] = token.args;
        if (width === 'a') {
            width = size.width;
        }
        if (height === 'a') {
            height = size.height;
        }

        const widthPlusPadding = width + padding * 2;
        const heightPlusPadding = height + padding * 2;
        const viewBox = `0 0 ${widthPlusPadding} ${heightPlusPadding}`;

        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="renderer-svg" height={heightPlusPadding} width={widthPlusPadding} fill={'#000000'} viewBox={viewBox}>
                {showHelpers && (
                    <>
                        <rect stroke="#ff00ff" fill="none" x={0} y={0} width={widthPlusPadding} height={heightPlusPadding} strokeDasharray="2 2" />
                        <rect stroke="none" fill="#000" x={padding} y={padding} width={width} height={height} opacity="0.05" />
                    </>
                )}

                <g transform={`translate(${padding}, ${padding})`}>
                    {children.map(Child => (
                        <Child />
                    ))}
                </g>
            </svg>
        );
    },
};

export default function(tokens, showHelpers = true) {
    let $refs = {};
    let parseTree = { children: [], token: { name: 'root' } };
    if (!tokens.length || tokens[0].name !== 'document') {
        tokens.unshift({ name: 'document', args: DEFAULT_DOC_ARGS, depth: 0 });
    }
    let node = parseTree;
    let currentDepth = -1;

    const size = getDocumentSize(tokens);

    tokens.forEach((token, i) => {
        if (i && token.name === 'document') {
            throw new Error('Document must be at root level');
        }
        if (token.depth > currentDepth) {
            const newBranch = { token };
            node.children = [...(node.children || []), newBranch];
            newBranch.parent = node;
            node = newBranch;
        } else if (token.depth < currentDepth || (node.token.name === 'path' && token.name === 'path') || !isDrawCommand(token.name)) {
            const dif = currentDepth - token.depth;
            for (let i = 0; i < dif; i++) {
                node = node.parent;
            }
            const newBranch = { token };
            node.parent.children.push(newBranch);
            newBranch.parent = node.parent;
            node = newBranch;
        } else {
            if (node.token.name === 'path') {
                node.tokens = [...(node.tokens || []), token];
                if (node.token.id) {
                    $refs[node.token.id] = node;
                }
            } else {
                node.children = [...(node.children || []), { token }];
            }
        }
        currentDepth = token.depth;
    });

    const output = { grids: [], paths: null };

    function iterateNodes(node) {
        const opt = { ...node, showHelpers, size };
        const elFn = elements[node.token.name];
        if (!elFn) return props => null;
        if (node.children) {
            return elFn(opt, node.children.map(child => iterateNodes(child)));
        }
        return elFn(opt);
    }

    console.log('TREE', parseTree);
    output.paths = iterateNodes(parseTree);
    // console.log('OUTPUT', output);
    return output;
}

function isDrawCommand(name) {
    return Object.values(pathCommands)
        .map(v => v.name)
        .includes(name);
}
function isPointOrVector(name) {
    return ['subvector', 'addvector', 'point'].includes(name);
}
