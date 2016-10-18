/**
 * Created by jmunoza on 27/09/16.
 */
"use strict";

var express = require('express');
var router = express.Router();
var logger = require('../utils/logFactory').getLogger();
var async = require('async');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });


/* GET list of files. */
router.get('/filesystem', function(req, res, next) {
  var fileService =  require('../services/fileService');
  var path = '/';
  fileService.listFiles(path, function (err, fileList) {
    if(err) res.status(err.status || 400).send(err);
    else {
      return res.status(200).send({ files: fileList });
    }
  });
});

router.get('/filesystem/:path', urlencodedParser, function(req, res, next) {
  var fileService =  require('../services/fileService');
  var path = req.params.path || '/';
  fileService.listFiles(path, function (err, fileList) {
    if(err) res.status(err.status || 400).send(err);
    else {
      return res.status(200).send(fileList);
    }
  });
});

/* GET list of images. */
router.get('/filesystem/:path/images', function(req, res, next) {
  var imageService = require('../services/imageService');
  var path = req.params.path || '/';
  imageService.getImages(path, function(err, images){
    if(err) res.status(err.status || 400).send(err);
    else {
      return res.status(200).send({ photos: images });
    }
  });
});

router.get('/images', function(req, res, next) {
  var imageService = require('../services/imageService');
  var path = "/Users/jmunoza/odrive/Dropbox/Curation\ " +
    "Prototype/curationarena/public/images/photos_B";

  imageService.getImages(path, function(err, images){
    if(err) res.status(err.status || 400).send(err);
    else {
      //var _ = require('underscore');
      //_.sortBy(images)
      images.sort(function(a,b){
        var dateA = (new Date(a.original_time));
        var dateB = (new Date(b.original_time));
        logger.verbose(i++);
        return (dateA - dateB);
      });
      return res.status(200).send({ photos: images });
    }
  });
});

router.get('/images/:file', urlencodedParser, function(req, res, next) {
  var imageService = require('../services/imageService');
  var fileName;
  fileName = req.params.file;
  imageService.getImage(fileName, function (err, pathToFile){
    res.sendFile(pathToFile);
  });
});

module.exports = router;