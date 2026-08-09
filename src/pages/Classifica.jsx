import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const TURNS = [
  { id: 1, giornate: [1, 2, 3] },
  { id: 2, giornate: [4, 5, 6] },
  { id: 3, giornate: [7, 8, 9] },
  { id: 4, giornate: [10, 11, 12] },
  { id: 5, giornate: [13, 14, 15] },
  { id: 6, giornate: [16, 17, 18] },
  { id: 7, giornate: [19, 20, 21] },
];

export default function ClassificaChampions() {
  const [squads, setSquads] = useState([]);
  const [risultati, setRisultati] = useState([]);
  const [missioni, setMissioni] = useState([]);
  const [classifica, setClassifica] = useState([]);

  useEffect(() => {
    async function loadData() {
      const { data: sq } = await supabase.from("squads").select("*");
      const { data: rs } = await supabase.from("risultati").select("*");
      const { data: ms } = await supabase.from("missioni_completate").select("*");

      setSquads(sq || []);
      setRisultati(rs || []);
      setMissioni(ms || []);
    }

    loadData();
  }, []);

  useEffect(() => {
    if (squads.length === 0 || risultati.length === 0) return;

    const classificaTemp = squads.map((squad) => {
      const risultatiSquadra = risultati.filter((r) => r.squad_id === squad.id);

      const fantapuntiTotali = risultatiSquadra.reduce(
        (acc, r) => acc + Number(r.fantapunti),
        0
      );

      const diffFantapunti = risultatiSquadra.reduce(
        (acc, r) => acc + (r.fantapunti_fatti || 0) - (r.fantapunti_subiti || 0),
        0
      );

      let puntiChampions = 0;

      // Calcolo punti dei turni
      for (const turno of TURNS) {
        const giornateTurno = turno.giornate;

        const rsTurno = risultatiSquadra.filter((r) =>
          giornateTurno.includes(r.giornata)
        );

        if (rsTurno.length !== 3) continue;

        const totale = rsTurno.reduce((acc, r) => acc + Number(r.fantapunti), 0);

        // Trova avversario del turno
        const avversariTurno = risultati.filter(
          (r) =>
            giornateTurno.includes(r.giornata) &&
            r.squad_id !== squad.id &&
            r.home_team === squad.id || r.away_team === squad.id
        );

        const totaleAvversario = avversariTurno.reduce(
          (acc, r) => acc + Number(r.fantapunti),
          0
        );

        const scarto = totale - totaleAvversario;

        if (scarto >= 6) puntiChampions += 3;
        else if (Math.abs(scarto) < 6) puntiChampions += 1;

        // Missioni
        const missioneTurno = missioni.find(
          (m) => m.turno_id === turno.id && m.squad_id === squad.id
        );

        if (missioneTurno) {
          if (missioneTurno.comune) puntiChampions += 0.5;
          if (missioneTurno.personale) puntiChampions += 1;
          if (missioneTurno.leggendaria) puntiChampions += 1;
        }
      }

      return {
        squad: squad.name,
        puntiChampions,
        fantapuntiTotali,
        diffFantapunti,
      };
    });

    // Ordinamento secondo regolamento
    classificaTemp.sort((a, b) => {
      if (b.puntiChampions !== a.puntiChampions)
        return b.puntiChampions - a.puntiChampions;

      if (b.fantapuntiTotali !== a.fantapuntiTotali)
        return b.fantapuntiTotali - a.fantapuntiTotali;

      return b.diffFantapunti - a.diffFantapunti;
    });

    setClassifica(classificaTemp);
  }, [squads, risultati, missioni]);

  return (
    <div style={{ padding: "30px" }}>
      <h1>Classifica Champions League Comp</h1>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px",
        }}
      >
        <thead>
          <tr>
            <th style={th}>Squadra</th>
            <th style={th}>Punti Champions</th>
            <th style={th}>Fantapunti Totali</th>
            <th style={th}>Differenza Fantapunti</th>
          </tr>
        </thead>

        <tbody>
          {classifica.map((row, index) => (
            <tr key={index}>
              <td style={td}>{row.squad}</td>
              <td style={td}>{row.puntiChampions}</td>
              <td style={td}>{row.fantapuntiTotali}</td>
              <td style={td}>{row.diffFantapunti}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th = {
  borderBottom: "2px solid #ccc",
  padding: "10px",
  textAlign: "left",
};

const td = {
  borderBottom: "1px solid #eee",
  padding: "10px",
};
