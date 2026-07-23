import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import api, { getFullImageUrl } from "../services/api";
import { Search, LogOut, Settings, MessageSquare, Users, UserPlus } from "lucide-react";

const Sidebar = ({
  activeConversation,
  setActiveConversation,
  selectedUser,
  setSelectedUser,
  onOpenProfile,
  onSelectUserForChat
}) => {
  const { user, logout } = useAuth();
  const { socket, onlineUsers } = useSocket();

  const [activeTab, setActiveTab] = useState("chats"); // "chats" | "users"
  const [conversations, setConversations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const currentUserIdStr = (user?._id || user?.id)?.toString();

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await api.get("/conversations");
      if (res.data.success) {
        setConversations(res.data.conversations);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users?search=${encodeURIComponent(searchQuery)}`);
      if (res.data.success) {
        setAllUsers(res.data.users);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "chats") {
      fetchConversations();
    } else {
      fetchUsers();
    }
  }, [activeTab, searchQuery]);

  // Real-time conversation updates on socket newMessage
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = () => {
      fetchConversations();
    };

    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket]);

  // Check if a user is online
  const isOnline = (userId) => {
    if (!userId) return false;
    return onlineUsers.includes(userId.toString());
  };

  // Helper to extract receiver from conversation participants
  const getOtherParticipant = (participants) => {
    if (!participants || !currentUserIdStr) return null;
    return participants.find((p) => (p._id || p.id)?.toString() !== currentUserIdStr);
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 flex flex-col h-full bg-[#151c2c]/90 border-r border-white/10 select-none">
      {/* User Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/40">
        <div
          onClick={onOpenProfile}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-indigo-500/40 bg-slate-800 flex items-center justify-center font-bold text-indigo-400">
              {user?.profilePic ? (
                <img
                  src={getFullImageUrl(user.profilePic)}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.name?.charAt(0).toUpperCase()
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#151c2c] rounded-full"></span>
          </div>

          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
              {user?.name}
            </h3>
            <span className="text-xs text-slate-400 line-clamp-1">
              {user?.bio || "Online"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={onOpenProfile}
            title="Edit Profile"
            className="p-2 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Settings size={18} />
          </button>
          <button
            onClick={logout}
            title="Logout"
            className="p-2 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === "chats" ? "Search conversations..." : "Search users..."}
            className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 px-3">
        <button
          onClick={() => setActiveTab("chats")}
          className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
            activeTab === "chats"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <MessageSquare size={15} />
          Chats ({conversations.length})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
            activeTab === "users"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Users size={15} />
          People
        </button>
      </div>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/5">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : activeTab === "chats" ? (
          conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <MessageSquare size={32} className="mx-auto mb-3 opacity-40 text-indigo-400" />
              <p className="text-xs">No conversations yet.</p>
              <button
                onClick={() => setActiveTab("users")}
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:underline font-medium"
              >
                <UserPlus size={14} /> Start a new chat
              </button>
            </div>
          ) : (
            conversations.map((conv) => {
              const otherUser = getOtherParticipant(conv.participants);
              if (!otherUser) return null;
              const online = isOnline(otherUser._id || otherUser.id);
              const isActive = activeConversation?._id === conv._id;

              return (
                <div
                  key={conv._id}
                  onClick={() => setActiveConversation(conv)}
                  className={`p-3.5 flex items-center gap-3 cursor-pointer transition-all ${
                    isActive
                      ? "bg-indigo-600/20 border-l-4 border-indigo-500"
                      : "hover:bg-slate-800/50"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400">
                      {otherUser.profilePic ? (
                        <img
                          src={getFullImageUrl(otherUser.profilePic)}
                          alt={otherUser.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        otherUser.name?.charAt(0).toUpperCase()
                      )}
                    </div>
                    {online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#151c2c] rounded-full"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-white truncate">
                        {otherUser.name}
                      </h4>
                      {conv.updatedAt && (
                        <span className="text-[10px] text-slate-400">
                          {new Date(conv.updatedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      {conv.lastMessage?.text ? (
                        conv.lastMessage.text
                      ) : conv.lastMessage?.image ? (
                        "📷 Image Attachment"
                      ) : (
                        <span className="italic text-slate-500">No messages yet</span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })
          )
        ) : (
          // Users List Tab
          allUsers.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No users found matching query.
            </div>
          ) : (
            allUsers.map((u) => {
              const online = isOnline(u._id);
              return (
                <div
                  key={u._id}
                  onClick={() => onSelectUserForChat(u)}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400">
                        {u.profilePic ? (
                          <img
                            src={getFullImageUrl(u.profilePic)}
                            alt={u.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          u.name?.charAt(0).toUpperCase()
                        )}
                      </div>
                      {online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#151c2c] rounded-full"></span>
                      )}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <h4 className="text-xs font-semibold text-white truncate">
                        {u.name}
                      </h4>
                      <span className="text-[11px] text-slate-400 truncate">
                        {u.bio || u.email}
                      </span>
                    </div>
                  </div>

                  <button className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1">
                    <MessageSquare size={13} /> Chat
                  </button>
                </div>
              );
            })
          )
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
