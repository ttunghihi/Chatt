import { Stack } from "@mui/material";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import SideBar from "./SideBar";

const DashboardLayout = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }

  return (
    <>
      <Stack direction="row" sx={{ height: "100vh", width: "100vw" }}>
        {/* Side Bar */}
        <SideBar />
        <Outlet />
      </Stack>
    </>
  );
};

export default DashboardLayout;