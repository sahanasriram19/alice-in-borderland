// Import Modules
const express = require('express');
const router = express.Router();

// Import Middleware
const response = require('../middleware/response');

// Import Controller
const controller = require("../controllers/matchController");

// POST /matches
router.post("/",
    controller.createMatch,
    response.withMessage("Match created successfully", 201),
    response.sendResponse
);

module.exports = router;
