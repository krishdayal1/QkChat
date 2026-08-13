import { Server } from "socket.io";
import express from "express";
import http from "http";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
    },
});

export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

const userSocketMap = {}; // userId = socketId

io.on("connection", (socket) => {
    console.log("A user connected :", socket.id);

    const userId = socket.handshake.query.userId;

    if(userId) {
        socket.userId = userId;
        userSocketMap[userId] = socket.id;
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("typing", ({ receiverId }) => {
        const receiverSocketId = getReceiverSocketId(receiverId);

        if(receiverSocketId){
            io.to(receiverSocketId).emit("userTyping", {
                userId: socket.userId,
            });
        }
    });

    socket.on("stopTyping", ({ receiverId }) => {
        const receiverSocketId = getReceiverSocketId(receiverId);

        if(receiverSocketId) {
            io.to(receiverSocketId).emit("userStopTyping", {
                userId: socket.userId,
            });
        }
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { io, app, server };