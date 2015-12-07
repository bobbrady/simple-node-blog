var express = require('express');
var controller = express.Router();
var Category = require('../models/category');

controller.get('/add', function(req, res, next) {
  res.render('addCategory',{
    "title":"Add Category"
  });
});

controller.post('/', function(req, res) {
  var category = req.body.category;

  var newCategory = new Category({
    category: category,
  });

  Category.create(newCategory, function(err, post) {
    if (err) {
      console.log('Category %s creation error: %j', category, err);
      req.flash('error', 'There was an error during Post creation: ' + err);
    } else {
      console.log('Category created: %j', newCategory);
      req.flash('success', 'Category ' + newCategory.category + ' was created');
    }
  });
  res.location('/');
  res.redirect('/');
});

module.exports = controller;
