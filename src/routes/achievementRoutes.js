// Import Modules
const express = require("express");
const router = express.Router();

//Import middleware
const response = require("../middlewares/response");

// Import Controller
const controller = require("../controllers/achievementController");

// POST /achievements
router.post("/",
    controller.create,
    controller.readById,
    response.withMessage("Achievement created", 201),
    response.sendResponse);

// GET /achievements
router.get("/",
    controller.readAll,
    response.withMessage("Fetched achievements", 200),
    response.sendResponse);

// GET /achievements/:id
router.get("/:id",
    controller.readById,
    response.withMessage("Fetched achievement", 200),
    response.sendResponse);

// PUT /achievements/:id
router.put("/:id",
    controller.updateById,
    controller.readById,
    response.withMessage("Achievement updated", 200),
    response.sendResponse);

// POST /achievements/:id/unlock
router.post("/:id/unlock",
    controller.prepareUnlock,
    controller.unlock,
    response.withMessage("Achievement unlocked", 201),
    response.sendResponse);

module.exports = router;