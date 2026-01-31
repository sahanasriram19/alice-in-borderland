// Import Modules
const express = require('express');
const router = express.Router();

//Import Middleware
const response = require('../middlewares/response');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

// Import Controller
const controller = require("../controllers/groupController");

// Get all groups
router.get("/",
    jwtMiddleware.verifyToken,
    controller.readAllGroups,
    response.withMessage("Groups fetched", 200),
    response.sendResponse
);

// Join group
router.post("/:group_id/join",
    jwtMiddleware.verifyToken,
    controller.checkGroupCapacity,
    controller.joinGroup,
    response.withMessage("Joined group", 200),
    response.sendResponse
);

module.exports = router;