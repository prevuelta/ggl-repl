import React from 'react';
import ReactDOM from 'react-dom';
import { Grid, CircleGrid, GridContainer } from '../workspace/components';
import { Node, Cross } from '../workspace/components/overlayHelperShapes';
import { HALF_PI, PI, TWO_PI, addVector, getAngle, getDistance, polarToCartesian, radToDeg, COLORS } from '../util';
import { Store } from '../data';

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
    stroke: ({ token }, children = []) => props => {
        const [color = RED, strokeWidth = 1, strokeOpacity = 0.4] = token.args;
        // const strokeAlignment = { c: 'center', i: 'inner', o: 'outer' }[rawStrokeAlignment];
        return (
            <g stroke={color} strokeWidth={strokeWidth} strokeOpacity={strokeOpacity}>
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
        return <rect x={x1} y={y1} width={x2} height={y2} rx={cornerRadius} />;
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
        (tokens || []).forEach((token, idx) => {
            const { name, args } = token;
            let string = '';
            if (isPointOrVector(name)) {
                const [i, j] = args;
                let command;
                if (name === 'point') {
                    currentLocation.x = i;
                    currentLocation.y = j;
                    if (!idx) {
                        command = 'M';
                    } else {
                        command = 'L';
                    }
                } else if (name === 'vector') {
                    currentLocation.x += i;
                    currentLocation.y += j;
                    if (!idx) {
                        command = 'm';
                    } else {
                        command = 'l';
                    }
                }
                string = `${command} ${i} ${j}`;
                points.push({ x: currentLocation.x, y: currentLocation.y });
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
                console.log('Intersect args', args);
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
        });
        helpers = [...points.map(({ x, y }) => <Node x={x} y={y} color="red" />), ...helpers];
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
    squaregrid: ({ token, showHelpers }, children = []) => props => {
        return (
            <Fragment>
                {showHelpers && <GridContainer args={token.args} />}
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
    root: (_, children = []) => props => {
        return (
            <Fragment>
                {children.map((Child, i) => (
                    <Child key={i} />
                ))}
            </Fragment>
        );
    },
};

export default function(tokens, showHelpers = true) {
    let $refs = {};
    let state = Store.getState();
    let parseTree = { children: [], token: { name: 'root' } };
    let node = parseTree;
    let currentDepth = -1;
    tokens.forEach(token => {
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
        const opt = { ...node, showHelpers };
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
    return ['vector', 'point', 'arc'].includes(name);
}
function isPointOrVector(name) {
    return ['vector', 'point'].includes(name);
}
