var express = require('express');
var async = require('async');
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
  console.log('req.body %j', req.body);
  var title = req.body.title;
  var category = req.body.category;
  var content = req.body.content;
  var coverImage = null;
  var categoryHome = req.body.categoryHome;

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

  async.waterfall([
    function(callback) {
      Post.create(post, callback);
    },
    function(post, callback) {
      if (categoryHome === 'true') {
        Category.findOneAndUpdate({
          "name": post.category
        }, {
          "homePage": post.slug
        }, callback);
      } else {
        callback(null, post);
      }
    }
  ], function(error, post) {
    if (error) {
      req.flash('error', 'There was an error during Post creation: ' + err);
    } else {
      req.flash('success', 'Post ' + post.title + ' was created');
    }
  });
  res.location('/');
  res.redirect('/');
});

controller.get('/addPost', isAuthenticated, function(req, res) {
  Category.find({}).sort({
    'name': 1
  }).exec(function(err, categories) {
    res.render('addPost', {
      'title': 'Add Post',
      'categories': categories
    });
  });
});

controller.delete('/:slug', isAuthenticated, function(req, res) {
  async.waterfall([
    function(callback) {
      Post.findOneAndRemove({
        "slug": req.params.slug
      }, callback);
    },
    function(post, callback) {
      Category.findOneAndUpdate({
        "homePage": req.params.slug
      }, {
        "homePage": null
      }, callback);
    }
  ], function(error, post) {
    if (error) {
      req.flash('error', 'There was an error during deletion of Post ' + req.params.slug + ': ' + err);
    } else {
      req.flash('success', 'Post ' + req.params.slug + ' was deleted');
    }
    res.redirect('/');
  });
});

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

module.exports = controller;
