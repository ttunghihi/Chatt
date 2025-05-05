const mongoose = require("mongoose");

const groupMessageSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group", // Tham chiếu đến model Group
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Tham chiếu đến model User
      required: true,
    },
    message: {
      type: String,
      required: true, // Nội dung tin nhắn là bắt buộc
    },
    type: {
      type: String,
      enum: ["text", "file"], // Loại tin nhắn: văn bản hoặc tệp
      required: true,
    },
    fileUrl: {
      type: String, // Đường dẫn file (nếu có)
      default: null,
    },
    size: {
      type: Number, // Kích thước file (nếu có)
      default: null,
    },
  },
  { timestamps: true } // Tự động thêm createdAt và updatedAt
);

// Phương thức tĩnh: Lấy tất cả tin nhắn trong một nhóm
groupMessageSchema.statics.getGroupMessages = async function (groupId) {
  return await this.find({ groupId })
    .sort({ createdAt: 1 })
    .populate("sender", "firstName lastName avatar");
};

const GroupMessage = mongoose.model("GroupMessage", groupMessageSchema);

module.exports = GroupMessage;