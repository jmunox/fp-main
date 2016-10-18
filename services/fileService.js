/**
 * Created by jmunoza on 14/10/16.
 */
var fs = require("fs");

var logger = require('../utils/logFactory').getLogger();
var fileService = [];

var fileSchema = function fileSchema(filePath, root, isDir, bytes,  icon, modified, callback) {
  var file = this;
  file.path = filePath;
  file.is_dir = isDir || false;
  file.icon = icon || '';
  file.bytes = bytes || 0;
  file.root = root || '';
  file.modified = modified;
  file.size = bytes + ' bytes';
  if(callback)
    return callback(null,file);
};

fileService.processFilesFromDir = function listFiles(path, cb){
  var listFiles = [];
  var fs = require("fs");
  logger.debug(path);
  fs.readdir(path, function(err, files) {
    // Check for images and push on the array if it's a match.
    var filePath = path;
    if(filePath.indexOf('/', filePath.length - 1) == -1) filePath += '/';
    files.some(function(name){
      listFiles.push(new fileSchema(filePath + name, path));
    });
    if(err)
      return cb(err);
    else {
      return cb(null,listFiles);
    }
  });

};

fileService.loadMetaData = function loadExifData (files, cb){
  var fs = require("fs");
  //done in series because it takes too long before the
  // it gets the stats from the file
  var everySeries = require('async').everySeries;
  everySeries(files, function(file, cb1) {
    //get stats
    fs.stat(file.path, function(err, stats){
      if (!err) {
        file.is_dir = stats.isDirectory();
        file.bytes = stats.size;
        file.modified = stats.mtime;
        cb1(null, true);
      }
      else {
        logger.error('Problem while reading stats data from file: ' + file.filePath, err);
        cb1(err);
      }
    });
  }, function(err, result){
    if(err) return cb(err);
    else return cb(null,files);
  });
};

fileService.listFiles = function listFiles(path, cb) {
  var context = this;
  context.processFilesFromDir(path, function(err, files){
    if(!err) {
      context.loadMetaData(files, function(err, files){
        cb(null, files);
      });
    } else cb(err)
  });
};



module.exports = fileService;
