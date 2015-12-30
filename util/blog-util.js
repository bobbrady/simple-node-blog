var https = require('https');
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config.'+env);

/*
 * Thanks to mathewbyme for the slugify snippet
 *
 * https://gist.github.com/mathewbyrne/1280286
 *
 */
var slugify = function(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};

var verifyRecaptcha = function(key, callback) {
  var params = 'secret=' + config.google.recaptchaSecret + '&response=' +key;
  https.get('https://www.google.com/recaptcha/api/siteverify?' + params,
    function(res) {
      var data = "";
      res.on('data', function(chunk) {
        data += chunk.toString();
      });
      res.on('end', function() {
        try {
          var parsedData = JSON.parse(data);
          console.log('verifyRecaptcha parsedData: ', parsedData);
          callback(null, parsedData.success);
        } catch (e) {
          console.log('verifyRecaptcha error: ', e);
          callback(e, null);
        }
      });
    });
};

module.exports = {
  slugify: slugify,
  verifyRecaptcha: verifyRecaptcha
};
