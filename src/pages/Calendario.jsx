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
  marginBottom: "20px"
};

const backBtnHover = {
  background: "#ccc",
};

export default function Calendario() {
  const [matches, setMatches] = useState([]);
  const [squads, setSquads] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: matchesData } = await supabase
      .from("matches")
      .select("*")
      .order("giornata", { ascending: true });

    const { data: squadsData } = await supabase
      .from("squads")
      .select("*");

    setMatches(matchesData || []);
    setSquads(squadsData || []);
  }

  const squadName = (id) => {
    const s = squads.find((sq) => sq.id === id);
    return s ? s.name : `Squadra ${id}`;
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Calendario Champions 2026</h1>

      {/* TORNA ALLA HOME - IN ALTO */}
      <Link
        to="/"
        style={backBtn}
        onMouseEnter={(e) => Object.assign(e.currentTarget.style, backBtnHover)}
        onMouseLeave={(e) => Object.assign(e.currentTarget.style, backBtn)}
      >
        ⬅ Torna alla Home
      </Link>

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
