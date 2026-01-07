// Import model
const model = require("../models/dailyClaimModel");

// POST /daily-claim
module.exports.claimDaily = (req, res, next) => {
  if (!req.body.user_id) {
    return res.status(400).json({ message: "user_id required" });
  }

  const data = { user_id: req.body.user_id };

  const callback = (error, results) => {
    if (error) {
      console.error("Error claimDaily:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    // results.affectedRows will usually be 1 (insert) or 2 (update)
    res.locals.result = {
      user_id: data.user_id,
      claimed: true,
      affectedRows: results.affectedRows
    };
    next();
  };

  model.claimUpsert(data, callback);
};