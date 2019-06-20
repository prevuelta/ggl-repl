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
