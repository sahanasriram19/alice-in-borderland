// Import Pool (Database Connection)
const pool = require("../services/db");

// GET /groups
module.exports.selectAll = (callback) => {
    const SQLSTATEMENT = `
        SELECT * FROM CommunityGroup;
    `;
    const VALUES = [];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

// Count how many players are in a group
module.exports.countMembersByGroupId = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT COUNT(*) AS member_count
    FROM PlayerProfile
    WHERE group_id = ?;
  `;
  const VALUES = [data.group_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// POST /groups/:group_id/join
module.exports.joinGroup = (data, callback) => {
    const SQLSTATEMENT = `
        UPDATE PlayerProfile
        SET group_id = ?
        WHERE user_id = ?;
    `;
    const VALUES = [
        data.group_id,
        data.user_id
    ];

    pool.query(SQLSTATEMENT, VALUES, callback);
};