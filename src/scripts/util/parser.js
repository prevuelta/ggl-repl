import React from 'react';

const elements = {
    path: args => props => <path stroke="red" fill="none" d={args} />,
};

export default function(tokenGroups) {
    return tokenGroups.map(tokenGroup => {
        const pathString = [];
        tokenGroup.tokens.forEach((token, idx) => {
            let command;
            const [i, j] = token.arg;
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
        return elements[tokenGroup.type](pathString.join(' '));
    });
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
