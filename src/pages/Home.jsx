import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Champions League Comp</h1>

      <div style={{ display: "flex", gap: "20px", marginTop: "30px" }}>
        <Link to="/dashboard">
          <button>Dashboard</button>
        </Link>

        <Link to="/squadre">
          <button>Squadre</button>
        </Link>

        <Link to="/calendario">
          <button>Calendario</button>
        </Link>
      </div>
    </div>
  );
}
