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
        user_id: res.locals.userId
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
        user_id: res.locals.userId,
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

//login 
module.exports.login = (req, res, next) => {
if ( req.body.username == undefined || req.body.password == undefined ) {
        res.status(400).json({
            message: "Error: username or password is undefined"
        });
        return;
    }

    const data = {
        username: req.body.username
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error login:", error);   
            res.status(500).json({message: "Internal Server Error"});

        } else {
            if (results.length == 0) {
                res.status(404).json({ message: "User not found" });
            } else {   
                res.locals.userId = results[0].id;
                res.locals.hash = results[0].password;
                next();
            }
        }   
    }       
    model.selectByUsername(data, callback);
}

//check if username or email exists before registering
module.exports.checkUsernameOrEmailExist = (req, res, next) => {
    if( req.body.username == undefined || 
        req.body.email == undefined || 
        req.body.password == undefined ) {
        res.status(400).json({
            message: "Error: username, email or password is undefined"
        });
        return;
    }

    const data = {
        username: req.body.username,
        email: req.body.email
    };  
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error checkUsernameOrEmailExist:", error);   
            res.status(500).json({message: "Internal Server Error"});;

        } else {    
            if (results.length > 0) {
                res.status(409).json({
                    message: "Username or email already exists"
                });
            }   
            else next();
   
        }
    }       
    model.checkUsernameOrEmailExist(data, callback);
}

//register
module.exports.register = (req, res, next) => {

    const data = {
        username: req.body.username,
        email: req.body.email,
        password: res.locals.hash
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error register:", error);   
            res.status(500).json({message: "Internal Server Error"});
        } else {    
            res.locals.message = `User ${data.username} created successfully.`;
            res.locals.userId = results.insertId;
            next();
        }
    }       
    model.insertUser(data, callback);
}