import React from "react";
import { Avatar, Box, Divider, IconButton, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Bell, CaretLeft, Image, Info, Key, Lock, Note, } from "phosphor-react";
import { faker } from "@faker-js/faker";

const CaiDat = () => {
  const theme = useTheme();

  const list = [
    {
      key: 0,
      icon: <Bell size={20} />,
      title: "Thông báo",
      onclick: () => {},
    },
    {
      key: 1,
      icon: <Lock size={20} />,
      title: "Quyền riêng tư",
      onclick: () => {},
    },
    {
      key: 2,
      icon: <Key size={20} />,
      title: "Bảo mật",
      onclick: () => {},
    },
    {
      key: 3,
      icon: <Image size={20} />,
      title: "Nền hội thoại",
      onclick: () => {},
    },
    {
      key: 4,
      icon: <Note size={20} />,
      title: "Thông tin cá nhân",
      onclick: () => {},
    },
    {
      key: 5,
      icon: <Info size={20} />,
      title: "Hỗ trợ",
      onclick: () => {},
    },
  ];

  return (
    <>
      <Stack direction="row" sx={{ width: "100%" }}>
        {/* leftPanel */}
        <Box
          sx={{
            overflowY: "scroll",
            height: "100vh",
            width: 320,
            backgroundColor:
              theme.palette.mode === "light"
                ? "#F8FAFF"
                : theme.palette.background,
                boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
          }}
        >
            <Stack p={4} spacing={5}>
                {/* Header */}
                <Stack direction={"row"} alignItems={"center"} spacing={3}>
                    <IconButton>
                        <CaretLeft size={24} color="#4B4B4B" />
                    </IconButton>
                    <Typography variant="h6">
                        Cài đặt
                    </Typography>
                </Stack>
                {/* Profile */}
                <Stack direction={"row"} spacing={3}>
                    <Avatar sx={{width: 56, height: 56}} src={faker.image.avatar()} alt={faker.name.fullName()} />
                    <Stack spacing={0.5}>
                        <Typography variant="article">
                            {faker.name.fullName()}
                        </Typography>
                        <Typography variant="body2">
                            {faker.random.words()}
                        </Typography>
                    </Stack>
                </Stack>
                {/* Danh sach chuc nang */}
                <Stack spacing={4}>
                    {list.map(({key, icon, title, onclick}) => <>
                    <Stack spacing={2} sx={{cursor: "pointer"}} onClick={onclick}>
                        <Stack direction={"row"} spacing={2} alignItems={"center"}>
                            {icon}

                            <Typography variant="body2">{title}</Typography>
                        </Stack>
                        {key !== 5 && <Divider />}
                    </Stack>
                    </>)}
                </Stack>
            </Stack>
        </Box>
        {/* rightPanel */}
      </Stack>
    </>
  );
};

export default CaiDat;
