var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    bcrypt: true
  },
  avatar: {
    type: String,
    required: true
  }
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(user, callback) {
  bcrypt.hash(user.password, 10, function(err, hash) {
    if (err) throw err;
    user.password = hash;
    user.save(callback);
  });
};

module.exports.getUserByEmail = function(email, callback) {
  console.log('getUserByEmail query for %j', email);
  var query = {
    email: email
  };
  User.findOne(query, callback);
};

module.exports.isValidPassword = function(password, hash, callback) {
  bcrypt.compare(password, hash, function(err, isValid) {
    if (err) return callback(err);
    callback(null, isValid);
  });
};
