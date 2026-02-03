// Import Pool (Database Connection)
const pool = require("../services/db");

// GET /groups
module.exports.selectAll = (callback) => {
  const SQLSTATEMENT = `
    SELECT 
      g.id,
      g.name,
      g.description,
      COUNT(up.user_id) AS member_count
    FROM CommunityGroup g
    LEFT JOIN UserProfile up ON up.group_id = g.id
    GROUP BY g.id;
  `;

  pool.query(SQLSTATEMENT, callback);
};

// Count how many players are in a group
module.exports.countMembersByGroupId = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT COUNT(*) AS member_count
    FROM UserProfile
    WHERE group_id = ?;
  `;
  const VALUES = [data.group_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// POST /groups/:group_id/join
module.exports.joinGroup = (data, callback) => {
    const SQLSTATEMENT = `
        UPDATE UserProfile
        SET group_id = ?
        WHERE user_id = ?;
    `;
    const VALUES = [
        data.group_id,
        data.user_id
    ];

    pool.query(SQLSTATEMENT, VALUES, callback);
};