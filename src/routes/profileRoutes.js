// Import Modules
const express = require("express");
const router = express.Router();

// Import Controller
const controller = require("../controllers/profileController");

// Import Middleware
const response = require("../middlewares/response");
const jwtMiddleware = require('../middlewares/jwtMiddleware');

// POST /profiles
router.post("/",
    jwtMiddleware.verifyToken,
    controller.createProfile,
    response.withMessage("Profile created successfully", 201),
    response.sendResponse
);

// GET /profiles/me
router.get("/me",
    jwtMiddleware.verifyToken,
    controller.readProfileByUserId,
    response.withMessage("Profile fetched successfully", 200),
    response.sendResponse
);

// GET /profiles/levels
router.get("/levels",
  jwtMiddleware.verifyToken,
  controller.readAllProfileLevels,
  response.withMessage("Profile levels fetched", 200),
  response.sendResponse
);

module.exports = router;