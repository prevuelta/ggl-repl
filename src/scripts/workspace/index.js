import React from 'react';

import {MODE, MODE_TAG} from '../util/constants';

import {Source, Renderer} from './components';

const StatusBar = props => (
  <div className="statusbar">
    <span className="tag">{MODE_TAG[props.app.mode]} mode</span>
  </div>
);

const Workspace = props => {
  return (
    <div className="workspace">
      <StatusBar />
      <Source />
      <Renderer />
    </div>
  );
};

export default Workspace;
