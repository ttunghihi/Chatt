const GroupMessage = require("../models/groupMessage");
const Group = require("../models/group");
const User = require("../models/user");


let io; // Biến để lưu trữ đối tượng Socket.IO

// Hàm để nhận `io` từ server.js
exports.setSocketIO = (socketIO) => {
  io = socketIO;
  console.log("Socket.IO đã được truyền vào controllers/groupMessage.js");
};

// Hàm lưu tin nhắn nhóm vào cơ sở dữ liệu
const saveGroupMessage = async (groupId, sender, message, type, fileUrl, size) => {
  const newMessage = await GroupMessage.create({
    groupId,
    sender,
    message: type !== "text" && fileUrl ? fileUrl.split("/").pop() : message, // Lưu tên file đầy đủ
    type,
    fileUrl: type !== "text" ? fileUrl : null,
    size: type !== "text" ? size : null,
  });
  console.log("Tin nhắn nhóm đã được lưu:", newMessage);
  return newMessage;
};

// Hàm phát tin nhắn nhóm qua Socket.IO
const emitGroupMessage = async (groupId, newMessage) => {
  if (!io) {
    console.error("Socket.IO chưa được khởi tạo. Không thể phát tin nhắn nhóm.");
    return;
  }

  console.log("Phát tin nhắn nhóm qua Socket.IO:", newMessage);

  // Lấy danh sách thành viên trong nhóm
  const group = await Group.findById(groupId).populate("members", "id");

  if (!group) {
    console.error("Nhóm không tồn tại.");
    return;
  }

  // Lấy thông tin chi tiết của người gửi
  const senderDetails = await User.findById(newMessage.sender).select("firstName lastName avatar");

  // Phát tin nhắn đến tất cả các thành viên trong nhóm
  group.members.forEach((member) => {
    const memberSocket = Array.from(io.sockets.sockets.values()).find(
      (socket) => socket.userId === member.id
    );

    if (memberSocket) {
      const sanitizedMessage = {
        _id: newMessage._id,
        groupId: newMessage.groupId,
        sender: newMessage.sender,
        senderName: `${senderDetails.firstName} ${senderDetails.lastName}`,
        senderAvatar: senderDetails.avatar,
        message: newMessage.message,
        type: newMessage.type,
        fileUrl: newMessage.fileUrl,
        size: newMessage.size,
        createdAt: newMessage.createdAt,
      };

      io.to(memberSocket.id).emit("receiveGroupMessage", sanitizedMessage);
      console.log("Phát tin nhắn đến thành viên:", memberSocket.id);
    } else {
      console.warn(`Thành viên ${member.id} không trực tuyến.`);
    }
  });
};

// Hàm gửi tin nhắn nhóm qua HTTP
exports.sendGroupMessage = async (req, res) => {
  try {
    const { groupId, message, type, fileUrl, size } = req.body;
    const { user } = req;

    console.log("Dữ liệu nhận được từ frontend:", { groupId, message, type, fileUrl });

    if (!groupId || !message || !type) {
      return res.status(400).json({
        status: "error",
        message: "Thiếu thông tin cần thiết để gửi tin nhắn nhóm.",
      });
    }

    // Kiểm tra xem nhóm có tồn tại không
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        status: "error",
        message: "Nhóm không tồn tại.",
      });
    }

    // Lưu tin nhắn vào cơ sở dữ liệu
    const newMessage = await saveGroupMessage(groupId, user._id, message, type, fileUrl, size);

    // Phát tin nhắn qua Socket.IO
    emitGroupMessage(groupId, newMessage);

    res.status(201).json({ status: "success", data: newMessage });
  } catch (error) {
    console.error("Lỗi khi gửi tin nhắn nhóm:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// Hàm lấy danh sách tin nhắn nhóm
exports.getGroupMessages = async (req, res) => {
  const { groupId } = req.params;

  if (!groupId) {
    return res.status(400).json({ status: "error", message: "Thiếu ID nhóm." });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        status: "error",
        message: "Nhóm không tồn tại.",
      });
    }

    const messages = await GroupMessage.find({ groupId })
      .sort({ createdAt: 1 })
      .populate("sender", "firstName lastName avatar"); // Populate đầy đủ thông tin người gửi

    const sanitizedMessages = messages.map((msg) => ({
      _id: msg._id,
      groupId: msg.groupId,
      sender: msg.sender._id.toString(),
      senderName: msg.sender.firstName && msg.sender.lastName
        ? `${msg.sender.firstName} ${msg.sender.lastName}`
        : "Không rõ tên", // Xử lý trường hợp thiếu tên
      senderAvatar: msg.sender.avatar || null,
      message: msg.message,
      type: msg.type,
      fileUrl: msg.fileUrl,
      size: msg.size,
      createdAt: msg.createdAt,
    }));

    res.status(200).json({ status: "success", data: sanitizedMessages });
  } catch (error) {
    console.error("Lỗi khi lấy tin nhắn nhóm:", error.message);
    res.status(500).json({ status: "error", message: "Không thể lấy tin nhắn nhóm." });
  }
};