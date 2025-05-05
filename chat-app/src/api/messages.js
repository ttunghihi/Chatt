import axios from "axios";

export const fetchChatHistory = async (userId1, userId2) => {
  try {
    const token = localStorage.getItem("token"); // Lấy token từ localStorage
    const response = await axios.get("http://localhost:3000/message/messages", {
      params: {
        userId1,
        userId2,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data; // Trả về danh sách tin nhắn
  } catch (error) {
    console.error("Lỗi khi lấy tin nhắn:", error.response?.data || error.message);
    return [];
  }
};

// Hàm lấy tin nhắn nhóm từ API
export const fetchGroupChatHistory = async (groupId, token) => {
  try {
    const response = await axios.get(
      `http://localhost:3000/groupMessage/messages/${groupId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data; // Trả về danh sách tin nhắn nhóm
  } catch (error) {
    console.error("Lỗi khi lấy tin nhắn nhóm:", error.response?.data || error.message);
    return [];
  }
};