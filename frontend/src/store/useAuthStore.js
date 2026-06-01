import {create} from "zustand";
import { axiosInstance, API_URL } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";


export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp : false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    checkAuth: async() => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data});
            get().connectSocket()
        } catch (error) {
            console.log("Error in checkAuth", error);
            set({ authUser: null});
        } finally {
            set({ isCheckingAuth: false});
        }
    },

    signup: async (data, navigate) => {
        set({ isSigningUp: true});
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            toast.success(res.data.message);
            navigate("/verify-otp", {
                state: {
                    email: data.email
                }
            });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isSigningUp: false});
        }
    },

    verifyOtp: async (data, navigate) => {
        try{
            const res = await axiosInstance.post(
                "/auth/verify-otp", 
                data
            );
            set({ authUser: res.data });
            toast.success(res.data.message);
            get().connectSocket();
            navigate("/");
        } catch(error) {
            toast.error(error.response.data.message);
        }
    },

    resendOtp: async (data) => {
        try {
            const res = await axiosInstance.post("/auth/resend-otp", data);
            toast.success(res.data.message);
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null});
            toast.success("Logged out successfully");
            get().disconnectSocket()
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true});
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data });
            toast.success("Logged in Successfully");

            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isLoggingIn: false });
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });

        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: res.data });
            toast.success("Profile updated successfully");
        } catch (error) {
            console.log("error in update profile: ", error);
            const errorMessage = error?.response?.data?.message || "Something went wrong";
            toast.error(errorMessage);
        } finally {
            set({ isUpdatingProfile: false});
        }
    },
    
    connectSocket: () => {
        const { authUser } = get();
        if(!authUser || get().socket?.connected) return;

        const socket = io(API_URL, {
            query: {
                userId: authUser._id,
            }
        })
        socket.connect()
        set({ socket: socket})

        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds})
        })
    },

    disconnectSocket: () => {
        if(get().socket?.connected) get().socket.disconnect();
    },
}));