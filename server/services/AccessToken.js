module.exports = function ($models, $coroutine) {
  this.getOneByToken = function (token) {
    return $models.OAuthAccessToken.filter({
      accessToken : token
    })
    .then( function(results) {
      if (results && results.length !== 0) {
        return results[0];
      }
      return null;
    });
  };
};
