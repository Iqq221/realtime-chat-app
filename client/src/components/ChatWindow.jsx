import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import api, { getFullImageUrl } from "../services/api";
import MessageInput from "./MessageInput";
import { ArrowLeft, CheckCheck, Image as ImageIcon, X } from "lucide-react";

const ChatWindow = ({ conversation, recipient, onBack }) => {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const messagesEndRef = useRef(null);

  const recipientIdStr = (recipient?._id || recipient?.id)?.toString();
  const isOnline = recipientIdStr ? onlineUsers.includes(recipientIdStr) : false;

  // Join/leave conversation socket room
  useEffect(() => {
    if (!socket || !conversation?._id) return;

    socket.emit("joinChat", conversation._id);

    return () => {
      socket.emit("leaveChat", conversation._id);
    };
  }, [socket, conversation?._id]);

  // Fetch conversation messages
  useEffect(() => {
    if (!conversation?._id) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/messages/${conversation._id}`);
        if (res.data.success) {
          setMessages(res.data.messages);
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversation?._id]);

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      const msgConvId = newMessage.conversation?._id
        ? newMessage.conversation._id.toString()
        : newMessage.conversation?.toString();
      const currentConvId = conversation?._id?.toString();

      if (msgConvId && currentConvId && msgConvId === currentConvId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === newMessage._id)) return prev;
          return [...prev, newMessage];
        });
      }
    };

    const handleUserTyping = ({ conversationId, senderId }) => {
      const currentConvId = conversation?._id?.toString();
      const targetSenderId = senderId?.toString();

      if (
        conversationId?.toString() === currentConvId &&
        targetSenderId === recipientIdStr
      ) {
        setIsTyping(true);
      }
    };

    const handleUserStopTyping = ({ conversationId, senderId }) => {
      const currentConvId = conversation?._id?.toString();
      const targetSenderId = senderId?.toString();

      if (
        conversationId?.toString() === currentConvId &&
        targetSenderId === recipientIdStr
      ) {
        setIsTyping(false);
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("userTyping", handleUserTyping);
    socket.on("userStopTyping", handleUserStopTyping);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("userTyping", handleUserTyping);
      socket.off("userStopTyping", handleUserStopTyping);
    };
  }, [socket, conversation?._id, recipientIdStr]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Socket typing emitters
  const handleTyping = () => {
    if (!socket || !conversation?._id || !recipientIdStr) return;
    const currentUserId = (user?._id || user?.id)?.toString();
    socket.emit("typing", {
      conversationId: conversation._id,
      receiverId: recipientIdStr,
      senderId: currentUserId,
    });
  };

  const handleStopTyping = () => {
    if (!socket || !conversation?._id || !recipientIdStr) return;
    const currentUserId = (user?._id || user?.id)?.toString();
    socket.emit("stopTyping", {
      conversationId: conversation._id,
      receiverId: recipientIdStr,
      senderId: currentUserId,
    });
  };

  // Send message API call
  const handleSendMessage = async (text, imageFile) => {
    try {
      const formData = new FormData();
      formData.append("conversationId", conversation?._id || "");
      formData.append("receiverId", recipientIdStr || "");
      if (text) formData.append("text", text);
      if (imageFile) formData.append("image", imageFile);

      const res = await api.post("/messages", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === res.data.message._id)) return prev;
          return [...prev, res.data.message];
        });
        return true;
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      return false;
    }
  };

  if (!recipient) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0b0f19] text-slate-400">
        <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 glow-primary">
          <ImageIcon size={36} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Welcome to Realtime Chat</h2>
        <p className="text-xs text-slate-400 text-center max-w-sm">
          Select a conversation from the sidebar or search for users to start chatting instantly.
        </p>
      </div>
    );
  }

  const currentUserIdStr = (user?._id || user?.id)?.toString();

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0f19] relative">
      {/* Header */}
      <div className="p-3.5 bg-[#151c2c]/80 border-b border-white/10 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400">
              {recipient.profilePic ? (
                <img
                  src={getFullImageUrl(recipient.profilePic)}
                  alt={recipient.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                recipient.name?.charAt(0).toUpperCase()
              )}
            </div>
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#151c2c] rounded-full"></span>
            )}
          </div>

          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-white">{recipient.name}</h3>
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              {isTyping ? (
                <span className="text-indigo-400 font-medium animate-pulse">
                  typing...
                </span>
              ) : isOnline ? (
                <span className="text-emerald-400 font-medium">Online</span>
              ) : (
                <span>Offline</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
            <p>No messages in this chat yet. Say hi 👋</p>
          </div>
        ) : (
          messages.map((msg) => {
            const senderIdStr = (msg.sender?._id || msg.sender?.id || msg.sender)?.toString();
            const isMe = senderIdStr === currentUserIdStr;

            return (
              <div
                key={msg._id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[75%] sm:max-w-[65%] rounded-2xl p-3 shadow-md ${
                    isMe
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-xs"
                      : "bg-[#151c2c] border border-white/10 text-slate-100 rounded-bl-xs"
                  }`}
                >
                  {msg.image && (
                    <div className="mb-2 rounded-xl overflow-hidden cursor-pointer">
                      <img
                        src={getFullImageUrl(msg.image)}
                        alt="Attachment"
                        onClick={() => setModalImage(getFullImageUrl(msg.image))}
                        className="max-h-60 w-full object-cover hover:opacity-90 transition-opacity"
                      />
                    </div>
                  )}

                  {msg.text && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>}

                  <div
                    className={`flex items-center gap-1.5 justify-end mt-1 text-[10px] ${
                      isMe ? "text-indigo-200" : "text-slate-400"
                    }`}
                  >
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {isMe && <CheckCheck size={13} className="text-indigo-300" />}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400">
            <div className="bg-[#151c2c] border border-white/10 px-3.5 py-2.5 rounded-2xl rounded-bl-xs flex items-center gap-1">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-typing-1"></span>
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-typing-2"></span>
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-typing-3"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        onStopTyping={handleStopTyping}
      />

      {/* Image Lightbox Modal */}
      {modalImage && (
        <div
          onClick={() => setModalImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={modalImage} alt="Expanded view" className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl" />
            <button
              onClick={() => setModalImage(null)}
              className="absolute -top-4 -right-4 bg-slate-800 text-white rounded-full p-2 hover:bg-slate-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
