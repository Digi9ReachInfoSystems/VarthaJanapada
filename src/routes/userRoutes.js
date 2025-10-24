const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");

const allowedRoles = require("../middleware/allowedRole");
const authenticateJWT = require("../middleware/authenticateRole");

// Route to get all users
router.get("/getMonthlyUser", userController.getMonthlyUserCreationData);
router.get("/total-users", userController.getTotalUsers);
router.get("/users", userController.getAllUsers);
router.get("/new-users", userController.getNewUsersCount);

// Route to get a specific user by ID
router.get("/users/:id",authenticateJWT, allowedRoles(['admin','moderator']), userController.getUserById);
// router.get("/user/recent", userController.recentUser);

// Route to delete a user
router.delete("/users/:id", userController.deleteUser);

// Route to track news click for a user
router.post("/track-news-click", userController.trackNewsClick);

router.post("/login-on-web", userController.loginOnWeb);
router.post("/logout", userController.logout);

// Route to recommend news category based on the user's interactions
router.get("/recommendations/:userId", userController.recommendCategory);

router.put("/update-profile/:firebaseUid", userController.updateUserProfile);
router.put("/update-preferences/:userId", userController.updateUserPreferences);
router.delete("/deleteuser/:userId",authenticateJWT, allowedRoles(['admin']), userController.deleteUser);
module.exports = router;
