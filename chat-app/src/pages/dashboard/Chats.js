import {
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { ArchiveBox, CircleDashed, MagnifyingGlass } from "phosphor-react";
import { useTheme } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { SimpleBarStyle } from "../../components/Scrollbar";
import {
  Search,
  SearchIconWrapper,
  StyledInputBase,
} from "../../components/Search";
import ChatElement from "../../components/ChatElement";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentChat } from "../../redux/slices/chat";
import { io } from "socket.io-client"; // Thêm import Socket.IO

const Chats = ({ onSelectUser }) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [recentChats, setRecentChats] = useState([]); // Danh sách trò chuyện gần đây
  const [displayedChats, setDisplayedChats] = useState([]); // Danh sách hiển thị
  const dispatch = useDispatch();
  const currentUserId = useSelector((state) => state.auth.user.id); // Lấy userId từ Redux

  // Kết nối với Socket.IO và lắng nghe sự kiện updateRecentChats
  useEffect(() => {
    const token = localStorage.getItem("token");

const socket = io(process.env.REACT_APP_API_URL, {
  transports: ["websocket"],
  withCredentials: true,
  auth: {
    token, // Gửi token để server xác thực
  },
});

socket.on("connect", () => {
  console.log("Kết nối socket.io thành công:", socket.id);
});

// Lắng nghe sự kiện lỗi kết nối
socket.on("connect_error", (err) => {
  console.error("Lỗi kết nối socket.io:", err.message);
});



// Lắng nghe sự kiện updateRecentChats
socket.on("updateRecentChats", (data) => {
  console.log("Cập nhật danh sách trò chuyện theo thời gian thực:", data);

  // Xác định ID của người trò chuyện (khác với người dùng hiện tại)
  const chatUserId = data.sender === currentUserId ? data.receiver : data.sender;

  // Xác định thông tin hiển thị dựa trên vai trò
  const isSender = data.sender === currentUserId;

  const newChat = {
    id: chatUserId,
    firstName: isSender ? data.receiverFirstName : data.senderFirstName,
    lastName: isSender ? data.receiverLastName : data.senderLastName,
    avatar: isSender ? data.receiverAvatar : data.senderAvatar,
    lastMessage: data.message,
    createdAt: data.createdAt,
  };

  setRecentChats((prevChats) => {
    const existingIndex = prevChats.findIndex((chat) => chat.id === chatUserId);
    let updatedChats;

    if (existingIndex !== -1) {
      // Cập nhật nội dung cũ
      updatedChats = [...prevChats];
      updatedChats[existingIndex] = newChat;
    } else {
      // Thêm vào nếu chưa có
      updatedChats = [newChat, ...prevChats];
    }

    // Sắp xếp lại theo thời gian
    updatedChats.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setDisplayedChats(updatedChats); // Cập nhật danh sách hiển thị
    return updatedChats;
  });
});

    

    // Dọn dẹp kết nối khi component bị unmount
    return () => {
      socket.disconnect();
    };
  }, [currentUserId]);

  // Gọi API để lấy danh sách recentChats
  useEffect(() => {
    const fetchRecentChats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token không tồn tại trong localStorage");
          return;
        }
    
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/chat/recent-chats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Danh sách recentChats từ backend:", response.data.data);
    
        // Sắp xếp danh sách theo createdAt từ mới nhất đến cũ nhất
        const sortedChats = response.data.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setRecentChats(sortedChats);
        setDisplayedChats(sortedChats);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách recentChats:", error);
      }
    };

    fetchRecentChats();
  }, [currentUserId]);

  // Tìm kiếm người dùng khi nhập từ khóa
  useEffect(() => {
    const fetchUsers = async () => {
      if (searchQuery.trim() === "") {
        setDisplayedChats(recentChats); // Hiển thị lại recentChats nếu không có từ khóa
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/auth/search`,
          { params: { query: searchQuery } }
        );
        console.log("Kết quả tìm kiếm:", response.data.data);
        setFilteredUsers(response.data.data);
        setDisplayedChats(response.data.data); // Hiển thị kết quả tìm kiếm
      } catch (error) {
        console.error("Lỗi khi tìm kiếm người dùng:", error);
      }
    };

    const debounceTimeout = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, recentChats]);

  // Xử lý khi chọn một người dùng
  const handleSelectUser = async (user) => {
    console.log("Người dùng được chọn:", user);
  
    // Đảm bảo user có trường `id`
    const userWithId = { ...user, id: user.id || user._id };
  
    // Gửi yêu cầu đến backend để cập nhật danh sách recentChats
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.REACT_APP_API_URL}/chat/update-recent-chats`,
        {
          userId: currentUserId,
          chatUserId: userWithId.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Danh sách recentChats đã được cập nhật trên backend");
    } catch (error) {
      console.error("Lỗi khi cập nhật recentChats trên backend:", error);
    }
  
    // Cập nhật currentChat trong Redux store
    dispatch(setCurrentChat(userWithId));
  
    // Gọi callback để cập nhật ở component cha
    onSelectUser(userWithId);
  
    // Xóa kết quả tìm kiếm
    setSearchQuery("");
    setFilteredUsers([]);
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: 320,
        backgroundColor:
          theme.palette.mode === "light"
            ? "#f8faff"
            : theme.palette.background.paper,
        boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
      }}
    >
      <Stack p={3} spacing={2} sx={{ height: "100vh" }}>
        {/* Tiêu đề */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h5">Chats</Typography>
          <IconButton>
            <CircleDashed />
          </IconButton>
        </Stack>

        {/* Thanh tìm kiếm */}
        <Stack sx={{ width: "100%" }}>
          <Search>
            <SearchIconWrapper>
              <MagnifyingGlass color="#789CE6" />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Tìm kiếm..."
              inputProps={{ "aria-label": "search" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Search>
        </Stack>

        {/* Lưu trữ */}
        <Stack spacing={1}>
          <Stack direction="row" alignItems={"center"} spacing={1.5}>
            <ArchiveBox size={24} />
            <Button>Lưu trữ</Button>
          </Stack>
          <Divider />
        </Stack>

        {/* Danh sách trò chuyện */}
        <Stack
          spacing={2}
          direction="column"
          sx={{ flexGrow: 1, overflow: "scroll", height: "100%" }}
        >
          <SimpleBarStyle timeout={500} clickOnTrack={false}>
            <Stack spacing={2.4}>
              <Typography variant="subtitle2" sx={{ color: "676767" }}>
                Trò Chuyện
              </Typography>
              {displayedChats.map((chat) => (
                <ChatElement
                  key={chat.id || chat._id}
                  id={chat.id || chat._id}
                  name={`${chat.firstName} ${chat.lastName}`}
                  img={chat.avatar}
                  msg={chat.lastMessage}
                  time={
                    chat.createdAt
                      ? new Date(chat.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A"
                  }
                  unread={0}
                  online={false}
                  onClick={() => handleSelectUser(chat)}
                />
              ))}
            </Stack>
          </SimpleBarStyle>
        </Stack>
      </Stack>
    </Box>
  );
};

export default Chats;