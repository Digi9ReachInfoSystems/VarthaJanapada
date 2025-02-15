const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");

// Route for user signup
router.post("/signup", authController.signup);
router.post("/signupWithEmail", authController.signupWithEmail);

// Route for user login
router.post("/login", authController.login);

router.get("/getUserProfile/:userId", authController.getUserProfile);

module.exports = router;
