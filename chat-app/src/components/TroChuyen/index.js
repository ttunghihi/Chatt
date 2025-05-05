import { Box, Stack } from "@mui/material";
import React, { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import TinNhan from "./TinNhan";
import socket from "../../socket";
import axios from "axios";

const TroChuyen = ({ currentChat, currentGroup, currentUserId }) => {
  const [messages, setMessages] = useState([]);

  // Hàm gửi tin nhắn cá nhân
  const sendMessage = async (newMessage) => {
    if (!currentChat) {
      console.error("Không thể gửi tin nhắn: currentChat không tồn tại");
      return;
    }

    const messageToSend = {
      ...newMessage,
      receiver: currentChat.id,
      sender: currentUserId,
      type: "text",
      createdAt: new Date().toISOString(),
      isSentByCurrentUser: true, // Đánh dấu tin nhắn do người dùng hiện tại gửi
    };

    console.log("Gửi tin nhắn cá nhân qua Socket.IO:", messageToSend);

    try {
      if (socket && socket.connected) {
        socket.emit("sendMessage", messageToSend);
      } else {
        console.error("Socket.IO không được kết nối.");
        alert("Không thể gửi tin nhắn vì kết nối thời gian thực bị gián đoạn.");
      }

      // Thêm tin nhắn vào danh sách cục bộ
      setMessages((prevMessages) => [...prevMessages, messageToSend]);
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error.message);
    }
  };

  // Hàm gửi tin nhắn nhóm
  const sendGroupMessage = async (newMessage) => {
    if (!currentGroup) {
      console.error("Không thể gửi tin nhắn nhóm: currentGroup không tồn tại");
      return;
    }

    if (!newMessage || !newMessage.message) {
      console.error("Không thể gửi tin nhắn nhóm: Nội dung tin nhắn không hợp lệ");
      return;
    }

    const messageToSend = {
      ...newMessage,
      groupId: currentGroup._id,
      sender: currentUserId,
      type: "text",
      createdAt: new Date().toISOString(),
      isSentByCurrentUser: true,
    };

    console.log("Gửi tin nhắn nhóm qua Socket.IO:", messageToSend);

    try {
      if (socket && socket.connected) {
        socket.emit("sendGroupMessage", messageToSend);
      } else {
        console.error("Socket.IO không được kết nối.");
        alert("Không thể gửi tin nhắn vì kết nối thời gian thực bị gián đoạn.");
      }

      // Thêm tin nhắn vào danh sách cục bộ
      setMessages((prevMessages) => [...prevMessages, messageToSend]);
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn nhóm:", error.message);
    }
  };

  // Lắng nghe sự kiện nhận tin nhắn từ Socket.IO
  useEffect(() => {
    const handleReceiveGroupMessage = (newMessage) => {
      if (currentGroup && newMessage.groupId === currentGroup._id) {
        // Phân biệt tin nhắn gửi và nhận
        newMessage.isSentByCurrentUser = newMessage.sender === currentUserId;
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    };

    const handleReceivePersonalMessage = (newMessage) => {
      if (
        currentChat &&
        [newMessage.sender, newMessage.receiver].includes(currentChat.id) &&
        [newMessage.sender, newMessage.receiver].includes(currentUserId)
      ) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    };

    socket.on("receiveGroupMessage", handleReceiveGroupMessage);
    socket.on("receiveMessage", handleReceivePersonalMessage);

    return () => {
      socket.off("receiveGroupMessage", handleReceiveGroupMessage);
      socket.off("receiveMessage", handleReceivePersonalMessage);
    };
  }, [socket, currentChat, currentGroup, currentUserId]);

  // Tải danh sách tin nhắn từ API khi thay đổi cuộc trò chuyện hoặc nhóm
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChat && !currentGroup) return;

      console.log("Tải danh sách tin nhắn từ API.");

      setMessages([]);

      try {
        const token = localStorage.getItem("token");
        let response;

        if (currentChat) {
          response = await axios.get(
            `http://localhost:3000/message/messages?userId1=${currentUserId}&userId2=${currentChat.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } else if (currentGroup) {
          response = await axios.get(
            `http://localhost:3000/groupMessage/messages/${currentGroup._id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }

        const fetchedMessages = response.data.data.map((msg) => ({
          ...msg,
          isSentByCurrentUser: (msg.sender._id || msg.sender).toString() === currentUserId.toString(),
          senderName: msg.senderName || "Không rõ tên", // Hiển thị tên người gửi
          senderAvatar: msg.senderAvatar || null, // Hiển thị avatar người gửi
        }));

        console.log("Danh sách tin nhắn đã tải:", fetchedMessages);
        setMessages(fetchedMessages);
      } catch (error) {
        console.error("Lỗi khi tải danh sách tin nhắn:", error.message);
        alert("Không thể tải danh sách tin nhắn. Vui lòng thử lại sau.");
      }
    };

    fetchMessages();
  }, [currentChat, currentGroup, currentUserId]);

  // Hiển thị thông báo nếu chưa chọn cuộc trò chuyện hoặc nhóm
  if (!currentChat && !currentGroup) {
    return <div>Vui lòng chọn một cuộc trò chuyện hoặc nhóm để bắt đầu.</div>;
  }

  return (
    <Stack height={"100%"} maxHeight={"100vh"} width={"auto"}>
      <Header currentChat={currentChat} currentGroup={currentGroup} />
      <Box
        width={"100%"}
        sx={{ flexGrow: 1, height: "100%", overflowY: "scroll" }}
      >
        <TinNhan messages={messages} currentUserId={currentUserId} />
      </Box>
      <Footer
        sendMessage={sendMessage}
        sendGroupMessage={sendGroupMessage}
        currentUserId={currentUserId}
        currentChat={currentChat}
        currentGroup={currentGroup}
        socket={socket}
        setMessages={setMessages}
      />
    </Stack>
  );
};

export default TroChuyen;