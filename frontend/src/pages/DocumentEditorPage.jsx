import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import socket from "../services/socket";

function DocumentEditorPage() {
  const { id } = useParams();

  const [document, setDocument] = useState(null);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const [activeEditors, setActiveEditors] = useState([]);

  const [currentUser, setCurrentUser] = useState(null);

  const fetchDocument = async () => {
    try {
      const res = await api.get(`/documents/${id}`);

      setDocument(res.data);

      setContent(res.data.content);
    } catch (error) {
      console.error(error);
    }
  };

  const saveDocument = async () => {
    try {
      setSaving(true);

      await api.put(`/documents/${id}`, {
        content,
      });

      setSaving(false);
    } catch (error) {
      console.error(error);

      setSaving(false);
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
    const initialize = async () => {
      await fetchDocument();

      const res = await api.get("/auth/me");

      setCurrentUser(res.data.user);

      socket.emit("join-document", {
        documentId: id,
        user: res.data.user,
      });
    };

    initialize();

    return () => {
      socket.emit("leave-document", id);
    };
  }, [id]);

  useEffect(() => {
    if (!document) return;

    const timeout = setTimeout(() => {
      saveDocument();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [content]);

  useEffect(() => {
    socket.on("receive-document-change", (newContent) => {
      setContent(newContent);
    });

    socket.on("active-editors", (editors) => {
      setActiveEditors(editors);
    });

    return () => {
      socket.off("receive-document-change");
      socket.off("active-editors");
    };
  }, []);

  if (!document) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <Link
        to={`/workspace/${document.workspace}/documents`}
        className="text-slate-400 hover:text-white"
      >
        ← Back to Documents
      </Link>

      <h1 className="text-4xl font-bold mt-4">{document.title}</h1>

      <div className="mt-3 text-slate-400 space-y-1">
        <p>Created By: {document.createdBy?.name}</p>

        <p>Last Updated: {new Date(document.updatedAt).toLocaleString()}</p>
      </div>

      <p className="text-sm text-slate-400 mt-2">
        {saving ? "Saving..." : "Saved"}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {activeEditors.map((editor) => (
          <div
            key={editor.socketId}
            className="bg-emerald-700 px-3 py-1 rounded-full text-sm"
          >
            🟢 {editor.name}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);

            socket.emit("document-change", {
              documentId: id,
              content: e.target.value,
            });
          }}
          className="w-full h-[500px] rounded-xl bg-slate-900 border border-slate-800 p-4 outline-none"
        />
      </div>
    </div>
  );
}

export default DocumentEditorPage;
