import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function DashboardSquadre() {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    async function loadTeams() {
      const { data } = await supabase
        .from("teams")
        .select("*")
        .order("id", { ascending: true });

      setTeams(data || []);
    }

    loadTeams();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard Squadre</h1>

      <p><strong>Totale squadre:</strong> {teams.length}</p>

      <ul>
        {teams.map((team) => (
          <li key={team.id}>{team.name}</li>
        ))}
      </ul>
    </div>
  );
}
