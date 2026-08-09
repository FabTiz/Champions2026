import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Calendario() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    async function loadMatches() {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("giornata", { ascending: true });

      if (error) {
        console.error("Errore nel caricamento delle partite:", error);
        return;
      }

      setMatches(data);
    }

    loadMatches();
  }, []);

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
                    {match.home_team} vs {match.away_team}
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
