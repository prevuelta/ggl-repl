import React from 'react';
import GridLayer from '../workspace/components/layers/grid';
import {
    getDistance,
    getAngle,
    getCross,
    polarToCartesian,
    PI,
    HALF_PI,
    TWO_PI,
} from '../util/trig';
import { modes } from '../util/constants';
import { Store } from '../data';

let state = Store.getState();

// import Grid from '../
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
    console.log('Start', start, 'Center', center, 'Start angle', startAngle);
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

    return `${start.x} ${
        start.y
    } A ${radius} ${radius} 0 ${sweep} ${largeArcFlag} ${end.x} ${end.y}`;
}

const elements = {
    path: tokenGroup => {
        const pathString = [];
        let currentLocation = {x: 0, y: 0};
        tokenGroup.tokens.forEach((token, idx) => {
            const { type, args } = token;
            let string = '';
            if (['point', 'vector'].includes(type)) {
                const [i, j] = args;
                let command;
                if (type === 'point') {
                    currentLocation.x = i;
                    currentLocation.y = j;
                    if (!idx) {
                        command = 'M';
                    } else {
                        command = 'L';
                    }
                } else if (type === 'vector') {
                    currentLocation.x += i;
                    currentLocation.y += j;
                    if (!idx) {
                        command = 'm';
                    } else {
                        command = 'l';
                    }
                }
                string = `${command} ${i} ${j}`;
            } else if (type === 'arc') {
                string = `${idx ? 'L' : 'M'} ${tokenToSVGArc(token)}`;
                currentLocation.x = token.args[0];
                currentLocation.y = token.args[1];
            } else if (type === 'corner') {
                // const nextToken = tokenGroup.tokens[idx + 1];
                const center = { x: args[0], y: args[1] };
                const dist = getDistance(currentLocation, center);
                const initialAngle = getAngle(currentLocation, centeR);
                const newAngle = HALF_PI;//args[2] || 0;
                const end = { x: endX, y: endY };
                string = `L ${center.x} ${center.y}`;
            }
            pathString.push(string);
            previousToken = token;
        });
        return props => <path d={pathString.join(' ')} />;
    },
    grid: tokenGroup => props => <Grid args={tokenGroup.args} />,
};

export default function(tokenGroups) {
    let state = Store.getState();
    return tokenGroups.reduce(
        (obj, tokenGroup) => {
            if (elements.hasOwnProperty(tokenGroup.type)) {
                const element = elements[tokenGroup.type](tokenGroup);
                if (tokenGroup.type === 'grid') {
                    obj.grids.push(element);
                } else {
                    obj.paths.push(element);
                }
            } else {
                console.warn(`Token ref ${tokenGroup.type} has no element`);
            }
            return obj;
        },
        { grids: [], paths: [] }
    );
}
