/* jshint node: true */
'use strict';

var express = require('express');
var controller = express.Router();
var async = require('async');
var https = require('https');
var Util = require('../util/blog-util');
var gmailer = require('../util/gmailer');
var Post = require('../models/post');
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config.' + env);
var util = require('util');

var getPaginateOptions = function(req) {
  var options = {};
  options.pageLimit = 2;
  options.category = req.params.category;
  options.page = isNaN(Number(req.query.page)) ? 1 : Number(req.query.page);
  options.sort = isNaN(Number(req.query.page)) ? -1 : Number(req.query.sort);
  options.nextDate = isNaN(Number(req.query.nextTime)) ? undefined : new Date(Number(req.query.nextTime));
  options.prevDate = isNaN(Number(req.query.prevTime)) ? undefined : new Date(Number(req.query.prevTime));
  return options;
};

var getQueryFromOptions = function(options) {
  var query = {};
  query.category = {
    $eq: options.category
  };
  query.homePage = {
    $eq: false
  };
  if (options.nextDate || options.prevDate) {
    query.created = {};
    if (options.nextDate)
      query.created.$gt = options.nextDate;
    if (options.prevDate)
      query.created.$lt = options.prevDate;
  }
  return query;
};

var getCategoryDTO = function(options, query, cb) {
  async.series([
    function(callback) {
      Post.findOne({
        "slug": options.category
      }, callback);
    },
    function(callback) {
      Post.find(query).sort({
        created: options.sort
      }).limit(2).exec(callback);
    },
    function(callback) {
      console.log('COUNTQuery %j', query);
      Post.find(query).count().exec(callback);
    }
  ], cb);
};

controller.get('/', function(req, res) {
  var post = {};
  post.category = 'Home';
  post.description = config.blog.description;
  post.coverImageUrl = config.blog.url + '/images/uploads/' + config.blog.homeImage;
  post.url = config.blog.url;
  res.render('index', {
    post: post
  });
});

controller.get('/contact', function(req, res) {
  var post = {};
  post.category = 'Contact';
  post.description = post.title;
  post.coverImageUrl = config.blog.url + '/images/uploads/' + config.blog.homeImage;
  post.url = config.blog.url + '/contact';
  res.render('contact', {
    post: post
  });
});

controller.get('/about', function(req, res) {
  var post = {};
  post.category = 'About';
  post.description = 'About BradyThink';
  post.coverImageUrl = config.blog.url + '/images/uploads/' + 'BradyThink-BobBrady-Image.png';
  post.url = config.blog.url + '/about';
  res.render('about', {
    post: post
  });
});

controller.get('/privacy-policy', function(req, res) {
  var post = {};
  post.category = 'Privacy';
  post.description = post.title;
  post.coverImageUrl = config.blog.url + '/images/uploads/' + config.blog.homeImage;
  post.url = config.blog.url + '/privacy-policy';
  res.render('privacy-policy', {
    post: post
  });
});

controller.get('/terms-conditions', function(req, res) {
  var post = {};
  post.category = 'Terms';
  post.description = post.title;
  post.coverImageUrl = config.blog.url + '/images/uploads/' + config.blog.homeImage;
  post.url = config.blog.url + '/terms-conditons';
  res.render('terms-conditions', {
    post: post
  });
});

controller.post('/contact', function(req, res) {
  async.waterfall([
    function(callback) {
      Util.verifyRecaptcha(req.body["g-recaptcha-response"], callback);
    },
    function(result, callback) {
      var message = util.format(config.gmailer.text, req.body.contactName, req.body.contactEmail,
        req.body.contactMessage);
      gmailer.sendMail({
        from: config.gmailer.from,
        to: config.gmailer.to,
        subject: config.gmailer.subject,
        text: message
      }, callback);
    }
  ], function(err, result) {
    if (err) {
      console.log('contact error %j', err);
      req.flash('error', 'An error during the submission of you message.  Please directly email bradythink');
    } else {
      req.flash('success', 'Your message was successfully posted');
    }
    res.redirect('/contact');
  });
});

controller.get('/:category', function(req, res, next) {
  var options = getPaginateOptions(req);
  var query = getQueryFromOptions(options);

  getCategoryDTO(options, query, function(error, result) {
    console.log('paginate result: %j', result);
    if (error || result[1] === null || result[2] === null) {
      res.sendStatus(500);
    } else if (result[0] === null) {
      res.sendStatus(404);
    } else {
      var pages = Math.ceil(result[2] / options.pageLimit);
      var prevPage = options.page < pages ? options.page + 1 : 0;
      var nextPage = options.page > 1 ? options.page - 1 : 0;
      console.log('Pages %d, nextPage %d, prevPage %d', pages, nextPage, prevPage);
      if (options.sort === 1) {
        result[1] = result[1].reverse();
      }
      var post = result[0];
      post.url = config.blog.url + '/' + post.slug;
      post.coverImageUrl = config.blog.url + '/images/uploads/' + post.coverImage;
      res.render('categoryPosts', {
        'title': post.title,
        'post': post,
        'posts': result[1],
        'count': result[2],
        'prevPage': prevPage,
        'nextPage': nextPage
      });
    }
  });

});

controller.get('/:category/:slug', function(req, res, next) {
  Post.findOne({
    "slug": req.params.slug
  }, function(err, post) {
    if (err) {
      return next(err);
    } else if (post === null) {
      res.sendStatus(404);
    } else {
      post.url = config.blog.url + '/' + Util.slugify(post.category) + '/' + post.slug;
      post.coverImageUrl = config.blog.url + '/images/uploads/' + post.coverImage;
      res.render('post', {
        'title': post.title,
        'post': post
      });
    }
  });
});

module.exports = controller;
