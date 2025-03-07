const express = require("express");
const router = express.Router();
const rewardController = require("../controllers/reward.controller");

// Create a new reward
router.post("/", rewardController.createReward);

// Get all rewards
router.get("/", rewardController.getRewards);

// Get a specific reward by ID
router.get("/:id", rewardController.getRewardById);

// Update a reward
router.put("/:id", rewardController.updateReward);

// Delete a reward
router.delete("/:id", rewardController.deleteReward);

module.exports = router;
