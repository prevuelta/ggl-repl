import React from 'react';
import ReactDOM from 'react-dom';
import Workspace from './workspace';
import './util/keys';
// import 'brace/theme/github';

const render = () => {
  ReactDOM.render(<Workspace />, document.getElementById('root'));
};

render();
