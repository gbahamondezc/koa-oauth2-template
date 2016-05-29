// r.db('mantle').table('OAuthClient').delete();
r.db('template').table('OAuthClient');

// r.db('template').table('User').delete();
r.db('template').table('User');

// r.db('template').table('OAuthAccessToken').delete();
r.db('template').table('OAuthAccessToken');

// r.db('template').table('OAuthRefreshToken').delete();
r.db('template').table('OAuthRefreshToken');

r.db('template').table('OAuthClient')
  .insert({
    clientId: 's6BhdRkqt4',
    clientSecret: 'gX4fBat3bV',
    redirectUri : '/private'
  });

r.db('template').table('User')
  .insert({
    email     : 'gonzalo.bahamondez.c@gmail.com',
    username  : 'gbahamondez',
    locale    : 'es',
    password : 'hitori87'
  });



