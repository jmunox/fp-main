var $ = jQuery = require('../../../bower_components/jquery/dist/jquery');
var bootstrap = require('../../../bower_components/bootstrap-sass/assets/javascripts/bootstrap');
var React = require('/bower_components/react');
var name = 'YEY';
module.exports = React.createClass({
  render: function() {
    return (
      '<h1>Hello world from a React.j' + name + '</h1>'
    )
  }
});
