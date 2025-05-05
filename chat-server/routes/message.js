const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message");
const authMiddleware = require("../middlewares/auth"); // Middleware xác thực

// Endpoint gửi tin nhắn (yêu cầu xác thực)
router.post("/messages", authMiddleware, messageController.sendMessage);

// Endpoint lấy danh sách tin nhắn (yêu cầu xác thực)
router.get("/messages", authMiddleware, messageController.getMessages);

module.exports = router;