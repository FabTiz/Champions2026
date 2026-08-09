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

export default function Turno() {
  const [turnoId, setTurnoId] = useState("");
  const [turno, setTurno] = useState(null);
  const [squads, setSquads] = useState([]);

  // Stato per ogni giornata e squadra
  const [giornataData, setGiornataData] = useState({});

  // Carica squadre
  useEffect(() => {
    async function loadSquads() {
      const { data } = await supabase.from("squads").select("*");
      setSquads(data || []);
    }
    loadSquads();
  }, []);

  // Quando selezioni un turno → carica le 3 giornate
  useEffect(() => {
    if (!turnoId) return;
    const t = TURNS.find((t) => t.id === Number(turnoId));
    setTurno(t);

    // Inizializza struttura dati
    const init = {};
    t.giornate.forEach((g) => {
      init[g] = {};
      squads.forEach((s) => {
        init[g][s.id] = {
          personale_scelta: "",
          personale_completata: false,
          comune: false,
          vittoria: false,
          evento_speciale: false,
          voti_bassi: false,
        };
      });
    });

    setGiornataData(init);
  }, [turnoId, squads]);

  // Salva parziale
  async function salvaParziale(giornata, squadId) {
    const d = giornataData[giornata][squadId];

    await supabase.from("missioni_parziali").upsert({
      turno_id: turno.id,
      giornata,
      squad_id: squadId,
      personale_scelta: d.personale_scelta,
      personale_completata: d.personale_completata,
      comune: d.comune,
      vittoria: d.vittoria,
      evento_speciale: d.evento_speciale,
      voti_bassi: d.voti_bassi,
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

      turno.giornate.forEach((g) => {
        const d = giornataData[g][squad.id];

        if (!d.personale_completata) personaleOK = false;
        if (!d.comune) comuneOK = false;
        if (d.evento_speciale) eventoOK = true;
        if (d.voti_bassi) votiBassiTot += 1;
      });

      const leggendaria =
        personaleOK &&
        eventoOK &&
        votiBassiTot <= 5;

      await supabase.from("missioni_completate").upsert({
        turno_id: turno.id,
        squad_id: squad.id,
        comune: comuneOK,
        personale: personaleOK,
        leggendaria,
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

      {/* Mostra giornate */}
      {turno && (
        <div style={{ marginTop: "30px" }}>
          <h2>Turno {turno.id}</h2>
          <p>Giornate: {turno.giornate.join(", ")}</p>

          {turno.giornate.map((g) => (
            <div key={g} style={{ marginTop: "30px", padding: "20px", border: "1px solid #ccc" }}>
              <h3>{g}ª Giornata</h3>

              {squads.map((squad) => (
                <div key={squad.id} style={{ marginBottom: "20px" }}>
                  <strong>{squad.name}</strong>

                  {/* Missione personale scelta */}
                  <select
                    value={giornataData[g][squad.id].personale_scelta}
                    onChange={(e) =>
                      setGiornataData((prev) => ({
                        ...prev,
                        [g]: {
                          ...prev[g],
                          [squad.id]: {
                            ...prev[g][squad.id],
                            personale_scelta: e.target.value,
                          },
                        },
                      }))
                    }
                    style={{ marginLeft: "10px" }}
                  >
                    <option value="">-- missione personale --</option>
                    {PERSONAL_MISSIONS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>

                  {/* Checkbox missione personale completata */}
                  <label style={{ marginLeft: "10px" }}>
                    <input
                      type="checkbox"
                      checked={giornataData[g][squad.id].personale_completata}
                      onChange={(e) =>
                        setGiornataData((prev) => ({
                          ...prev,
                          [g]: {
                            ...prev[g],
                            [squad.id]: {
                              ...prev[g][squad.id],
                              personale_completata: e.target.checked,
                            },
                          },
                        }))
                      }
                    />
                    Missione personale completata
                  </label>

                  {/* Comune */}
                  <label style={{ marginLeft: "10px" }}>
                    <input
                      type="checkbox"
                      checked={giornataData[g][squad.id].comune}
                      onChange={(e) =>
                        setGiornataData((prev) => ({
                          ...prev,
                          [g]: {
                            ...prev[g],
                            [squad.id]: {
                              ...prev[g][squad.id],
                              comune: e.target.checked,
                            },
                          },
                        }))
                      }
                    />
                    Missione comune
                  </label>

                  {/* Vittoria */}
                  <label style={{ marginLeft: "10px" }}>
                    <input
                      type="checkbox"
                      checked={giornataData[g][squad.id].vittoria}
                      onChange={(e) =>
                        setGiornataData((prev) => ({
                          ...prev,
                          [g]: {
                            ...prev[g],
                            [squad.id]: {
                              ...prev[g][squad.id],
                              vittoria: e.target.checked,
                            },
                          },
                        }))
                      }
                    />
                    Vittoria/Pareggio
                  </label>

                  {/* Evento speciale */}
                  <label style={{ marginLeft: "10px" }}>
                    <input
                      type="checkbox"
                      checked={giornataData[g][squad.id].evento_speciale}
                      onChange={(e) =>
                        setGiornataData((prev) => ({
                          ...prev,
                          [g]: {
                            ...prev[g],
                            [squad.id]: {
                              ...prev[g][squad.id],
                              evento_speciale: e.target.checked,
                            },
                          },
                        }))
                      }
                    />
                    Evento speciale
                  </label>

                  {/* Voti bassi */}
                  <label style={{ marginLeft: "10px" }}>
                    <input
                      type="checkbox"
                      checked={giornataData[g][squad.id].voti_bassi}
                      onChange={(e) =>
                        setGiornataData((prev) => ({
                          ...prev,
                          [g]: {
                            ...prev[g],
                            [squad.id]: {
                              ...prev[g][squad.id],
                              voti_bassi: e.target.checked,
                            },
                          },
                        }))
                      }
                    />
                    Voti bassi
                  </label>

                  {/* SALVA PARZIALE */}
                  <button
                    style={{ marginLeft: "20px" }}
                    onClick={() => salvaParziale(g, squad.id)}
                  >
                    Salva Parziale
                  </button>
                </div>
              ))}
            </div>
          ))}

          {/* CALCOLO FINALE */}
          <button
            onClick={calcolaFinale}
            style={{
              marginTop: "30px",
              padding: "10px 20px",
              fontSize: "16px",
            }}
          >
            Calcola Missioni del Turno
          </button>
        </div>
      )}
    </div>
  );
}
