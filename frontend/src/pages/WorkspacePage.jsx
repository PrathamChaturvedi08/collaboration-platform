import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import socket from "../services/socket";

function WorkspacePage() {
  const { id } = useParams();

  const [messages, setMessages] = useState([]);

  const [content, setContent] = useState("");

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
      <h1>Workspace Chat</h1>

      <p>Workspace ID: {id}</p>

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
