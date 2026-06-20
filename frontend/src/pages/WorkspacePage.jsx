import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import socket from "../services/socket";
import toast from "react-hot-toast";

function WorkspacePage() {
  const { id } = useParams();

  const [messages, setMessages] = useState([]);

  const [content, setContent] = useState("");

  const [workspace, setWorkspace] = useState(null);

  const messagesEndRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);

  const [onlineUsers, setOnlineUsers] = useState([]);

  const [typingUser, setTypingUser] = useState("");

  const [editingMessageId, setEditingMessageId] = useState(null);

  const [editContent, setEditContent] = useState("");

  const sendMessage = async () => {
    if (!content.trim()) return;

    if (content.length > 1000) {
      toast.error("Message too long");
      return;
    }

    try {
      await api.post(`/messages/${id}`, {
        content,
      });

      setContent("");
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Unable to send message");
    }
  };

  const updateMessage = async (messageId) => {
    try {
      const res = await api.put(`/messages/${messageId}`, {
        content: editContent,
      });

      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? res.data : msg)),
      );

      socket.emit("message-edited", {
        workspaceId: id,
        message: res.data,
      });

      setEditingMessageId(null);

      setEditContent("");
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Unable to update message");
    }
  };

  const deleteMessage = async (messageId) => {
    const confirmDelete = window.confirm("Delete this message?");

    if (!confirmDelete) return;

    try {
      await api.delete(`/messages/${messageId}`);

      toast.success("Message deleted");

      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));

      socket.emit("message-deleted", {
        workspaceId: id,
        messageId,
      });
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Unable to delete message");
    }
  };

  const fetchWorkspace = async () => {
    try {
      const res = await api.get(`/workspaces/${id}`);

      setWorkspace(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get("/auth/me");

      setCurrentUser(res.data.user);

      socket.emit("user-online", res.data.user._id);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${id}`);

        setMessages(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchMessages();
    fetchWorkspace();
    fetchCurrentUser();

    socket.emit("join-workspace", id);

    socket.on("new-message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("receive-message-edit", (updatedMessage) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === updatedMessage._id ? updatedMessage : msg,
        ),
      );
    });

    socket.on("receive-message-delete", (messageId) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    });

    socket.on("online-users", (users) => {
      setOnlineUsers(users);
    });

    socket.on("user-typing", (user) => {
      setTypingUser(user);

      setTimeout(() => {
        setTypingUser("");
      }, 1500);
    });

    return () => {
      socket.off("new-message");
      socket.off("receive-message-edit");
      socket.off("receive-message-delete");
      socket.off("online-users");
      socket.off("user-typing");
    };
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  if (!workspace) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-800 bg-gradient-to-r from-slate-900 to-indigo-950 px-8 py-5">
        <Link
          to="/"
          className="text-slate-400 hover:text-white mb-3 inline-block"
        >
          ← Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold">{workspace?.name}</h1>

        <div className="mt-2 flex items-center gap-6 flex-wrap">
          <span className="text-slate-400 text-sm">
            Owner: {workspace?.owner?.name}
          </span>

          <span className="text-slate-400 text-sm">
            Members: {workspace?.members?.length}
          </span>

          <Link
            to={`/workspace/${id}/documents`}
            className="bg-indigo-600 px-4 py-2 rounded-lg text-white hover:bg-indigo-500 transition"
          >
            Documents
          </Link>
        </div>
      </div>

      {/* Members */}
      <div className="px-8 py-4 border-b border-slate-800 flex gap-3 flex-wrap">
        {workspace?.members?.map((member) => (
          <div
            key={member._id}
            className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-full text-sm hover:bg-slate-700 transition flex items-center gap-2"
          >
            <div
              className={`h-2.5 w-2.5 rounded-full ${
                onlineUsers.includes(member._id)
                  ? "bg-green-500"
                  : "bg-slate-500"
              }`}
            />

            {member.name}
          </div>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500">
            <div className="text-center">
              <h3 className="text-xl font-semibold">No messages yet</h3>

              <p className="mt-2">Start the conversation 🚀</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isMine = currentUser?._id === message.sender?._id;

            return (
              <div
                key={message._id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex gap-3 max-w-xl ${
                    isMine ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className="h-10 w-10 rounded-full bg-slate-700 flex
                       items-center justify-center font-semibold shrink-0"
                  >
                    {message.sender?.name?.[0]}
                  </div>

                  <div>
                    <div
                      className={`text-xs mb-1 text-slate-400 ${
                        isMine ? "text-right" : "text-left"
                      }`}
                    >
                      {message.sender?.name}
                    </div>

                    <div
                      className={`rounded-2xl px-5 py-3 ${
                        isMine ? "bg-indigo-600" : "bg-slate-800"
                      }`}
                    >
                      {editingMessageId === message._id ? (
                        <div className="space-y-2">
                          <input
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full rounded bg-slate-900 px-2 py-1"
                          />

                          <div className="flex gap-2">
                            <button
                              onClick={() => updateMessage(message._id)}
                              className="text-xs bg-green-600 px-2 py-1 rounded"
                            >
                              Save
                            </button>

                            <button
                              onClick={() => {
                                setEditingMessageId(null);
                                setEditContent("");
                              }}
                              className="text-xs bg-red-600 px-2 py-1 rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>{message.content}</div>
                      )}

                      {isMine && editingMessageId !== message._id && (
                        <div className="mt-2 flex gap-3">
                          <button
                            onClick={() => {
                              setEditingMessageId(message._id);

                              setEditContent(message.content);
                            }}
                            className="text-xs text-indigo-300 hover:text-indigo-200"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => deleteMessage(message._id)}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      )}

                      <div className="mt-2 text-xs opacity-70">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef}></div>
      </div>

      {typingUser && (
        <div className="px-6 py-2 text-sm text-slate-400 italic">
          {typingUser} is typing...
        </div>
      )}

      {/* Message Input */}
      <div className="border-t border-slate-800 bg-slate-900 p-5">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Message the workspace..."
            value={content}
            onChange={(e) => {
              setContent(e.target.value);

              socket.emit("typing", {
                workspaceId: id,
                user: currentUser?.name,
              });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            className="flex-1 rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-indigo-500"
          />

          <button
            onClick={sendMessage}
            className="rounded-xl bg-indigo-600 px-6 py-3 font-medium hover:bg-indigo-500 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default WorkspacePage;
