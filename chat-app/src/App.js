// routes
import Router from "./routes";
// theme
import ThemeProvider from "./theme";
// components
import ThemeSettings from "./components/settings";
// hooks và socket
import { useEffect } from "react";
import { useSelector } from "react-redux";
import socket, { reconnectSocket, disconnectSocket } from "./socket";

function App() {
  const currentUserId = useSelector((state) => state.auth.user?.id); // Lấy userId từ Redux store

  useEffect(() => {
    if (currentUserId) {
      console.log("Socket.IO đang kết nối với userId:", currentUserId);
  
      // Kết nối lại Socket.IO nếu cần
      reconnectSocket();
  
      // Lắng nghe sự kiện kết nối thành công
      socket.on("connect", () => {
        console.log("Socket.IO đã kết nối:", socket.id);
      });
  
      // Lắng nghe sự kiện lỗi kết nối
      socket.on("connect_error", (err) => {
        console.error("Lỗi kết nối Socket.IO:", err.message);
      });
  
      // Lắng nghe sự kiện ngắt kết nối
      socket.on("disconnect", (reason) => {
        console.log("Socket.IO đã ngắt kết nối. Lý do:", reason);
      });
    }
  
    // Không ngắt kết nối Socket.IO ở đây
  }, [currentUserId]); // Chỉ chạy khi currentUserId thay đổi

  return (
    <ThemeProvider>
      <ThemeSettings>
        <Router />
      </ThemeSettings>
    </ThemeProvider>
  );
}

export default App;