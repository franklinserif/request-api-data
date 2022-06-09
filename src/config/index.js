require("dotenv").config();

const config = {
  mysqlDatabase: process.env.MYSQL_DATABASE,
  mysqlHost: process.env.MYSQL_HOST,
  mysqlPort: process.env.MYSQL_PORT,
  mysqlUser: process.env.MYSQL_USER,
  mysqlPassword: process.env.MYSQL_PASSWORD,
  pmaHost: process.env.PMA_HOST,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  localTokenUrl: process.env.LOCAL_TOKEN_URL,
  callbackUrl: process.env.CALLBACK_URL,
};

module.exports = config;
