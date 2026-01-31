// Import Modules
const express = require('express');
const router = express.Router();

// Import Middleware
const response = require('../middlewares/response');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

// Import Controller
const controller = require("../controllers/matchController");

// POST /matches
router.post("/",
    jwtMiddleware.verifyToken,
    controller.createMatch,
    response.withMessage("Match created successfully", 201),
    response.sendResponse
);

// Resolve match result based on inventory power
router.post("/:match_id/resolve",
  jwtMiddleware.verifyToken,
  controller.loadMatch,
  controller.loadGroupAInventoryPower,
  controller.loadGroupBInventoryPower,
  controller.decideWinner,
  controller.saveOutcome,
  response.withMessage("Match resolved successfully", 200),
  response.sendResponse
);

module.exports = router;