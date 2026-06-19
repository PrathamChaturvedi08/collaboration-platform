import { useEffect, useState } from "react";
import api from "../services/api";

function DashboardPage() {
  const [user, setUser] = useState(null);

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

  if (!user) {
    return <h2>Loading...</h2>;
  }

  return (
    <div>
      <h1>Welcome, {user.name}</h1>

      <p>{user.email}</p>
    </div>
  );
}

export default DashboardPage;
