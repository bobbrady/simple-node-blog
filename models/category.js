var mongoose = require('mongoose');

// Category Schema
var CategorySchema = mongoose.Schema({
	category: {
		type: String,
		required: true,
		index: true
	}
});

var Category = module.exports = mongoose.model('Category', CategorySchema);

