var config = {};
config.gmailer = {};
config.google = {};
config.adminEnabled = true;
config.dbConnection='mongodb://localhost/simpleblog';
// Gmail settings
config.gmailer.user = '<GMAIL-USER-ACCOUNT-OAUTH>';
config.gmailer.from = '<FROM-EMAIL>';
config.gmailer.to = '<TO-EMAIL>';
config.gmailer.subject = 'BradyThink Contact Form Message';
config.gmailer.text = 'From Name: %s\n\nFrom Email: %s\n\nMessage: %s';
config.gmailer.clientId = '<GMAIL-CLIENT-ID>';
config.gmailer.clientSecret = '<GMAIL-CLIENT-SECRET>';
config.gmailer.refreshToken = '<GMAIL-REFRESH-TOKEN>';
config.google.recaptchaSecret = '<GOOGLE-RECAPTCHA-SECRET>';
module.exports = config;
