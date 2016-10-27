/**
 * Created by jmunoza on 27/10/16.
 */

/**
 * Module dependencies.
 */

const spawn = require('child_process').spawn;
var shellwords = require('shellwords');

/**
 * Fetch EXIF data from `file` and invoke `fn(err, data)`.
 *
 * @param {String} file
 * @param {Object} execOpts [optional] options to pass to exec() for a finer control
 * @param {Function} fn
 * @api public
 */

module.exports = function(file, args, opts, fn){
  // rationalize options
  if(typeof args === 'function') {
    fn = args;
    args = [];
    opts = {};
  }
  else if(typeof opts === 'function') {
    fn = opts;
    opts = {};
  }

  args = args || [];


  // REM : exiftool options http://www.sno.phy.queensu.ca/~phil/exiftool/exiftool_pod.html
  // -json : ask JSON output
  //file =  shellwords.escape(String(file));
  var cmdArgs = ['-json', file].concat(args);
  var stdout = '';

  var exif = spawn('exiftool', cmdArgs , opts);

  exif.stdout.on('data',  (data) => {
    stdout += String(data);
  });

  exif.on('error',  (error) => {
    return fn(error);
  });

  exif.on('close',  (code) => {
    if(code === 0) {
      var obj = JSON.parse(stdout); // so easy
      return fn(null, obj.length > 1 ? obj : obj[0]);
    }
    else {
      return fn('Command closed unexpectedly');
    }

  });
};