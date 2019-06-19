'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import Workspace from './workspace';

import Store from './data/store';

import './util/keys';

const render = () => {
  ReactDOM.render(<Workspace />, document.getElementById('app'));
};

render();

Store.onUpdate(render);
