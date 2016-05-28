var thinky = require('../thinky-conn.js');
var type = thinky.type;

var OAuthClient = thinky.createModel('OAuthAuthorizationCode', {
  clientId    : type.string(),
  expires     : type.date(),
  userId      : type.string()
});

module.exports = OAuthClient;
