import React from "react";
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { CaretDown, MagnifyingGlass, Phone, VideoCamera } from "phosphor-react";
import { useTheme } from "@mui/material/styles";
import StyledBadge from "../StyledBadge";
import { ToggleSidebar } from "../../redux/slices/app";
import { useDispatch } from "react-redux";

const Header = ({ currentChat, currentGroup }) => {
  const theme = useTheme();
  const dispatch = useDispatch();

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
      <Stack
        alignItems={"center"}
        direction="row"
        justifyContent={"space-between"}
        sx={{ width: "100%", height: "100%" }}
      >
        {/* Hiển thị thông tin nhóm hoặc người dùng */}
        <Stack
          onClick={() => {
            dispatch(ToggleSidebar());
          }}
          direction={"row"}
          spacing={2}
        >
          <Box>
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
            >
              <Avatar
                alt={
                  currentGroup
                    ? currentGroup.name
                    : `${currentChat?.firstName || ""} ${currentChat?.lastName || ""}`
                }
                src={
                  currentGroup
                    ? currentGroup.avatar || "https://via.placeholder.com/150"
                    : currentChat?.avatar || ""
                } // Nếu không có avatar, để trống
              />
            </StyledBadge>
          </Box>
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">
              {currentGroup
                ? currentGroup.name
                : currentChat
                ? `${currentChat.firstName || ""} ${currentChat.lastName || ""}`
                : "Chọn một người dùng hoặc nhóm"}
            </Typography>
            <Typography variant="caption">
              {currentGroup
                ? `${currentGroup.members?.length || 0} thành viên`
                : currentChat
                ? "Online"
                : ""}
            </Typography>
          </Stack>
        </Stack>

        {/* Các nút chức năng */}
        <Stack direction="row" alignItems={"center"} spacing={3}>
         
          
         
          <Divider orientation="vertical" flexItem />
          <IconButton>
            <CaretDown />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
};

export default Header;