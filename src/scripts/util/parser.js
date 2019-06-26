import React from 'react';

const elements = {
    path: args => props => <path fill="red" d={args} />,
};

export default function(tokens) {
    // return tokens.map(token => elements[token.ref](token.args));
    return tokens.map(token =>
        // elements['path']('M 10 10 H 90 V 90 H 10 L 10 10')
        elements['path'](token.args)
    );
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
