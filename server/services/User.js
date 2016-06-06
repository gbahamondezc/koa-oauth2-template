module.exports = function ($models, $coroutine) {

  this.getById = function (id) {
    return $models.User.find({
      where : {
        id : id
      }
    });
  };

  this.getOneByEmail = function (email) {
    return $models.User.find({
      where : {
        email : email
      }
    })
    .then(function(user) {
      if (user) {
        return user;
      }
      return null;
    });
  };
};
