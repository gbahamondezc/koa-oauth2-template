var thinky = require('../thinky-conn.js');
var type = thinky.type;

var User = thinky.createModel('User', {
  email     : type.string().email(),
  username  : type.string(),
  locale    : type.string(),
  googleId  : type.string(),
  githubId  : type.string(),
  picture   : type.string(),
  passsword : type.string()
});

module.exports = User;
