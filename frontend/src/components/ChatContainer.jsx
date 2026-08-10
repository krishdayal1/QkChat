import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import ChatHeader from "../components/ChatHeader";
import MessageInput from "../components/MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLOading,
    selectedUser,
    OnWindowMessages,
    OffWindowMessages,
    isTyping,
  } = useChatStore();

  const messageEndRef = useRef(null);
  const { authUser } = useAuthStore();
  useEffect(() => {
    if (!selectedUser?._id) return;

    getMessages(selectedUser._id);

    OnWindowMessages();

    return () => OffWindowMessages();
  }, [selectedUser._id, getMessages, OnWindowMessages, OffWindowMessages]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({
      behavior: messages.length > 1 ? "smooth" : "auto",
    });
  }, [messages]);

  if (isMessagesLOading)
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="attechment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}

        <div ref={messageEndRef} />
      </div>

      {isTyping && (
        <div className="px-3 pb-1">
          {" "}
          <div className="flex items-center gap-2">
            {" "}
            <div className="w-6 h-6 rounded-full overflow-hidden border border-base-300">
              {" "}
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName}
                className="w-full h-full object-cover"
              />{" "}
            </div>{" "}
            <div className="bg-base-200 rounded-full px-3 py-1">
              {" "}
              <span className="loading loading-dots loading-xs text-base-content/70"></span>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
