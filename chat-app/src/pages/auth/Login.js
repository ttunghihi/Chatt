import { Link, Stack, Typography } from "@mui/material";
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import AuthSocial from "../../sections/auth/AuthSocial";
import LoginForm from "../../sections/auth/LoginForm";

const Login = () => {
  return (
    <>
      <Stack spacing={2} sx={{ mb: 5, position: "relative" }}>
        <Typography variant="h4">Đăng nhập vào TX2T</Typography>
        <Stack direction={"row"} spacing={0.5}>
          <Typography variant="body2">Chưa có tài khoản?</Typography>
          <Link to="/auth/register" component={RouterLink} variant="subtitle2">
            Tạo tài khoản
          </Link>
        </Stack>
        {/* Form Đăng nhập */}
        <LoginForm />
        {/* Auth Social */}
        <AuthSocial />
      </Stack>
    </>
  );
};

export default Login;
