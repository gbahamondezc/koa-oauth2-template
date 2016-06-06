-- DROP TABLE oauth_client
CREATE TABLE oauth_client (
  id            SERIAL,
  client_id     VARCHAR(100),
  client_secret VARCHAR(100),
  redirect_uri  VARCHAR(100),
  created_at    timestamp,
  updated_at    timestamp,
  CONSTRAINT "oauth_client_pk" PRIMARY KEY ("id")
);

-- DROP TABLE oauth_access_token
CREATE TABLE oauth_access_token (
  id           SERIAL,
  access_token VARCHAR(100),
  client_id    VARCHAR(255),
  user_id      INTEGER,
  expires      timestamp,
  created_at   timestamp,
  updated_at   timestamp,
  CONSTRAINT "oauth_access_token_pk" PRIMARY KEY ("id")
);

-- DROP TABLE oauth_authorization_code
CREATE TABLE oauth_authorization_code (
  id         SERIAL,
  auth_code  VARCHAR(100),
  client_id  VARCHAR(100),
  expires    timestamp,
  user_id    INTEGER,
  created_at timestamp,
  updated_at timestamp,
  CONSTRAINT "oauth_authorization_code_pk" PRIMARY KEY ("id")
);

-- DROP TABLE oauth_refresh_token
CREATE TABLE oauth_refresh_token (
  id            SERIAL,
  refresh_token VARCHAR(100),
  client_id     VARCHAR(100),
  user_id       INTEGER,
  expires       timestamp,
  created_at    timestamp,
  updated_at    timestamp,
  CONSTRAINT "oauth_refresh_token_pk" PRIMARY KEY ("id")
);

-- DROP TABLE "user"
CREATE TABLE "user" (
  id         SERIAL,
  username   VARCHAR(100),
  email      VARCHAR(100),
  locale     VARCHAR(20),
  google_id  VARCHAR(100),
  github_id  VARCHAR(100),
  picture    VARCHAR(100),
  password   VARCHAR(100),
  created_at timestamp,
  updated_at timestamp,
  CONSTRAINT "user_pk" PRIMARY KEY ("id")
);

