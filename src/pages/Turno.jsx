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

const PUNTI = {
  personale: 1,
  comune: 0.5,
  vittoria: 3,
  pareggio: 1,
  bonus_trio: 1, // missione_personale_x + gol/parato + voti_bassi
  leggendaria: 1,
  voti_bassi: 0
};

export default function Turno() {
  const [turnoId, setTurnoId] = useState("");
  const [turno, setTurno] = useState(null);
  const [squads, setSquads] = useState([]);

  // struttura: { giornata: { [squadId]: { ...fields } } }
  const [giornataData, setGiornataData] = useState({});
  // punteggi: { giornata: { [squadId]: number } }
  const [punteggi, setPunteggi] = useState({});

  useEffect(() => {
    async function loadSquads() {
      const { data } = await supabase.from("squads").select("*");
      setSquads(data || []);
    }
    loadSquads();
  }, []);

  useEffect(() => {
    if (!turnoId || squads.length === 0) return;
    const t = TURNS.find((x) => x.id === Number(turnoId));
    setTurno(t);

    const initData = {};
    const initPunti = {};
    t.giornate.forEach((g) => {
      initData[g] = {};
      initPunti[g] = {};
      squads.forEach((s) => {
        initData[g][s.id] = {
          personale_scelta: "",
          personale_completata: false,
          personale_x: false, // viene impostata automaticamente quando personale_completata = true
          comune: false,
          vittoria: false,
          pareggio: false,
          gol_parato: false,
          voti_bassi: false
        };
        initPunti[g][s.id] = 0;
      });
    });
    setGiornataData(initData);
    setPunteggi(initPunti);
  }, [turnoId, squads]);

  // calcola punteggio da uno stato riga (usando i valori passati)
  function computeRowPointsFromState(row) {
    if (!row) return 0;
    let p = 0;
    if (row.personale_completata) p += PUNTI.personale;
    if (row.comune) p += PUNTI.comune;
    if (row.vittoria) p += PUNTI.vittoria;
    else if (row.pareggio) p += PUNTI.pareggio;
    // trio: personale_x + gol_parato + voti_bassi => +1 solo se tutte e tre true
    if (row.personale_x && row.gol_parato && row.voti_bassi) p += PUNTI.bonus_trio;
    return p;
  }

  // aggiorna campo e ricalcola punteggio immediatamente usando il nuovo stato
  function updateField(giornata, squadId, field, value) {
    setGiornataData((prev) => {
      const copy = { ...prev };
      if (!copy[giornata]) copy[giornata] = {};
      const prevRow = copy[giornata][squadId] || {};
      const newRow = { ...prevRow, [field]: value };

      // regole aggiuntive:
      // 1) se si deseleziona la scelta della missione personale (select vuoto), azzera personale_completata e personale_x
      if (field === "personale_scelta" && (value === "" || value == null)) {
        newRow.personale_completata = false;
        newRow.personale_x = false;
      }

      // 2) se si cambia personale_completata:
      //    - se diventa true => impostiamo automaticamente personale_x = true
      //    - se diventa false => togliamo personale_x = false (così il trio non può essere soddisfatto)
      if (field === "personale_completata") {
        if (value === true) {
          newRow.personale_x = true;
        } else {
          newRow.personale_x = false;
        }
      }

      // 3) vittoria/pareggio mutua esclusione: se impostiamo vittoria true => pareggio false; se impostiamo pareggio true => vittoria false
      if (field === "vittoria" && value === true) {
        newRow.pareggio = false;
      }
      if (field === "pareggio" && value === true) {
        newRow.vittoria = false;
      }

      copy[giornata] = { ...copy[giornata], [squadId]: newRow };

      // aggiorna anche i punteggi nello stesso setState per evitare race condition
      setPunteggi((pprev) => {
        const pcopy = { ...pprev };
        if (!pcopy[giornata]) pcopy[giornata] = {};
        pcopy[giornata] = { ...pcopy[giornata], [squadId]: computeRowPointsFromState(newRow) };
        return pcopy;
      });

      return copy;
    });
  }

  // salva parziale: missioni_parziali + punteggi_parziali
  async function salvaParziale(giornata, squadId) {
    const d = giornataData[giornata] && giornataData[giornata][squadId];
    const p = (punteggi[giornata] && punteggi[giornata][squadId]) || 0;

    if (!d) {
      alert("Nessun dato da salvare per questa riga.");
      return;
    }

    // upsert missioni_parziali
    await supabase.from("missioni_parziali").upsert({
      turno_id: turno.id,
      giornata,
      squad_id: squadId,
      personale_scelta: d.personale_scelta,
      personale_completata: d.personale_completata,
      personale_x: d.personale_x,
      comune: d.comune,
      vittoria: d.vittoria,
      pareggio: d.pareggio,
      gol_parato: d.gol_parato,
      voti_bassi: d.voti_bassi
    });

    // upsert punteggi_parziali
    await supabase.from("punteggi_parziali").upsert({
      turno_id: turno.id,
      giornata,
      squad_id: squadId,
      punteggio: p
    });

    alert(`Salvato parziale: giornata ${giornata} - squadra ${squadId} (punteggio ${p})`);
  }

  // calcolo finale: somma punteggi delle 3 giornate e applica leggendaria se necessario
  async function calcolaFinale() {
    for (const s of squads) {
      let totale = 0;
      let personaleOK = true;
      let comuneOK = true;
      let eventoOK = false;
      let votiBassiCount = 0;

      for (const g of turno.giornate) {
        const d = giornataData[g] && giornataData[g][s.id];
        const p = (punteggi[g] && punteggi[g][s.id]) || 0;
        totale += p;

        if (!d || !d.personale_completata) personaleOK = false;
        if (!d || !d.comune) comuneOK = false;
        if (d && d.gol_parato) eventoOK = true;
        if (d && d.voti_bassi) votiBassiCount += 1;
      }

      const leggendaria = personaleOK && eventoOK && votiBassiCount <= 5;
      if (leggendaria) totale += PUNTI.leggendaria;

      await supabase.from("missioni_completate").upsert({
        turno_id: turno.id,
        squad_id: s.id,
        comune: comuneOK,
        personale: personaleOK,
        leggendaria,
        punteggio_finale: totale
      });
    }

    alert("Calcolo finale completato e classifica aggiornata.");
  }

  // cella che mostra trio e punteggio riga
  function renderTrioCell(g, s) {
    const d = giornataData[g] && giornataData[g][s.id];
    const p = (punteggi[g] && punteggi[g][s.id]) || 0;
    if (!d) return null;

    return (
      <div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <label>
            <input
              type="checkbox"
              // personale_x viene impostata automaticamente quando si spunta "Completata"
              checked={d.personale_x}
              onChange={(e) => updateField(g, s.id, "personale_x", e.target.checked)}
            />{" "}
            Missione Personale X
          </label>

          <label>
            <input
              type="checkbox"
              checked={d.gol_parato}
              onChange={(e) => updateField(g, s.id, "gol_parato", e.target.checked)}
            />{" "}
            Gol / Parato
          </label>

          <label>
            <input
              type="checkbox"
              checked={d.voti_bassi}
              onChange={(e) => updateField(g, s.id, "voti_bassi", e.target.checked)}
            />{" "}
            Voti Bassi
          </label>
        </div>

        <div style={{ marginTop: 6 }}>
          <strong>Punteggio riga:</strong> {p}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Gestione Turno Champions</h1>

      <Link
        to="/"
        style={backBtn}
        onMouseEnter={(e) => Object.assign(e.currentTarget.style, backBtnHover)}
        onMouseLeave={(e) => Object.assign(e.currentTarget.style, backBtn)}
      >
        ⬅ Torna alla Home
      </Link>

      <div style={{ marginTop: 12 }}>
        <label>Seleziona turno: </label>
        <select value={turnoId} onChange={(e) => setTurnoId(e.target.value)}>
          <option value="">-- scegli turno --</option>
          {TURNS.map((t) => (
            <option key={t.id} value={t.id}>Turno {t.id}</option>
          ))}
        </select>
      </div>

      {turno && turno.giornate.map((g) => (
        <div key={g} style={{ marginTop: 30 }}>
          <h2>{g}ª Giornata</h2>

          <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th>Squadra</th>
                <th>Missione Personale</th>
                <th>Completata (si/no)</th>
                <th>Miss. Comune</th>
                <th>Vittoria/Pareggio Giornata</th>
                <th>Missione Personale X, Gol / Parato, Voti Bassi Punteggio</th>
                <th>Salva</th>
              </tr>
            </thead>

            <tbody>
              {squads.map((s) => {
                const row = giornataData[g] && giornataData[g][s.id];
                return (
                  <tr key={s.id}>
                    <td>{s.name}</td>

                    <td>
                      <select
                        value={row ? row.personale_scelta : ""}
                        onChange={(e) => updateField(g, s.id, "personale_scelta", e.target.value)}
                      >
                        <option value="">-- scegli --</option>
                        {PERSONAL_MISSIONS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </td>

                    <td style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={row ? row.personale_completata : false}
                        onChange={(e) => updateField(g, s.id, "personale_completata", e.target.checked)}
                      />
                    </td>

                    <td style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={row ? row.comune : false}
                        onChange={(e) => updateField(g, s.id, "comune", e.target.checked)}
                      />
                    </td>

                    <td style={{ textAlign: "center" }}>
                      <label style={{ marginRight: 8 }}>
                        <input
                          type="checkbox"
                          checked={row ? row.vittoria : false}
                          onChange={(e) => updateField(g, s.id, "vittoria", e.target.checked)}
                        /> Vittoria
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={row ? row.pareggio : false}
                          onChange={(e) => updateField(g, s.id, "pareggio", e.target.checked)}
                        /> Pareggio
                      </label>
                    </td>

                    <td>
                      {renderTrioCell(g, s)}
                    </td>

                    <td style={{ textAlign: "center" }}>
                      <button onClick={() => salvaParziale(g, s.id)}>Salva</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ marginTop: 8 }}>
            <strong>Totali parziali giornata {g}:</strong>
            <div>
              {squads.map((s) => (
                <span key={s.id} style={{ marginRight: 12 }}>
                  {s.name}: {(punteggi[g] && punteggi[g][s.id]) ?? 0}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}

      {turno && (
        <div style={{ marginTop: 30 }}>
          <button onClick={calcolaFinale} style={{ padding: "10px 20px", fontSize: 16 }}>
            Calcola Missioni del Turno
          </button>
        </div>
      )}
    </div>
  );
}
