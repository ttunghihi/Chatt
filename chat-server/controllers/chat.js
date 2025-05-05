const mongoose = require("mongoose");
const User = require("../models/user");
const Message = require("../models/message");
const { io } = require("../socket"); // Đảm bảo đường dẫn đúng đến file socket.js // Đường dẫn đến file model Message // Đường dẫn đến file model User

exports.getRecentChats = async (req, res) => {
    try {
      const userId = req.user.id; // Lấy userId từ middleware authController.protect
  
      if (!userId) {
        return res.status(400).json({
          status: "error",
          message: "Thiếu userId",
        });
      }
  
      console.log("User ID từ middleware:", userId);
  
      // Chuyển userId thành ObjectId
      const objectId = new mongoose.Types.ObjectId(userId);
  
      // Lấy danh sách recentChats
      const recentChats = await Message.aggregate([
        {
          $match: {
            $or: [{ sender: objectId }, { receiver: objectId }], // Lọc tin nhắn liên quan đến userId
          },
        },
        {
          $sort: { createdAt: -1 }, // Sắp xếp theo thời gian gần nhất
        },
        {
          $group: {
            _id: {
              $cond: [
                { $eq: ["$sender", objectId] },
                "$receiver", // Nếu userId là sender, nhóm theo receiver
                "$sender", // Nếu userId là receiver, nhóm theo sender
              ],
            },
            lastMessage: { $first: "$message" }, // Lấy tin nhắn gần nhất
            createdAt: { $first: "$createdAt" }, // Lấy thời gian gần nhất
          },
        },
        {
          $lookup: {
            from: "users", // Join với bảng users
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user", // Giải nén mảng user
        },
        {
          $project: {
            _id: 0,
            id: "$user._id",
            firstName: "$user.firstName",
            lastName: "$user.lastName",
            avatar: "$user.avatar",
            lastMessage: 1,
            createdAt: {
              $ifNull: ["$createdAt", null], // Đảm bảo `createdAt` không bị null
            },
          },
        },
        {
          $sort: { createdAt: -1 }, // Sắp xếp lại theo thời gian gần nhất
        },
      ]);
  
      console.log("Kết quả recentChats:", recentChats);
  
      res.status(200).json({
        status: "success",
        data: recentChats,
      });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách recentChats:", error.message);
      res.status(500).json({
        status: "error",
        message: "Đã xảy ra lỗi khi lấy danh sách recentChats.",
      });
    }
  };

  exports.updateRecentChats = async (req, res) => {
    try {
      const { userId, chatUserId } = req.body;
  
      console.log("Dữ liệu nhận được từ frontend:", { userId, chatUserId });
  
      if (!userId || !chatUserId) {
        return res.status(400).json({
          status: "error",
          message: "Thiếu userId hoặc chatUserId",
        });
      }
  
      // Chuyển userId và chatUserId thành ObjectId
      const userObjectId = new mongoose.Types.ObjectId(userId);
      const chatUserObjectId = new mongoose.Types.ObjectId(chatUserId);
  
      // Cập nhật danh sách recentChats trong cơ sở dữ liệu
      const updatedUser = await User.findByIdAndUpdate(
        userObjectId,
        {
          $addToSet: { recentChats: chatUserObjectId }, // Thêm chatUserId vào danh sách recentChats nếu chưa tồn tại
        },
        { new: true }
      );
  
      if (!updatedUser) {
        console.error("Không tìm thấy người dùng với userId:", userId);
        return res.status(404).json({
          status: "error",
          message: "Không tìm thấy người dùng với userId đã cung cấp",
        });
      }
  
      console.log("Danh sách recentChats đã được cập nhật:", updatedUser.recentChats);
  
      // Phát sự kiện updateRecentChats qua socket.io
      io.to(userId).emit("updateRecentChats", {
        sender: userId,
        receiver: chatUserId,
        message: "Danh sách recentChats đã được cập nhật.",
        createdAt: new Date(),
      });
  
      res.status(200).json({
        status: "success",
        message: "Danh sách recentChats đã được cập nhật",
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật recentChats:", error.message);
      res.status(500).json({
        status: "error",
        message: "Đã xảy ra lỗi khi cập nhật recentChats.",
      });
    }
  };