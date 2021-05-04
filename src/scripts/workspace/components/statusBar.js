import React from 'react';
import Button from './button';
import { MODE_TAGS } from '../../util/constants';
import Notifications from './notifications';

export default ({ mode, save, edit, svg, message, activeRune, help }) => (
  <div className="statusbar">
    <span className="tag">General Graphics Language</span>
    {activeRune && (
      <>
        <Button onClick={save}>Save</Button>
        <Button onClick={edit}>Edit</Button>
        <Button onClick={svg}>Get Svg markup</Button>
      </>
    )}
    {activeRune && <p>{activeRune.name}</p>}
    <Notifications notifications={[message]} />
    <Button style={{ marginLeft: 'auto' }} onClick={help}>
      Help
    </Button>
  </div>
);
