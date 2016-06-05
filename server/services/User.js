module.exports = function ($models, $coroutine) {

  this.getById = function (id) {
    return $models.User.get(id);
  };

  this.getOneByEmail = function (email) {
    return $models.User.filter({
      email : email
    })
    .then(function(results) {
      if (results && results.length !== 0) {
        return results[0];
      }
      return null;
    });
  };
};
