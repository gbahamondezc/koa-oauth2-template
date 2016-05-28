const path = require('path');

module.exports = {
  User              : require(path.join(__dirname, '/user.js')),
  OAuthAccessToken  : require(path.join(__dirname, '/oauth-access-token.js')),
  OAuthClient       : require(path.join(__dirname, '/oauth-client.js')),
  OAuthRefreshToken : require(path.join(__dirname, '/oauth-refresh-token.js')),
  OAuthAuthorizationCode : require(path.join(__dirname, '/oauth-authorization-code.js'))
};
