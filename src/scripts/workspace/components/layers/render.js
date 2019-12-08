import React from 'react';
import { withRune } from '../../../hocs';

function RenderLayer(props) {
    const { PathElements } = props;
    return <PathElements />;
}

export default withRune(RenderLayer);
