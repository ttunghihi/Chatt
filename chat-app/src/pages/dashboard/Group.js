import React, { useState, useEffect } from "react";
import { Box, Stack, Typography, Divider, IconButton, Avatar } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { MagnifyingGlass, Plus } from "phosphor-react";
import { SimpleBarStyle } from "../../components/Scrollbar";
import {
  Search,
  SearchIconWrapper,
  StyledInputBase,
} from "../../components/Search";
import CreateGroup from "../../sections/main/CreateGroup";
import TroChuyen from "../../components/TroChuyen";
import axios from "axios";
import { useSelector } from "react-redux";
import socket, { joinGroup, onReceiveGroupMessage } from "../../socket";

const Group = () => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false); // Dialog tạo nhóm
  const [groups, setGroups] = useState([]); // Danh sách nhóm
  const [searchQuery, setSearchQuery] = useState(""); // Từ khóa tìm kiếm
  const [filteredGroups, setFilteredGroups] = useState([]); // Kết quả tìm kiếm
  const [currentGroup, setCurrentGroup] = useState(null); // Nhóm hiện tại
  const [messages, setMessages] = useState([]); // Tin nhắn của nhóm hiện tại

  const currentUserId = useSelector((state) => state.auth.user?.id || state.auth.user?._id);

  // Hàm đóng dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Gọi API để lấy danh sách nhóm
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/group/get`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setGroups(response.data.groups);
        setFilteredGroups(response.data.groups); // Hiển thị tất cả nhóm ban đầu
      } catch (error) {
        console.error("Lỗi khi lấy danh sách nhóm:", error.message);
      }
    };

    fetchGroups();
  }, []);

  // Tìm kiếm nhóm
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredGroups(groups); // Hiển thị lại tất cả nhóm nếu không có từ khóa
      return;
    }

    const results = groups.filter((group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredGroups(results);
  }, [searchQuery, groups]);

  // Xử lý khi chọn một nhóm
  const handleSelectGroup = async (group) => {
    setCurrentGroup(group); // Cập nhật nhóm hiện tại
    setMessages([]); // Xóa tin nhắn cũ
  
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/groupMessage/messages/${group._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const fetchedMessages = Array.isArray(response.data.messages)
        ? response.data.messages.map((msg) => ({
            ...msg,
            senderName: `${msg.sender.firstName} ${msg.sender.lastName}`,
            senderAvatar: msg.sender.avatar,
          }))
        : [];
  
      setMessages(fetchedMessages); // Lưu tin nhắn vào state
      joinGroup(group._id, currentUserId); // Tham gia nhóm qua socket
    } catch (error) {
      console.error("Lỗi khi lấy tin nhắn nhóm:", error.message);
    }
  };

  // Lắng nghe tin nhắn nhóm mới
  useEffect(() => {
    const unsubscribe = onReceiveGroupMessage((newMessage) => {
      if (newMessage.groupId === currentGroup?._id) {
        const isSentByMe = newMessage.sender === currentUserId;
        setMessages((prevMessages) => [
          ...prevMessages,
          { ...newMessage, isSentByMe },
        ]);
      }
    });
  
    return () => {
      unsubscribe(); // Hủy đăng ký sự kiện khi component bị unmount
    };
  }, [currentGroup, currentUserId]);

  // Hàm gửi tin nhắn nhóm

  return (
    <Stack direction={"row"} sx={{ width: "100%" }}>
      {/* Danh sách nhóm */}
      <Box
        sx={{
          height: "100vh",
          backgroundColor:
            theme.palette.mode === "light"
              ? "#F8FAFF"
              : theme.palette.background,
          width: 320,
          boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
        }}
      >
        <Stack p={3} spacing={2} sx={{ maxHeight: "100vh" }}>
          {/* Tiêu đề */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h5">Nhóm</Typography>
            <IconButton onClick={() => setOpenDialog(true)}>
              <Plus style={{ color: theme.palette.primary.main }} />
            </IconButton>
          </Stack>

          {/* Thanh tìm kiếm */}
          <Stack sx={{ width: "100%" }}>
            <Search>
              <SearchIconWrapper>
                <MagnifyingGlass color="#789CE6" />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Tìm kiếm nhóm..."
                inputProps={{ "aria-label": "search" }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Search>
          </Stack>

          <Divider />

          {/* Danh sách nhóm */}
          <Stack
            spacing={3}
            sx={{ flexGrow: 1, overflow: "scroll", height: "100%" }}
          >
            <SimpleBarStyle timeout={500} clickOnTrack={false}>
              <Stack spacing={2.5}>
                {filteredGroups.map((group) => (
                  <Box
                    key={group._id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px",
                      borderRadius: "8px",
                      backgroundColor:
                        theme.palette.mode === "light"
                          ? "#fff"
                          : theme.palette.background.default,
                      boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
                      cursor: "pointer",
                    }}
                    onClick={() => handleSelectGroup(group)} // Chọn nhóm
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        src={
                          group.avatar || "https://via.placeholder.com/150"
                        }
                      />
                      <Typography variant="subtitle2">{group.name}</Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ color: "#888" }}>
                      {new Date(group.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </SimpleBarStyle>
          </Stack>
        </Stack>
      </Box>

      {/* Giao diện trò chuyện nhóm */}
      <Box
        sx={{
          height: "100%",
          width: "calc(100vw - 320px)",
          backgroundColor:
            theme.palette.mode === "light"
              ? "#f0f4fa"
              : theme.palette.background.default,
        }}
      >
        {currentGroup ? (
          <TroChuyen
            currentGroup={currentGroup}
            currentUserId={currentUserId}

          />
        ) : (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="h6" color="textSecondary">
              Chọn một nhóm để bắt đầu trò chuyện
            </Typography>
          </Box>
        )}
      </Box>

      {/* Dialog tạo nhóm */}
      {openDialog && (
        <CreateGroup
          open={openDialog}
          handleClose={handleCloseDialog}
          updateGroupList={(newGroup) =>
            setGroups((prevGroups) => [...prevGroups, newGroup])
          }
        />
      )}
    </Stack>
  );
};

export default Group;