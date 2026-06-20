import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

function DocumentEditorPage() {
  const { id } = useParams();

  const [document, setDocument] = useState(null);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    fetchDocument();
  }, [id]);

  useEffect(() => {
    if (!document) return;

    const timeout = setTimeout(() => {
      saveDocument();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [content]);

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

      <p className="text-sm text-slate-400 mt-2">
        {saving ? "Saving..." : "Saved"}
      </p>

      <div className="mt-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-[500px] rounded-xl bg-slate-900 border border-slate-800 p-4 outline-none"
        />
      </div>
    </div>
  );
}

export default DocumentEditorPage;
