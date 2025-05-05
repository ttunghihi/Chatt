import React, { useState } from "react";
import {
  Box,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
} from "@mui/material";
import { Paperclip, PaperPlaneTilt, Smiley } from "phosphor-react";
import { useTheme, styled } from "@mui/material/styles";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import axios from "axios";

const StyledInput = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-input": {
    paddingTop: "12px",
    paddingBottom: "12px",
  },
}));

const ChatInput = ({
  setOpenPicker,
  message,
  setMessage,
  handleSendMessage,
}) => {
  return (
    <StyledInput
      fullWidth
      placeholder="Viết một tin nhắn..."
      variant="filled"
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault(); // Ngăn xuống dòng khi nhấn Enter
          handleSendMessage(); // Gọi hàm gửi tin nhắn
        }
      }}
      InputProps={{
        disableUnderline: true,
        endAdornment: (
          <InputAdornment>
            <IconButton
              onClick={() => {
                setOpenPicker((prev) => !prev);
              }}
            >
              <Smiley />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

const Footer = ({ sendMessage, currentUserId, currentChat, currentGroup, socket, setMessages }) => {
  const theme = useTheme();
  const [openPicker, setOpenPicker] = useState(false);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [isSending, setIsSending] = useState(false);

  


  const handleSendMessage = async () => {
    if (isSending) return;

    if (!message.trim() && !file) {
      console.error("Không có tin nhắn hoặc file để gửi.");
      return;
    }

    const messageToSend = {
      type: file ? (file.type.startsWith("image/") ? "image" : "file") : "text",
      message: file ? file.name : message.trim(),
      sender: currentUserId, // Người gửi là người dùng hiện tại
      receiver: currentChat?.id || null, // Người nhận là người dùng trong cuộc trò chuyện cá nhân
      createdAt: new Date().toISOString(),
      fileUrl: file ? file.fileUrl : null, // URL file nếu có
      size: file ? file.size : null, // Kích thước file nếu có
    };

    setIsSending(true);

    try {
      // Gửi tin nhắn cá nhân qua Socket.IO
      socket.emit("sendMessage", messageToSend);

      setMessage("");
      setFile(null);
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendGroupMessage = async () => {
    if (!currentUserId || !currentGroup || !currentGroup._id || isSending) return;
  
    if (!message.trim() && !file) {
      console.error("Không có tin nhắn hoặc file để gửi.");
      return;
    }
  
    const messageToSend = {
      type: file ? (file.type.startsWith("image/") ? "image" : "file") : "text",
      message: file ? file.name : message.trim(),
      sender: currentUserId,
      receiver: null,
      groupId: currentGroup._id,
      createdAt: new Date().toISOString(),
      fileUrl: file ? file.fileUrl : null,
      size: file ? file.size : null,
    };
  
    setIsSending(true);
  
    try {
      socket.emit("sendGroupMessage", messageToSend); // Chỉ gửi tin nhắn qua Socket.IO
      setMessage(""); // Reset nội dung tin nhắn
      setFile(null); // Reset file
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn nhóm:", error.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);

        // Tải file lên backend
        const response = await axios.post("http://localhost:3000/upload/uploads", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log("File đã tải lên:", response.data.filePath);

        // Lưu thông tin file vào state
        setFile({
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
          fileUrl: response.data.filePath,
        });
      } catch (error) {
        console.error("Lỗi khi tải file:", error.message);
        alert("Không thể tải file. Vui lòng thử lại.");
      }
    }
  };

  return (
    <Box
      p={2}
      sx={{
        width: "100%",
        backgroundColor:
          theme.palette.mode === "light"
            ? "#f8faff"
            : theme.palette.background.paper,
        boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
      }}
    >
      <Stack direction={"row"} alignItems={"center"} spacing={3}>
        <Stack sx={{ width: "100%" }}>
          <Box
            sx={{
              display: openPicker ? "inline" : "none",
              zIndex: 10,
              position: "fixed",
              bottom: 81,
              right: 100,
            }}
          >
            <Picker
              theme={theme.palette.mode}
              data={data}
              onEmojiSelect={(emoji) =>
                setMessage((prev) => prev + emoji.native)
              }
            />
          </Box>

          <TextField
            fullWidth
            placeholder="Viết một tin nhắn..."
            variant="filled"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (e.shiftKey) {
                  // Cho phép xuống dòng khi nhấn Shift + Enter
                  return;
                }
                e.preventDefault(); // Ngăn xuống dòng mặc định khi nhấn Enter
                if (currentGroup) {
                  handleSendGroupMessage(); // Gửi tin nhắn nhóm
                } else {
                  handleSendMessage(); // Gửi tin nhắn cá nhân
                }
              }
            }}
            InputProps={{
              disableUnderline: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton component="label">
                    <input type="file" hidden onChange={handleFileChange} />
                    <Paperclip />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      setOpenPicker((prev) => !prev);
                    }}
                  >
                    <Smiley />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        <Box
          sx={{
            height: 48,
            width: 48,
            backgroundColor: theme.palette.primary.main,
            borderRadius: 1.5,
          }}
        >
          <Stack
            sx={{ height: "100%", width: "100%" }}
            alignItems={"center"}
            justifyContent="center"
          >
            <IconButton
              onClick={() => {
                if (currentGroup) {
                  handleSendGroupMessage(); // Gửi tin nhắn nhóm
                } else {
                  handleSendMessage(); // Gửi tin nhắn cá nhân
                }
              }}
              disabled={isSending}
            >
              <PaperPlaneTilt color={isSending ? "#ccc" : "#fff"} />
            </IconButton>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default Footer;
