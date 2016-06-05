'use strict';

module.exports = function (types) {
  return {
    tableName : 'OAuthClient',
    attributes: {
      clientId    : types.string(),
      clienSecret : types.string(),
      redirectUri : types.string()
    }
  };
};
