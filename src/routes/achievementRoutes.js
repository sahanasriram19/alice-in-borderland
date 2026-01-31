// Import Modules
const express = require("express");
const router = express.Router();

//Import middleware
const response = require("../middlewares/response");
const jwtMiddleware = require ('../middlewares/jwtMiddleware');

// Import Controller
const controller = require("../controllers/achievementController");


// POST /achievements
router.post("/",
    jwtMiddleware.verifyToken,
    controller.create,
    controller.readById,
    response.withMessage("Achievement created", 201),
    response.sendResponse);

// GET /achievements
router.get("/",
    jwtMiddleware.verifyToken,
    controller.readAll,
    response.withMessage("Fetched achievements", 200),
    response.sendResponse);

// GET /achievements/:id
router.get("/:id",
    jwtMiddleware.verifyToken,
    controller.readById,
    response.withMessage("Fetched achievement", 200),
    response.sendResponse);

// PUT /achievements/:id
router.put("/:id",
    jwtMiddleware.verifyToken,
    controller.updateById,
    controller.readById,
    response.withMessage("Achievement updated", 200),
    response.sendResponse);

// POST /achievements/:id/unlock
router.post("/:id/unlock",
    jwtMiddleware.verifyToken,
    controller.prepareUnlock,
    controller.unlock,
    response.withMessage("Achievement unlocked", 201),
    response.sendResponse);

module.exports = router;