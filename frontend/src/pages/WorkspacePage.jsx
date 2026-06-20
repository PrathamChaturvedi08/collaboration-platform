import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import socket from "../services/socket";

function WorkspacePage() {
  const { id } = useParams();

  const [messages, setMessages] = useState([]);

  const [content, setContent] = useState("");

  const [workspace, setWorkspace] = useState(null);

  const messagesEndRef = useRef(null);

  const sendMessage = async () => {
    if (!content.trim()) return;

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

  return (
    <div className="h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900 px-8 py-5">
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
            className="bg-slate-800 px-4 py-2 rounded-full text-sm"
          >
            {member.name}
          </div>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {messages.map((message) => (
          <div key={message._id}>
            <div className="text-sm text-slate-400 mb-1">
              {message.sender?.name}
            </div>

            <div className="inline-block max-w-xl rounded-2xl bg-slate-800 px-5 py-3">
              {message.content}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef}></div>
      </div>

      {/* Message Input */}
      <div className="border-t border-slate-800 bg-slate-900 p-5">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Type a message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            className="flex-1 rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none"
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
