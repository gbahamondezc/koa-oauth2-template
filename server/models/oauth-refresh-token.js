'use strict';

var thinky = require('../thinky-conn.js');
var type = thinky.type;

var OAuthRefreshToken = thinky.createModel('OAuthRefreshToken', {
  refreshToken : type.string(),
  clientId     : type.string(),
  userId       : type.string(),
  expires      : type.date()
});

module.exports = OAuthRefreshToken;
