import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import ConfirmModal from "../components/ConfirmModal";
import LoadingScreen from "../components/LoadingScreen";
import socket from "../services/socket";

function DocumentsPage() {
  const { id } = useParams();

  const [documents, setDocuments] = useState([]);
  const [title, setTitle] = useState("");

  const [currentUser, setCurrentUser] = useState(null);

  const [editingDocumentId, setEditingDocumentId] = useState(null);

  const [newTitle, setNewTitle] = useState("");

  const [workspace, setWorkspace] = useState(null);

  const [documentToDelete, setDocumentToDelete] = useState(null);

  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/documents/workspace/${id}`);

      setDocuments(res.data);
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Unable to load documents");
    } finally {
      setLoading(false);
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

  useEffect(() => {
    socket.emit("join-workspace", id);

    socket.on("receive-document-create", () => {
      fetchDocuments();
    });

    socket.on("receive-document-rename", () => {
      fetchDocuments();
    });

    socket.on("receive-document-delete", () => {
      fetchDocuments();
    });

    return () => {
      socket.off("receive-document-create");
      socket.off("receive-document-rename");
      socket.off("receive-document-delete");
    };
  }, [id]);

  const createDocument = async () => {
    if (!title.trim()) {
      toast.error("Document title is required");
      return;
    }

    try {
      const res = await api.post("/documents", {
        title,
        workspaceId: id,
      });

      socket.emit("document-created", {
        workspaceId: id,
        document: res.data,
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
    if (!newTitle.trim()) {
      toast.error("Document title is required");
      return;
    }
    try {
      const res = await api.put(`/documents/${documentId}/rename`, {
        title: newTitle,
      });

      socket.emit("document-renamed", {
        workspaceId: id,
        document: res.data,
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

  const deleteDocument = async () => {
    try {
      const deletedId = documentToDelete;

      await api.delete(`/documents/${documentToDelete}`);

      socket.emit("document-deleted", {
        workspaceId: id,
        documentId: deletedId,
      });

      toast.success("Document deleted");

      setDocumentToDelete(null);

      fetchDocuments();
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Unable to delete document");
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

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
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              createDocument();
            }
          }}
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
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        renameDocument(document._id);
                      }
                    }}
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
                          onClick={() => setDocumentToDelete(document._id)}
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
      <ConfirmModal
        isOpen={!!documentToDelete}
        title="Delete Document"
        message="This action cannot be undone."
        confirmText="Delete"
        onConfirm={deleteDocument}
        onCancel={() => setDocumentToDelete(null)}
      />
    </div>
  );
}

export default DocumentsPage;
