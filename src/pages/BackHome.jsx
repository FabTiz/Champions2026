import { Link } from "react-router-dom";

export default function BackHome() {
  return (
    <div style={{ marginTop: "20px" }}>
      <Link to="/" style={{ textDecoration: "none", fontSize: "18px" }}>
        ⬅ Torna alla Home
      </Link>
    </div>
  );
}
