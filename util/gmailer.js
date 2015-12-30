var nodemailer = require('nodemailer');
var xoauth2 = require('xoauth2');
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config.'+env);

function Gmailer() {
  this.generator = xoauth2.createXOAuth2Generator({
    user: config.gmailer.user, // Your gmail address.
    clientId: config.gmailer.clientId,
    clientSecret: config.gmailer.clientSecret,
    refreshToken: config.gmailer.refreshToken
  });
  this.transporter = nodemailer.createTransport(({
    service: 'gmail',
    auth: {
      xoauth2: this.generator
    }
  }));
  this.generator.on('token', function(token) {
    console.log('New token for %s: %s', token.user, token.accessToken);
  });
}

Gmailer.prototype.sendMail = function(mailOptions, callback) {
  this.transporter.sendMail(mailOptions, callback);
};

module.exports = new Gmailer();
