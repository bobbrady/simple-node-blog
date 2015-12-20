var express = require('express');
var controller = express.Router();

controller.get('/:category', function(req, res, next) {
  res.send(req.params.category);
});

controller.get('/:category/:slug', function(req, res) {
res.send(req.params.category + '/' + req.params.slug);
});

module.exports = controller;
