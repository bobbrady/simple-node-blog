var mongoose = require('mongoose');
var Schema =  mongoose.Schema;

var CategorySchema = {
	name: {
		type: String,
		unique: true,
		required: true,
		index: true
	},
	homePage: {
		type: Schema.Types.ObjectId,
		ref: 'Post'
	},
	parent: String,
	ancestors: [String]
};


var Category = module.exports = mongoose.model('Category', CategorySchema);

