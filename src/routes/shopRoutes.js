//Import model
const express = require("express");
const router = express.Router();

//Import Middleware
const response = require("../middleware/response");

//Import Controller
const controller = require("../controllers/shopController");

// Endpoint: POST /shop/:id/buy
router.post("/:id/buy",
  controller.loadBuyInfo,
  controller.deductPointsForBuy,
  controller.addInventoryForBuy,
  response.withMessage("Item purchased successfully", 200),
  response.sendResponse
);

module.exports = router;