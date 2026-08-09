import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

const backBtn = {
  display: "inline-block",
  padding: "10px 15px",
  background: "#ddd",
  borderRadius: "8px",
  textDecoration: "none",
  fontSize: "18px",
  color: "#000",
  transition: "0.2s",
  marginTop: "20px",
};

const backBtnHover = {
  background: "#ccc",
};

export default function Squadre() {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    async function loadTeams() {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .order("id", { ascending: true });

      if (!error) {
        setTeams(data);
      }
    }

    loadTeams();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Squadre</h1>

      {teams.length === 0 && <p>Nessuna squadra trovata...</p>}

      <ul>
        {teams.map((team) => (
          <li key={team.id}>{team.name}</li>
        ))}
      </ul>

      {/* TORNA ALLA HOME */}
      <Link
        to="/"
        style={backBtn}
        onMouseEnter={(e) => Object.assign(e.currentTarget.style, backBtnHover)}
        onMouseLeave={(e) => Object.assign(e.currentTarget.style, backBtn)}
      >
        ⬅ Torna alla Home
      </Link>
    </div>
  );
}
