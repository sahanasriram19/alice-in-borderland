//Import modules
const express = require("express");
const router = express.Router();

//Import Middleware
const response = require("../middlewares/response");
const jwtMiddleware = require("../middlewares/jwtMiddleware");

//Import Controller
const controller = require("../controllers/inventoryController");

// Endpoint: GET /inventory
router.get("/",
  jwtMiddleware.verifyToken,
  controller.readInventoryByUserId,
  response.withMessage("Fetched user inventory", 200),
  response.sendResponse
);



module.exports = router;