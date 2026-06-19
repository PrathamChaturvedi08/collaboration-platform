import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceId, setWorkspaceId] = useState("");
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

      alert("Workspace created");

      setWorkspaceName("");

      fetchWorkspaces();
    } catch (error) {
      console.error(error);
    }
  };

  const joinWorkspace = async () => {
    try {
      await api.post(`/workspaces/${workspaceId}/join`);

      alert("Joined workspace");

      setWorkspaceId("");

      fetchWorkspaces();
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) {
    return <h2>Loading...</h2>;
  }

  return (
    <div>
      <h1>Welcome, {user.name}</h1>

      <p>{user.email}</p>

      <button onClick={logout}>Logout</button>

      <hr />

      <h2>Create Workspace</h2>

      <input
        type="text"
        placeholder="Workspace Name"
        value={workspaceName}
        onChange={(e) => setWorkspaceName(e.target.value)}
      />

      <button onClick={createWorkspace}>Create</button>

      <hr />

      <h2>Join Workspace</h2>

      <input
        type="text"
        placeholder="Workspace ID"
        value={workspaceId}
        onChange={(e) => setWorkspaceId(e.target.value)}
      />

      <button onClick={joinWorkspace}>Join</button>

      <h2>Your Workspaces</h2>

      {workspaces.map((workspace) => (
        <div key={workspace._id}>
          <Link to={`/workspace/${workspace._id}`}>{workspace.name}</Link>
        </div>
      ))}
    </div>
  );
}

export default DashboardPage;
