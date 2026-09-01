import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isTyping: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  markMessagesAsSeen: async (userId) => {
    try {
      await axiosInstance.put(`/messages/seen/${userId}`);

      set((state) => {
        const updatedMessages = state.messages.map((msg) =>
          msg.senderId === userId && !msg.seen ? { ...msg, seen: true } : msg,
        );

        return {
          messages: updatedMessages,
        };
      });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData,
      );
      set((state) => ({
        messages: [...state.messages, res.data],
      }));
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  startTyping: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedUser } = get();

    if (socket && selectedUser) {
      socket.emit("typing", {
        receiverId: selectedUser._id,
      });
    }
  },

  stopTyping: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedUser } = get();

    if (socket && selectedUser) {
      socket.emit("stopTyping", {
        receiverId: selectedUser._id,
      });
    }
  },

  OnWindowMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.off("newMessage");
    socket.off("messageDelivered");
    socket.off("userTyping");
    socket.off("userStopTyping");
    socket.off("messagesSeen");

    socket.on("newMessage", async (newMessage) => {
      set((state) => ({
        messages: [...state.messages, newMessage],
      }));

      const selected = get().selectedUser;

      if (selected?._id === newMessage.senderId) {
        try {
          await axiosInstance.put(`/messages/seen/${newMessage.senderId}`);

          set({
            messages: get().messages.map((msg) =>
              msg.senderId === newMessage.senderId &&
              msg.receiverId === useAuthStore.getState().authUser._id
                ? { ...msg, seen: true }
                : msg,
            ),
          });
        } catch (error) {
          console.log("Error marking incoming message as seen", error);
        }
      }
    });

    socket.on("messageDelivered", ({ messageId }) => {
      set({
        messages: get().messages.map((msg) =>
          msg._id === messageId ? { ...msg, delivered: true } : msg,
        ),
      });
    });

    socket.on("messagesSeen", ({ userId }) => {
      set({
        messages: get().messages.map((msg) =>
          msg.senderId === useAuthStore.getState().authUser._id &&
          msg.receiverId === userId
            ? { ...msg, seen: true }
            : msg,
        ),
      });
    });

    socket.on("userTyping", ({ userId }) => {
      const selected = get().selectedUser;

      if (selected?._id === userId) {
        set({ isTyping: true });
      }
    });

    socket.on("userStopTyping", ({ userId }) => {
      const selected = get().selectedUser;

      if (selected?._id === userId) {
        set({ isTyping: false });
      }
    });
  },

  OffWindowMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("userTyping");
    socket.off("userStopTyping");
    socket.off("messagesSeen");
    socket.off("messageDelivered");
  },
  // todo: optimize later
  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
