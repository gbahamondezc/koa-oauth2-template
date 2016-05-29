'use strict';

var thinky = require('../thinky-conn.js');
var type = thinky.type;

var OAuthClient = thinky.createModel('OAuthClient', {
  clientId    : type.string(),
  clienSecret : type.string(),
  redirectUri : type.string()
});

module.exports = OAuthClient;
