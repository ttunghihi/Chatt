const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Message = require("./models/message");
const GroupMessage = require("./models/groupMessage");
const Group = require("./models/group");
const User = require("./models/user"); // Import model User

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3001", // URL frontend
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Middleware xác thực
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      console.error("Lỗi xác thực: Token không tồn tại.");
      return next(new Error("Authentication error: Token không tồn tại."));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id; // Gắn userId vào socket
      console.log("Xác thực thành công, userId:", socket.userId);
      next();
    } catch (err) {
      console.error("Lỗi xác thực token:", err.message);
      next(new Error("Authentication error: Token không hợp lệ."));
    }
  });

  // Sự kiện kết nối
  io.on("connection", (socket) => {
    console.log("Người dùng đã kết nối:", { userId: socket.userId, socketId: socket.id });

    // Sự kiện tham gia nhóm
    socket.on("joinGroup", async ({ groupId }) => {
  const userId = socket.userId;
  try {
    if (!groupId || !userId) {
      throw new Error("Thiếu thông tin groupId hoặc userId.");
    }

    // Thêm socket vào room của nhóm
    socket.join(groupId);
    console.log(`Người dùng ${userId} đã tham gia nhóm ${groupId}`);

    // Gửi lại lịch sử tin nhắn của nhóm
    const messages = await GroupMessage.find({ groupId })
      .sort({ createdAt: 1 })
      .populate("sender", "firstName lastName avatar");

    // Chuẩn hóa dữ liệu tin nhắn trước khi gửi
    const sanitizedMessages = messages.map((msg) => ({
      _id: msg._id,
      groupId: msg.groupId,
      sender: msg.sender._id,
      senderName: `${msg.sender.firstName} ${msg.sender.lastName}`,
      senderAvatar: msg.sender.avatar,
      message: msg.message,
      type: msg.type,
      fileUrl: msg.fileUrl,
      size: msg.size,
      createdAt: msg.createdAt,
    }));

    socket.emit("groupMessages", sanitizedMessages);

    // Phát sự kiện thông báo đến các thành viên khác trong nhóm
    socket.to(groupId).emit("userJoined", { userId, groupId });
  } catch (err) {
    console.error("Lỗi khi tham gia nhóm:", err.message);
    socket.emit("error", { error: "Lỗi khi tham gia nhóm" });
  }
});

    // Sự kiện gửi tin nhắn nhóm
    socket.on("sendGroupMessage", async (data) => {
      try {
        const { groupId, message, type, fileUrl, size } = data;
        const sender = socket.userId;
    
        // Lưu tin nhắn vào cơ sở dữ liệu
        const newGroupMessage = await GroupMessage.create({
          groupId,
          sender,
          message: type !== "text" && fileUrl ? fileUrl.split("/").pop() : message,
          type,
          fileUrl: type !== "text" ? fileUrl : null,
          size: type !== "text" ? size : null,
          createdAt: new Date(),
        });
    
        console.log("Tin nhắn nhóm đã được lưu vào cơ sở dữ liệu:", newGroupMessage);
    
        // Lấy thông tin chi tiết của người gửi
        const senderDetails = await User.findById(sender).select("firstName lastName avatar");
    
        if (!senderDetails) {
          console.error("Không tìm thấy thông tin người gửi.");
          return;
        }
    
        const sanitizedMessage = {
          _id: newGroupMessage._id,
          groupId,
          sender,
          senderName: `${senderDetails.firstName} ${senderDetails.lastName}`,
          senderAvatar: senderDetails.avatar,
          message,
          type,
          fileUrl,
          size,
          createdAt: newGroupMessage.createdAt,
        };
    
        // Phát tin nhắn đến tất cả các thành viên trong nhóm, ngoại trừ người gửi
        socket.to(groupId).emit("receiveGroupMessage", sanitizedMessage);
    
        console.log(`Phát tin nhắn nhóm đến các thành viên trong nhóm ${groupId}, ngoại trừ người gửi.`);
    
        // Phát tin nhắn lại cho chính người gửi
        socket.emit("receiveGroupMessage", {
          ...sanitizedMessage,
          senderName: `${senderDetails.firstName} ${senderDetails.lastName}`,
          senderAvatar: senderDetails.avatar,
        });
        console.log("Phát tin nhắn lại cho người gửi:", socket.id);
      } catch (err) {
        console.error("Lỗi khi gửi tin nhắn nhóm:", err.message);
        socket.emit("error", { error: "Lỗi khi gửi tin nhắn nhóm" });
      }
    });
    // Sự kiện gửi tin nhắn cá nhân
    socket.on("sendMessage", async (data) => {
      try {
        const { sender, receiver, message, type, fileUrl, size } = data;

        console.log("Dữ liệu nhận được từ frontend:", data);

        if (!sender || !receiver || !message || !type) {
          throw new Error("Thiếu thông tin cần thiết để gửi tin nhắn.");
        }

        const newMessage = await Message.create({
          sender,
          receiver,
          message: type !== "text" && fileUrl ? fileUrl.split("/").pop() : message,
          type,
          fileUrl: type !== "text" ? fileUrl : null,
          size: type !== "text" ? size : null,
          createdAt: new Date(),
        });

        console.log("Tin nhắn đã được lưu vào cơ sở dữ liệu:", newMessage);

        const sockets = await io.fetchSockets();
        const receiverSocket = sockets.find((s) => s.userId === receiver);

        if (receiverSocket) {
          io.to(receiverSocket.id).emit("receiveMessage", {
            _id: newMessage._id,
            sender,
            receiver,
            message,
            type,
            fileUrl,
            size,
            createdAt: newMessage.createdAt,
          });
          console.log("Phát tin nhắn đến socketId của người nhận:", receiverSocket.id);
        } else {
          console.warn("Người nhận không trực tuyến hoặc không tồn tại trong danh sách.");
        }

        io.to(socket.id).emit("receiveMessage", {
          _id: newMessage._id,
          sender,
          receiver,
          message,
          type,
          fileUrl,
          size,
          createdAt: newMessage.createdAt,
        });
        console.log("Phát tin nhắn lại cho người gửi:", socket.id);
      } catch (err) {
        console.error("Lỗi khi gửi tin nhắn:", err.message);
        socket.emit("error", { error: "Lỗi khi gửi tin nhắn" });
      }
    });

    // Sự kiện ngắt kết nối
    socket.on("disconnect", (reason) => {
      console.log("Người dùng đã ngắt kết nối:", { userId: socket.userId, socketId: socket.id, reason });
    });
  });

  return io;
};

module.exports = { initializeSocket };