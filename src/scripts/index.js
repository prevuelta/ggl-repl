import React from 'react';
import ReactDOM from 'react-dom';
import Workspace from './workspace';
import Store from './data/store';
import './util/keys';
// import 'brace/theme/github';
console.log(Workspace);

const render = () => {
  ReactDOM.render(
    <Workspace state={Store.getState()} />,
    document.getElementById('root')
  );
};

render();

Store.onUpdate(render);
