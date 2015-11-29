var express = require('express');
var controller = express.Router();
var User = require('../models/user');
var passport = require('passport');

controller.get('/', function(req, res) {
	res.send('respond with a resource');
});

controller.get('/register', function(req, res) {
	res.render('register', {
		"title": 'Register'
	});
});

controller.post('/register', function(req, res) {
	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.password;
	var avatar = null;
	if (req.files && req.files[0]) {
		var avatarImageOriginalName = req.files[0].originalname;
		avatar = req.files[0].filename;
		console.log('Uploading File ', avatarImageOriginalName, avatar);
	} else {
		avatar = 'noimage.png';
	}

	var user = new User({
		name: name,
		email: email,
		password: password,
		avatar: avatar
	});

	User.createUser(user, function(err, user) {
		if (err) {
			console.log('User create error: %j', err);
			req.flash('error', 'There was an error during User creation: ' + err);
			res.location('/users/register');
			res.redirect('/users/register');
		} else {
			console.log('User created: %j', user);
		}
	});

	req.flash('success', 'You are now registered and may login');
	res.location('/');
	res.redirect('/');
});

controller.get('/login', function(req, res) {
	res.render('login', {
		"title": 'Login'
	});
});

controller.post('/login',
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/users/login',
		failureFlash: true,
		successFlash: 'Successful login'
	})
);

controller.get('/logout', function(req, res) {
	req.logout();
	req.flash('success','You have been successfully logged-out');
	res.redirect('/users/login');
});

module.exports = controller;
