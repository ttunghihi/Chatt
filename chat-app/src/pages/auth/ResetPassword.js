import { Link, Stack, Typography } from "@mui/material";
import { CaretLeft } from "phosphor-react";
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import ResetPasswordForm from "../../sections/auth/ResetPasswordForm";

const ResetPassword = () => {
  return (
    <>
      <Stack spacing={2} sx={{ mb: 5, position: "relative" }}>
        <Typography variant="h3" paragraph>
          Quên mật khẩu?
        </Typography>
        <Typography sx={{ color: "text.secondary", mb: 5 }}>
          Vui lòng nhập địa chỉ Email liên kết với tài khoản của bạn và chúng
          tôi sẽ gửi cho bạn đường liên kết để đặt lại mật khẩu tài khoản của
          bạn.
        </Typography>

        {/* ResetPassword Form */}

        <ResetPasswordForm />

        <Link
          component={RouterLink}
          to="/auth/login"
          color="inherit"
          variant="subtitle2"
          sx={{ mt: 3, mx: "auto", alignItem: "center" }}
        >
          <CaretLeft />
          Quay lại trang đăng nhập
        </Link>
      </Stack>
    </>
  );
};

export default ResetPassword;
