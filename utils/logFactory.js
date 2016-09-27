"use strict";

var winston = require('winston');
winston.emitErrs = true;

var customLevels = {
  levels : {
    verbose: 0,
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
    fatal: 5
  },
  colors : {
    verbose: 'grey',
    debug: 'green',
    info: 'blue',
    warn: 'yellow',
    error: 'red',
    fatal: 'red'
  }
};

var defaultConfig = {
  name: 'default',
  options: {
    console: {
      level: 'debug',
      colorize: true,
      timestamp: true,
      handleExceptions: true,
      humanReadableUnhandledException: true,
      json: false
    }
  }
};

//load config or defaultConfig
var loggingConfig = defaultConfig;
//TODO implement how to load other logging configurations

console.log('setting up logger winston', loggingConfig);
//winston.remove(winston.transports.Console); //remove default transport
winston.addColors(customLevels.colors);

winston.loggers.add(loggingConfig.name, loggingConfig.options);
winston.loggers.get(loggingConfig.name).handleExceptions();
winston.loggers.get(loggingConfig.name).exitOnError = false;

var logFactory;
logFactory = {
  /**
   * If name is empty, returns the default logger.
   * @param name
   * @returns logger
   */
  getLogger : function getLogger(name) {
    var _logName = (name || defaultConfig.name);
    var logger = winston.loggers.get(_logName);
    logger.stream = {
      write : function(message, encoding) {
        logger.info(message);
        console.log(message);
      }
    };
    return logger;
  }
};

module.exports =  logFactory;