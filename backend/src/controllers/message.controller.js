import User from "../models/user.model.js";

import Message from "../models/message.model.js";

import cloudinary from "cloudinary";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { send } from "process";

export const getUsersForSidebar = async (req,res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne : loggedInUserId } }).select("-password");

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error("Error in getUsersForSidebar", error.message);
        res.status(500).json( { error: "Internal Server error" });
    }
};

export const getMessages = async (req,res) => {
    try {
        const userTochat = req.params.id.trim();
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userTochat},
                { senderId: userTochat, receiverId: myId},
            ],
        });

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal Server Error"})
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text, image} = req.body;
        const { id: receiverId } = req.params;
        const cleanedReceiverId = receiverId.trim();
        const senderId = req.user._id;

        let imageUrl;
        if(image){
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

        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        const senderSocketId = getReceiverSocketId(senderId.toString());

        if(receiverSocketId && senderSocketId) {
            io.to(senderSocketId).emit("messageDelivered", {
                messageId: newMessage._id,
            });
        }
        
        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage controller", error.message);
        res.status(500).json({ error: "Internal Server error"});
    }
}