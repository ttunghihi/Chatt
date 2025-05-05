const router = require("express").Router();

const authRoute = require("./auth");
const userRoute = require("./user");
const messageRoute = require("./message");
const chatRoute = require("./chat");
const uploadRoute = require("./upload");
const groupRoute = require("./group"); // Import route nhóm
const groupMessageRoute = require("./groupMessage"); // Import route tin nhắn nhóm
// Định nghĩa các route
router.use("/auth", authRoute); // Route cho xác thực
router.use("/user", userRoute); // Route cho người dùng
router.use("/message", messageRoute); // Route cho tin nhắn
router.use("/chat", chatRoute); // Route cho trò chuyện
router.use("/upload", uploadRoute); // Route tải lên file
router.use("/group", groupRoute); // Route cho nhóm
router.use("/groupMessage", groupMessageRoute); // Route cho tin nhắn nhóm

module.exports = router;