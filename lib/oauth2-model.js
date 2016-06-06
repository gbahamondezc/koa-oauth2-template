'use strict';

const join = require('path').join;
const resolve = require('path').resolve;
const qs = require('querystring');
const request = require('request-promise');
const utils = require('./utils.js');
const secrets = require(join(resolve(), '/config/oauth2-secrets.js'));


class OAuth2Model {

  constructor(models) {
    this.models = models;
    this.providers = {
      google: {
        accessTokenUrl : 'https://accounts.google.com/o/oauth2/token',
        peopleApiUrl   : 'https://www.googleapis.com/plus/v1/people/me/openIdConnect'
      },
      github : {
        accessTokenUrl : 'https://github.com/login/oauth/access_token',
        peopleApiUrl   : 'https://api.github.com/user'
      }
    };
  }

  getClient(clientId, clientSecret, callback) {

    this.models.OauthClient.find({
      where : {
        client_id : clientId
      }
    })
    .then(client => {
      if (!client) {
        return callback(null);
      }
      if (clientSecret !== null && client.client_secret !== clientSecret) {
        return callback();
      }
      return callback(null, {
        clientId     : client.client_id,
        clientSecret : client.client_secret,
        redirectUri  : client.redirect_uri
      });
    })
    .catch(err => {
      return callback(err);
    });
  }

  getUser(username, password, callback) {
    this.models.User.find({
      where : {
        email    : username
      }
    })
    .then(user => {
      if (user && user.password) {
        utils.comparePassword(
          password,
          user.password
        )
        .then(match => {
          if (match) {
            delete user.password;
            return callback(null, user);
          }
          return callback(null, false);
        })
        .catch(err => {
          return callback(err);
        });
      } else {
        return callback(null, false);
      }
    })
    .catch(err => {
      return callback(err);
    });
  }


  saveAccessToken(accessToken, clientId, expires, userId, callback) {
    this.models.OauthAccessToken.create({
      access_token : accessToken,
      client_id    : clientId,
      user_id      : userId.id,
      expires      : expires
    })
    .then(() => {
      return callback();
    })
    .catch(err => {
      return callback(err);
    });
  }

  getAccessToken(bearerToken, callback) {
    this.models.OauthAccessToken.find({
      where : {
        access_token : bearerToken
      }
    })
    .then(token => {
      if (!token) {
        return callback();
      }
      return callback(null, {
        accessToken : token.access_token,
        clientId    : token.client_id,
        expires     : token.expires,
        userId      : token.user_id
      });
    })
    .catch(err => {
      return callback(err);
    });
  }


  saveRefreshToken(token, clientId, expires, user, callback) {
    this.models.OauthRefreshToken.create({
      refresh_token : token,
      client_id     : clientId,
      user_id       : user.id,
      expires       : expires
    })
    .then(() => {
      return callback(null);
    })
    .catch(err => {
      return callback(err);
    });
  }

  grantTypeAllowed(clientId, grantType, cb) {
    if (grantType === 'password') {
      return cb(false, true);
      // authorizedClientIds.indexOf(clientId) >= 0
    }
    return cb(false, true);
  }


  getRefreshToken(refreshToken, callback) {
    this.models.OauthRefreshToken.find({
      where : {
        refresh_token : refreshToken
      }
    })
    .then(token => {
      if (!token) {
        return callback();
      }
      return callback(null, {
        accessToken : token.refresh_token,
        clientId    : token.client_id,
        expires     : token.expires,
        user    : [{
          id: token.user_id
        }]
      });
    })
    .catch(err => {
      return callback(err);
    });
  }


  getAuthCode(authCode, callback) {
    this.models.OauthAuthorizationCode.find({
      where : {
        auth_code : authCode
      }
    })
    .then(authCode => {
      if (!authCode) {
        return callback();
      }
      return callback(null, authCode.auth_code);
    })
    .catch(err => {
      return callback(err);
    });
  }


  saveAuthCode(authCode, clientId, expires, user, callback) {
    this.models.OauthAuthorizationCode.create({
      auth_code  : authCode,
      client_id  : clientId,
      expires    : expires,
      user_id    : user.id
    })
    .then(() => {
      return callback(null);
    })
    .catch(err => {
      return callback(err);
    });
  }


  extendedGrant(grantType, req,  callback) {
    if (grantType !== 'extern:auth') {
      return callback(null, false);
    }
    var provider = req.body.provider;
    var authCode = req.body.code;
    var clientId = req.body.clientId;
    var redirectUri = req.body.redirectUri;

    if (provider === 'google') {
      this.getGoogleProfile(authCode, clientId, redirectUri)
        .then(response =>  {
          this.existOrCreateUser(response)
            .then(user => {
              return callback(null, true, user);
            })
            .catch(err => {
              return callback(err);
            });
        })
        .catch(err => {
          return callback(err);
        });
    }

    if (provider === 'github') {
      this.getGithubProfile(authCode, clientId, redirectUri)
        .then(response => {
          this.existOrCreateUser(response)
            .then(user => {
              return callback(null, true, user);
            })
            .catch(err => {
              return callback(err);
            });
        })
        .catch(err => {
          return callback(err);
        });
    }

  }


  getGithubProfile(authCode, clientId, redirectUrl) {
    var params = {
      code : authCode,
      client_id : clientId,
      client_secret : secrets.github,
      redirect_uri : redirectUrl
    };
    return  request.get({
      url : this.providers.github.accessTokenUrl,
      qs  : params
    })
    .then(token => {
      var accessToken = qs.parse(token);
      var headers  = {'User-Agent': 'Mantle'};
      return request.get({
        url : this.providers.github.peopleApiUrl,
        qs  : accessToken,
        headers : headers,
        json : true
      });
    })
    .catch(err => {
      throw err;
    });
  }


  existOrCreateUser(profile) {

    var filter = {};
    var userData = {};

    if (profile.sub) {
      filter.google_id = userData.googleId = profile.sub;
      userData.name = profile.name;
      userData.email = profile.email;
      userData.locale = profile.locale;
      userData.picture = profile.picture;
    }
    if (profile.id) {
      filter.github_id = userData.githubId = profile.id.toString();
      userData.name = profile.name;
      userData.username = profile.login;
      userData.picture = profile.avatar_url;
      userData.email = profile.email;
    }

    return this.models.User.find({
      where : filter
    })
    .then(exists => {
      if (!exists) {
        return this.models.User.create(userData);
      }
      return exists;
    })
    .catch(err => {
      throw err;
    });
  }

  getGoogleProfile(authCode, clientId, redirectUri) {
    var params = {
      code : authCode,
      client_id : clientId,
      client_secret : secrets.google,
      redirect_uri : redirectUri,
      grant_type : 'authorization_code'
    };
    return request.post(this.providers.google.accessTokenUrl, {
      json : true,
      form : params
    })
    .then(token => {
      var accessToken = token.access_token;
      var headers = {Authorization: 'Bearer ' + accessToken};
      return request.get({
        url : this.providers.google.peopleApiUrl,
        headers : headers,
        json : true
      });
    })
    .catch(err => {
      throw err;
    });
  }
}

module.exports = OAuth2Model;
