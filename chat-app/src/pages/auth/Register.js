import { Link, Stack, Typography } from "@mui/material";
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import RegisterForm from "../../sections/auth/RegisterForm";
import AuthSocial from "../../sections/auth/AuthSocial";

const Register = () => {
  return (
    <>
      <Stack spacing={2} sx={{ mb: 5, position: "relative" }}>
        <Typography variant="h4">Chào mừng bạn đến với TX2T</Typography>

        <Stack direction={"row"} spacing={0.5}>
          <Typography variant="body2">Đã có tài khoản?</Typography>
          <Link component={RouterLink} to="/auth/login" variant="subtitle2">
            Đăng nhập
          </Link>
        </Stack>
        {/* Form Đăng ký */}

        <RegisterForm />

        <Typography
          component={"div"}
          sx={{
            color: "text.secondary",
            mt: 3,
            typography: "caption",
            textAlign: "center",
          }}
        >
          {"Bằng việc đăng ký, tôi đồng ý với "}
          <Link underline="always" color="text.primary">
            Điều khoản dịch vụ
          </Link>
          {" và "}
          <Link underline="always" color="text.primary">
            Chính sách bảo mật
          </Link>
          .
        </Typography>
        <AuthSocial />
      </Stack>
    </>
  );
};

export default Register;
