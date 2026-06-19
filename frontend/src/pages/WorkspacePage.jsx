import { useParams } from "react-router-dom";

function WorkspacePage() {
  const { id } = useParams();

  return (
    <div>
      <h1>Workspace Chat</h1>

      <p>Workspace ID: {id}</p>
    </div>
  );
}

export default WorkspacePage;
