import React from 'react';
import Button from './button';
import { MODE_TAGS } from '../../util/constants';
import Notifications from './notifications';

export default props => (
    <div className="statusbar">
        <span className="tag">{MODE_TAGS[props.mode]} mode</span>
        <Button onClick={props.save}>Save</Button>
        <Notifications notifications={[props.message]} />
    </div>
);
