const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");

// Route to get all users
router.get("/total-users", userController.getTotalUsers);
router.get("/users", userController.getAllUsers);
router.get("/new-users", userController.getNewUsersCount);

// Route to get a specific user by ID
router.get("/users/:id", userController.getUserById);

// Route to delete a user
router.delete("/users/:id", userController.deleteUser);

// Route to track news click for a user
router.post("/track-news-click", userController.trackNewsClick);

router.post("/login-on-web", userController.loginOnWeb);
router.post("/logout", userController.logout);

router.post("/logout", userController.logout);

// Route to recommend news category based on the user's interactions
router.get("/recommendations/:userId", userController.recommendCategory);

router.put("/update-profile/:userId", userController.updateUserProfile);
router.put("/update-preferences/:userId", userController.updateUserPreferences);

module.exports = router;
