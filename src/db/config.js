const config = require("../config");
const mysql = require("mysql");

const pool = mysql.createPool({
  connectionLimit: 10,
  host: config.mysql,
  user: config.mysqlUser,
  password: config.mysqlPassword,
  database: config.mysqlDatabase,
  port: config.mysqlPort,
});

module.exports = pool;
