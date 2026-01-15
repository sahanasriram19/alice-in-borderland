//Import modules
const express = require("express");
const router = express.Router();

//Import Middleware
const response = require("../middlewares/response");

//Import Controller
const controller = require("../controllers/dailyClaimController");

// Endpoint: POST /dailyClaims
router.post(
  "/",
  controller.claimDaily,
  response.withMessage("Daily claim updated", 200),
  response.sendResponse
);

module.exports = router;