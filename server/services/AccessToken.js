module.exports = function ($models, $coroutine) {
  this.getByToken = function (id) {
    return $models.User.get(id);
  };
};
