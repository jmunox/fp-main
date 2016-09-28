/**
 * Created by jmunoza on 28/09/16.
 */

var fs = require("fs");

var logger = require('../utils/logFactory').getLogger();
var imageService = {};
var storedImages = [];
var idCounter = 0;
var pathUserA = "/Users/jmunoza/odrive/Dropbox/Curation\ " +
  "Prototype/curationarena/public/images/photos_A";
var pathUSerB = "/Users/jmunoza/odrive/Dropbox/Curation\ " +
  "Prototype/curationarena/public/images/photos_B"

var imageSchema = function imageSchema(userId, filePath, fileName, callback) {
  var image = this;
  image.userId = userId;
  image._id = idCounter++;
  image.filePath = filePath;
  image.fileName = fileName;
  image.url = image._id + image.fileName;
  if(callback)
    return callback(null,image);
};

//static methods
imageService.processImageFromDir = function processImageFromDir(userId, path, cb) {
  fs.readdir(path, function(err, files) {

    // Check for images and push on the array if it's a match.
    files.forEach(function(name) {
      name.substr(-4).match(/(png|jpeg|jpg|gif)/) && storedImages.push(new imageSchema(userId, path, name))
    });
    if(err)
      return cb(err);
    return cb(null,storedImages);
  });
};


imageService.getImages = function getImages(cb){
  var context = this;
  context.processImageFromDir("UserA",pathUserA, function(err, images){
    if(!err) {
      storedImages = storedImages.concat(images);
      cb(null, storedImages);
    } else cb(err)
  });
};

imageService.getImage = function getImage(url, cb){
 storedImages.forEach(function(image){
   logger.debug("Looking for image at URL: " + url);
   logger.debug(image);
   if(url == image.url) {
     logger.debug("URL correct");
     fs.readFile(image.file + image.fileName, function(err, data) {
       if (err) throw err; // Fail if the file can't be read.
       cb(null, data);
     });
   }
 });
  var err = new Error('Not Found');
  err.status = 404;
  cb(err);
};



module.exports = imageService;