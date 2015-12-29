var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var passportLocalAuth = require('./config/passport-local-auth')(passport);
var bodyParser = require('body-parser');
var connectFlash = require('connect-flash');
var multer = require('multer');
var flash = require('connect-flash');
var env = process.env.NODE_ENV || 'development';
var config = require('./config/config.'+env);
var mongoose =require('mongoose');
var methodOverride = require('method-override');

mongoose.connect(config.dbConnection);

var indexController = require('./controllers/index');
var userController = require('./controllers/users');
var postController = require('./controllers/posts');
var categoryController = require('./controllers/categories');

var app = express();

// Add globals
app.locals.adminEnabled = config.adminEnabled;


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(methodOverride('_method'));

// File upload confguraation
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

app.use(multer({
	storage: storage
}).any());

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

// Handle session-related processing after body parser
app.use(session({
	secret: 'secret',
	saveUninitialized: true,
	resave: true
}));

// Passport session processing loaded after Expression session
app.use(passport.initialize());
app.use(passport.session());


app.use(cookieParser());
//app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());
app.use(function(req, res, next) {
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
	next();
});

// Enable public and admin routes based on env config
app.use('/posts', postController);
if(config.adminEnabled) {
	app.use('/users', userController);
	app.use('/categories', categoryController);
}
app.use('/', indexController);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});


module.exports = app;
