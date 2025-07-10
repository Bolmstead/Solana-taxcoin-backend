const express = require("express");
const router = express.Router();
const infoController = require("../controllers/info.controller");

// Create a new reward
router.post("/", infoController.getInfo);

module.exports = router;
