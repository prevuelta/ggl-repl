import React from 'react';
import GridLayer from '../workspace/components/layers/grid';
import {
    getDistance,
    getAngle,
    polarToCartesian,
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

function describeArc(start, center, angle, direction, sweep) {
    // if (angle < 0) {
    // direction = direction ? 0 : 1;
    // }
    angle += getAngle(start, center);
    // angle = TWO_PI - angle;
    // var start = polarToCartesian(x, y, radius, endAngle % (Math.PI * 2));

    // const a = start.x + center.x;
    // const b = start.y + center.y;
    // const radius = Math.sqrt(a*a + b*b);
    const radius = getDistance(start, center);
    var end = polarToCartesian(center, radius, angle);

    console.log(
        'Start',
        start,
        'Center',
        center,
        'Radius',
        radius,
        'Angle',
        angle,
        'End',
        end
    );

    function d(swp, dir) {
        var d = [
            'L',
            start.x,
            start.y,
            'A',
            radius,
            radius,
            0,
            sweep,
            dir,
            end.x,
            end.y,
        ].join(' ');
        return d;
    }

    return `${d()} ${d()} ${d()} ${d()}`;
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
