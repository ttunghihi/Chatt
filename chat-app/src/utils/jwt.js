import axios from 'axios';

// ----------------------------------------------------------------------

// Hàm thiết lập session (không cần lưu token vào localStorage)
const setSession = () => {
  // Cookie HTTP-only sẽ tự động được gửi kèm trong các yêu cầu
  // Không cần lưu token vào localStorage hoặc thêm vào header Authorization
  console.log("Session đã được thiết lập thông qua cookie HTTP-only.");
};

// Hàm kiểm tra trạng thái đăng nhập
const isLoggedIn = async () => {
  try {
    // Gửi yêu cầu đến backend để kiểm tra trạng thái đăng nhập
    const response = await axios.get('/auth/check-session', {
      withCredentials: true, // Gửi cookie kèm theo yêu cầu
    });

    // Nếu backend trả về trạng thái hợp lệ, người dùng đã đăng nhập
    return response.data.loggedIn;
  } catch (error) {
    console.error("Lỗi khi kiểm tra trạng thái đăng nhập:", error.message);
    return false; // Người dùng chưa đăng nhập hoặc token không hợp lệ
  }
};

export { setSession, isLoggedIn };