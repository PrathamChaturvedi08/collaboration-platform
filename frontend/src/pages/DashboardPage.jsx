import { useEffect, useState } from "react";
import api from "../services/api";

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [workspaceName, setWorkspaceName] = useState("");

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
  }, []);

  const createWorkspace = async () => {
    try {
      await api.post("/workspaces", {
        name: workspaceName,
      });

      alert("Workspace created");

      setWorkspaceName("");
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

      <hr />

      <h2>Create Workspace</h2>

      <input
        type="text"
        placeholder="Workspace Name"
        value={workspaceName}
        onChange={(e) => setWorkspaceName(e.target.value)}
      />

      <button onClick={createWorkspace}>Create</button>
    </div>
  );
}

export default DashboardPage;
