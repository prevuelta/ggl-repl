import React from 'react';

export default props => (
    <div
        className="preview"
        dangerouslySetInnerHTML={{ __html: props.rendered }}
    />
);
