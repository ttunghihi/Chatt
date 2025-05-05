const router = require("express").Router();

const authController = require("../controllers/auth");
const userController = require("../controllers/user");

// Route lấy danh sách người dùng
router.get("/", authController.protect, userController.getAllUsers);

// Route cập nhật thông tin người dùng
router.patch("/update-me", authController.protect, userController.updateMe);

router.post("/change-password", authController.protect, userController.changePassword);

router.post("/verify-password", authController.protect, userController.verifyPassword);

module.exports = router;