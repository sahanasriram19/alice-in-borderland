// Import Pool (Database Connection)
const pool = require('../services/db');

//Endpoint 1:POST /users
module.exports.createUser = (data, callback) => {
    const SQLSTATMENT = `
    INSERT INTO User (username)        
    VALUES (?);
    `;
    const VALUES = [    
        data.username,
        data.points
    ];  
    pool.query(SQLSTATMENT, VALUES, callback);
}

//Endpoint 1:POST /users
module.exports.selectByUsername = (data, callback) => {
    const SQLSTATMENT = `
    SELECT * FROM User
    WHERE username = ?
    LIMIT 1;
    `;
    const VALUES = [data.username];
    pool.query(SQLSTATMENT, VALUES, callback);
};

//Endpoint 2:GET /users
module.exports.selectAll = (callback) => {
    const SQLSTATMENT = `
    SELECT * FROM User;
    `;
    pool.query(SQLSTATMENT, callback);
}

//Endpoint 3:GET /users/:user_id
module.exports.selectById = (data, callback) => {

    const SQLSTATMENT = `
    SELECT * FROM User
    WHERE id = ?;
    `;
    const VALUES = [data.user_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.updateById = (data, callback) => {
  const SQLSTATMENT = `
    UPDATE \`User\`
    SET username = ?, points = ?
    WHERE id = ?;
  `;
  const VALUES = [data.username, data.points, data.user_id];
  pool.query(SQLSTATMENT, VALUES, callback);
};

//Gamification
// Deduct points from user for purchases
module.exports.deductPoints = (data, callback) => {
  const SQLSTATEMENT = `
    UPDATE User
    SET points = points - ?
    WHERE id = ? AND points >= ?;
  `;
  const VALUES = [data.points, data.user_id, data.points];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Authentication for registering new user
module.exports.checkUsernameOrEmailExist = (data, callback) => {

    const SQLSTATEMENT =  `
    SELECT * FROM User
    WHERE username = ? OR email = ?
    `;

    const values = [data.username, data.email];

    pool.query(SQLSTATEMENT, values, callback);
}

// Register new user
module.exports.insertUser = (data, callback) => {

    const SQLSTATEMENT =  `
    INSERT INTO User (username, email, password)
    VALUES (?, ?, ?)
    `;  
    const values = [data.username, data.email, data.password];

    pool.query(SQLSTATEMENT, values, callback);
}

