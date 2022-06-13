const config = require("../config");
const mysql = require("mysql2");

const pool = mysql.createPool({
  connectionLimit: 10,
  host: config.mysqlHost,
  user: config.mysqlUser,
  password: config.mysqlPassword,
  database: config.mysqlDatabase,
  port: config.mysqlPort,
});

module.exports = pool;
