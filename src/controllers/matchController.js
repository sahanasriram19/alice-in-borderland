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

// Controller 1: load match groups
module.exports.loadMatch = (req, res, next) => {
  const data = { match_id: req.params.match_id };

  const callback = (error, results) => {
    if (error) {
      console.error("Error loadMatch:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Match not found" });
    }

    res.locals.match = results[0]; // {id, group_a_id, group_b_id}
    next();
  };

  model.selectMatchById(data, callback);
};

// Controller 2: calculate group A inventory power
module.exports.loadGroupAInventoryPower = (req, res, next) => {
  const match = res.locals.match;

  const callback = (error, results) => {
    if (error) {
      console.error("Error loadGroupAInventoryPower:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    const score = results[0]?.power_score;
    res.locals.score_a = Number(score) || 0;
    next();
  };

  model.selectGroupInventoryPower({ group_id: match.group_a_id }, callback);
};

// Controller 3: calculate group B inventory power
module.exports.loadGroupBInventoryPower = (req, res, next) => {
  const match = res.locals.match;

  const callback = (error, results) => {
    if (error) {
      console.error("Error loadGroupBInventoryPower:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    const score = results[0]?.power_score;
    res.locals.score_b = Number(score) || 0;
    next();
  };

  model.selectGroupInventoryPower({ group_id: match.group_b_id }, callback);
};

// Controller 4: decide winner (based on inventory power)
module.exports.decideWinner = (req, res, next) => {
  const match = res.locals.match;
  const scoreA = Number(res.locals.score_a) || 0;
  const scoreB = Number(res.locals.score_b) || 0;

  let winner = null;
  if (scoreA > scoreB) winner = match.group_a_id;
  else if (scoreB > scoreA) winner = match.group_b_id;

  res.locals.resultData = {
    match_id: match.id,
    group_a_id: match.group_a_id,
    group_b_id: match.group_b_id,
    score_a: scoreA,         // group A inventory power
    score_b: scoreB,         // group B inventory power
    winner_group_id: winner  // null = draw
  };

  next();
};
