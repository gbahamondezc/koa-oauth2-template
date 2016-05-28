// r.db('mantle').table('OAuthClient').delete();
r.db('mantle').table('OAuthClient');

// r.db('mantle').table('User').delete();
r.db('mantle').table('User');

// r.db('mantle').table('OAuthAccessToken').delete();
r.db('mantle').table('OAuthAccessToken');

// r.db('mantle').table('OAuthRefreshToken').delete();
r.db('mantle').table('OAuthRefreshToken');

r.db('mantle').table('OAuthClient')
  .insert({
    clientId: 's6BhdRkqt4',
    clientSecret: 'gX4fBat3bV',
    redirectUri : '/private'
  });

r.db('mantle').table('User')
  .insert({
    email     : 'gonzalo.bahamondez.c@gmail.com',
    username  : 'gbahamondez',
    locale    : 'es',
    password : 'hitori87'
  });



