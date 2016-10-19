/**
 * Created by jmunoza on 14/10/16.
 */
var fs = require("fs");

var logger = require('../utils/logFactory').getLogger();
var fileService = [];

var fileSchema = function fileSchema(user, filePath, fileName, directory, isDir, bytes, icon, callback) {
  var file = this;
  file.user = user;
  file.path = filePath;
  file.name = fileName;
  file.directory = directory;
  file.is_directory = isDir || false;
  file.icon = icon || 'folder' ? isDir : '';
  file.bytes = bytes || '';
  file.size = bytes + ' bytes';
  file.original_time;
  file.creation_time;
  file.modified_time;
  file.access_time;
  file.file_type = isDir ? 'folder': '';
  file.mime_type;

  if(!icon && !isDir && fileName.substr(-4).match(/(png|jpeg|jpg|gif|JPG|JPEG|PNG|GIF)/)){
    file.icon =  'image';
  }

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
      listFiles.push(new fileSchema('userA', filePath + name, name, path));
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
        file.bytes = stats.size;
        file.modified_time = new Date(stats.mtime);
        file.access_time = new Date(stats.atime);
        files.creation_time = new Date(stats.birthtime || stats.ctime);
        files.original_time = new Date(stats.birthtime || stats.ctime);
        if(stats.isDirectory()){
          file.is_directory = true;
          file.icon = 'folder';
          file.file_type ='folder';
        }
        else if(file.name.substr(-4).match(/(png|jpeg|jpg|gif|JPG|JPEG|PNG|GIF)/)) {
          file.icon = 'image';
        }
        cb1(null, true);
      }
      else {
        logger.error('Problem while reading stats data from file: ' + file.path, err);
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
