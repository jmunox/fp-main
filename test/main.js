// main.js
'use strict';

var React = require('react');
var ReactDOM = require('react-dom');

ReactDOM.render(React.createElement(
  'h1',
  null,
  'Hello, world!'
), document.getElementById('example'));

var myDivElement = React.createElement('div', { className: 'foo' });
ReactDOM.render(myDivElement, document.getElementById('example'));