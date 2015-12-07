var express = require('express');
var controller = express.Router();
var Post = require('../models/post');
var Category = require('../models/category');

controller.get('/', function(req, res) {
  Post.find({}, function(err, posts) {
    res.render('posts', {
      'title': 'Posts',
      'posts': posts
    });
  });
});

controller.post('/', isAuthenticated, function(req, res) {
  var title = req.body.title;
  var category = req.body.category;
  var content = req.body.content;
  var coverImage = null;
  if (req.files && req.files[0]) {
    coverImage = req.files[0].originalname;
    console.log('Uploading File ', coverImage);
  } else {
    coverImage = 'noimage.png';
  }

  var post = new Post({
    title: title,
    category: category,
    content: content,
    coverImage: coverImage
  });

  console.log('req.body %j', req.body);

  Post.create(post, function(err, post) {
    if (err) {
      console.log('Post %j creation error: %j', err);
      req.flash('error', 'There was an error during Post creation: ' + err);
    } else {
      console.log('Post created: %j', post);
      req.flash('success', 'Post ' + post.title + ' was created');
    }
  });
  res.location('/');
  res.redirect('/');
});

controller.get('/addPost', isAuthenticated, function(req, res) {
  Category.find({}, function(err, categories) {
    res.render('addPost', {
      'title': 'Add Post',
      'categories': categories
    });
  });
});

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

module.exports = controller;
