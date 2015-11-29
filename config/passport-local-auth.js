var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

module.exports = function(passport) {

	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});

	passport.use(new LocalStrategy({
			usernameField: 'email'
		},
		function(email, password, done) {
			process.nextTick(function() {
				console.log('passport local strat: %s email, %s password', email, password);
				User.findOne({
					'email': email,
				}, function(err, user) {
					if (err) {
						return done(err);
					}
					if (!user) {
						console.log('Unable to find user with email' + email);
						return done(null, false, {
							message: 'Unable to find user with email: ' + email
						});
					}
					User.isValidPassword(password, user.password, function(err, isValid) {
						if (err) throw err;
						if (isValid) {
							return done(null, user);
						} else {
							console.log('Invalid Password');
							return done(null, false, {
								message: 'Invalid Password'
							});
						}
					});
				});
			});
		}));
};
