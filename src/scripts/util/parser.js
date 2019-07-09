import React from 'react';
import GridLayer from '../workspace/components/layers/grid';
import {
    getDistance,
    getAngle,
    polarToCartesian,
    PI,
    HALF_PI,
    TWO_PI,
} from '../util/trig';

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

function describeArc(start, center, angle, largeArcFlag = 0) {
    let sweep = 0;

    const originalAngle = angle;
    const startAngle = getAngle(start, center);
    angle += startAngle;
    angle = angle % TWO_PI;

    if (originalAngle > PI || originalAngle < -PI) {
        sweep = 1;
    }

    if (angle >= PI) {
        largeArcFlag = 1;
    }

    const radius = getDistance(start, center);
    var end = polarToCartesian(center, radius, angle);

    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${sweep} ${largeArcFlag} ${end.x} ${end.y}`;
}

const commandArgMapping = {};

const elements = {
    path: tokenGroup => {
        const pathString = [];
        tokenGroup.tokens.forEach((token, idx) => {
            const { type } = token;
            let command, string;
            if (['point', 'vector'].includes(token.type)) {
                const [i, j] = token.args;
                string = `${i} ${j}`;
                if (token.type === 'point') {
                    if (!idx) {
                        command = 'M';
                    } else {
                        command = 'L';
                    }
                } else if (token.type === 'vector') {
                    if (!idx) {
                        command = 'm';
                    } else {
                        command = 'l';
                    }
                }
            } else if (token.type === 'arc') {
                command = '';
                const [
                    startX,
                    startY,
                    centerX,
                    centerY,
                    angle,
                    direction,
                    sweep,
                ] = token.args;
                string = describeArc(
                    { x: startX, y: startY },
                    { x: centerX, y: centerY },
                    angle,
                    direction,
                    sweep
                );
            }

            pathString.push(`${command} ${string}`);
        });
        return props => (
            <path stroke="black" fill="none" d={pathString.join(' ')} />
        );
    },
    grid: tokenGroup => props => <Grid args={tokenGroup.args} />,
};

export default function(tokenGroups) {
    return tokenGroups
        .map(tokenGroup => {
            if (elements.hasOwnProperty(tokenGroup.type)) {
                return elements[tokenGroup.type](tokenGroup);
            } else {
                console.warn(`Token ref ${tokenGroup.type} has no element`);
                return null;
            }
        })
        .filter(el => el !== null);
}
