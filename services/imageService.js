/**
 * Created by jmunoza on 28/09/16.
 */

var fs = require("fs");

var logger = require('../utils/logFactory').getLogger();
var imageService = {};

var pathUserA = "/Users/jmunoza/wee/workspace/curationarena/public/images/photos_A";
var pathUserB= "/Users/jmunoza/odrive/Dropbox/Curation\ " +
  "Prototype/curationarena/public/images/photos_A";
var userB = '/Volumes/FUSE/summer2016';
var pathTest = userB;
var userFiles = [
  {
  userId : 'user_A',
  path: pathUserA,
  json: []
  },
  {
    userId : 'user_B',
    path: pathUserB,
    json: []
  }
];

/**
 *
 * @param userId
 * @param fileWithPath
 * @param fileName
 * @param directory
 * @param url
 * @param callback
 * @returns {*}
 *
 *  Example.
 *  It returns an object with the following structure:
 *     {
 *        "user":"UserA",
 *        "path":"./images/photos_A/P1010342.JPG",
 *        "directory": "./images/photos_A/",
 *        "name":"P1010342.JPG",
 *        "url":"/files/images/P1010342.JPG",
 *        "orientation": "1",
 *        "rotation": "Rotate 90 CW",
 *        "width": "2048",
 *        "height": "1360",
 *        "original_time": "2007:12:25 17:42:40",
 *        "creation_time": "2007:12:25 17:42:40",
 *        "modified_time": "2016:10:17 17:41:04+02:00",
 *        "access_time": "2016:10:17 17:41:04+02:00",
 *        "file_type_extension":"jpg",
 *        "mime_type":"image/jpeg",
 *        "icon" : "image",
 *        "bytes" : "2048",
 *        "size"  : "2048 bytes"
 *     }
 *
 */
var imageSchema = function imageSchema(userId, fileWithPath, fileName, directory, url, callback) {
  var image = this;
  image.user = userId;
  image.path = fileWithPath;
  image.name = fileName;
  image.directory = directory;
  image.url = url || "/files/" + userId + "/images/" + encodeURIComponent(fileWithPath);
  image.orientation;
  image.rotation;
  image.width;
  image.height;
  image.original_time;
  image.creation_time;
  image.modified_time;
  image.access_time;
  image.file_type;
  image.mime_type;
  image.icon = 'image';
  image.bytes;
  image.size;

  if(callback)
    return callback(null,image);
};

//static methods
/**
 * Load images from a specific path into an array
 * @param userId
 * @param path
 * @param cb
 */
imageService.processImageFromDir = function processImageFromDir(userId, path, cb) {
  var images = [];
  var fs = require("fs");
  logger.verbose('[imageService.processImageFromDir] Loading images, path: ' + path);
  fs.readdir(path, function(err, files) {
    var filePath = path;
    if(filePath.indexOf('/', filePath.length - 1) == -1) filePath += '/';
    // Check for images and push on the array if it's a match.
    files.some(function(name){
      name.substr(-4).match(/(png|jpeg|jpg|gif|JPG|JPEG|PNG|GIF)/) && images.push(new imageSchema(userId, filePath+name, name, filePath));
    });
    if(err) return cb(err);
    else return cb(null,images);
  });
};

imageService.loadExifData = function loadExifData (images, cb){

  //done in series because it calls exiftool via shell command and has to be
  // exif tool: http://www.sno.phy.queensu.ca/~phil/exiftool/
  // done in series.
  var everySeries = require('async').everySeries;
  everySeries(images, function(image, cb1) {
    //get exif
    /**
     * https://github.com/tj/node-exif
     */
    var exiftool = require('exif2');
    exiftool(image.path, function(err, exifMetadata){
      if (!err) {
        //logger.verbose('exif data loaded successfully: ' + image.path);
        /**
         *
         * 1 = Horizontal (normal)
         * 2 = Mirror horizontal
         * 3 = Rotate 180
         * 4 = Mirror vertical
         * 5 = Mirror horizontal and rotate 270 CW
         * 6 = Rotate 90 CW
         * 7 = Mirror horizontal and rotate 90 CW
         * 8 = Rotate 270 CW
         *
         */
        image.orientation = exifMetadata['orientation'];
        var rotation = exifMetadata['rotation'] || exifMetadata['orientation'] || '1';
        switch(rotation){
          case '1':
          case 'Horizontal (normal)':
            image.rotation = { index: '1', description: 'Horizontal (normal)'};
            break;
          case '2':
          case 'Mirror horizontal':
            image.rotation = { index: '2', description: 'Mirror horizontal'};
            break;
          case '3':
          case 'Rotate 180':
            image.rotation = { index: '3', description: 'Rotate 180'};
            break;
          case '4':
          case 'Mirror vertical':
            image.rotation = { index: '4', description: 'Mirror vertical'};
            break;
          case '5':
          case 'Mirror horizontal and rotate 270 CW':
            image.rotation = { index: '5', description: 'Mirror horizontal' +
            ' and rotate 270 CW'};
            break;
          case '6':
          case 'Rotate 90 CW':
            image.rotation = { index: '6', description: 'Rotate 90 CW'};
            break;
          case '7':
          case 'Mirror horizontal and rotate 90 CW':
            image.rotation = { index: '7', description: 'Mirror horizontal' +
            ' and rotate 90 CW'};
            break;
          case '8':
          case 'Rotate 270 CW':
            image.rotation = { index: '8', description: 'Rotate 270 CW'};
            break;
          default:
            image.rotation = { index: '1', description: 'Horizontal (normal)'};
            break;
        }
        image.width = exifMetadata['image width'];
        image.height = exifMetadata['image height'];
        /**
         * convert exifDate to normal date
         * https://github.com/briangershon/exif-date-to-iso
         */
        var moment = require('moment-timezone');
        var timeZone = moment.tz.guess();
        const exifDate = require('exif-date-to-iso');
        image.original_time = exifDate.toISO(exifMetadata['date time original'], timeZone);
        image.creation_time = exifDate.toISO(exifMetadata['create date'], timeZone);
        image.modified_time = exifDate.toISO(exifMetadata['modify date'], timeZone);
        image.access_time = exifDate.toISO(exifMetadata['file access date time'], timeZone);
        image.file_type = exifMetadata['file type extension'];
        image.mime_type = exifMetadata['mime type'];
        image.bytes = exifMetadata['file size'];
        image.size = exifMetadata['file size'];
        cb1(null, true);
      }
      else {
        logger.error('Problem while reading exif data from file: ' + image.path, err);
        cb1(err);
      }
    });
  }, function(err, result){
    if(err) return cb(err);
    else return cb(null,images);
  });
};

imageService.getImagesForUser = function getImagesForUser(userId,cb) {
  /*
   * TODO get path for user from DB
   */
  logger.debug(userId);
  userFiles.forEach(function (user){
    if(user.userId == userId) return cb(null,user.json);

  });

};

imageService.loadImagesOnStart = function loadImagesOnStart(cb){
  var context = this;
  userFiles.forEach(function (user){
    context.loadImagesForUser(user.userId, user.path, function(err, images){
      if(!err) {
        logger.debug('Photos for user:' + user.userId + ' loaded successfully');
        user.json = user.json.concat(images);
        cb(null);
      }
      else cb(err);
    });
  });
};

imageService.loadImagesForUser = function loadImagesForUser(user, path, cb) {
  var context = this;
  context.processImageFromDir(user,path, function(err, images){
    if(!err) {
      context.loadExifData(images, function(err, images){
        //storedImages = storedImages.concat(images);
        images = images.sort(function(a,b){
          if(a.original_time < b.original_time) return -1;
          else return 1;
        });
        /*
         * TODO save everything in DB
         */
        cb(null, images);
      });

    } else cb(err)
  });
};

/**TODO fix image lookup through USER_ID, URL and Path */
imageService.getImage = function getImage(user, url, cb) {
  var pathToFile = url;
  cb(null, pathToFile);
};

imageService.generateThumbnail = function generateThumbnail(images,cb){


};


module.exports = imageService;