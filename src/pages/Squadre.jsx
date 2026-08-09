import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

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
    </div>
  );
}
