var express = require('express');
var controller = express.Router();
var Category = require('../models/category');
var Util = require('../util/blog-util');
var async = require('async');

controller.get('/add', isAuthenticated, function(req, res, next) {
  Category.find({}).sort({
    'name': 1
  }).exec(function(err, categories) {
    res.render('addCategory', {
      'title': 'Add Category',
      'categories': categories
    });
  });
});

controller.post('/', isAuthenticated, function(req, res) {
  var name = Util.slugify(req.body.name);
  var parentName = req.body.parent;
  var ancestors = [];
  async.waterfall(
    [
      function(callback) {
        if (parentName === 'home') {
          ancestors.push(parentName);
          var parent = {
            name: parentName
          };
          callback(null, parent);
        } else {
          Category.findOne({
            'name': parentName
          }, function(err, parent) {
            if (parent) {
              ancestors.push(parent.name);
              if (parent.ancestors) {
                Array.prototype.unshift.apply(ancestors, parent.ancestors);
              }
            }
            callback(null, parent);
          });
        }
      }
    ],
    function(err, parent) {
      var newCategory = new Category({
        name: name,
        parent: parent.name,
        ancestors: ancestors
      });

      Category.create(newCategory, function(err, category) {
        if (err) {
          console.log('Category %s creation error: %j', category, err);
          req.flash('error', 'There was an error during category creation: ' + err);
        } else {
          console.log('Category created: %j', newCategory);
          req.flash('success', 'Category ' + newCategory.name + ' was created');
        }
      });
    }
  );

  res.location('/');
  res.redirect('/');
});

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

module.exports = controller;
