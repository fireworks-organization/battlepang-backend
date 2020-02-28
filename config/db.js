import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();
let client = null;
const databaseInit = function() {
  client = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    port: process.env.MYSQL_PORT,
    password: process.env.MYSQL_PASSWORD,
    connectionLimit: process.env.MYSQL_CONNECTION_LIMIT,
    database: process.env.DATABASE
    // debug: process.env.DEBUG
  });

  client.connect(function(err) {
    if (err) {
      console.log("error when connecting to db:", err);
      setTimeout(databaseInit, 2000);
    } else {
      console.log("✅  Connected to DB");
    }
  });
  client.on("error", function(err) {
    console.log("db error", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      databaseInit();
    } else {
      throw err;
    }
  });
  return client;
};

export const getQueryTest = ({ cb }) => {
  databaseInit();
  client
    .promise()
    .query("SELECT name from users")
    .then(([rows, fields]) => {
      if (cb) {
        cb(rows);
      }
    })
    .catch(console.log)
    .then(() => {
      console.log(" Disconnect to DB");
      client.end();
    });
};
