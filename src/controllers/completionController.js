// Import model
const model = require('../models/completionModel');

//Endpoint 9:POST /challenges/:challenge_id/
// Check user_id exists
module.exports.checkUserIdExists = (req, res, next) => {
    const data = {
        userId: req.body.user_id
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error checkUserIdExists:", error);
            res.status(500).json({ message: "Internal server error" });
        } else {
            if (results.length === 0) {
                res.status(404).json({ message: "user_id does not exist" });
            } else {
                next();
            }
        }
    }
    model.checkUserIdExists(data, callback);
};

//Check challenge_id exists
module.exports.checkChallengeIdExists = (req, res, next) => {
    const data = {
        challengeId: req.params.challengeId
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error checkChallengeIdExists:", error);
            res.status(500).json({ message: "Internal server error" });
        } else {
            if (results.length === 0) {
                res.status(404).json({ message: "challenge_id does not exist" });
            } else {
                next();
            }
        }
    }
    model.checkChallengeIdExists(data, callback);
};

// POST /challenges/{challenge_id}/
module.exports.createCompletionRecord = (req, res, next) => {
    const data = {
        challengeId: req.params.challengeId,
        userId: req.body.user_id,
        details: req.body.details
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error createCompletionRecord", error);
            res.status(500).json({ message: "Internal server error" });
        } else {
            // store IDs for later middlewares
            res.locals.completionId = results.insertId;
            res.locals.challengeId = data.challengeId;
            res.locals.userId = data.userId;
            next();
        }
    }
    model.insertCompletionRecord(data, callback);
};

// GET /challenges/{completion_id}
module.exports.getCompletionById = (req, res, next) => {
    const data = {
        completionId: res.locals.completionId
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error getCompletionById:", error);
            res.status(500).json({ message: "Internal server error" });
        } else {
            res.status(201).json(results[0]);
        }
    }
    model.getCompletionById(data, callback);
};

// Get points from completed challenge
module.exports.getPointsByChallenge = (req, res, next) => {
    const data = {
        challengeId: res.locals.challengeId || req.params.challengeId
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error getPointsByChallenge:", error);
            res.status(500).json({ message: "Internal server error" });
        } else {
            res.locals.points = results[0].points;
            next();
        }
    }
    model.getPointsByChallenge(data, callback);
};

//Add points to user
module.exports.rewardPoints = (req, res, next) => {
    const data = {
        userId: res.locals.userId,
        points: res.locals.points
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error rewardPoints:", error);
            res.status(500).json({ message: "Internal server error" });
        } else {
            next();
        }
    }
    model.rewardPoints(data, callback);
};