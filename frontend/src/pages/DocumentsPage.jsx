import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

function DocumentsPage() {
  const { id } = useParams();

  const [documents, setDocuments] = useState([]);
  const [title, setTitle] = useState("");

  const fetchDocuments = async () => {
    try {
      const res = await api.get(`/documents/workspace/${id}`);

      setDocuments(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const createDocument = async () => {
    if (!title.trim()) return;

    try {
      await api.post("/documents", {
        title,
        workspaceId: id,
      });

      setTitle("");

      fetchDocuments();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <Link to={`/workspace/${id}`} className="text-slate-400 hover:text-white">
        ← Back to Workspace
      </Link>

      <h1 className="text-4xl font-bold mt-4">Documents</h1>

      <div className="mt-6 flex gap-3">
        <input
          type="text"
          placeholder="Document title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 rounded-xl bg-slate-900 border border-slate-800 px-4 py-3"
        />

        <button
          onClick={createDocument}
          className="bg-indigo-600 px-5 py-3 rounded-xl hover:bg-indigo-500"
        >
          Create
        </button>
      </div>

      <div className="mt-8 space-y-4">
        {documents.map((document) => (
          <Link
            key={document._id}
            to={`/documents/${document._id}`}
            className="block bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-indigo-500"
          >
            <h3 className="font-semibold">{document.title}</h3>

            <p className="text-sm text-slate-400">
              Created by {document.createdBy?.name}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default DocumentsPage;
