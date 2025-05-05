const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat");
const authController = require("../controllers/auth");

// API để lấy danh sách recentChats
router.get("/recent-chats", authController.protect, chatController.getRecentChats);

// API để cập nhật danh sách recentChats
router.post("/update-recent-chats", authController.protect, chatController.updateRecentChats);

module.exports = router;