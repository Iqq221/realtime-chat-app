import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ProfileModal from "../components/ProfileModal";
import api from "../services/api";

const Chat = () => {
  const { user } = useAuth();
  const [activeConversation, setActiveConversation] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Helper to extract recipient from conversation
  const getRecipientFromConv = (conv) => {
    if (!conv?.participants || !user) return null;
    return conv.participants.find((p) => (p._id || p.id) !== (user._id || user.id));
  };

  const handleSelectUserForChat = async (targetUser) => {
    try {
      setSelectedUser(targetUser);
      // Check or create conversation
      const res = await api.post("/conversations", { receiverId: targetUser._id });
      if (res.data.success) {
        setActiveConversation(res.data.conversation);
      }
    } catch (err) {
      console.error("Failed to initialize conversation:", err);
    }
  };

  const currentRecipient = selectedUser || getRecipientFromConv(activeConversation);

  return (
    <div className="flex h-screen w-screen bg-[#0b0f19] overflow-hidden">
      {/* Sidebar - hidden on mobile when a chat is open */}
      <div
        className={`h-full ${
          activeConversation || selectedUser ? "hidden md:flex" : "flex w-full"
        }`}
      >
        <Sidebar
          activeConversation={activeConversation}
          setActiveConversation={(conv) => {
            setSelectedUser(null);
            setActiveConversation(conv);
          }}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          onOpenProfile={() => setIsProfileOpen(true)}
          onSelectUserForChat={handleSelectUserForChat}
        />
      </div>

      {/* Main Chat Area - hidden on mobile when no chat is open */}
      <div
        className={`flex-1 h-full ${
          !activeConversation && !selectedUser ? "hidden md:flex" : "flex"
        }`}
      >
        <ChatWindow
          conversation={activeConversation}
          recipient={currentRecipient}
          onBack={() => {
            setActiveConversation(null);
            setSelectedUser(null);
          }}
        />
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
};

export default Chat;
