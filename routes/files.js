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

router.post('/:user/images/:path', function(req, res, next) {
  var imageService = require('../services/imageService');
  var user = req.params.user;
  var path = req.params.path;
  imageService.getImagesForUser(user, function(err, images) {
    if(err) res.status(err.status || 400).send(err);
    else {
      return res.status(200).send({ photos: images });
    }
  });
});

/* GET list of images. */
router.get('/:user/images', function(req, res, next) {
  var imageService = require('../services/imageService');
  var user = req.params.user;
  imageService.getImagesForUser(user, function(err, images) {
    if(err) res.status(err.status || 400).send(err);
    else {
      return res.status(200).send({ photos: images });
    }
  });
});

router.get('/:user/images/:file', urlencodedParser, function(req, res, next) {
  var imageService = require('../services/imageService');
  var file = req.params.file;
  var user = req.params.user;
  imageService.getImage(user, file, function (err, pathToFile){
    res.sendFile(pathToFile);
  });
});

module.exports = router;