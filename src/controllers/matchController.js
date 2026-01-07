// Import Model
const model = require("../models/matchModel.js");

// Endpoint: POST /matches
module.exports.createMatch = (req, res, next) => {
    if (!req.body.group_a_id || !req.body.group_b_id || !req.body.season_id ) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    const data = {
        group_a_id: req.body.group_a_id,
        group_b_id: req.body.group_b_id,
        season_id: req.body.season_id,
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error createMatch:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
        else {
            res.locals.match_id = results.insertId;
            next();
        }
    };

    model.createMatch(data, callback);
};