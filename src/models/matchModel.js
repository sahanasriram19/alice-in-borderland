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


