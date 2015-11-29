var express = require('express');
var controller = express.Router();

/* GET home page. */
controller.get('/', function(req, res) {
  res.render('index', { title: 'Home' });
});

module.exports = controller;
