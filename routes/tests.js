"use strict";

var express = require('express');
var router = express.Router();

/* GET tests listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* GET helloworld page. */
router.get('/helloworld', function(req, res, next) {
  res.render('tests/helloworld', { title: 'Hello World' });
});



module.exports = router;