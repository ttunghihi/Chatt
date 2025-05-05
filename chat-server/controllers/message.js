const Message = require("../models/message");

let io; // Biến để lưu trữ đối tượng Socket.IO

// Hàm để nhận `io` từ server.js
exports.setSocketIO = (socketIO) => {
  io = socketIO;
  console.log("Socket.IO đã được truyền vào controllers/message.js");
};

// Hàm lưu tin nhắn vào cơ sở dữ liệu
const saveMessage = async (sender, receiver, message, type, fileUrl, size) => {
  const newMessage = await Message.create({
    sender,
    receiver,
    message: type !== "text" && fileUrl ? fileUrl.split("/").pop() : message, // Lưu tên file đầy đủ
    type,
    fileUrl: type !== "text" ? fileUrl : null,
    size: type !== "text" ? size : null,
  });
  console.log("Tin nhắn đã được lưu:", newMessage);
  return newMessage;
};

// Hàm phát tin nhắn qua Socket.IO
const emitMessage = async (receiver, newMessage) => {
  if (!io) {
    console.error("Socket.IO chưa được khởi tạo.");
    return;
  }

  console.log("Danh sách socket đang kết nối:", Array.from(io.sockets.sockets.keys()));

  // Tìm socket của người nhận
  io.sockets.sockets.forEach((socket) => {
    if (socket.userId === receiver) {
      socket.emit("receiveMessage", newMessage);
      console.log("Phát tin nhắn đến socketId:", socket.id);
    }
  });
};

// Hàm gửi tin nhắn qua HTTP
exports.sendMessage = async (req, res) => {
  try {
    const { sender, receiver, message, type, fileUrl, size } = req.body;

const newMessage = await saveMessage(sender, receiver, message, type, fileUrl, size);

    // Không phát tin nhắn qua Socket.IO ở đây
    // emitMessage(receiver, newMessage);

    res.status(201).json({ status: "success", data: newMessage });
  } catch (error) {
    console.error("Lỗi khi gửi tin nhắn qua HTTP:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// Hàm lấy danh sách tin nhắn
exports.getMessages = async (req, res) => {
  const { userId1, userId2 } = req.query;

  console.log("Yêu cầu lấy tin nhắn giữa:", { userId1, userId2 });

  if (!userId1 || !userId2) {
    return res.status(400).json({ status: "error", message: "Thiếu dữ liệu cần thiết." });
  }

  try {
    const messages = await Message.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 },
      ],
    }).sort({ createdAt: 1 });

    console.log("Tin nhắn được tìm thấy:", messages);

    // Xử lý dữ liệu để thêm `fileUrl` nếu là ảnh hoặc file
    const processedMessages = messages.map((msg) => ({
      ...msg._doc,
      fileUrl: msg.type !== "text" ? `/uploads/${msg.message}` : null, // Tạo đúng `fileUrl`
    }));

    res.status(200).json({ status: "success", data: processedMessages });
  } catch (error) {
    console.error("Lỗi khi lấy tin nhắn:", error.message);
    res.status(500).json({ status: "error", message: "Không thể lấy tin nhắn." });
  }
};

// Hàm xử lý gửi tin nhắn qua Socket.IO
exports.handleSocketSendMessage = async (data) => {
  const { sender, receiver, message, type, fileUrl, size } = data;

  try {
    console.log("Dữ liệu nhận được từ frontend:", { sender, receiver, message, type, fileUrl });

    // Lưu tin nhắn vào cơ sở dữ liệu
    const newMessage = await Message.create({
      sender,
      receiver,
      message: type !== "text" && fileUrl ? fileUrl.split("/").pop() : message, // Lưu tên file đầy đủ
      type,
      fileUrl: type !== "text" ? fileUrl : null,
      size: type !== "text" ? size : null,
    });

    console.log("Tin nhắn đã được lưu:", newMessage);

    // Phát tin nhắn đến người nhận qua Socket.IO
    const receiverSocket = Array.from(io.sockets.sockets.values()).find(
      (socket) => socket.userId === receiver
    );

    if (receiverSocket) {
      io.to(receiverSocket.id).emit("receiveMessage", newMessage);
      console.log("Phát tin nhắn đến người nhận:", receiverSocket.id);
    } else {
      console.warn("Người nhận không trực tuyến.");
    }

    // Phát tin nhắn lại cho người gửi
    const senderSocket = Array.from(io.sockets.sockets.values()).find(
      (socket) => socket.userId === sender
    );

    if (senderSocket) {
      io.to(senderSocket.id).emit("receiveMessage", newMessage);
      console.log("Phát tin nhắn lại cho người gửi:", senderSocket.id);
    }
  } catch (error) {
    console.error("Lỗi khi xử lý tin nhắn:", error.message);
  }
};