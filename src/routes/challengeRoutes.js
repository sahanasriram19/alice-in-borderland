// Import Modules
const express = require('express');
const router = express.Router();

//Import Middleware
const response = require('../middleware/response');

// Import Controller
const controller = require('../controllers/challengeController');
const completionController = require('../controllers/completionController')

//Endpoint 5:POST /challenges
router.post('/',
    controller.createChallenge,
    controller.readChallengeById,
    response.withMessage("Challenge created successfully", 201),
    response.sendResponse
);

//Endpoint 6:GET /challenges
router.get('/',
    controller.readAllChallenge,
    response.withMessage("Fetched all challenges", 200),
    response.sendResponse
);

//Endpoint 7:DELETE /challenges/:challenge_id
router.delete('/:challenge_id',
    controller.deleteChallenge,
    response.withMessage("", 204),
    response.sendResponse
);

//Endpoint 8:PUT /challenges/:challenge_id
router.put('/:challenge_id',
    controller.checkChallengeOwner,
    controller.updateChallengeById,
    controller.readChallengeById,
    response.withMessage("", 200),
    response.sendResponse
);

//Endpoint 9:POST /challenges/:challenge_id/
router.post("/:challengeId/",
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
    controller.getUsersByChallengeId,
    response.withMessage("Fetched users for the challenge", 200),
    response.sendResponse                                    
);


module.exports = router;