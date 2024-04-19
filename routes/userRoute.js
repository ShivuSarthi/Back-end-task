const express = require("express");
const {
  registerUser,
  loginUser,
  logout,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUser
} = require("../controllers/userController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const router = express.Router();

router.route("/user/register").post(registerUser);

router.route("/user/login").post(loginUser);

router.route("/user/logout").get(logout);

router.route("/user/:id").get(isAuthenticatedUser, getUserDetails);

router
  .route("/user/password/update/:id")
  .put(isAuthenticatedUser, updatePassword);

router.route("/user/update/:id").put(isAuthenticatedUser, updateProfile);

router
  .route("/admin/get_all_users")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllUser);

module.exports = router;
