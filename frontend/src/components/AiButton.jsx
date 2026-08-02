import { useState, useEffect, useRef } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import astra from "../assets/astra.png";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useAstraStore } from "../store/useAstraStore";
import { X } from "lucide-react";
import { motion } from "framer-motion";

const AiButton = () => {
  const { isAstraOpen, openAstra, closeAstra } = useAstraStore();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (isLoading) {
      return;
    }

    if (!message.trim()) {
      return toast.error("Please type your question");
    }
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: message,
      },
    ]);
    setIsLoading(true);

    try {
      const res = await axiosInstance.post("/ai", { message });
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: res.data.reply,
        },
      ]);
    } catch (error) {
      toast.error("Failed to get AI response");
    } finally {
      setIsLoading(false);
    }
    setMessage("");
  };

  return (
    <div className="fixed bottom-12 right-4">
      {isAstraOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.25 }}
          className="card w-[95vw] max-w-[420px] h-[85vh] max-h-[700px] bg-base-100 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300"
        >
          <div className="card-body flex flex-col min-h-0 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={astra}
                    alt="Astra"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="absolute bottom-1 right-0 w-3 h-3 bg-green-500 border-2 border-base-100 rounded-full"></span>
                </div>
                <div>
                  <h2 className="font-bold">Astra</h2>
                  <p className="text-xs opacity-70">
                    Your Intelligent Companion
                  </p>
                </div>
              </div>

              <button
                onClick={closeAstra}
                className="btn btn-ghost btn-circle btn-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{
                    opacity: 0,
                    x: msg.sender === "user" ? 30 : -30,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.25,
                  }}
                  className={msg.sender === "user" ? "chat chat-end" : "chat chat-start"}
                >
                  {msg.sender === "ai" && (
                    <div className="chat-image avatar">
                      <div className="w-10 rounded-full">
                        <img src={astra} alt="Astra" />
                      </div>
                    </div>
                  )}
                  <div
                    className={
                      msg.sender === "user"
                        ? "chat-bubble chat-bubble-primary max-w-[80%] break-words"
                        : "max-w-[92%] min-w-0 break-words bg-base-200 rounded-2xl rounded-tl-sm p-4"
                    }
                  >
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="mb-3 leading-relaxed">{children}</p>
                        ),
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="!text-blue-500 underline font-medium"
                          >
                            {children}
                          </a>
                        ),
                        code: ({ className, children, ...props }) => {
                          const match = /language-(\w+)/.exec(className || "");

                          return match ? (
                            <SyntaxHighlighter
                              language={match[1]}
                              style={vscDarkPlus}
                              PreTag="div"
                              customStyle={{
                                margin: 0,
                                padding: "10px",
                              }}
                              {...props}
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                        pre: ({ children }) => (
                          <pre className="w-full max-w-full overflow-x-auto p-2 rounded-lg bg-base-300">
                            {children}
                          </pre>
                        ),
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              ))}
              {/* Thinking indicator for my chat ..... */}
              {isLoading && (
                <div className="chat chat-start">
                  <div className="chat-image avatar">
                    <div className="w-8 rounded-full">
                      <img src={astra} alt="Astra" />
                    </div>
                  </div>
                  <div className="chat-bubble bg-base-200">
                    <span className="loading loading-dots loading-sm"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef}></div>
            </div>

            {/* Input Area */}
            <div className="flex gap-2">
              <input
                className=" input input-bordered flex-1 min-w-0"
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask Astra anything..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSend();
                  }
                }}
              />
              <button
                className="btn btn-primary"
                onClick={handleSend}
                disabled={isLoading}
              >
                {isLoading ? "🤔" : "➤"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AiButton;
