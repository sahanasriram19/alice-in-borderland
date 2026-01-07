//Import database connection pool
const pool = require("../services/db");

// GET /inventory/:user_id
module.exports.selectByUserId = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT id, user_id, item_id, quantity
    FROM UserInventory
    WHERE user_id = ?;
  `;
  const VALUES = [data.user_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// DELETE /inventory/:id 
module.exports.deleteById = (data, callback) => {
  const SQLSTATEMENT = `
    DELETE FROM UserInventory
    WHERE id = ?;
  `;
  const VALUES = [data.id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};