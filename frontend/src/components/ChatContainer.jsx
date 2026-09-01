import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "../components/ChatHeader";
import MessageInput from "../components/MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";

import { formatMessageTime } from "../lib/utils";

const formatChatDate = (date) => {
  const messageDate = new Date(date);
  const today = new Date();

  if (
    messageDate.getDate() === today.getDate() &&
    messageDate.getMonth() === today.getMonth() &&
    messageDate.getFullYear() === today.getFullYear()
  ) {
    return "Today";
  }

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (
    messageDate.getDate() === yesterday.getDate() &&
    messageDate.getMonth() === yesterday.getMonth() &&
    messageDate.getFullYear() === yesterday.getFullYear()
  ) {
    return "Yesterday";
  }

  return messageDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const ChatContainer = () => {
  const messages = useChatStore((state) => state.messages);
  const selectedUser = useChatStore((state) => state.selectedUser);
  const isMessagesLoading = useChatStore((state) => state.isMessagesLoading);
  const isTyping = useChatStore((state) => state.isTyping);

  const getMessages = useChatStore((state) => state.getMessages);
  const markMessagesAsSeen = useChatStore((state) => state.markMessagesAsSeen);
  const OnWindowMessages = useChatStore((state) => state.OnWindowMessages);
  const OffWindowMessages = useChatStore((state) => state.OffWindowMessages);

  const authUser = useAuthStore((state) => state.authUser);

  const messagesContainerRef = useRef(null);

  const previousScrollTopRef = useRef(0);

  const initialScrollDoneRef = useRef(false);

  const shouldAutoScrollRef = useRef(true);

  const previousMessagesLengthRef = useRef(0);

  const [showDateHeader, setShowDateHeader] = useState(true);

  const currentChatDate =
    messages.length > 0
      ? formatChatDate(messages[messages.length - 1].createdAt)
      : "";

  useEffect(() => {
    if (!selectedUser?._id) return;

    const userId = selectedUser._id;

    getMessages(userId);

    markMessagesAsSeen(userId);

    OnWindowMessages();

    return () => {
      OffWindowMessages();
    };
  }, [
    selectedUser?._id,
    getMessages,
    markMessagesAsSeen,
    OnWindowMessages,
    OffWindowMessages,
  ]);

  useEffect(() => {
    initialScrollDoneRef.current = false;
    previousScrollTopRef.current = 0;

    setShowDateHeader(true);

    const container = messagesContainerRef.current;

    if (container) {
      container.scrollTop = 0;
    }
  }, [selectedUser?._id]);

  useEffect(() => {
    if (isMessagesLoading) return;
    if (messages.length === 0) return;

    const previousLength = previousMessagesLengthRef.current;

    // Initial chat load
    if (!initialScrollDoneRef.current) {
      requestAnimationFrame(() => {
        const container = messagesContainerRef.current;

        if (!container) return;

        container.scrollTop = container.scrollHeight;

        previousScrollTopRef.current = container.scrollTop;
        previousMessagesLengthRef.current = messages.length;

        initialScrollDoneRef.current = true;
        shouldAutoScrollRef.current = true;
      });

      return;
    }

    // New message added
    if (messages.length > previousLength) {
      requestAnimationFrame(() => {
        const container = messagesContainerRef.current;

        if (!container) return;

        // Always scroll to bottom when a new message is added
        container.scrollTop = container.scrollHeight;

        previousScrollTopRef.current = container.scrollTop;
      });

      previousMessagesLengthRef.current = messages.length;
    }
  }, [messages.length, isMessagesLoading]);

  const handleScroll = () => {
    const container = messagesContainerRef.current;

    if (!container) return;

    const currentScrollTop = container.scrollTop;
    const previousScrollTop = previousScrollTopRef.current;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    shouldAutoScrollRef.current = distanceFromBottom < 150;

    if (Math.abs(currentScrollTop - previousScrollTop) < 2) {
      return;
    }

    if (currentScrollTop > previousScrollTop) {
      setShowDateHeader(false);
    } else {
      setShowDateHeader(true);
    }

    previousScrollTopRef.current = currentScrollTop;
  };
  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatHeader />

        <MessageSkeleton />

        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <ChatHeader />

      {/* Message area */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="relative flex-1 min-h-0 overflow-y-auto p-4 space-y-6"
      >
        {/* Sticky date */}
        {currentChatDate && (
          <div
            className={`
              sticky
              top-0
              z-20
              flex
              justify-center
              py-2
              pointer-events-none
              transition-opacity
              duration-150
              ${showDateHeader ? "opacity-100" : "opacity-0"}
            `}
          >
            <span className="px-3 py-1 rounded-full bg-base-200 text-xs text-base-content/60 shadow-sm">
              {currentChatDate}
            </span>
          </div>
        )}

        {/* Messages */}
        {messages.map((message) => {
          const isOwnMessage = message.senderId === authUser._id;

          return (
            <div
              key={message._id}
              className={`chat ${isOwnMessage ? "chat-end" : "chat-start"}`}
            >
              {/* Avatar */}
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      isOwnMessage
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>

              {/* Time + status */}
              <div className="chat-header mb-1 flex items-center gap-1.5 justify-end">
                <time className="text-xs opacity-50">
                  {formatMessageTime(message.createdAt)}
                </time>

                {isOwnMessage && (
                  <span className="text-[11px] text-base-content/50 leading-none">
                    {message.seen ? (
                      <span className="text-blue-400">✓✓</span>
                    ) : message.delivered ? (
                      <span>✓✓</span>
                    ) : (
                      <span>✓</span>
                    )}
                  </span>
                )}
              </div>

              {/* Bubble */}
              <div className="chat-bubble flex flex-col">
                {message.image && (
                  <img
                    src={message.image}
                    alt="attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}

                {message.text && <p>{message.text}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Typing indicator */}
      {isTyping && (
        <div className="px-3 pb-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden border border-base-300">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="bg-base-200 rounded-full px-3 py-1">
              <span className="loading loading-dots loading-xs text-base-content/70" />
            </div>
          </div>
        </div>
      )}

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
