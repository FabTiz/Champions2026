import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Calendario() {
  const [matches, setMatches] = useState([]);
  const [squads, setSquads] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    // Carica partite
    const { data: matchesData } = await supabase
      .from("matches")
      .select("*")
      .order("giornata", { ascending: true });

    // Carica squadre
    const { data: squadsData } = await supabase
      .from("squads")
      .select("*");

    setMatches(matchesData || []);
    setSquads(squadsData || []);
  }

  // Mappa ID → Nome squadra
  const squadName = (id) => {
    const s = squads.find((sq) => sq.id === id);
    return s ? s.name : `Squadra ${id}`;
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Calendario Champions 2026</h1>

      {[...Array(21)].map((_, index) => {
        const giornata = index + 1;
        const partite = matches.filter(m => m.giornata === giornata);

        return (
          <div key={giornata} style={{ marginBottom: "25px" }}>
            <h2>{giornata}ª Giornata</h2>

            {partite.length === 0 ? (
              <p>Nessuna partita trovata.</p>
            ) : (
              <ul>
                {partite.map(match => (
                  <li key={match.id}>
                    {squadName(match.home_team)} vs {squadName(match.away_team)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
