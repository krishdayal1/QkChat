import { useState } from "react";
import { axiosInstance } from "../lib/axios";

const AiButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSend = async () => {
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: message,
      },
    ]);
    const res = await axiosInstance.post("/ai", { message });
    setMessages((prev) => [
      ...prev,
      {
        sender: "ai",
        text: res.data.reply,
      },
    ]);
    console.log(res.data);
  };

  return (
    <div className="fixed bottom-5 right-5">
      <button onClick={() => setIsOpen(true)}>🐰</button>
      {isOpen && (
        <div>
          <h2>AI Assistant</h2>

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask Anything..."
          />
          <p>{message}</p>
          <button onClick={handleSend}>Send</button>
          <div>
            {messages.map((msg, index) => (
              <p key={index}>
                {msg.sender}: {msg.text}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiButton;
