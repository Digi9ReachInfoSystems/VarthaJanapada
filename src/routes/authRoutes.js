// const express = require("express");
// const router = express.Router();
// const authController = require("../controller/authController");
// const authenticateJWT = require("../middleware/authenticateRole");
// const allowedRoles = require("../middleware/allowedRole");

// // Route for user signup
// router.post("/signup", authController.signup);
// router.post("/signupWithEmail", authController.signupWithEmail);
// router.post("/login-with-role", authController.loginWithUserRole);
// router.post("/create-user-with-role", authController.createUserWithRole);
// router.post("/check-user", authController.checkUserByPhoneNumber);

// // Route for user login
// router.post("/login", authController.login);

// router.get("/getUserProfile/:userId", authController.getUserProfile);

// module.exports = router;

const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const authenticateJWT = require("../middleware/authenticateRole");
const allowedRoles = require("../middleware/allowedRole");


router.post("/signup", authController.signup); // Phone-based signup
router.post("/signupWithEmail", authController.signupWithEmail);
router.post("/login", authController.login);
router.post("/login-with-role", authController.loginWithUserRole);

router.post("/check-user",
    authenticateJWT,
    allowedRoles(['admin']),
    authController.checkUserByPhoneNumber);

// Role-based user creation (Admin Only)
router.post(
  "/create-user-with-role",
  authenticateJWT,
  allowedRoles(['admin']),
  authController.createUserWithRole
);

// View your own profile
router.get("/getUserProfile", authenticateJWT, authController.getUserProfile);



router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authenticateJWT, authController.logout);

module.exports = router;
