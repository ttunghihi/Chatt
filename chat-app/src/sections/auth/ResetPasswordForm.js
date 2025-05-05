import React from "react";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, { RHFTextField } from "../../components/hook-form";
import { Stack, Alert, Button } from "@mui/material";

const ResetPasswordForm = () => {
  const ResetPasswordSchema = Yup.object().shape({
    email: Yup.string()
      .required("Vui lòng nhập địa chỉ Email")
      .email("Địa chỉ email không chính xác"),
  });

  const defaultValues = {
    email: "tung@gmail.com",
  };

  const methods = useForm({
    resolver: yupResolver(ResetPasswordSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  const onSubmit = async (data) => {
    try {
      //nhập data tới backend
    } catch (error) {
      console.log(error);
      reset();
      setError("afterSubmit", {
        ...error,
        message: error.message,
      });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {!!errors.afterSubmit && (
          <Alert severity="error">{errors.afterSubmit.message}</Alert>
        )}

        <RHFTextField name="email" label="Địa chỉ Email" />

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
        Gửi yêu cầu
      </Button>
      </Stack>
      
    </FormProvider>
  );
};

export default ResetPasswordForm;
