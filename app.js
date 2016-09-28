"use strict";

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var logger = require('./utils/logFactory').getLogger();
logger.debug('Launching server...');
var app = express();

logger.debug('Overriding Express morgan logger');
// use 'combined' mode in morgan to show full details
app.use(morgan('dev', { stream: logger.stream }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'));

var routes = require('./routes/index');
app.use('/', routes);
var tests = require('./routes/tests');
app.use('/tests', tests);
var files = require('./routes/files');
app.use('/files/', files);

// catch 404 and forward to error handler
app.use(function(req, res, cb) {
  var err = new Error('Not Found');
  err.status = 404;
  cb(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, cb) {
    logger.error(err);
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, cb) {
  logger.error(err);
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;