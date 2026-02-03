// Import Pool (Database Connection)
const pool = require('../services/db');

// Create Profile
module.exports.createProfile = (data, callback) => {
    const SQLSTATEMENT = `
        INSERT INTO UserProfile (user_id, power)
        VALUES (?, 0);
    `;
    const VALUES = [data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

// Read user's profile
// Consists of username, user's character, user's current points
module.exports.selectByUserId = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT
            u.id,
            u.username,
            u.points,
            p.character_name
        FROM User AS u
        INNER JOIN ProfileLevel AS p
            ON u.points >= p.required_total_points
        WHERE u.id = ?
        ORDER BY p.required_total_points DESC
        LIMIT 1;
    `;
    const VALUES = [data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

// GET all profile levels (characters)
module.exports.selectAllProfileLevels = (callback) => {
  const SQLSTATEMENT = `
    SELECT character_name, description, required_total_points
    FROM ProfileLevel
    ORDER BY required_total_points ASC;
  `;
  pool.query(SQLSTATEMENT, callback);
};