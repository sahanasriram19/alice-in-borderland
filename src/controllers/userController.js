// Import Model (for Database)
const model = require("../models/userModel.js")

// Endpoint 1:POST /users (check username)
module.exports.checkUsername = (req, res, next) => {
    const data = {
        username: req.body.username
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error checkUsername:", error);
            res.status(500).json({ message: "Internal server error" });
        } 
        else {
            if (results.length > 0) {
                res.status(409).json({
                    message: "Username is already associated with another user"
                });
                return;
            }
            next();
        }
    };

    model.selectByUsername(data, callback);
};

// Endpoint 1: POST /users
module.exports.createUser = (req, res, next) => {
    const data = {
        username: req.body.username,
        points: req.body.points
    };
    
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error createUser:", error);
            res.status(500).json({ message: "Internal server error" });
        } 
        else {
            if (results.affectedRows == 0) {
                res.status(404).json({
                    message: "User not created"
                });
                return;
            }
            res.locals.user = results;
            next();
        }
    };

    model.createUser(data, callback);
};

//Endpoint 2:GET /users 
module.exports.readAllUser = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllUser:", error);
            res.status(500).json({ message: "Internal server error" });
        }
        else {
            res.locals.user = results;
            next();
        }
    }

    model.selectAll(callback);
}

//Endpoint 3:GET /users/:user_id
module.exports.readUserById = (req, res, next) => {
    const data = {
        user_id: req.params.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readUserById:", error);
            res.status(500).json({ message: "Internal server error" });
        } else {
            if (results.length == 0) {
                res.status(404).json({
                    message: "User not found"
                });
            }
            else res.status(200).json(results[0]);
        }
    }

    model.selectById(data, callback);
}

//Endpoint 4:PUT /users/:user_id
module.exports.updateUserById = (req, res, next) => {
    const data = {
        user_id: req.params.user_id,
        username: req.body.username,
        points: req.body.points
    };
    const callback = (error, results) => {
        if (error) {
            console.error("Error updateUserById:", error);

            if (error.code === "ER_DUP_ENTRY") {
                return res.status(403).json({
                    message: "Username is already associated with another user"
                });
            }
            return res.status(500).json({
                message: "Internal server error"
            });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.locals.user = results;
        next();
    };

    model.updateById(data, callback);
};
