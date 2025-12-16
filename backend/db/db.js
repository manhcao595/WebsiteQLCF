const sql = require("mssql");

const config = {
  user: "sa",
  password: "admin",
  server: "LAPTOP-94U5AEJG\\SQLEXPRESS",
  database: "WebsiteQLCF",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

module.exports = { sql, config };
