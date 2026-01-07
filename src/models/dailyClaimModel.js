// Import database connection pool
const pool = require("../services/db");

// Upsert claim (create if none, update if exists)
module.exports.claimUpsert = (data, callback) => {
  const SQLSTATEMENT = `
    INSERT INTO DailyClaim (user_id, last_claimed_at)
    VALUES (?, NOW())
    ON DUPLICATE KEY UPDATE last_claimed_at = NOW();
  `;
  const VALUES = [data.user_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};