import React, { useEffect, useState } from "react";
import Chats from "./Chats";
import TroChuyen from "../../components/TroChuyen";
import { Box, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useSelector } from "react-redux";
import { onReceiveMessage, disconnectSocket } from "../../socket";

const GeneralApp = () => {
  const theme = useTheme();
  const { sidebar } = useSelector((store) => store.app);
  const [currentChat, setCurrentChat] = useState(null); // Người dùng hiện tại đang trò chuyện
  const [messages, setMessages] = useState([]); // State để lưu danh sách tin nhắn
  const currentUserId = useSelector((state) => state.auth.user?.id || state.auth.user?._id);

  console.log("currentUserId từ Redux store:", currentUserId);

  // Lắng nghe sự kiện nhận tin nhắn
  useEffect(() => {
    if (!currentUserId) {
      console.warn("Không tìm thấy currentUserId. Không thể lắng nghe tin nhắn.");
      return;
    }
  
  }, [currentChat, currentUserId]);

  return (
    <Stack direction={"row"} sx={{ width: "100%" }}>
      {/* Danh sách người dùng */}
      <Chats
        onSelectUser={(user) => {
          console.log("Người dùng được chọn:", user); // Log để kiểm tra
          setCurrentChat(user); // Cập nhật người dùng hiện tại
          setMessages([]); // Xóa danh sách tin nhắn cũ khi chuyển sang người dùng khác
        }}
      />

      {/* Giao diện trò chuyện */}
      <Box
        sx={{
          height: "100%",
          width: sidebar.open ? "calc(100vw - 740px)" : "calc(100vw - 420px)",
          backgroundColor:
            theme.palette.mode === "light"
              ? "#f0f4fa"
              : theme.palette.background.default,
        }}
      >
        <TroChuyen
          currentChat={currentChat}
          currentUserId={currentUserId}
          messages={messages} // Truyền danh sách tin nhắn vào component TroChuyen
        />
      </Box>
    </Stack>
  );
};

export default GeneralApp;