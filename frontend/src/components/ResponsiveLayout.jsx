import Sidebar from "./Sidebar";
import ChatContainer from "./ChatContainer";
import NoChatSelected from "./NoChatSelected";
import { useChatStore } from "../store/useChatStore";
import AiButton from "./AiButton";

const ResponsiveLayout = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="flex h-full relative">
      {/* Sidebar */}
      <div
        className={`${
          selectedUser ? "hidden md:flex" : "flex"}
          "w-24 sm:w-28 md:w-80 border-r border-base-300 flex-shrink-0"
        `}
      >
        <Sidebar />
      </div>

      {/* Chat area */}
      <div className={`${
        selectedUser ? "flex w-full" : "flex flex-1"
      } relative min-w-0`}
      >
        {selectedUser ? <ChatContainer /> : <NoChatSelected />}
      </div>

      <AiButton />
    </div>
  );
};

export default ResponsiveLayout;
