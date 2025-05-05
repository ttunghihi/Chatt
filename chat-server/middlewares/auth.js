const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports = async (req, res, next) => {
  try {
    let token;

    // Lấy token từ cookie hoặc header Authorization
    if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
      if (process.env.NODE_ENV === "development") {
        console.log("Token từ cookie:", token);
      }
    } else if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
      if (process.env.NODE_ENV === "development") {
        console.log("Token từ header:", token);
      }
    }

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Bạn cần đăng nhập để thực hiện hành động này.",
      });
    }

    // Xác minh token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (process.env.NODE_ENV === "development") {
        console.log("ID từ token:", decoded.id);
      }
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          status: "error",
          message: "Token đã hết hạn. Vui lòng đăng nhập lại.",
        });
      }
      return res.status(401).json({
        status: "error",
        message: "Token không hợp lệ.",
      });
    }

    // Tìm người dùng từ token
    const currentUser = await User.findById(decoded.id);
    if (process.env.NODE_ENV === "development") {
      console.log("Người dùng tìm thấy:", currentUser);
    }

    if (!currentUser) {
      return res.status(401).json({
        status: "error",
        message: "Người dùng không tồn tại. Vui lòng kiểm tra lại token.",
      });
    }

    // Kiểm tra nếu người dùng đã đăng xuất
    if (!currentUser.isLoggedIn) {
      return res.status(403).json({
        status: "error",
        message: "Người dùng đã đăng xuất. Vui lòng đăng nhập lại.",
      });
    }

    // Gắn thông tin người dùng vào request
    req.user = currentUser;
    next();
  } catch (error) {
    console.error("Lỗi xác thực:", error.message);
    res.status(401).json({
      status: "error",
      message: "Xác thực không thành công.",
    });
  }
};