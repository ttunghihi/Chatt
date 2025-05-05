const multer = require("multer");
const path = require("path");

// Cấu hình nơi lưu trữ file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Thư mục lưu file
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Tên file duy nhất
  },
});

// Bộ lọc file (chỉ cho phép ảnh và tài liệu)
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif", // Hỗ trợ ảnh GIF
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // Hỗ trợ file .docx
        "text/plain", // Hỗ trợ file văn bản .txt
      ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Loại file không được hỗ trợ."), false);
  }
};

// Khởi tạo multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn kích thước file: 5MB
});

// API tải lên file
exports.uploadFile = (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "Không có file nào được tải lên." });
      }
  
      res.status(200).json({ filePath: `/uploads/${req.file.filename}` });
    } catch (error) {
      res.status(500).json({ error: "Lỗi khi tải lên file." });
    }
  };

// Middleware để xử lý tải lên file
exports.uploadMiddleware = upload.single("file");