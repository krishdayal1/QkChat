import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const AiButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
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
    <div className="fixed bottom-5 right-5">
      <button onClick={() => setIsOpen(true)}>🐰</button>
      {isOpen && (
        <div className="card w-96 h-[500px] bg-base-100 shadow-xl">
          <div className="card-body p-4">
            <button onClick={() => setIsOpen(false)}>X</button>
            <h2 className="card-title">AI Assistant</h2>
            <div className="h-64 overflow-y-auto space-y-2">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={
                    msg.sender === "user" ? "chat chat-end" : "chat chat-start"
                  }
                >
                  <div className="chat-bubble">{msg.text}</div>
                </div>
              ))}
            </div>

            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask Anything..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend();
                }
              }}
            />
            <button onClick={handleSend} disabled={isLoading}>
              {isLoading ? "Thinking..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiButton;
