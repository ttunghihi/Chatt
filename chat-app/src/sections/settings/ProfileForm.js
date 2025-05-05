import React, { useState } from "react";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, { RHFTextField } from "../../components/hook-form";
import { Stack, Alert, Button, IconButton, InputAdornment } from "@mui/material";
import { Eye, EyeSlash } from "phosphor-react";
import axios from "axios";

const ChangePasswordForm = () => {
  const [showPassword, setShowPassword] = useState(false);

  // Validation schema
  const schema = Yup.object().shape({
    currentPassword: Yup.string().required("Vui lòng nhập mật khẩu hiện tại"),
    newPassword: Yup.string()
      .required("Vui lòng nhập mật khẩu mới")
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), null], "Mật khẩu không khớp")
      .required("Vui lòng xác nhận mật khẩu mới"),
  });

  const defaultValues = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const {
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = methods;

  const onSubmit = async (data) => {
    try {
      // Gửi tất cả dữ liệu tới backend
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/user/change-password`,
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.status === "success") {
        alert("Đổi mật khẩu thành công!");
        reset(); // Reset form sau khi đổi mật khẩu thành công
      }
    } catch (error) {
      console.error(error);
      setError("afterSubmit", {
        ...error,
        message: error.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại.",
      });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}

        <RHFTextField
          name="currentPassword"
          label="Mật khẩu hiện tại"
          type={showPassword ? "text" : "password"}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeSlash /> : <Eye />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <RHFTextField
          name="newPassword"
          label="Mật khẩu mới"
          type={showPassword ? "text" : "password"}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeSlash /> : <Eye />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <RHFTextField
          name="confirmPassword"
          label="Xác nhận mật khẩu mới"
          type={showPassword ? "text" : "password"}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeSlash /> : <Eye />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Stack direction="row" justifyContent="flex-end">
          <Button color="primary" size="large" type="submit" variant="contained">
            Đổi mật khẩu
          </Button>
        </Stack>
      </Stack>
    </FormProvider>
  );
};

export default ChangePasswordForm;