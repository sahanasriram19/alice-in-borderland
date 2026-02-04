//Import modules
const express = require("express");
const router = express.Router();

//import controller
const controller = require("../controllers/leaderboardController");

//get leaderboard top 10
router.get("/", 
    controller.readLeaderboard,
    controller.sendLeaderboard);

module.exports = router;
