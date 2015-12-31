var mongoose = require('mongoose');
var Util = require('../util/blog-util');

// Post Schema
var PostSchema = mongoose.Schema({
	title: {
		type: String,
		index: true,
		unique: true
	},
	category: {
		type: String,
		required: true,
		index: true
	},
	homePage: {
		type: Boolean,
		required: true
	},
	lead: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	content: {
		type: String,
		required: true
	},
	slug: {
		type: String,
		index: true,
		unique: true
	},
	created: {
		type: Date,
		default: Date.now,
		required: true
	},
	coverImage: {
		type: String,
		required: false
	}
});

PostSchema.pre('save', function(next) {
	this.slug = Util.slugify(this.title);
	next();
});


var Post = module.exports = mongoose.model('Post', PostSchema);
