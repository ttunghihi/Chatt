import { Container, Stack } from "@mui/material";
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux"; // Import useSelector
import Logo from "../../assets/Images/logo.jpeg";

const MainLayout = () => {
  // Lấy trạng thái đăng nhập từ Redux Store
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/app" />;
  }

  return (
    <>
      <Container sx={{ mt: 5 }} maxWidth="sm">
        <Stack spacing={5}>
          <Stack
            sx={{ width: "100%" }}
            direction="column"
            alignItems={"center"}
          >
            {/* <img style={{ height: 120, width: 120 }} src={Logo} alt="Logo" /> */}
          </Stack>
        </Stack>
        <Outlet />
      </Container>
    </>
  );
};

export default MainLayout;