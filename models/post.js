var mongoose = require('mongoose');

// Post Schema
var PostSchema = mongoose.Schema({
	title: {
		type: String,
		index: true
	},
	category:{
		type: String,
		required: true
	},
	content: {
		type:String,
		required: true
	},
	created:{
		type: Date,
		default: Date.now,
		required: true
	},
  coverImage: {
    type: String,
    required: false
  }
});

var Post = module.exports = mongoose.model('Post', PostSchema);

