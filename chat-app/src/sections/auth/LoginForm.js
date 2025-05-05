import React, { useState } from "react";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, { RHFTextField } from "../../components/hook-form";
import { Stack, Alert, Button, IconButton, InputAdornment } from "@mui/material";
import { Eye, EyeSlash } from "phosphor-react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Thêm axios để gửi yêu cầu HTTP
import { API_URL } from "../../config"; // Import URL của backend
import { dispatch } from "../../redux/store";
import { loginSuccess } from "../../redux/slices/auth";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const LoginSchema = Yup.object().shape({
    email: Yup.string()
      .required("Vui lòng nhập địa chỉ Email")
      .email("Địa chỉ email không chính xác"),
    password: Yup.string().required("Vui lòng nhập mật khẩu"),
  });

  const defaultValues = {
    email: "",
    password: "",
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(`${API_URL}/login`, data, {
        withCredentials: true,
      });

      console.log("Đăng nhập thành công:", response.data);

      // Lưu token vào localStorage
      localStorage.setItem("token", response.data.token);

      // Dispatch hành động loginSuccess
      dispatch(loginSuccess(response.data.user));

      // Chuyển hướng đến dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Lỗi khi đăng nhập:", error.response?.data || error.message);

      reset();
      setError("afterSubmit", {
        ...error,
        message: error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.",
      });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}

        <RHFTextField name="email" label="Email" />

        <RHFTextField
          name="password"
          label="Mật khẩu"
          type={showPassword ? "text" : "password"}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <Eye /> : <EyeSlash />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
          Đăng Nhập
        </Button>
      </Stack>
    </FormProvider>
  );
};

export default LoginForm;