const knex = require("knex");
const { DATABASE_URL } = require("../config/index");

let db = knex.knex({
    client: "mysql2",
    connection: DATABASE_URL,
  });

module.exports = db;
