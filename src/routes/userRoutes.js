// Import Modules
const express = require('express');
const router = express.Router();

//Import Middleware
const response = require('../middlewares/response');
const jwtMiddleware = require ('../middlewares/jwtMiddleware')

// Import Controller
const controller = require('../controllers/userController');
const achievementController = require("../controllers/achievementController");

//Endpoint 1:POST /users
router.post('/',
    jwtMiddleware.verifyToken,
    controller.checkUsername,
    controller.createUser,
    response.withMessage("User created successfully", 201),
    response.sendResponse
);

//Endpoint 2:GET /users
router.get('/',
    jwtMiddleware.verifyToken,
    controller.readAllUser,
    response.withMessage("Fetched all users", 200),
    response.sendResponse
);

//Endpoint 3:GET /users/:user_id
router.get('/:user_id',
    jwtMiddleware.verifyToken,
    controller.readUserById,
    response.withMessage("Fetched user by ID", 200),
    response.sendResponse
);

//Endpoint 4:PUT /users/:user_id
router.put('/:user_id',
    jwtMiddleware.verifyToken,
    controller.updateUserById,
    response.withMessage("User updated successfully", 200),
    response.sendResponse
);

//Gamification Route
// GET /users/:user_id/achievements
router.get("/:user_id/achievements",
    jwtMiddleware.verifyToken,
    achievementController.readUnlockedRawByUserId,
    response.withMessage("Fetched user achievements", 200),
    response.sendResponse
);

module.exports = router;