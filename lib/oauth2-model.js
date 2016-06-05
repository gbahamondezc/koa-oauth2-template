'use strict';

const request = require('request-promise');
const qs = require('querystring');
const path = require('path');
const utils = require('./utils.js');
const secrets = require(path.join(
  path.resolve(), './config/oauth2-secrets.js')
);


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

    this.models.OAuthClient.filter({
      clientId : clientId
    })
    .then(client => {
      if (!client.length) {
        return callback(null);
      }
      client = client[0];

      if (clientSecret !== null && client.clientSecret !== clientSecret) {
        return callback();
      }

      return callback(null, {
        clientId     : client.clientId,
        clientSecret : client.clientSecret,
        redirectUri  : client.redirectUri
      });

    })
    .catch(err => {
      return callback(err);
    });
  }

  getUser(username, password, callback) {
    this.models.User.filter({
      email    : username
    })
    .then(users => {
      if (users.length && users[0].password) {
        utils.comparePassword(
          password,
          users[0].password
        )
        .then(match => {
          if (match) {
            var user = users[0];
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
    this.models.OAuthAccessToken.save({
      accessToken : accessToken,
      clientId    : clientId,
      userId      : userId.id,
      expires     : expires
    })
    .then(() => {
      return callback();
    })
    .catch(err => {
      return callback(err);
    });
  }

  getAccessToken(bearerToken, callback) {
    this.models.OAuthAccessToken.filter({
      accessToken : bearerToken
    })
    .then(result => {
      if (!result.length) {
        return callback();
      }

      var token = result[0];
      return callback(null, {
        accessToken : token.accessToken,
        clientId    : token.clientId,
        expires     : token.expires,
        userId      : token.userId
      });
    })
    .catch(err => {
      return callback(err);
    });
  }


  saveRefreshToken(token, clientId, expires, user, callback) {
    this.models.OAuthRefreshToken.save({
      refreshToken : token,
      clientId     : clientId,
      userId       : user.id,
      expires      : expires
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
    this.models.OAuthRefreshToken.filter({
      refreshToken : refreshToken
    })
    .then(result => {
      if (!result.length) {
        return callback();
      }
      let token = result[0];
      return callback(null, {
        accessToken : token.refreshToken,
        clientId    : token.clientId,
        expires     : token.expires,
        user    : [{
          id: token.userId
        }]
      });
    })
    .catch(err => {
      return callback(err);
    });
  }


  getAuthCode(authCode, callback) {
    this.models.OAuthAuthorizationCode.filter({
      authCode : authCode
    })
    .then(results => {
      if (!results.length) {
        return callback();
      }
      var authCode = results[0];
      return callback(null, authCode);
    })
    .catch(err => {
      return callback(err);
    });
  }


  saveAuthCode(authCode, clientId, expires, user, callback) {
    this.models.OAuthAuthorizationCode.save({
      authCode : authCode,
      clientId : clientId,
      expires  : expires,
      userId   : user.id
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
      filter.googleId = userData.googleId = profile.sub;
      userData.name = profile.name;
      userData.email = profile.email;
      userData.locale = profile.locale;
      userData.picture = profile.picture;
    }
    if (profile.id) {
      filter.githubId = userData.githubId = profile.id.toString();
      userData.name = profile.name;
      userData.username = profile.login;
      userData.picture = profile.avatar_url;
      userData.email = profile.email;
    }

    return this.models.User.filter(filter)
      .then(exists => {
        if (!exists.length) {
          return this.models.User.save(userData);
        }
        return exists[0];
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
