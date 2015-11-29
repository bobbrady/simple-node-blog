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
	body: {
		type:String,
		required: true
	},
	author:{
		type: String,
		required: true
	},
	created:{
		type: Date,
		default: Date.now,
		required: true
	}
});

var Post = module.exports = mongoose.model('Post', PostSchema);

