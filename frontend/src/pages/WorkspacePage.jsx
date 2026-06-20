import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import socket from "../services/socket";

function WorkspacePage() {
  const { id } = useParams();

  const [messages, setMessages] = useState([]);

  const [content, setContent] = useState("");

  const [workspace, setWorkspace] = useState(null);

  const messagesEndRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);

  const sendMessage = async () => {
    if (!content.trim()) return;

    if (content.length > 1000) {
      alert("Message too long");
      return;
    }

    try {
      await api.post(`/messages/${id}`, {
        content,
      });

      setContent("");
    } catch (error) {
      console.error(error);
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

    return () => {
      socket.off("new-message");
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

        <div className="mt-2 flex gap-6 text-slate-400 text-sm">
          <span>Owner: {workspace?.owner?.name}</span>

          <span>Members: {workspace?.members?.length}</span>
        </div>
      </div>

      {/* Members */}
      <div className="px-8 py-4 border-b border-slate-800 flex gap-3 flex-wrap">
        {workspace?.members?.map((member) => (
          <div
            key={member._id}
            className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-full text-sm hover:bg-slate-700 transition"
          >
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
                      <div>{message.content}</div>

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

      {/* Message Input */}
      <div className="border-t border-slate-800 bg-slate-900 p-5">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Message the workspace..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
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
