var thinky = require('../thinky-conn.js');
var type = thinky.type;

var OAuthAccessToken = thinky.createModel('OAuthAccessToken', {
  accessToken : type.string(),
  clientId    : type.string(),
  userId      : type.string(),
  expires     : type.date()
});

module.exports = OAuthAccessToken;
