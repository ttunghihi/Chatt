import { io } from "socket.io-client";

// Lấy token từ localStorage
const token = localStorage.getItem("token");

if (!token) {
  console.error("Không tìm thấy token trong localStorage. Kết nối Socket.IO sẽ không được thực hiện.");
}

// Thiết lập kết nối Socket.IO
const socket = io("http://localhost:3000", {
  transports: ["websocket"],
  auth: {
    token, // Gửi token từ localStorage
  },
});

// Xử lý sự kiện kết nối thành công
socket.on("connect", () => {
  console.log("Socket.IO đã kết nối:", socket.id);
});

// Xử lý lỗi kết nối
socket.on("connect_error", (err) => {
  console.error("Lỗi kết nối Socket.IO:", err.message);
});

// Lắng nghe sự kiện nhận tin nhắn cá nhân
export const onReceiveMessage = (callback) => {
  const handleReceiveMessage = (message) => {
    try {
      console.log("Tin nhắn cá nhân nhận được từ server:", message);
      callback(message); // Gọi callback để xử lý tin nhắn trong giao diện
    } catch (error) {
      console.error("Lỗi khi xử lý tin nhắn cá nhân:", error.message);
    }
  };

  // Kiểm tra và hủy sự kiện cũ trước khi đăng ký mới
  if (socket.hasListeners("receiveMessage")) {
    console.log("Hủy sự kiện receiveMessage trước khi đăng ký mới");
    socket.off("receiveMessage");
  }

  socket.on("receiveMessage", handleReceiveMessage);

  // Trả về hàm để hủy đăng ký sự kiện
  return () => {
    console.log("Hủy đăng ký sự kiện receiveMessage");
    socket.off("receiveMessage", handleReceiveMessage);
  };
};

// Lắng nghe sự kiện nhận tin nhắn nhóm
export const onReceiveGroupMessage = (callback) => {
  const handleReceiveGroupMessage = (message) => {
    try {
      console.log("Tin nhắn nhóm nhận được từ server:", message);
      callback(message); // Gọi callback để xử lý tin nhắn nhóm trong giao diện
    } catch (error) {
      console.error("Lỗi khi xử lý tin nhắn nhóm:", error.message);
    }
  };

  // Kiểm tra và hủy sự kiện cũ trước khi đăng ký mới
  if (socket.hasListeners("receiveGroupMessage")) {
    console.log("Hủy sự kiện receiveGroupMessage trước khi đăng ký mới");
    socket.off("receiveGroupMessage");
  }

  socket.on("receiveGroupMessage", handleReceiveGroupMessage);

  // Trả về hàm để hủy đăng ký sự kiện
  return () => {
    console.log("Hủy đăng ký sự kiện receiveGroupMessage");
    socket.off("receiveGroupMessage", handleReceiveGroupMessage);
  };
};

// Gửi tin nhắn cá nhân qua Socket.IO
export const sendMessage = (data) => {
  if (socket.connected) {
    console.log("Gửi tin nhắn cá nhân qua Socket.IO:", data);
    socket.emit("sendMessage", data);
  } else {
    console.error("Socket chưa kết nối. Không thể gửi tin nhắn cá nhân.");
  }
};

// Gửi tin nhắn nhóm qua Socket.IO
export const sendGroupMessage = (data) => {
  if (socket.connected) {
    if (!data.sender) {
      console.error("Thiếu thông tin 'sender' khi gửi tin nhắn nhóm:", data);
      return;
    }
    console.log("Gửi tin nhắn nhóm qua Socket.IO:", data);
    socket.emit("sendGroupMessage", data);
  } else {
    console.error("Socket chưa kết nối. Không thể gửi tin nhắn nhóm.");
  }
};

// Tham gia nhóm qua Socket.IO
export const joinGroup = (groupId, userId) => {
  if (socket.connected) {
    console.log(`Tham gia nhóm ${groupId} với userId ${userId}`);
    socket.emit("joinGroup", { groupId, userId });
  } else {
    console.error("Socket chưa kết nối. Không thể tham gia nhóm.");
  }
};

// Lắng nghe sự kiện khi một người dùng tham gia nhóm
export const onUserJoined = (callback) => {
  const handleUserJoined = (data) => {
    try {
      console.log("Người dùng đã tham gia nhóm:", data);
      callback(data); // Gọi callback để xử lý trong giao diện
    } catch (error) {
      console.error("Lỗi khi xử lý sự kiện userJoined:", error.message);
    }
  };

  // Kiểm tra và hủy sự kiện cũ trước khi đăng ký mới
  if (socket.hasListeners("userJoined")) {
    console.log("Hủy sự kiện userJoined trước khi đăng ký mới");
    socket.off("userJoined");
  }

  socket.on("userJoined", handleUserJoined);

  // Trả về hàm để hủy đăng ký sự kiện
  return () => {
    console.log("Hủy đăng ký sự kiện userJoined");
    socket.off("userJoined", handleUserJoined);
  };
};

// Ngắt kết nối khi cần
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    console.log("Socket.IO đã ngắt kết nối");
  } else {
    console.log("Socket.IO chưa kết nối, không cần ngắt.");
  }
};

// Kết nối lại khi cần
export const reconnectSocket = () => {
  if (!socket.connected) {
    socket.connect();
    console.log("Socket.IO đang kết nối lại...");
  } else {
    console.log("Socket.IO đã kết nối, không cần kết nối lại.");
  }
};

export default socket;