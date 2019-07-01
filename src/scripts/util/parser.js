import React from 'react';
import GridLayer from '../workspace/components/layers/grid';

// import Grid from '../
function Grid(props) {
    console.log('Gridprops', props);
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

const elements = {
    path: args => {
        const pathString = [];
        tokenGroup.tokens.forEach((token, idx) => {
            let command;
            const [i, j] = token.args;
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

            pathString.push(`${command} ${i} ${j}`);
        });
        return props => (
            <path stroke="black" fill="none" d={pathString.join(' ')} />
        );
    },
    grid: args => props => <Grid args={args} />,
};

export default function(tokenGroups) {
    return tokenGroups
        .map(tokenGroup => {
            if (elements.hasOwnProperty(tokenGroup.type)) {
                return elements[tokenGroup.type](tokenGroup.args);
            } else {
                console.warn(`Token ref ${tokenGroup.type} has no element`);
                return null;
            }
        })
        .filter(el => el !== null);
}

// go from :
// [
//     { command: 'point', args: [0, 0] },
//     { command: 'point', args: [10, 0] },
//     { command: 'vector', args: [0, 10] },
//     { command: 'point', args: [0, 10] },
//     { command: 'point', args: [0, 0] },
//     { command: 'fill', args: 'red' },
// ];

// to: [
//     {
//         component: props => {
//             return <path d="M0 0 L10 0 l0 10 L0 10 0 0" />;
//         },
//         children: [],
//     },
// ];
