import { faker } from "@faker-js/faker";
import { ChatCircleDots, Gear, GearSix, Phone, SignOut, User, Users } from "phosphor-react";
import { fetchChatHistory, fetchGroupChatHistory } from "../api/messages"; // Import hàm fetchChatHistory

const Profile_Menu = [
  {
    title: "Đổi mật khẩu",
    icon: <User />,
  },
  {
    title: "Cài đặt",
    icon: <Gear />,
  },
  {
    title: "Đăng xuất",
    icon: <SignOut />,
  },
];

const Nav_Buttons = [
  {
    index: 0,
    icon: <ChatCircleDots />,
  },
  {
    index: 1,
    icon: <Users />,
  },
  {
    index: 2,
    icon: <Phone />,
  },
];

const Nav_Setting = [
  {
    index: 3,
    icon: <GearSix />,
  },
];

const ChatList = [
  {
    id: 0,
    img: "https://scontent-hkg1-2.xx.fbcdn.net/v/t39.30808-6/483660638_1545900709378827_4578194115153014045_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=HQ-QuDGayCYQ7kNvgHyLsws&_nc_oc=Adg03ZnQbTg7ucE2d4kEQXa97NRK-W1QMdcBZJmT5AUJN-Me8kes3UV_-ov4hHILYpCySAuhE05OveCpqXW4X12-&_nc_zt=23&_nc_ht=scontent-hkg1-2.xx&_nc_gid=HdXBGSKq_HyolIIfHTFpmw&oh=00_AYHeQJYPbfZvHjzLjKwlldd9KIoghtLh0fjQjzikVAgdsg&oe=67DE0883",
    name: "Tung Thanh Doan",
    msg: "Toi bi ngu",
    time: "6:50",
    unread: 1,
    pinned: true,
    online: true,
  },
  {
    id: 1,
    img: faker.image.avatar(),
    name: faker.name.firstName(),
    msg: faker.music.songName(),
    time: "12:02",
    unread: 2,
    pinned: true,
    online: false,
  },
  // Các phần khác giữ nguyên...
];

let Chat_History = []; // Biến lưu trữ danh sách tin nhắn cá nhân
let Group_Chat_History = []; // Biến lưu trữ danh sách tin nhắn nhóm

// Hàm tải dữ liệu tin nhắn cá nhân từ cơ sở dữ liệu
export const loadChatHistory = async (userId1, userId2) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Không tìm thấy token trong localStorage.");
    }

    const response = await fetchChatHistory(userId1, userId2, token); // Gọi API để lấy dữ liệu
    Chat_History = response.data; // Lưu dữ liệu vào biến Chat_History
    console.log("Dữ liệu tin nhắn cá nhân đã được tải:", Chat_History);
    return Chat_History; // Trả về dữ liệu để sử dụng trong các component khác
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu tin nhắn cá nhân:", error.message || error);
    Chat_History = []; // Nếu lỗi, đặt Chat_History thành mảng rỗng
    return [];
  }
};

// Hàm tải dữ liệu tin nhắn nhóm từ cơ sở dữ liệu
export const loadGroupChatHistory = async (groupId, currentUserId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Không tìm thấy token trong localStorage.");
    }

    const response = await fetchGroupChatHistory(groupId, token); // Gọi API để lấy dữ liệu
    const groupChatHistory = response.data.map((msg) => ({
      ...msg,
      isSentByCurrentUser: (msg.sender._id || msg.sender).toString() === currentUserId.toString(),
      senderName: msg.senderName || "Không rõ tên", // Hiển thị tên người gửi
      senderAvatar: msg.senderAvatar || null, // Hiển thị avatar người gửi
    }));

    Group_Chat_History = groupChatHistory; // Lưu dữ liệu vào biến Group_Chat_History
    console.log("Dữ liệu tin nhắn nhóm đã được tải:", Group_Chat_History);
    return Group_Chat_History; // Trả về dữ liệu để sử dụng trong các component khác
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu tin nhắn nhóm:", error.message || error);
    Group_Chat_History = []; // Nếu lỗi, đặt Group_Chat_History thành mảng rỗng
    return [];
  }
};

const Message_options = [
  {
    title: "Reply",
  },
  {
    title: "React to message",
  },
  {
    title: "Forward message",
  },
  {
    title: "Star message",
  },
  {
    title: "Report",
  },
  {
    title: "Delete Message",
  },
];

export {
  Profile_Menu,
  Nav_Setting,
  Nav_Buttons,
  ChatList,
  Chat_History,
  Message_options,
};