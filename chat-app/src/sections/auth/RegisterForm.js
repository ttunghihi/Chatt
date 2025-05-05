import React, { useState } from "react";
import * as Yup from "yup";
import {
  Stack,
  Alert,
  InputAdornment,
  IconButton,
  Button,
} from "@mui/material";
import FormProvider, { RHFTextField } from "../../components/hook-form";

import { useForm } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";
import { Eye, EyeSlash } from "phosphor-react";
import axios from "axios";
import { API_URL } from "../../config";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);

  const RegisterSchema = Yup.object().shape({
    firstName: Yup.string().required("Vui lòng nhập Họ của bạn"),
    lastName: Yup.string().required("Vui lòng nhập Tên của bạn"),
    email: Yup.string()
      .required("Vui lòng nhập địa chỉ Email")
      .email("Địa chỉ email không chính xác"),
    password: Yup.string().required("Vui lòng nhập mật khẩu"),
  });

  const defaultValues = {
    firstName: "",
    lastName: "",
    email: "tung@gmail.com",
    password: "tung1234",
  };

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  const navigate = useNavigate(); // Khởi tạo navigate

  const onSubmit = async (data) => {
    try {
      // Gửi dữ liệu đăng ký đến backend
      const response = await axios.post(`${API_URL}/register`, data);

      console.log("Đăng ký thành công:", response.data);
      alert("Đăng ký thành công!");

      // Chuyển hướng đến trang đăng nhập
      navigate("/auth/login");
    } catch (error) {
      console.error("Lỗi khi đăng ký:", error.response?.data || error.message);

      reset();
      setError("afterSubmit", {
        ...error,
        message:
          error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.",
      });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {!!errors.afterSubmit && (
          <Alert severity="error">{errors.afterSubmit.message}</Alert>
        )}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <RHFTextField name="firstName" label="Họ" />
          <RHFTextField name="lastName" label="Tên" />
        </Stack>

        <RHFTextField name="email" label="Địa chỉ Email" />
        <RHFTextField
          name="password"
          type={showPassword ? "text" : "password"}
          label="Mật khẩu"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    setShowPassword(!showPassword);
                  }}
                >
                  {showPassword ? <Eye /> : <EyeSlash />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          fullWidth
          color="inherit"
          size="large"
          type="submit"
          variant="contained"
          sx={{
            bgcolo: "text.primary",
            color: (theme) =>
              theme.palette.mode === "light" ? "common.white" : "grey.800",
            "&:hover": {
              bgcolor: "text.primary",
              color: (theme) =>
                theme.palette.mode === "light" ? "common.white" : "grey.800",
            },
          }}
        >
          Đăng ký
        </Button>
      </Stack>
    </FormProvider>
  );
};

export default RegisterForm;
