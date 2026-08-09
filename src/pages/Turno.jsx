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
  margin: "20px 0"
};

const backBtnHover = { background: "#ccc" };

// Turni → 3 giornate ciascuno
const TURNS = [
  { id: 1, giornate: [1, 2, 3] },
  { id: 2, giornate: [4, 5, 6] },
  { id: 3, giornate: [7, 8, 9] },
  { id: 4, giornate: [10, 11, 12] },
  { id: 5, giornate: [13, 14, 15] },
  { id: 6, giornate: [16, 17, 18] },
  { id: 7, giornate: [19, 20, 21] },
];

const PERSONAL_MISSIONS = [
  "Dominio Offensivo",
  "Qualità di Squadra",
  "Bonus Diffuso",
  "One Shot",
  "Continuità Europea",
  "Top Performer",
];

// Punteggi confermati
const PUNTI = {
  personale: 1,
  comune: 0.5,
  vittoria: 3,
  pareggio: 1,
  evento_speciale: 1,
  leggendaria: 1,
  voti_bassi: 0
};

export default function Turno() {
  const [turnoId, setTurnoId] = useState("");
  const [turno, setTurno] = useState(null);
  const [squads, setSquads] = useState([]);

  // Stato tabellare
  const [giornataData, setGiornataData] = useState({});
  const [punteggi, setPunteggi] = useState({});

  // Carica squadre
  useEffect(() => {
    async function loadSquads() {
      const { data } = await supabase.from("squads").select("*");
      setSquads(data || []);
    }
    loadSquads();
  }, []);

  // Quando selezioni un turno → inizializza le 3 giornate
  useEffect(() => {
    if (!turnoId || squads.length === 0) return;

    const t = TURNS.find((t) => t.id === Number(turnoId));
    setTurno(t);

    const init = {};
    const initPunti = {};

    t.giornate.forEach((g) => {
      init[g] = {};
      initPunti[g] = {};

      squads.forEach((s) => {
        init[g][s.id] = {
          personale_scelta: "",
          personale_completata: false,
          comune: false,
          vittoria: false,
          evento_speciale: false,
          voti_bassi: false
        };

        initPunti[g][s.id] = 0;
      });
    });

    setGiornataData(init);
    setPunteggi(initPunti);
  }, [turnoId, squads]);

  // Calcolo punteggio parziale
  function calcolaPunteggio(giornata, squadId) {
    const d = giornataData[giornata][squadId];
    let p = 0;

    if (d.personale_completata) p += PUNTI.personale;
    if (d.comune) p += PUNTI.comune;
    if (d.vittoria) p += PUNTI.vittoria;
    if (d.evento_speciale) p += PUNTI.evento_speciale;
    if (d.voti_bassi) p += PUNTI.voti_bassi;

    setPunteggi((prev) => ({
      ...prev,
      [giornata]: {
        ...prev[giornata],
        [squadId]: p
      }
    }));
  }

  // Salva parziale
  async function salvaParziale(giornata, squadId) {
    const d = giornataData[giornata][squadId];
    const p = punteggi[giornata][squadId];

    await supabase.from("missioni_parziali").upsert({
      turno_id: turno.id,
      giornata,
      squad_id: squadId,
      personale_scelta: d.personale_scelta,
      personale_completata: d.personale_completata,
      comune: d.comune,
      vittoria: d.vittoria,
      evento_speciale: d.evento_speciale,
      voti_bassi: d.voti_bassi
    });

    await supabase.from("punteggi_parziali").upsert({
      turno_id: turno.id,
      giornata,
      squad_id: squadId,
      punteggio: p
    });

    alert(`Salvato parziale giornata ${giornata} per squadra ${squadId}`);
  }

  // Calcolo finale del turno
  async function calcolaFinale() {
    for (const squad of squads) {
      let personaleOK = true;
      let comuneOK = true;
      let eventoOK = false;
      let votiBassiTot = 0;
      let punteggioFinale = 0;

      turno.giornate.forEach((g) => {
        const d = giornataData[g][squad.id];
        const p = punteggi[g][squad.id];

        punteggioFinale += p;

        if (!d.personale_completata) personaleOK = false;
        if (!d.comune) comuneOK = false;
        if (d.evento_speciale) eventoOK = true;
        if (d.voti_bassi) votiBassiTot += 1;
      });

      const leggendaria =
        personaleOK &&
        eventoOK &&
        votiBassiTot <= 5;

      if (leggendaria) punteggioFinale += PUNTI.leggendaria;

      await supabase.from("missioni_completate").upsert({
        turno_id: turno.id,
        squad_id: squad.id,
        comune: comuneOK,
        personale: personaleOK,
        leggendaria,
        punteggio_finale: punteggioFinale
      });
    }

    alert("Calcolo finale completato!");
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>Gestione Turno Champions</h1>

      {/* TORNA ALLA HOME */}
      <Link
        to="/"
        style={backBtn}
        onMouseEnter={(e) => Object.assign(e.currentTarget.style, backBtnHover)}
        onMouseLeave={(e) => Object.assign(e.currentTarget.style, backBtn)}
      >
        ⬅ Torna alla Home
      </Link>

      {/* Seleziona turno */}
      <label>Seleziona turno:</label>
      <select
        value={turnoId}
        onChange={(e) => setTurnoId(e.target.value)}
      >
        <option value="">-- scegli turno --</option>
        {TURNS.map((t) => (
          <option key={t.id} value={t.id}>
            Turno {t.id}
          </option>
        ))}
      </select>

      {/* Tabelle giornate */}
      {turno && turno.giornate.map((g) => (
        <div key={g} style={{ marginTop: "40px" }}>
          <h2>{g}ª Giornata</h2>

          <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th>Squadra</th>
                <th>Missione Personale</th>
                <th>Completata</th>
                <th>Comune</th>
                <th>Vittoria</th>
                <th>Evento Speciale</th>
                <th>Voti Bassi</th>
                <th>Punteggio</th>
                <th>Salva</th>
              </tr>
            </thead>

            <tbody>
              {squads.map((squad) => (
                <tr key={squad.id}>
                  <td>{squad.name}</td>

                  {/* Missione personale scelta */}
                  <td>
                    <select
                      value={giornataData[g][squad.id].personale_scelta}
                      onChange={(e) => {
                        setGiornataData((prev) => ({
                          ...prev,
                          [g]: {
                            ...prev[g],
                            [squad.id]: {
                              ...prev[g][squad.id],
                              personale_scelta: e.target.value
                            }
                          }
                        }));
                      }}
                    >
                      <option value="">-- scegli --</option>
                      {PERSONAL_MISSIONS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </td>

                  {/* Checkbox missione personale */}
                  <td>
                    <input
                      type="checkbox"
                      checked={giornataData[g][squad.id].personale_completata}
                      onChange={(e) => {
                        setGiornataData((prev) => ({
                          ...prev,
                          [g]: {
                            ...prev[g],
                            [squad.id]: {
                              ...prev[g][squad.id],
                              personale_completata: e.target.checked
                            }
                          }
                        }));
                        calcolaPunteggio(g, squad.id);
                      }}
                    />
                  </td>

                  {/* Comune */}
                  <td>
                    <input
                      type="checkbox"
                      checked={giornataData[g][squad.id].comune}
                      onChange={(e) => {
                        setGiornataData((prev) => ({
                          ...prev,
                          [g]: {
                            ...prev[g],
                            [squad.id]: {
                              ...prev[g][squad.id],
                              comune: e.target.checked
                            }
                          }
                        }));
                        calcolaPunteggio(g, squad.id);
                      }}
                    />
                  </td>

                  {/* Vittoria */}
                  <td>
                    <input
                      type="checkbox"
                      checked={giornataData[g][squad.id].vittoria}
                      onChange={(e) => {
                        setGiornataData((prev) => ({
                          ...prev,
                          [g]: {
                            ...prev[g],
                            [squad.id]: {
                              ...prev[g][squad.id],
                              vittoria: e.target.checked
                            }
                          }
                        }));
                        calcolaPunteggio(g, squad.id);
                      }}
                    />
                  </td>

                  {/* Evento speciale */}
                  <td>
                    <input
                      type="checkbox"
                      checked={giornataData[g][squad.id].evento_speciale}
                      onChange={(e) => {
                        setGiornataData((prev) => ({
                          ...prev,
                          [g]: {
                            ...prev[g],
                            [squad.id]: {
                              ...prev[g][squad.id],
                              evento_speciale: e.target.checked
                            }
                          }
                        }));
                        calcolaPunteggio(g, squad.id);
                      }}
                    />
                  </td>

                  {/* Voti bassi */}
                  <td>
                    <input
                      type="checkbox"
                      checked={giornataData[g][squad.id].voti_bassi}
                      onChange={(e) => {
                        setGiornataData((prev) => ({
                          ...prev,
                          [g]: {
                            ...prev[g],
                            [squad.id]: {
                              ...prev[g][squad.id],
                              voti_bassi: e.target.checked
                            }
                          }
                        }));
                        calcolaPunteggio(g, squad.id);
                      }}
                    />
                  </td>

                  {/* Punteggio */}
                  <td>{punteggi[g][squad.id]}</td>

                  {/* Salva */}
                  <td>
                    <button onClick={() => salvaParziale(g, squad.id)}>
                      Salva
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* CALCOLO FINALE */}
      {turno && (
        <button
          onClick={calcolaFinale}
          style={{
            marginTop: "40px",
            padding: "10px 20px",
            fontSize: "16px"
          }}
        >
          Calcola Missioni del Turno
        </button>
      )}
    </div>
  );
}
