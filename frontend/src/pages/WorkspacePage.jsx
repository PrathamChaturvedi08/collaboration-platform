import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import socket from "../services/socket";

function WorkspacePage() {
  const { id } = useParams();

  const [messages, setMessages] = useState([]);

  const [content, setContent] = useState("");

  const [workspace, setWorkspace] = useState(null);

  const sendMessage = async () => {
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

  return (
    <div>
      <h1>{workspace?.name}</h1>

      <p>Owner: {workspace?.owner?.name}</p>

      <h3>Members</h3>

      {workspace?.members?.map((member) => (
        <div key={member._id}>{member.name}</div>
      ))}

      <hr />

      <h2>Messages</h2>

      <input
        type="text"
        placeholder="Type a message"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <button onClick={sendMessage}>Send</button>

      <hr />

      {messages.map((message) => (
        <div key={message._id}>
          <strong>{message.sender?.name}</strong>

          {" : "}

          {message.content}
        </div>
      ))}
    </div>
  );
}

export default WorkspacePage;
