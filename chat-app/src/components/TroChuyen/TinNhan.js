import { Box, Typography } from "@mui/material";
import { Download, Paperclip } from "phosphor-react";
import React, { useEffect, useRef } from "react";

const TinNhan = ({ messages, currentUserId }) => {
  const messagesEndRef = useRef(null); // Tham chiếu đến phần cuối của danh sách tin nhắn

  // Hàm cuộn xuống cuối danh sách
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Cuộn xuống cuối danh sách khi `messages` thay đổi
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  return (
    <Box p={2} sx={{ height: "100%", overflowY: "auto" }}>
      {messages.length === 0 ? (
        <Typography variant="body2" color="textSecondary">
          Không có tin nhắn nào.
        </Typography>
      ) : (
        messages.map((msg, index) => {
          const isSentByCurrentUser = msg.sender && currentUserId && msg.sender === currentUserId;
          const fileUrl = msg.fileUrl?.startsWith("http")
            ? msg.fileUrl
            : `http://localhost:3000${msg.fileUrl || ""}`;

          return (
            <Box
              key={msg._id || `${msg.createdAt}-${index}`} // Tạo key duy nhất
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: isSentByCurrentUser ? "flex-end" : "flex-start",
                mb: 2,
              }}
            >
              {/* Hiển thị tên người gửi nếu không phải tin nhắn của người dùng hiện tại */}
              {!isSentByCurrentUser && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "#888",
                    mb: 0.5,
                  }}
                >
                  {msg.senderName || "Không rõ tên"}
                </Typography>
              )}

              <Box
                sx={{
                  maxWidth: "70%",
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: isSentByCurrentUser ? "#4da5fe" : "#f1f1f1",
                  color: isSentByCurrentUser ? "#fff" : "#000",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                }}
              >
                {/* Hiển thị nội dung tin nhắn */}
                {msg.type === "image" ? (
                  <img
                    src={fileUrl} // Hiển thị ảnh từ đường dẫn file
                    alt="Hình ảnh"
                    style={{ maxWidth: "100%", borderRadius: "8px" }}
                  />
                ) : msg.type === "file" ? (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: "#eeeeee",
                      padding: "8px",
                      borderRadius: "8px",
                    }}
                  >
                    <Box sx={{ marginRight: "8px", color: "#007bff" }}>
                      <Paperclip size={24} />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: "#007bff" }}>
                        {msg.message}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#007bff" }}>
                        {msg.size ? `${(msg.size / 1024).toFixed(2)} KB` : ""}
                      </Typography>
                    </Box>
                    <Box sx={{ marginLeft: "auto" }}>
                      <a
                        href={fileUrl} // Thêm URL đầy đủ
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: "none", color: "#007bff" }}
                      >
                        <Download size={24} color="#007bff" />
                      </a>
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ wordWrap: "break-word" }}>
                    {msg.message}
                  </Typography>
                )}

                {/* Hiển thị thời gian gửi tin nhắn */}
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    textAlign: "right",
                    mt: 0.5,
                    color: isSentByCurrentUser ? "#d1e7ff" : "#888",
                  }}
                >
                  {msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Không rõ thời gian"}
                </Typography>
              </Box>
            </Box>
          );
        })
      )}
      {/* Thêm một phần tử để cuộn đến cuối */}
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default TinNhan;