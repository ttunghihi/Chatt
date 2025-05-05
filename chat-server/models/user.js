const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Vui lòng nhập họ của bạn"],
  },
  lastName: {
    type: String,
    required: [true, "Vui lòng nhập tên của bạn"],
  },
  email: {
    type: String,
    required: [true, "Vui lòng nhập địa chỉ email"],
    unique: true, // Đảm bảo email không trùng lặp
    validate: {
      validator: function (email) {
        return String(email)
          .toLowerCase()
          .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          );
      },
      message: (props) => `Email (${props.value}) không hợp lệ!`,
    },
  },
  password: {
    type: String,
    required: [true, "Vui lòng nhập mật khẩu"],
    minlength: 6,
    select: false, // Không trả về mật khẩu trong các truy vấn
  },
  avatar: {
    type: String,
    default:
      "https://www.google.com/url?sa=i&url=https%3A%2F%2Fvi.pngtree.com%2Ffreepng%2Fdark-gray-simple-avatar_6404677.html&psig=AOvVaw3p62NHt6vhO6tpxaWxwqV_&ust=1744320178048000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCOjd25Lxy4wDFQAAAAAdAAAAABAI", // URL ảnh đại diện mặc định
  },
  status: {
    type: String,
    enum: ["online", "offline"],
    default: "offline", // Trạng thái mặc định là ngoại tuyến
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isLoggedIn: {
    type: Boolean,
    default: false,
  },
  recentChats: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Tham chiếu đến model User
    },
  ],
});

// Middleware mã hóa mật khẩu trước khi lưu
userSchema.pre("save", async function (next) {
  // Chỉ mã hóa mật khẩu nếu nó được sửa đổi và chưa được mã hóa thủ công
  if (!this.isModified("password") || this.isManuallyHashed) return next();

  // Mã hóa mật khẩu
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Middleware kiểm tra email trùng lặp trước khi lưu
userSchema.pre("save", async function (next) {
  if (this.isModified("email")) {
    const existingUser = await mongoose.models.User.findOne({ email: this.email });
    if (existingUser) {
      return next(new Error("Email đã được sử dụng."));
    }
  }
  next();
});

// Phương thức thực thể: Cập nhật trạng thái đăng nhập
userSchema.methods.updateLoginStatus = async function (status) {
  this.isLoggedIn = status;
  await this.save();
};

// Phương thức thực thể: So sánh mật khẩu
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Phương thức tĩnh: Tìm người dùng theo email
userSchema.statics.findByEmail = async function (email) {
  return await this.findOne({ email }).select("+password");
};

// Phương thức tĩnh: Cập nhật trạng thái của tất cả người dùng
userSchema.statics.updateAllStatuses = async function (status) {
  return await this.updateMany({}, { status });
};

const User = mongoose.model("User", userSchema);
module.exports = User;