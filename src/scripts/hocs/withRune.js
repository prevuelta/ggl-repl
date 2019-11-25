import React from 'react';
import { globals } from '../util';

console.log('Globals', globals);

export default El => {
    let { rune } = globals;
    globals.onUpdate = () => {
        rune = globals.rune;
    };
    return props => {
        return <El {...props} rune={rune} />;
    };
};
