// Import Modules
const express = require('express');
const router = express.Router();

//Import Middleware
const response = require('../middleware/response');

// Import Controller
const controller = require("../controllers/groupController");

// Get all groups
router.get("/",
    controller.readAllGroups,
    response.withMessage("Groups fetched", 200),
    response.sendResponse
);

// Join group
router.post("/:group_id/join",
    controller.checkGroupCapacity,
    controller.joinGroup,
    response.withMessage("Joined group", 200),
    response.sendResponse
);

module.exports = router;