//Import modules
const express = require("express");
const router = express.Router();

//Import Middleware
const response = require("../middlewares/response");
const jwtMiddleware = require('../middlewares/jwtMiddleware');

//Import Controller
const controller = require("../controllers/dailyClaimController");

// Endpoint: POST /dailyClaims
router.post("/",
  jwtMiddleware.verifyToken,
  controller.claimDaily,
  response.withMessage("Daily claim updated", 200),
  response.sendResponse
);

module.exports = router;