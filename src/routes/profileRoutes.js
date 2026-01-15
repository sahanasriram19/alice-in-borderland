// Import Modules
const express = require("express");
const router = express.Router();

// Import Controller
const controller = require("../controllers/profileController");

// Import Middleware
const response = require("../middlewares/response");

// POST /profiles
router.post("/",
    controller.createProfile,
    response.withMessage("Profile created successfully", 201),
    response.sendResponse
);

// GET /profiles/:user_id
router.get("/:user_id",
    controller.readProfileByUserId,
    response.withMessage("Profile fetched successfully", 200),
    response.sendResponse
);


module.exports = router;