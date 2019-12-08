import React from 'react';
import { globals } from '../util';

export default El => {
    let { rune } = globals;
    globals.onUpdate = () => {
        rune = globals.rune;
    };
    return props => {
        return <El {...props} rune={rune} />;
    };
};
