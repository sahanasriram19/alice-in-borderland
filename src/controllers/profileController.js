// Import Model (for Database)
const model = require("../models/profileModel.js");
const userModel = require("../models/userModel.js");

// POST /profiles
module.exports.createProfile = (req, res, next) => {

    if (!req.body.user_id) {
        return res.status(400).json({ message: "user_id is required" });
    }
    const data = {
        user_id: req.body.user_id
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error createProfile:", error);
            return res.status(500).json({ message: "Internal server error" });
        }

        res.locals.profile_id = results.insertId;
        next();
    };

    model.createProfile(data, callback);
};


// GET /profiles/:user_id
module.exports.readProfileByUserId = (req, res, next) => {
    const data = {
        user_id: req.params.user_id
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error readProfileByUserId:", error);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Profile not found" });
        }

        res.locals.profile = results[0];
        next();
    };

    model.selectByUserId(data, callback);
};

