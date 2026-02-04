const model = require("../models/leaderboardModel");

//function to get leaderboard top 10
module.exports.readLeaderboard = (req, res, next) => {
  const data = {};

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error readLeaderboard:", error);
      return res.status(500).json({
        message: "Internal server error"
      });
    }
    else if (results.length === 0) {
      return res.status(404).json({
        message: "No leaderboard data found"
      });
    }
    else {
      res.locals.leaderboard = results;
      next();
    }
  };

  model.selectTop10(data, callback);
};

module.exports.sendLeaderboard = (req, res) => {
  res.status(200).json({
    leaderboard: res.locals.leaderboard
  });
};
