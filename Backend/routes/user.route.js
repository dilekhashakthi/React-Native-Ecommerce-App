const express = require("express");
const {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
} = require("../controllers/user.controller");
const { protect, admin } = require("../middleware/auth.middleware");

const router = express.Router();

router.route("/").get(protect, admin, getUsers).post(registerUser);
router
  .route("/:id")
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.route("/auth").post(authUser);
router.route("/logout").post(logoutUser);

module.exports = router;
