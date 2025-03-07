const express = require("express");
const router = express.Router();
const snapshotController = require("../controllers/snapshot.controller");

// Create a new snapshot
router.post("/", snapshotController.createSnapshot);

// Get all snapshots
router.get("/", snapshotController.getSnapshots);

// Get a specific snapshot by ID
router.get("/:id", snapshotController.getSnapshotById);

// Update a snapshot
router.put("/:id", snapshotController.updateSnapshot);

// Delete a snapshot
router.delete("/:id", snapshotController.deleteSnapshot);

module.exports = router;
