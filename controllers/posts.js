/* jshint node: true */
'use strict';

var express = require('express');
var async = require('async');
var controller = express.Router();
var Post = require('../models/post');
var Category = require('../models/category');
var Util = require('../util/blog-util');

controller.get('/', function(req, res) {
  Post.find({}, function(err, posts) {
    res.render('posts', {
      'title': 'Posts',
      'posts': posts
    });
  });
});

controller.get('/paginated', function(req, res) {
  var pageLimit = 2;
  var category = req.query.category;
  var page = isNaN(Number(req.query.page)) ? 1 : Number(req.query.page);
  var sort = isNaN(Number(req.query.page)) ? -1 : Number(req.query.sort);
  var nextDate = isNaN(Number(req.query.nextTime)) ? undefined : new Date(Number(req.query.nextTime));
  var prevDate = isNaN(Number(req.query.prevTime)) ? undefined : new Date(Number(req.query.prevTime));

  var query = {category: category};
  if (nextDate || prevDate) {
    query.created = {};
    if (nextDate)
      query.created.$gt = nextDate;
    if (prevDate)
      query.created.$lt = prevDate;
  }

  async.series([
    function(callback) {
      Post.find(query).sort({
        created: sort
      }).limit(2).exec(callback);
    },
    function(callback) {
      Post.find({}).count().exec(callback);
    }
  ], function(error, result) {
    console.log('paginate result: %j', result);
    if (error) {
      req.flash('error', 'There was an error retrieving the posts: ' + error);
      res.render('posts', {
        'title': 'Posts',
        'posts': {}
      });
    } else {
      var pages = Math.ceil(result[1] / pageLimit);
      var prevPage = page < pages ? page + 1 : 0;
      var nextPage = page > 1 ? page - 1 : 0;
      console.log('Pages %d, nextPage %d, prevPage %d', pages, nextPage, prevPage);
      if(sort === 1) {
        result[0] = result[0].reverse();
      }
      res.render('posts', {
        'title': 'Posts',
        'posts': result[0],
        'count': result[1],
        'prevPage': prevPage,
        'nextPage': nextPage
      });
    }
  });
});

controller.post('/', isAuthenticated, function(req, res) {
  console.log('req.body %j', req.body);
  var title = req.body.title;
  var category = req.body.category;
  var lead = req.body.lead;
  var content = req.body.content;
  var coverImage = null;
  var homePage = req.body.homePage;

  if (req.files && req.files[0]) {
    coverImage = req.files[0].originalname;
    console.log('Uploading File ', coverImage);
  } else {
    coverImage = 'noimage.png';
  }

  var post = new Post({
    title: title,
    category: category,
    homePage: homePage,
    lead: lead,
    content: content,
    coverImage: coverImage
  });

  async.waterfall([
    function(callback) {
      Post.create(post, callback);
    },
    function(post, callback) {
      if (homePage === 'true') {
        Category.findOneAndUpdate({
          "name": post.category
        }, {
          "homePage": post._id
        }, callback);
      } else {
        callback(null, post);
      }
    }
  ], function(error, post) {
    if (error) {
      req.flash('error', 'There was an error during Post creation: ' + error);
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

controller.get('/editPost/:slug', isAuthenticated, function(req, res) {
  async.series([
    function(callback) {
      Post.findOne({
        "slug": req.params.slug
      }, callback);
    },
    function(callback) {
      Category.find({}).sort({
        'name': 1
      }).exec(callback);
    }
  ], function(error, results) {
    console.log('results 1 %j', results[1]);
    res.render('editPost', {
      'title': 'Edit Post',
      'post': results[0],
      'categories': results[1]
    });
  });
});

controller.put('/:slug', isAuthenticated, function(req, res) {
  console.log('req.body %j', req.body);
  var _id = req.body._id;
  var title = req.body.title;
  var category = req.body.category;
  var lead = req.body.lead;
  var content = req.body.content;
  var coverImage = null;
  var homePage = req.body.homePage;

  if (req.files && req.files[0]) {
    coverImage = req.files[0].originalname;
    console.log('Uploading File ', coverImage);
  } else {
    coverImage = 'noimage.png';
  }

  var updatedPost = {
    title: title,
    slug: Util.slugify(title),
    category: category,
    homePage: homePage,
    lead: lead,
    content: content,
    coverImage: coverImage
  };

  console.log('Updated Post: %j', updatedPost);

  async.waterfall([
    function(callback) {
      Post.findOneAndUpdate({
        "_id": _id
      }, updatedPost, callback);
    },
    function(post, callback) {
      console.log('Updated POST %j', post);
      if (homePage === 'false') {
        Category.findOneAndUpdate({
          "homePage": _id
        }, {
          "homePage": null
        }, callback);
      } else {
        Category.findOneAndUpdate({
          "name": category
        }, {
          "homePage": _id
        }, callback);
      }
    }
  ], function(error, post) {
    if (error) {
      req.flash('error', 'There was an error during Post creation: ' + error);
    } else {
      req.flash('success', 'Post ' + post.title + ' was updated');
    }
  });
  res.location('/');
  res.redirect('/');
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
        "homePage": post._id
      }, {
        "homePage": null
      }, callback);
    }
  ], function(error, post) {
    if (error) {
      req.flash('error', 'There was an error during deletion of Post ' + req.params.slug + ': ' + error);
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
