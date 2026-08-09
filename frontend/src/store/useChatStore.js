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

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  startTyping: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedUser } = get();

    if( socket && selectedUser ) {
      socket.emit("typing", {
        receiverId: selectedUser._id,
      });
    }
  },

  stopTyping: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedUser } = get();

    if(socket && selectedUser) {
      socket.emit("stopTyping", {
        receiverId: selectedUser._id,
      });
    }
  },

  OnWindowMessages: () => {
    const {selectedUser} = get();
    if(!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      set({
        messages: [...get().messages, newMessage],
      });
    });

    socket.on("userTyping", ({ userId }) => {
      const selected = get().selectedUser;

      if(selected?._id === userId) {
        set({ isTyping: true });
      }
    });

    socket.on("userStopTyping", ({ userId }) => {
      const selected = get().selectedUser;

      if(selected?._id === userId) {
        set({ isTyping: false });
      }
    })
  },

  OffWindowMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("userTyping");
    socket.off("userStopTyping");
  },
  // todo: optimize later
  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));