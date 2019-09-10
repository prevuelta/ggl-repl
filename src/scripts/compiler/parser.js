import React from 'react';
import ReactDOM from 'react-dom';
import GridLayer from '../workspace/components/layers/grid';
import { Node, Cross } from '../workspace/components/overlayHelperShapes';
import {
    HALF_PI,
    PI,
    TWO_PI,
    addVector,
    getAngle,
    getDistance,
    polarToCartesian,
    radToDeg,
} from '../util/trig';
import { Store } from '../data';

const { Fragment } = React;

function Grid(props) {
    const [xUnits, yUnits, gridUnit, divisions] = props.args;
    const width = xUnits * gridUnit;
    const height = yUnits * gridUnit;
    return (
        <GridLayer
            width={width}
            height={height}
            gridUnit={gridUnit}
            xUnits={xUnits}
            yUnits={yUnits}
            divisions={divisions}
        />
    );
}

export function tokenToSVGArc(token, isFirst) {
    const [
        startX,
        startY,
        centerX,
        centerY,
        angle,
        largeArcFlag,
        sweep,
    ] = token.args;

    return describeArc(
        { x: startX, y: startY },
        { x: centerX, y: centerY },
        angle,
        largeArcFlag,
        sweep
    );
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

function createSVGElement(type, token, childTokens, children) {}

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
    flip: ({ token }, children = []) => props => {
        const [x = 1, y = 1] = token.args;
        return (
            <g transform={`scale(${x}, ${y})`} transform-origin="center">
                {children.map(Child => (
                    <Child />
                ))}
            </g>
        );
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
        const [scale] = token.args;
        return (
            <g transform={`scale(${scale} ${scale})`}>
                {children.map(Child => (
                    <Child />
                ))}
            </g>
        );
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
                const arcData = tokenToSVGArc(token);
                string = `${idx ? 'L' : 'M'} ${arcData.string}`;
                currentLocation = arcData.end;
                points.push(
                    { x: currentLocation.x, y: currentLocation.y },
                    arcData.start,
                    arcData.end
                );
                helpers.push(
                    <circle
                        cx={arcData.center.x}
                        cy={arcData.center.y}
                        r={arcData.radius}
                        fill="none"
                        stroke="red"
                        opacity="0.5"
                    />,
                    <Cross
                        x={arcData.center.x}
                        y={arcData.center.y}
                        size={10}
                    />
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
            }

            pathString.push(string);
        });
        helpers = [
            ...points.map(({ x, y }) => <Node x={x} y={y} color="red" />),
            ...helpers,
        ];
        return props => (
            <Fragment>
                <path d={pathString.join(' ') + ' Z'} fillRule="evenodd" />
                {children.map((Child, i) => (
                    <Child key={i} />
                ))}
                {showHelpers && helpers}
            </Fragment>
        );
    },
    grid: ({ token, showHelpers }, children = []) => props => {
        return (
            <Fragment>
                {showHelpers && <Grid args={token.args} />}
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
        } else if (
            token.depth < currentDepth ||
            (node.token.name === 'path' && token.name === 'path') ||
            !isDrawCommand(token.name)
        ) {
            console.log(node.token, currentDepth);
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
            } else {
                node.children = [...(node.children || []), { token }];
            }
        }
        currentDepth = token.depth;
    });

    const output = { grids: [], paths: null };

    function iterateNodes(node) {
        const opt = { ...node, showHelpers };
        if (node.token.name === 'grid_DISABLE') {
            // output.grids.push(elements['grid'](node));
            return props => (
                <Fragment>
                    {(node.children || [])
                        .map(child => iterateNodes(child))
                        .map(El => (
                            <El />
                        ))}
                </Fragment>
            );
        }
        const elFn = elements[node.token.name];
        if (!elFn) return '';
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
