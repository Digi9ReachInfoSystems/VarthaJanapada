const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");

// Route to get all users
router.get("/users", userController.getAllUsers);

// Route to get a specific user by ID
router.get("/users/:id", userController.getUserById);
router.get("/total-users", userController.getTotalUsers);

// Route to delete a user
router.delete("/users/:id", userController.deleteUser);

// Route to track news click for a user
router.post("/track-news-click", userController.trackNewsClick);

// Route to recommend news category based on the user's interactions
router.get("/recommendations/:userId", userController.recommendCategory);

router.put("/update-profile/:userId", userController.updateUserProfile);
router.put("/update-preferences/:userId", userController.updateUserPreferences);

module.exports = router;
