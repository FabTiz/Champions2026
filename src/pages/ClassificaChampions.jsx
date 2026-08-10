import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

const TEAM_NAMES = [
  "Iron Team",
  "PanzaSoccer",
  "Arancia Meccanica",
  "FC Chicago Hasbulls",
  "TrapoTeam",
  "SAM PDOOR",
  "ASD Tragedia Totale",
  "Alcamo United",
];

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

export default function ClassificaChampions() {
  const [turns, setTurns] = useState([]);

  useEffect(() => {
    loadClassifica();
  }, []);

  async function loadClassifica() {
    const { data, error } = await supabase
      .from("league_turns")
      .select("*")
      .order("turn_number", { ascending: true });

    if (error) {
      console.error("Errore nel caricamento classifica:", error);
      return;
    }

    setTurns(data || []);
  }

  const classifica = useMemo(() => {
    return TEAM_NAMES.map((name, index) => {
      const teamId = index + 1;
      const rows = turns.filter(row => Number(row.team_home_id) === teamId);
      const punti = rows.reduce((acc, row) => acc + Number(row.total_home || 0), 0);
      const turniSalvati = rows.length;

      return {
        id: teamId,
        squad_name: name,
        punti,
        turniSalvati,
        media: turniSalvati ? (punti / turniSalvati).toFixed(2) : "0.00",
      };
    }).sort((a, b) => {
      if (b.punti !== a.punti) return b.punti - a.punti;
      if (b.turniSalvati !== a.turniSalvati) return b.turniSalvati - a.turniSalvati;
      return a.squad_name.localeCompare(b.squad_name);
    });
  }, [turns]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Classifica Champions League Comp</h1>

      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", marginTop: 20, width: "100%" }}>
        <thead>
          <tr>
            <th>Pos.</th>
            <th>Squadra</th>
            <th>Turni salvati</th>
            <th>Punti Champions</th>
            <th>Media turno</th>
          </tr>
        </thead>
        <tbody>
          {classifica.map((row, index) => (
            <tr key={row.id}>
              <td>{index + 1}</td>
              <td>{row.squad_name}</td>
              <td>{row.turniSalvati}</td>
              <td>{row.punti}</td>
              <td>{row.media}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {turns.length === 0 && <p style={{ marginTop: 12 }}>Nessun turno salvato su Supabase: appena salvi un turno, qui comparirà la classifica aggiornata.</p>}

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
