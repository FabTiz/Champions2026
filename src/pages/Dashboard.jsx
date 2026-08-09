import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [turnCount, setTurnCount] = useState(0);
  const [latestTurns, setLatestTurns] = useState([]);

  // --- STILI ---
  const cardStyle = {
    flex: "1",
    minWidth: "280px",
    padding: "20px",
    borderRadius: "12px",
    background: "#ffffff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
    textAlign: "center",
  };

  const cardHover = {
    transform: "scale(1.03)",
    boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
  };

  const containerStyle = {
    display: "flex",
    gap: "30px",
    marginTop: "40px",
    justifyContent: "center",
    flexWrap: "wrap",
  };

  const backBtn = {
    padding: "10px 20px",
    background: "#007bff",
    color: "white",
    borderRadius: "8px",
    textDecoration: "none",
    display: "inline-block",
    marginTop: "40px",
    transition: "background 0.2s",
  };

  const backBtnHover = {
    background: "#0056b3",
  };

  // --- FETCH DATI ---
  useEffect(() => {
    async function fetchData() {
      // Numero totale turni
      const { count } = await supabase
        .from("league_turns")
        .select("*", { count: "exact", head: true });

      setTurnCount(count || 0);

      // Ultimi 5 turni
      const { data: latest } = await supabase
        .from("league_turns")
        .select("*")
        .order("id", { ascending: false })
        .limit(5);

      setLatestTurns(latest || []);
    }

    fetchData();
  }, []);

  // --- RENDER ---
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>
        Dashboard
      </h1>

      <div style={containerStyle}>
        
        {/* STATISTICHE GENERALI */}
        <div
          style={cardStyle}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
        >
          <h2>Statistiche Generali</h2>
          <p><strong>Turni inseriti:</strong> {turnCount}</p>
        </div>

        {/* ULTIMI TURNI */}
        <div
          style={cardStyle}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
        >
          <h2>Ultimi Turni</h2>

          {latestTurns.length === 0 ? (
            <p>Nessun turno inserito.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {latestTurns.map((t) => (
                <li key={t.id} style={{ marginBottom: "10px" }}>
                  <strong>Turno {t.turn}</strong> — Casa {t.home_score} | Trasferta {t.away_score}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* PROSSIME PARTITE */}
        <div
          style={cardStyle}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
        >
          <h2>Prossime Partite</h2>
          <p>In arrivo…</p>
        </div>
      </div>

      {/* TORNA ALLA HOME */}
      <Link
        to="/"
        style={backBtn}
        onMouseEnter={(e) => Object.assign(e.currentTarget.style, backBtnHover)}
        onMouseLeave={(e) => Object.assign(e.currentTarget.style, backBtn)}
      >
        Torna alla Home
      </Link>
    </div>
  );
}
