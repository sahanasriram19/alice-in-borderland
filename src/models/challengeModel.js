// Import Pool (Database Connection)
const pool = require('../services/db');

//Endpoint 5:POST /challenges
module.exports.createChallenge = (data, callback) => {
    const SQLSTATMENT = `
    INSERT INTO WellnessChallenge (creator_id, description, points)        
    VALUES (?,?,?);
    `;
    const VALUES = [
        data.user_id,
        data.description,
        data.points
    ];
    pool.query(SQLSTATMENT, VALUES, callback);
}

//Endpoint 5:POST /challenges 
//Endpoint 8:PUT /challenges/:challenge_id
module.exports.selectById = (data, callback) => {
    const SQLSTATMENT = `
    SELECT * FROM WellnessChallenge
    WHERE id = ?;
    `;
    const VALUES = [data.challenge_id];
    pool.query(SQLSTATMENT, VALUES, callback);
}

//Endpoint 6:GET /challenges
module.exports.selectAll = (callback) => {
    const SQLSTATMENT = `
    SELECT * FROM WellnessChallenge;
    `;
    pool.query(SQLSTATMENT, callback);
}

//Endpoint 7:DELETE /challenges/:challenge_id
module.exports.deleteChallenge = (challenge_id, callback) => {
    const SQLSTATMENT = `
    DELETE FROM WellnessChallenge   
    WHERE id = ?;
    `;
    const VALUES = [challenge_id];
    pool.query(SQLSTATMENT, VALUES, callback);
}

//Endpoint 8:PUT /challenges/:challenge_id
module.exports.updateById = (data, callback) => {
    const SQLSTATMENT = `
    UPDATE WellnessChallenge        
    SET description = ?, points = ?
    WHERE id = ?;
    `;
    const VALUES = [
        data.description,
        data.points,
        data.challenge_id
    ];
    pool.query(SQLSTATMENT, VALUES, callback);
}

//Endpoint 10:GET /challenges/:challenge_id/
module.exports.getUsersByChallengeId = (data, callback) => {
    const SQL = `
        SELECT user_id, details
        FROM UserCompletion
        WHERE challenge_id = ?;
    `;
    const VALUES = [data.challenge_id];

    pool.query(SQL, VALUES, callback);
};