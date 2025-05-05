const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../models/user");


let io;

// Tạo token JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "90d",
  });
};

exports.setSocketIOAuth = (socketIO) => {
  io = socketIO;
};

// Đăng ký tài khoản mới
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Kiểm tra xem email đã tồn tại hay chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Email đã được sử dụng, vui lòng đăng nhập.",
      });
    }

    // Tạo người dùng mới
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password, // Mật khẩu sẽ được mã hóa trong middleware `pre("save")` của Mongoose
    });

    res.status(201).json({
      status: "success",
      message: "Đăng ký thành công!",
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Lỗi khi đăng ký:", error.message);
    res.status(500).json({
      status: "error",
      message: "Đã xảy ra lỗi, vui lòng thử lại sau.",
    });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra email và mật khẩu
    if (!email || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập email và mật khẩu.",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        message: "Email hoặc mật khẩu không đúng.",
      });
    }

    // Cập nhật trạng thái isLoggedIn và status
    user.isLoggedIn = true;
    user.status = "online";
    await user.save();

    // Tạo token JWT
    const token = signToken(user._id);
    console.log("Token được tạo:", token);

    // Gửi token dưới dạng cookie HTTP-only
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 90 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Đăng nhập thành công!",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status,
      },
      token,
    });
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error.message);
    res.status(500).json({
      message: "Đã xảy ra lỗi, vui lòng thử lại sau.",
    });
  }
};

// Đăng xuất
 // Biến toàn cục để lưu trữ đối tượng io



// Đăng xuất
exports.logout = async (req, res) => {
  try {
    const token = req.cookies?.jwt;

    if (!token) {
      // Nếu không có cookie, vẫn trả về phản hồi thành công
      return res.status(200).json({
        message: "Bạn đã đăng xuất hoặc chưa đăng nhập.",
      });
    }

    // Giải mã token để lấy ID người dùng
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (user) {
      // Cập nhật trạng thái isLoggedIn và status
      user.isLoggedIn = false;
      user.status = "offline";
      await user.save();

      // Ngắt kết nối Socket.IO
      if (io) {
        const userSocket = Array.from(io.sockets.sockets.values()).find(
          (socket) => socket.userId === user._id.toString()
        );

        if (userSocket) {
          userSocket.disconnect(true); // Ngắt kết nối socket của người dùng
          console.log(`Socket.IO đã ngắt kết nối cho userId: ${user._id}`);
        }
      } else {
        console.error("Socket.IO chưa được khởi tạo.");
      }
    }

    // Xóa cookie
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({
      message: "Đăng xuất thành công!",
    });
  } catch (error) {
    console.error("Lỗi khi đăng xuất:", error.message);
    res.status(500).json({
      message: "Đã xảy ra lỗi khi đăng xuất.",
    });
  }
};
// Middleware bảo vệ route
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Lấy token từ cookie hoặc header Authorization
    if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    } else if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "Bạn chưa đăng nhập! Vui lòng đăng nhập.",
      });
    }

    // Xác minh token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Tìm người dùng từ token
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        message: "Người dùng không tồn tại.",
      });
    }

    // Gắn thông tin người dùng vào req
    req.user = user;
    next();
  } catch (error) {
    console.error("Lỗi trong middleware protect:", error.message);
    res.status(401).json({
      message: "Token không hợp lệ hoặc đã hết hạn.",
    });
  }
};

// Kiểm tra phiên đăng nhập
exports.checkSession = async (req, res) => {
  try {
    const token = req.cookies?.jwt;

    if (!token) {
      return res.status(200).json({
        loggedIn: false,
        message: "Bạn chưa đăng nhập.",
      });
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || !user.isLoggedIn) {
      return res.status(200).json({
        loggedIn: false,
        message: "Người dùng không tồn tại hoặc chưa đăng nhập.",
      });
    }

    res.status(200).json({
      loggedIn: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Lỗi khi kiểm tra trạng thái đăng nhập:", error.message);
    res.status(200).json({
      loggedIn: false,
      message: "Token không hợp lệ hoặc đã hết hạn.",
    });
  }
};

// Tìm kiếm người dùng qua email
exports.searchUsersByEmail = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        status: "error",
        message: "Vui lòng cung cấp từ khóa tìm kiếm.",
      });
    }

    const users = await User.find({
      email: { $regex: query, $options: "i" },
    }).select("email firstName lastName avatar");

    res.status(200).json({
      status: "success",
      data: users,
    });
  } catch (error) {
    console.error("Lỗi khi tìm kiếm người dùng:", error.message);
    res.status(500).json({
      status: "error",
      message: "Đã xảy ra lỗi khi tìm kiếm người dùng.",
    });
  }
};