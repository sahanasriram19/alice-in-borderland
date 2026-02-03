// Import database connection pool
const pool = require("../services/db");

// GET all shop items
module.exports.selectAll = (callback) => {
  const SQLSTATEMENT = `
    SELECT id, name, description, cost, power
    FROM ShopItem
    ORDER BY id ASC;
  `;
  pool.query(SQLSTATEMENT, callback);
};

// GET shop item by id
module.exports.selectItemById = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT * FROM ShopItem
    WHERE id = ?;
  `;
  const VALUES = [data.id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Add to inventory (buy) - if exists, increase quantity
module.exports.upsertInventory = (data, callback) => {
  const SQLSTATEMENT = `
    INSERT INTO UserInventory (user_id, item_id, quantity)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity);
  `;
  const VALUES = [data.user_id, data.item_id, data.quantity];

  pool.query(SQLSTATEMENT, VALUES, callback);
};
