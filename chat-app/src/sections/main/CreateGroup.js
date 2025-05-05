import { yupResolver } from "@hookform/resolvers/yup";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Slide,
  Stack,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios"; // Thêm axios để gọi API
import * as Yup from "yup";
import FormProvider, { RHFTextField } from "../../components/hook-form";
import RHFAutocomplete from "../../components/hook-form/RHFAutocomplete";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CreateGroupForm = ({ handleClose, updateGroupList }) => {
  const [users, setUsers] = useState([]); // Danh sách người dùng từ backend
  const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu
  const [error, setError] = useState(null); // Trạng thái lỗi

  // Lấy danh sách người dùng từ backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/user`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUsers(response.data.users); // Lưu danh sách người dùng
        setLoading(false); // Dừng trạng thái tải
      } catch (error) {
        console.error("Lỗi khi lấy danh sách người dùng:", error.message);
        setError("Không thể lấy danh sách người dùng. Vui lòng thử lại sau.");
        setLoading(false); // Dừng trạng thái tải
      }
    };

    fetchUsers();
  }, []);

  const NewGroupSchema = Yup.object().shape({
    title: Yup.string().required("Vui lòng nhập tên nhóm"),
    members: Yup.array().min(2, "Phải thêm ít nhất 2 thành viên"),
  });

  const defaultValues = {
    title: "",
    members: [],
  };

  const methods = useForm({
    resolver: yupResolver(NewGroupSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmit = async (data) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/group/create`,
        {
          name: data.title,
          members: data.members.map((member) => member.value), // Chỉ gửi ID của thành viên
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log("Nhóm mới đã được tạo:", response.data.group);
  
      // Cập nhật danh sách nhóm
      updateGroupList(response.data.group);
  
      // Đóng dialog và reset form
      handleClose();
      reset();
    } catch (error) {
      console.error("Lỗi khi tạo nhóm:", error.message);
    }
  };

  if (loading) {
    return <p>Đang tải danh sách người dùng...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <RHFTextField name="title" label="Tên nhóm" />
        <RHFAutocomplete
          name="members"
          label="Thành viên"
          multiple
          options={users.map((user) => ({
            label: `${user.firstName} ${user.lastName}`,
            value: user._id,
          }))}
          isOptionEqualToValue={(option, value) => option.value === value.value} // So sánh giá trị
          ChipProps={{ size: "medium" }}
        />
        <Stack
          spacing={2}
          direction={"row"}
          alignItems={"center"}
          justifyContent="end"
        >
          <Button onClick={handleClose}>Hủy</Button>
          <Button type="submit" variant="contained">
            Tạo
          </Button>
        </Stack>
      </Stack>
    </FormProvider>
  );
};

const CreateGroup = ({ open, handleClose, updateGroupList }) => {
  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      TransitionComponent={Transition}
      keepMounted
      sx={{ p: 4 }}
    >
      <DialogTitle sx={{ mb: 3 }}>Tạo nhóm mới</DialogTitle>
      <DialogContent>
        <CreateGroupForm
          handleClose={handleClose}
          updateGroupList={updateGroupList}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroup;
