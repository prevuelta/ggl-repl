import React from 'react';
import { globals } from '../util';

console.log('Globals', globals);

export default El => {
    const { rune } = globals;
    return props => {
        return <El {...props} rune={rune} />;
    };
};
