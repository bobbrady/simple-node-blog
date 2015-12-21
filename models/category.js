var mongoose = require('mongoose');

var CategorySchema = {
  name: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  parent: String,
  ancestors: [String]
};


var Category = module.exports = mongoose.model('Category', CategorySchema);

