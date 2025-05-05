const router = require("express").Router();

const authController = require("../controllers/auth");
const groupMessageController = require("../controllers/groupMessage");

// Route gửi tin nhắn trong nhóm
router.post("/messages", authController.protect, groupMessageController.sendGroupMessage);

// Route lấy danh sách tin nhắn trong nhóm
router.get("/messages/:groupId", authController.protect, groupMessageController.getGroupMessages);

module.exports = router;