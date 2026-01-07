// Import Database Pool
const pool = require("../services/db");

// POST /achievements
module.exports.createAchievement = (data, callback) => {
  const SQLSTATEMENT = `
    INSERT INTO Achievement (name, description)
    VALUES (?, ?);
  `;
  const VALUES = [data.name, data.description];
  pool.query(SQLSTATEMENT, VALUES, callback);
};

// GET /achievements
module.exports.selectAll = (callback) => {
  const SQLSTATEMENT = 
  `SELECT * FROM Achievement;
  `;
  pool.query(SQLSTATEMENT, callback);
};

// GET /achievements/:id
module.exports.selectById = (data, callback) => {
  const SQLSTATEMENT = 
  `SELECT * FROM Achievement WHERE id = ?;
  `;
  const VALUES = [data.id];
  pool.query(SQLSTATEMENT, VALUES, callback);
};

// PUT /achievements/:id
module.exports.updateById = (data, callback) => {
  const SQLSTATEMENT = `
    UPDATE Achievement
    SET name = ?, description = ?
    WHERE id = ?;
  `;
  const VALUES = [data.name, data.description, data.id];
  pool.query(SQLSTATEMENT, VALUES, callback);
};


// POST /achievements/:id/unlock
module.exports.unlockAchievement = (data, callback) => {
  const SQLSTATEMENT = `
    INSERT INTO UserAchievement (user_id, achievement_id)
    VALUES (?, ?);
  `;
  const VALUES = [data.user_id, data.achievement_id];
  pool.query(SQLSTATEMENT, VALUES, callback);
};

// GET /users/:user_id/achievements  
module.exports.selectUnlockedByUserId = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT id, user_id, achievement_id, unlocked_at
    FROM UserAchievement
    WHERE user_id = ?;
  `;
  const VALUES = [data.user_id];
  pool.query(SQLSTATEMENT, VALUES, callback);
};
