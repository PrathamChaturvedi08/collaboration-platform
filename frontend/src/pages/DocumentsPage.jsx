import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

function DocumentsPage() {
  const { id } = useParams();

  const [documents, setDocuments] = useState([]);
  const [title, setTitle] = useState("");

  const [currentUser, setCurrentUser] = useState(null);

  const [editingDocumentId, setEditingDocumentId] = useState(null);

  const [newTitle, setNewTitle] = useState("");

  const [workspace, setWorkspace] = useState(null);

  const fetchDocuments = async () => {
    try {
      const res = await api.get(`/documents/workspace/${id}`);

      setDocuments(res.data);
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Unable to load documents");
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

  const fetchWorkspace = async () => {
    try {
      const res = await api.get(`/workspaces/${id}`);

      setWorkspace(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchCurrentUser();
    fetchWorkspace();
  }, []);

  const createDocument = async () => {
    if (!title.trim()) return;

    try {
      await api.post("/documents", {
        title,
        workspaceId: id,
      });

      toast.success("Document created");

      setTitle("");

      fetchDocuments();
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Unable to create document");
    }
  };

  const renameDocument = async (documentId) => {
    try {
      await api.put(`/documents/${documentId}/rename`, {
        title: newTitle,
      });

      toast.success("Document renamed");

      setEditingDocumentId(null);

      setNewTitle("");

      fetchDocuments();
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Unable to rename document");
    }
  };

  const deleteDocument = async (documentId) => {
    const confirmDelete = window.confirm("Delete this document?");

    if (!confirmDelete) return;

    try {
      await api.delete(`/documents/${documentId}`);

      toast.success("Document deleted");

      fetchDocuments();
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Unable to delete document");
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
        {documents.length === 0 ? (
          <div className="text-center text-slate-500 py-12">
            No documents yet
          </div>
        ) : (
          documents.map((document) => (
            <div
              key={document._id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5"
            >
              {editingDocumentId === document._id ? (
                <div className="flex gap-2">
                  <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="flex-1 rounded bg-slate-800 px-3 py-2"
                  />

                  <button
                    onClick={() => renameDocument(document._id)}
                    className="bg-green-600 px-3 rounded"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="font-semibold text-lg">{document.title}</h3>

                  <p className="text-sm text-slate-400 mt-1">
                    Created by {document.createdBy?.name}
                  </p>

                  <p className="text-xs text-slate-500 mt-2">
                    Updated {new Date(document.updatedAt).toLocaleString()}
                  </p>

                  <div className="flex gap-3 mt-4">
                    <Link
                      to={`/documents/${document._id}`}
                      className="bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-500"
                    >
                      Open
                    </Link>

                    {workspace?.owner?._id === currentUser?._id && (
                      <>
                        <button
                          onClick={() => {
                            setEditingDocumentId(document._id);

                            setNewTitle(document.title);
                          }}
                          className="bg-slate-700 px-4 py-2 rounded-lg"
                        >
                          Rename
                        </button>

                        <button
                          onClick={() => deleteDocument(document._id)}
                          className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-500"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DocumentsPage;
