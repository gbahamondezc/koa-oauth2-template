'use strict';

module.exports = function (types) {
  return {
    tableName : 'OAuthRefreshToken',
    attributes: {
      refreshToken : types.string(),
      clientId     : types.string(),
      userId       : types.string(),
      expires      : types.date()
    }
  };
};
