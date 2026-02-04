// Import Pool (Database Connection)
const pool = require("../services/db");

module.exports.selectTop10 = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT username, points
    FROM User
    ORDER BY points DESC
    LIMIT 10;
  `;

  pool.query(SQLSTATEMENT, callback);
};
