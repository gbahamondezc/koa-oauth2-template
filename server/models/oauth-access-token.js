'use strict';

module.exports = function (types) {
  return {
    tableName : 'OAuthAccessToken',
    attributes: {
      accessToken : types.string(),
      clientId    : types.string(),
      userId      : types.string(),
      expires     : types.date()
    }
  };
};
