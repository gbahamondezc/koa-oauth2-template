module.exports = function ($models, $coroutine) {
  this.getOneByToken = function (token) {
    return $models.OauthAccessToken.find({
      where : {
        access_token: token
      }
    })
    .then( function(accessToken) {
      if (accessToken) {
        return accessToken;
      }
      return null;
    });
  };
};
