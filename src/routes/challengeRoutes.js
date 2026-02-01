// Import Modules
const express = require('express');
const router = express.Router();

//Import Middleware
const response = require('../middlewares/response');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

// Import Controller
const controller = require('../controllers/challengeController');
const completionController = require('../controllers/completionController');

//Endpoint 5:POST /challenges
router.post('/',
    jwtMiddleware.verifyToken,
    controller.createChallenge,
    controller.readChallengeById,
    response.withMessage("Challenge created successfully", 201),
    response.sendResponse
);

//Endpoint 6:GET /challenges
router.get('/',
    jwtMiddleware.verifyToken,
    controller.readAllChallenge,
    response.withMessage("Fetched all challenges", 200),
    response.sendResponse
);

//Endpoint 7:DELETE /challenges/:challenge_id
router.delete('/:challenge_id',
    jwtMiddleware.verifyToken, 
    controller.deleteChallenge,
    response.withMessage("", 204),
    response.sendResponse
);

//Endpoint 8:PUT /challenges/:challenge_id
router.put('/:challenge_id',
    jwtMiddleware.verifyToken,
    controller.checkChallengeOwner,
    controller.updateChallengeById,
    controller.readChallengeById,
    response.withMessage("", 200),
    response.sendResponse
);

//Endpoint 9:POST /challenges/:challenge_id/
router.post("/:challengeId/",
    jwtMiddleware.verifyToken,
    completionController.checkUserIdExists,
    completionController.checkChallengeIdExists,
    completionController.createCompletionRecord,
    completionController.getPointsByChallenge,
    completionController.rewardPoints,
    completionController.getCompletionById,
    response.withMessage("Completion record created successfully", 201),
    response.sendResponse
);

//Endpoint 10:GET /challenges/:challenge_id
router.get('/:challenge_id',
    jwtMiddleware.verifyToken,
    controller.getUsersByChallengeId,
    response.withMessage("Fetched users for the challenge", 200),
    response.sendResponse
);

// GET /challenges/completed/me
router.get("/completed/me",
  jwtMiddleware.verifyToken,
  completionController.getMyCompletedChallenges,
  response.withMessage("Completed challenges retrieved", 200),
  response.sendResponse
);

module.exports = router;