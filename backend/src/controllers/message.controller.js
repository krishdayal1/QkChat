import User from "../models/user.model.js";

import Message from "../models/message.model.js";

import cloudinary from "cloudinary";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar", error.message);
    res.status(500).json({ error: "Internal Server error" });
  }
};

export const markMessagesAsSeen = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const myId = req.user._id;

    await Message.updateMany(
      {
        senderId: userId,
        receiverId: myId,
        seen: false,
      },
      {
        seen: true,
      },
    );

    const senderSocketId = getReceiverSocketId(userId);

    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesSeen", {
        userId: myId,
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.log("Error in markMessageAsSeen", error.message);
    res.status(500).json({ error: "Internal server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const userTochat = req.params.id.trim();
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userTochat },
        { senderId: userTochat, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const cleanedReceiverId = receiverId.trim();
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      if (!image.startsWith("data:image/")) {
        return res.status(400).json({
          message: "Invalid image format",
        });
      }

      const allowedTypes = [
        "data:image/jpeg;",
        "data:image/png;",
        "data:image/webp;",
      ];

      const isValidType = allowedTypes.some((type) => image.startsWith(type));

      if (!isValidType) {
        return res.status(400).json({
          message: "Only JPEG, PNG, and WebP images are allowed",
        });
      }

      const imageSize = Buffer.byteLength(image, "utf8");

      if (imageSize > 2 * 1024 * 1024) {
        return res.status(413).json({
          message: "Image must be smaller than 2MB",
        });
      }

      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const receiverSocketId = getReceiverSocketId(cleanedReceiverId);

    const newMessage = new Message({
      senderId,
      receiverId: cleanedReceiverId,
      text,
      image: imageUrl,
      delivered: !!receiverSocketId,
    });

    await newMessage.save();

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    const senderSocketId = getReceiverSocketId(senderId.toString());

    if (receiverSocketId && senderSocketId) {
      io.to(senderSocketId).emit("messageDelivered", {
        messageId: newMessage._id,
      });
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller", error.message);
    res.status(500).json({ error: "Internal Server error" });
  }
};
