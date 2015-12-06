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

controller.post('/', function(req, res) {
  var title = req.body.title;
  var category = req.body.category;
  var content = req.body.content;
  var coverImage = null;
  if (req.files && req.files[0]) {
    var coverImageOriginalName = req.files[0].originalname;
    coverimage = req.files[0].filename;
    console.log('Uploading File ', coverImageOriginalName, coverImage);
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

controller.get('/addPost', function(req, res) {
  res.render('addPost', {
    'title': 'Add Post'
  });
});

module.exports = controller;
