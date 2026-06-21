import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import LoadingScreen from "../components/LoadingScreen";
import ConfirmModal from "../components/ConfirmModal";

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [workspaceToDelete, setWorkspaceToDelete] = useState(null);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const fetchWorkspaces = async () => {
    try {
      const res = await api.get("/workspaces");

      setWorkspaces(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");

        setUser(res.data.user);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
    fetchWorkspaces();
  }, []);

  const createWorkspace = async () => {
    try {
      await api.post("/workspaces", {
        name: workspaceName,
      });

      toast.success("Workspace created");

      setWorkspaceName("");

      fetchWorkspaces();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message || "Unable to create workspace",
      );
    }
  };

  const joinWorkspace = async () => {
    try {
      await api.post(`/workspaces/${workspaceId}/join`);

      toast.success("Joined workspace");

      setWorkspaceId("");

      fetchWorkspaces();
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Unable to join workspace");
    }
  };

  const copyWorkspaceId = async (id) => {
    try {
      await navigator.clipboard.writeText(id);

      toast.success("Workspace ID copied");
    } catch (error) {
      console.error(error);
    }
  };

  const deleteWorkspace = async () => {
    try {
      await api.delete(`/workspaces/${workspaceToDelete}`);

      toast.success("Workspace deleted");

      setWorkspaceToDelete(null);

      fetchWorkspaces();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message || "Unable to delete workspace",
      );
    }
  };

  if (!user) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="w-72 border-r border-slate-800 bg-slate-900 p-6 flex flex-col">
          <h1 className="text-3xl font-bold mb-8">CollabSpace</h1>

          <div className="flex-1 overflow-y-auto pr-2">
            <h2 className="text-sm uppercase tracking-wider text-slate-400 mb-4">
              Your Workspaces
            </h2>

            <div className="space-y-3">
              {workspaces.length === 0 ? (
                <p className="text-slate-500 text-sm">No workspaces yet</p>
              ) : (
                workspaces.map((workspace) => (
                  <div
                    key={workspace._id}
                    className="rounded-xl bg-slate-800 p-3"
                  >
                    <Link
                      to={`/workspace/${workspace._id}`}
                      className="font-medium block hover:text-indigo-400"
                    >
                      {workspace.name}
                    </Link>

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => copyWorkspaceId(workspace._id)}
                        className="text-xs px-3 py-1 rounded bg-slate-700 hover:bg-slate-600"
                      >
                        Copy ID
                      </button>

                      {workspace.owner?._id === user._id && (
                        <button
                          onClick={() => setWorkspaceToDelete(workspace._id)}
                          className="text-xs px-3 py-1 rounded bg-red-600 hover:bg-red-500"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 mt-6">
            <div className="font-semibold">{user.name}</div>

            <div className="text-sm text-slate-400">{user.email}</div>

            <button
              onClick={logout}
              className="mt-4 w-full rounded-xl bg-red-600 py-2 hover:bg-red-500 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-10">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user.name}</h1>

          <p className="text-slate-400 mb-10">
            Manage your workspaces and collaborate in real time.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Create Workspace */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6">
              <h2 className="text-2xl font-semibold mb-4">Create Workspace</h2>

              <input
                type="text"
                placeholder="Workspace Name"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none"
              />

              <button
                onClick={createWorkspace}
                className="mt-4 w-full rounded-xl bg-indigo-600 py-3 font-medium hover:bg-indigo-500 transition"
              >
                Create Workspace
              </button>
            </div>

            {/* Join Workspace */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6">
              <h2 className="text-2xl font-semibold mb-4">Join Workspace</h2>

              <input
                type="text"
                placeholder="Workspace ID"
                value={workspaceId}
                onChange={(e) => setWorkspaceId(e.target.value)}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none"
              />

              <button
                onClick={joinWorkspace}
                className="mt-4 w-full rounded-xl bg-emerald-600 py-3 font-medium hover:bg-emerald-500 transition"
              >
                Join Workspace
              </button>
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={!!workspaceToDelete}
        title="Delete Workspace"
        message="This action cannot be undone."
        onConfirm={deleteWorkspace}
        onCancel={() => setWorkspaceToDelete(null)}
      />
    </div>
  );
}

export default DashboardPage;
