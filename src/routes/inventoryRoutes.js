//Import modules
const express = require("express");
const router = express.Router();

//Import Middleware
const response = require("../middleware/response");

//Import Controller
const controller = require("../controllers/inventoryController");

// Endpoint: GET /inventory/:user_id
router.get("/:user_id",
  controller.readInventoryByUserId,
  response.withMessage("Fetched user inventory", 200),
  response.sendResponse
);

// DELETE /inventory/item/:id
router.delete("/item/:id", controller.deleteInventoryRow);

module.exports = router;