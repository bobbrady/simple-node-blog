var express = require('express');
var controller = express.Router();
var Post = require('../models/post');

controller.get('/', function(req, res) {
	Post.find({}, function(err, posts) {
    res.render('posts', {
			'title': 'Posts',
			'posts': posts
		});
	});
});

module.exports = controller;
