const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Tên nhóm là bắt buộc
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Tham chiếu đến model User
      },
    ],
  },
  { timestamps: true } // Tự động thêm createdAt và updatedAt
);

// Phương thức tĩnh: Lấy danh sách nhóm của một người dùng
groupSchema.statics.getUserGroups = async function (userId) {
  return await this.find({ members: userId }).populate("members", "firstName lastName avatar");
};

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;