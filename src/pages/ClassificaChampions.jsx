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

export default function ClassificaChampions() {
  const [classifica, setClassifica] = useState([]);

  useEffect(() => {
    loadClassifica();
  }, []);

  async function loadClassifica() {
    const { data, error } = await supabase
      .from("classifica_champions")
      .select("*")
      .order("punti", { ascending: false });

    if (error) {
      console.error("Errore nel caricamento classifica:", error);
      return;
    }

    setClassifica(data || []);
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Classifica Champions League Comp</h1>

      {classifica.length === 0 ? (
        <p>Nessun dato disponibile.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Squadra</th>
              <th>Punti</th>
              <th>Gol</th>
              <th>Assist</th>
              <th>Bonus</th>
            </tr>
          </thead>
          <tbody>
            {classifica.map((row) => (
              <tr key={row.id}>
                <td>{row.squad_name}</td>
                <td>{row.punti}</td>
                <td>{row.gol}</td>
                <td>{row.assist}</td>
                <td>{row.bonus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

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
