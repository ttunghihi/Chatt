const User = require("../models/user");
const filterObj = require("../utils/filterObj");
const bcrypt = require("bcryptjs");

exports.updateMe = async (req, res, next) => {
  try {
    const { user } = req;

    // Lọc các trường được phép cập nhật
    const filteredBody = filterObj(
      req.body,
      "firstName",
      "lastName",
      "avatar"
    );

    // Tìm người dùng bằng `findById`
    const currentUser = await User.findById(user._id);
    if (!currentUser) {
      return res.status(404).json({
        status: "error",
        message: "Người dùng không tồn tại",
      });
    }

    // Cập nhật các trường được phép
    Object.keys(filteredBody).forEach((key) => {
      currentUser[key] = filteredBody[key];
    });

    // Lưu người dùng và kích hoạt middleware `pre("save")`
    const updatedUser = await currentUser.save();

    res.status(200).json({
      status: "success",
      data: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        avatar: updatedUser.avatar,
      },
      message: "Cập nhật trang cá nhân thành công",
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin người dùng:", error.message);
    res.status(500).json({
      status: "error",
      message: "Đã xảy ra lỗi khi cập nhật thông tin người dùng.",
    });
  }
};

// Lấy danh sách tất cả người dùng
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("firstName lastName _id avatar email");
    res.status(200).json({
      status: "success",
      users,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error.message);
    res.status(500).json({
      status: "error",
      message: "Không thể lấy danh sách người dùng.",
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: "error",
        message: "Vui lòng cung cấp đầy đủ mật khẩu hiện tại và mật khẩu mới.",
      });
    }

    // Kiểm tra xem người dùng đã đăng nhập hay chưa
    const { user } = req;
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Bạn cần đăng nhập để thực hiện thao tác này.",
      });
    }

    // Tìm người dùng trong database
    const currentUser = await User.findById(user._id).select("+password");
    if (!currentUser) {
      return res.status(404).json({
        status: "error",
        message: "Người dùng không tồn tại.",
      });
    }

    console.log("Mật khẩu hiện tại trong database:", currentUser.password);

    // Kiểm tra mật khẩu hiện tại
    const isPasswordCorrect = await bcrypt.compare(currentPassword, currentUser.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        status: "error",
        message: "Mật khẩu hiện tại không đúng.",
      });
    }

    // Mã hóa mật khẩu mới
    console.log("Mật khẩu mới trước khi mã hóa:", newPassword);
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    console.log("Mật khẩu mới sau khi mã hóa:", hashedPassword);

    // Cập nhật mật khẩu mới
    currentUser.password = hashedPassword;
    currentUser.isManuallyHashed = true; // Đặt cờ để middleware không mã hóa lại
    await currentUser.save();

    res.status(200).json({
      status: "success",
      message: "Đổi mật khẩu thành công.",
    });
  } catch (error) {
    console.error("Lỗi khi đổi mật khẩu:", error.message);
    res.status(500).json({
      status: "error",
      message: "Đã xảy ra lỗi khi đổi mật khẩu.",
    });
  }
};

exports.verifyPassword = async (req, res) => {
  try {
    const { currentPassword } = req.body;

    // Kiểm tra xem người dùng đã đăng nhập hay chưa
    const { user } = req;
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Bạn cần đăng nhập để thực hiện thao tác này.",
      });
    }

    // Tìm người dùng trong database
    const currentUser = await User.findById(user._id).select("+password");
    if (!currentUser) {
      return res.status(404).json({
        status: "error",
        message: "Người dùng không tồn tại.",
      });
    }

    // Kiểm tra mật khẩu hiện tại
    const isPasswordCorrect = await bcrypt.compare(currentPassword, currentUser.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        status: "error",
        message: "Mật khẩu hiện tại không đúng.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Mật khẩu hiện tại chính xác.",
    });
  } catch (error) {
    console.error("Lỗi khi xác thực mật khẩu:", error.message);
    res.status(500).json({
      status: "error",
      message: "Đã xảy ra lỗi khi xác thực mật khẩu.",
    });
  }
};