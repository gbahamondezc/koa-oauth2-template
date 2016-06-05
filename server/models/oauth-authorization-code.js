'use strict';

module.exports = function (types) {
  return {
    tableName : 'OAuthAuthorizationCode',
    attributes: {
      clientId    : types.string(),
      expires     : types.date(),
      userId      : types.string()
    }
  };
};
