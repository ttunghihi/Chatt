const Group = require("../models/group");
const User = require("../models/user");

// Tạo nhóm mới
exports.createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!name || !members || members.length < 2) {
      return res.status(400).json({
        status: "error",
        message: "Tên nhóm và ít nhất 2 thành viên là bắt buộc.",
      });
    }

    // Tạo nhóm mới
    const newGroup = await Group.create({
      name,
      members: [...members, req.user._id],
    });

    res.status(201).json({
      status: "success",
      group: newGroup,
      message: "Nhóm mới đã được tạo thành công.",
    });
  } catch (error) {
    console.error("Lỗi khi tạo nhóm:", error.message);
    res.status(500).json({
      status: "error",
      message: "Đã xảy ra lỗi khi tạo nhóm.",
    });
  }
};

// Lấy danh sách nhóm của người dùng
exports.getUserGroups = async (req, res) => {
  try {
    const { user } = req;

    // Tìm tất cả các nhóm mà người dùng là thành viên
    const groups = await Group.find({ members: user._id })
      .populate("members", "firstName lastName avatar")

    res.status(200).json({
      status: "success",
      groups,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách nhóm:", error.message);
    res.status(500).json({
      status: "error",
      message: "Đã xảy ra lỗi khi lấy danh sách nhóm.",
    });
  }
}; 