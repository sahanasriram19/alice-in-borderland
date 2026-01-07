// Import Pool (Database Connection)
const pool = require('../services/db');

// Create Profile
module.exports.createProfile = (data, callback) => {
    const SQLSTATEMENT = `
        INSERT INTO PlayerProfile (user_id, strength, stamina, focus)
        VALUES (?, 0, 0, 0);
    `;
    const VALUES = [data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

// Read Profile by User ID
module.exports.selectByUserId = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT * FROM PlayerProfile
        WHERE user_id = ?;
    `;
    const VALUES = [data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

