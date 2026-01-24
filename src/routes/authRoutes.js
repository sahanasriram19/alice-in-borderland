// Import Modules
const express = require('express');
const router = express.Router();

// Import controller 
const userController = require('../controllers/userController');

// Import Middleware
const bcryptMiddleware = require('../middlewares/bcryptMiddleware');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

// Basic Exercise Routes
router.post("/login", 
    userController.login, // <-- Code This!
    bcryptMiddleware.comparePassword, 
    jwtMiddleware.generateToken, 
    jwtMiddleware.sendToken);

router.post("/register", 
    userController.checkUsernameOrEmailExist, // <-- Code This!
    bcryptMiddleware.hashPassword, 
    userController.register, // <-- Code This!
    jwtMiddleware.generateToken, 
    jwtMiddleware.sendToken);

// Export Router
module.exports = router;