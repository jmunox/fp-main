/**
 * Created by jmunoza on 27/09/16.
 */
"use strict";

var express = require('express');
var router = express.Router();
var logger = require('../utils/logFactory').getLogger();
var async = require('async');


/* GET home page. */
router.get('/images', function(req, res, next) {


  var allImages = {"photos":
    [
      {"url": "./images/photos_A/01.png",
        "id": "A-001"},
      {"url": "./images/photos_A/02.png",
        "id": "A-002"},
      {"url": "./images/photos_A/03.png",
        "id": "A-003"},
      {"url": "./images/photos_A/04.png",
        "id": "A-004"},
      {"url": "./images/photos_A/05.png",
        "id": "A-005"},
      {"url": "./images/photos_A/06.png",
        "id": "A-006"},
      {"url": "./images/photos_A/07.png",
        "id": "A-007"},
      {"url": "./images/photos_A/08.png",
        "id": "A-008"}
    ]
  };

  var imageService = require('../services/imageService');
  imageService.getImages(function(err, images){
    if(err) res.send(err.status || 400, err);
    else {
      return res.send(200, images);
    }
  });
});

/**TODO fix to get image as a resource */
router.get('/images/:url', function(req, res, next) {
  var imageService = require('../services/imageService');
  var url;
  url = req.params.url;
  async.series([
    function(callback){
      logger.debug("Getting image: "  + url);
      imageService.getImage(url, function(err, data){
        if(err) callback(err);
        else callback(null, data);
      } );
    }
  ],
  function(err, data){
    if(err) res.send(err.status || 400, err);
    else {
      res.writeHead(200, {'Content-Type': 'image/jpeg'});
      res.end(data); // Send the file data to the browser.
    }
  });
});

module.exports = router;