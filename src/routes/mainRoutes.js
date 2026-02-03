// Import Modules
const express = require('express');
const router = express.Router();

// Import Routes (Section D)
const userRoutes = require('./userRoutes');
const challengeRoutes = require('./challengeRoutes');

// Import Routes (Gamification)
const groupRoutes = require('./groupRoutes');
const matchRoutes = require('./matchRoutes');
const profileRoutes = require("./profileRoutes");
const shopRoutes = require("./shopRoutes");
const dailyClaimRoutes = require("./dailyClaimRoutes");
const inventoryRoutes = require("./inventoryRoutes");
const authRoutes = require("./authRoutes");

// Use Routes
router.use("/users", userRoutes);
router.use("/challenges", challengeRoutes);

// Gamification Routes
router.use("/profiles", profileRoutes);
router.use("/groups", groupRoutes);
router.use("/matches", matchRoutes);
router.use("/shop", shopRoutes);
router.use("/daily-claim", dailyClaimRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/auth", authRoutes);

module.exports = router;

