const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "image", "file"], // Các loại tin nhắn
      default: "text",
    },
    fileUrl: {
      type: String,
      default: null, // Đường dẫn file (nếu có)
    },
    size: {
      type: Number,
      default: null, // Kích thước file (nếu có)
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Phương thức tĩnh: Lấy tin nhắn giữa hai người dùng
messageSchema.statics.getMessagesBetweenUsers = async function (userId1, userId2) {
  const messages = await this.find({
    $or: [
      { sender: userId1, receiver: userId2 },
      { sender: userId2, receiver: userId1 },
    ],
  })
    .populate("sender", "firstName lastName avatar email")
    .populate("receiver", "firstName lastName avatar email")
    .sort({ createdAt: 1 });

  // Thêm `fileUrl` nếu là ảnh hoặc file
  return messages.map((msg) => ({
    ...msg._doc,
    fileUrl: msg.type !== "text" && msg.message
    ? `/uploads/${msg.message}`
    : null,
    }));
};

// Phương thức thực thể: Đánh dấu tin nhắn là đã đọc
messageSchema.methods.markAsRead = async function () {
  if (!this.isRead) {
    this.isRead = true;
    await this.save();
  }
};

// Phương thức tĩnh: Đánh dấu tất cả tin nhắn là đã đọc giữa hai người dùng
messageSchema.statics.markAllAsRead = async function (userId1, userId2) {
  await this.updateMany(
    {
      sender: userId2,
      receiver: userId1,
      isRead: false,
    },
    { isRead: true }
  );
};

// Phương thức tĩnh: Lấy tin nhắn chưa đọc của một người dùng
messageSchema.statics.getUnreadMessages = async function (userId) {
  return await this.find({
    receiver: userId,
    isRead: false,
  })
    .populate("sender", "firstName lastName avatar email")
    .sort({ createdAt: -1 }); // Sắp xếp theo thời gian giảm dần
};

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;