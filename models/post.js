var mongoose = require('mongoose');

// Post Schema
var PostSchema = mongoose.Schema({
	title: {
		type: String,
		index: true
	},
	category: {
		type: String,
		required: true,
		index: true
	},
	content: {
		type: String,
		required: true
	},
	slug: {
		type: String
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

/*
 * Thanks to mathewbyme for the slugify snippet
 *
 * https://gist.github.com/mathewbyrne/1280286
 *
 */
PostSchema.statics.slugify = function(text) {
	return text.toString().toLowerCase()
		.replace(/\s+/g, '-') // Replace spaces with -
		.replace(/[^\w\-]+/g, '') // Remove all non-word chars
		.replace(/\-\-+/g, '-') // Replace multiple - with single -
		.replace(/^-+/, '') // Trim - from start of text
		.replace(/-+$/, ''); // Trim - from end of text
};


PostSchema.pre('save', function(next) {
	this.slug = PostSchema.statics.slugify(this.title);
	next();
});


var Post = module.exports = mongoose.model('Post', PostSchema);
