// Import Pool (Database Connection)
const pool = require("../services/db");

// Endpoint: POST /matches
module.exports.createMatch = (data, callback) => {
    const SQLSTATEMENT = `
        INSERT INTO GroupMatch
        (group_a_id, group_b_id, season_id)
        VALUES (?, ?, ?);
    `;
    const VALUES = [
        data.group_a_id,
        data.group_b_id,
        data.season_id,
    ];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

// SELECT match by id (used by loadMatch + readMatchById)
module.exports.selectMatchById = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT * FROM GroupMatch
    WHERE id = ?;
  `;
  const VALUES = [data.match_id];
  pool.query(SQLSTATEMENT, VALUES, callback);
};

// inventory power score (keep whatever calc you chose)
module.exports.selectGroupInventoryPower = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT SUM(si.power * ui.quantity) AS power_score
    FROM UserProfile up
    LEFT JOIN UserInventory ui ON ui.user_id = up.user_id
    LEFT JOIN ShopItem si ON si.id = ui.item_id
    WHERE up.group_id = ?;
  `;
  const VALUES = [data.group_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};
