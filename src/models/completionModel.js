// Import database connection pool
const pool = require("../services/db");

//Endpoint 9:POST /challenges/:challenge_id/
//Check user_id exists
module.exports.checkUserIdExists = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT id FROM User
    WHERE id = ?
    `;
    const VALUES = [data.userId];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

//Check challenge_id exists
module.exports.checkChallengeIdExists = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT id FROM WellnessChallenge
    WHERE id = ?
    `;
    const VALUES = [data.challengeId];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

// POST /challenges/{challenge_id}
module.exports.insertCompletionRecord = (data, callback) => {
    const SQLSTATEMENT = ` 
    INSERT INTO UserCompletion (challenge_id, user_id, details)
    VALUES (?, ?, ?)
    `;
    const VALUES = [data.challengeId, data.userId, data.details];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

//Get points from completed challenge
module.exports.getPointsByChallenge = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT points FROM WellnessChallenge
    WHERE id = ?
    `;
    const VALUES = [data.challengeId];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

// Reward points
module.exports.rewardPoints = (data, callback) => {
    const SQLSTATEMENT = `
    UPDATE User
    SET points = points + ?
    WHERE id = ?
    `;
    const VALUES = [data.points, data.userId];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

// GET /challenges/{complete_id}
module.exports.getCompletionById = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM UserCompletion
    WHERE id = ?
    `;
    const VALUES = [data.completionId];

    pool.query(SQLSTATEMENT, VALUES, callback);
};