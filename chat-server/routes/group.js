const router = require("express").Router();

const authController = require("../controllers/auth");
const groupController = require("../controllers/group");

// Route tạo nhóm mới
router.post("/create", authController.protect, groupController.createGroup);

// Route lấy danh sách nhóm của người dùng
router.get("/get", authController.protect, groupController.getUserGroups);

module.exports = router;