'use strict';

module.exports = function (types) {
  return {
    tableName : 'User',
    attributes: {
      email     : types.string().email(),
      username  : types.string(),
      locale    : types.string(),
      googleId  : types.string(),
      githubId  : types.string(),
      picture   : types.string(),
      passsword : types.string()
    }
  };
};
