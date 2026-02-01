// Import Model (for Database)
const model = require("../models/challengeModel.js")

//Endpoint 5:POST /challenges
module.exports.createChallenge = (req, res, next) => {
    const data = {
        user_id: res.locals.userId,
        description: req.body.description,
        points: req.body.points
    };

    if (!data.description || !data.user_id || data.points === undefined) {
        return res.status(400).json(error);
    }

    const callback = (error, results, fields) => {
    if (error) {
    console.error("Error createChallenge:", error);
    return res.status(500).json({
    message: "Internal server error"
     });
    }
        else {
            res.locals.challenge_id = results.insertId;
            next();
        }
    }

    model.createChallenge(data, callback);
}

//Endpoint 5:POST /challenges
//Endpoint 8:PUT /challenges/:challenge_id
module.exports.readChallengeById = (req, res, next) => {
    const data = {
        challenge_id: res.locals.challenge_id || req.params.challenge_id
    };

    const callback = (error, results, fields) => {
        if (error) {
        console.error("Error readChallengeById:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
        }
        else if (results.length === 0) {
            res.status(404).json({ message: "Challenge not found" });
        }
        else {
            res.locals.challenge = results[0];
            next();
        }
    }

    model.selectById(data, callback);
}

//Endpoint 6:GET /challenges
module.exports.readAllChallenge = (req, res, next) => {
    const callback = (error, results, fields) => {
if (error) {
  console.error("Error readAllChallenge:", error);
  return res.status(500).json({
    message: "Internal server error"
  });
}
        else {
            res.locals.challenge = results;
            next();
        }
    }

    model.selectAll(callback);
}

//Endpoint 7:DELETE /challenges/:challenge_id
module.exports.deleteChallenge = (req, res, next) => {

    const challengeId = req.params.challenge_id;
    const callback = (error, results, fields) => {
if (error) {
  console.error("Error deleteChallenge:", error);
  return res.status(500).json({
    message: "Internal server error"
  });
}
        if (results.affectedRows === 0) {
            return res.status(404).json(error).end();
        }
        else {
            res.status(204).end();
        }
    }

    model.deleteChallenge(challengeId, callback);
}

// Endpoint 8: PUT /challenges/:challenge_id (check challenge owner)
module.exports.checkChallengeOwner = (req, res, next) => {
  const challengeId = Number(req.params.challenge_id);

  if (!Number.isInteger(challengeId) || challengeId <= 0) {
    return res.status(400).json({ message: "Invalid challenge id" });
  }

  const data = { challenge_id: challengeId };

  const callback = (error, results) => {
    if (error) {
      console.error("Error checkChallengeOwner:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    const creatorId = Number(results[0].creator_id);
    const tokenUserId = Number(res.locals.userId);

    if (creatorId !== tokenUserId) {
      return res.status(403).json({
        message: "Forbidden: you are not the creator of this challenge"
      });
    }

    next();
  };

  model.selectById(data, callback);
};

//Endpoint 8:PUT /challenges/:challenge_id
module.exports.updateChallengeById = (req, res, next) => {
  const challengeId = Number(req.params.challenge_id);

  const data = {
    challenge_id: challengeId,
    description: req.body.description,
    points: req.body.points
  };

  const callback = (error, results) => {
    if (error) {
      console.error("Error updateChallengeById:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Challenge not found." });
    }

    next();
  };

  model.updateById(data, callback);
};

//Endpoint 10:GET /challenges/:challenge_id/
module.exports.getUsersByChallengeId = (req, res, next) => {
    const data = {
        challenge_id: req.params.challenge_id
    };

    if (!data.challenge_id) {
        return res.status(400).json({ message: "challenge_id is required" });
    }

    model.getUsersByChallengeId(data, (error, results) => {
    if (error) {
        console.error("Error readUsersByChallengeId:", error);
        return res.status(500).json({
        message: "Internal server error"
    });
    }

        if (results.length === 0) {
            return res.status(404).json({ message: "No attempts found for this challenge" });
        }

        res.status(200).json(results);
    });
};