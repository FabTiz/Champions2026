import React, { useState, useMemo } from "react";

/**
 * Turno.jsx
 * - 7 turni
 * - ogni turno ha 3 giornate
 * - per ogni giornata: missionePersonale, missionePersonaleX (visiva), golParata, votiBassi, missioneComune, vittoria/pareggio, missioneLeggendaria
 * - missionePersonaleX viene spuntata automaticamente quando missionePersonale viene spuntata
 * - missionePersonaleX conta +1 solo se golParata && votiBassi sono true nella stessa giornata
 */

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

const makeEmptyGiornata = () => ({
  missionePersonale: false,
  missionePersonaleX: false,
  golParata: false,
  votiBassi: false,
  missioneComune: false,
  vittoria: false,
  pareggio: false,
  missioneLeggendaria: false,
});

const makePerTurni = () =>
  Array.from({ length: 7 }, () => ({
    giornate: [makeEmptyGiornata(), makeEmptyGiornata(), makeEmptyGiornata()],
  }));

export default function Turno() {
  const [selectedTurno, setSelectedTurno] = useState(1); // 1..7
  const [teams, setTeams] = useState(() =>
    TEAM_NAMES.map((nome, idx) => ({
      id: `team-${idx}`,
      nome,
      perTurni: makePerTurni(),
    }))
  );

  // Toggle generico per una specifica squadra, turno (1-based), giornata (0..2), campo
  function toggleField(teamId, turnoIndex, giornataIndex, field) {
    setTeams(prev =>
      prev.map(t => {
        if (t.id !== teamId) return t;
        const perTurni = t.perTurni.map((turno, ti) => {
          if (ti !== turnoIndex) return turno;
          const giornate = turno.giornate.map((g, gi) => {
            if (gi !== giornataIndex) return g;
            const updated = { ...g, [field]: !g[field] };

            // Regola: se spunti missionePersonale -> imposta missionePersonaleX true
            if (field === "missionePersonale" && updated.missionePersonale) {
              updated.missionePersonaleX = true;
            }
            // se deselezioni missionePersonale -> togli missionePersonaleX
            if (field === "missionePersonale" && !updated.missionePersonale) {
              updated.missionePersonaleX = false;
            }

            // Se imposti vittoria, togli pareggio; se imposti pareggio, togli vittoria
            if (field === "vittoria" && updated.vittoria) {
              updated.pareggio = false;
            }
            if (field === "pareggio" && updated.pareggio) {
              updated.vittoria = false;
            }

            return updated;
          });
          return { ...turno, giornate };
        });
        return { ...t, perTurni };
      })
    );
  }

  // Se vuoi impedire toggle manuale di missionePersonaleX, usa questa funzione per ignorare il toggle.
  function toggleMissionePersonaleX(teamId, turnoIndex, giornataIndex) {
    // qui permettiamo il toggle manuale (ma il conteggio resta condizionale)
    toggleField(teamId, turnoIndex, giornataIndex, "missionePersonaleX");
  }

  // Calcola punteggio per una singola giornata
  function computeGiornataScore(g) {
    let s = 0;
    if (g.missionePersonale) s += 0.5;
    // missionePersonaleX conta solo se spuntata e golParata && votiBassi
    if (g.missionePersonaleX && g.golParata && g.votiBassi) s += 1;
    if (g.missioneComune) s += 1;
    if (g.vittoria) s += 3;
    else if (g.pareggio) s += 1;
    if (g.missioneLeggendaria) s += 1;
    return s;
  }

  // Calcola punteggio totale per il team nel turno selezionato (somma delle 3 giornate)
  const totalsByTeam = useMemo(() => {
    const turnoIdx = selectedTurno - 1;
    return teams.map(t => {
      const turno = t.perTurni[turnoIdx];
      const totale = turno.giornate.reduce((acc, g) => acc + computeGiornataScore(g), 0);
      return { id: t.id, nome: t.nome, totale, turno };
    });
  }, [teams, selectedTurno]);

  function saveTotals() {
    // Esempio payload: salva solo il turno selezionato
    const turnoIdx = selectedTurno - 1;
    const payload = teams.map(t => {
      const turno = t.perTurni[turnoIdx];
      return {
        id: t.id,
        nome: t.nome,
        giornate: turno.giornate,
        totale: turno.giornate.reduce((acc, g) => acc + computeGiornataScore(g), 0),
      };
    });
    console.log("Salva turno", selectedTurno, payload);
    // TODO: integra con Supabase / backend
  }

  return (
    <div style={{ padding: 16, fontFamily: "Segoe UI, Arial, sans-serif" }}>
      <h3>Turno</h3>

      <div style={{ marginBottom: 12, display: "flex", gap: 12, alignItems: "center" }}>
        <label>
          Seleziona turno:
          <select
            value={selectedTurno}
            onChange={e => setSelectedTurno(Number(e.target.value))}
            style={{ marginLeft: 8 }}
          >
            {Array.from({ length: 7 }, (_, i) => (
              <option key={i} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </label>

        <button onClick={saveTotals}>Salva Totale Turno</button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #ccc" }}>
            <th style={{ width: "18%" }}>Squadra</th>

            {/* Tre colonne giornate */}
            <th style={{ width: "24%", textAlign: "center" }}>Giornata 1</th>
            <th style={{ width: "24%", textAlign: "center" }}>Giornata 2</th>
            <th style={{ width: "24%", textAlign: "center" }}>Giornata 3</th>

            <th style={{ width: "10%", textAlign: "center" }}>Punteggio Totale</th>
          </tr>
        </thead>

        <tbody>
          {teams.map((t, ti) => {
            const turnoIdx = selectedTurno - 1;
            const turno = t.perTurni[turnoIdx];
            const totale = turno.giornate.reduce((acc, g) => acc + computeGiornataScore(g), 0);

            return (
              <tr key={t.id} style={{ borderTop: "1px solid #eee" }}>
                <td style={{ padding: "8px 6px" }}>{t.nome}</td>

                {turno.giornate.map((g, gi) => (
                  <td key={gi} style={{ padding: 8, verticalAlign: "top" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
                      <label style={{ fontSize: 12 }}>
                        <input
                          type="checkbox"
                          checked={g.missionePersonale}
                          onChange={() => toggleField(t.id, turnoIdx, gi, "missionePersonale")}
                        />{" "}
                        Missione Personale (+0.5)
                      </label>

                      <label style={{ fontSize: 12 }}>
                        <input
                          type="checkbox"
                          checked={g.missionePersonaleX}
                          onChange={() => toggleMissionePersonaleX(t.id, turnoIdx, gi)}
                        />{" "}
                        Missione Personale X
                      </label>

                      <div style={{ fontSize: 11, color: "#555", textAlign: "center" }}>
                        Conta +1 solo se Gol/Parata + Voto 5
                      </div>

                      <label style={{ fontSize: 12 }}>
                        <input
                          type="checkbox"
                          checked={g.golParata}
                          onChange={() => toggleField(t.id, turnoIdx, gi, "golParata")}
                        />{" "}
                        Gol/Parata
                      </label>

                      <label style={{ fontSize: 12 }}>
                        <input
                          type="checkbox"
                          checked={g.votiBassi}
                          onChange={() => toggleField(t.id, turnoIdx, gi, "votiBassi")}
                        />{" "}
                        Voto 5 (VotiBassi)
                      </label>

                      <label style={{ fontSize: 12 }}>
                        <input
                          type="checkbox"
                          checked={g.missioneComune}
                          onChange={() => toggleField(t.id, turnoIdx, gi, "missioneComune")}
                        />{" "}
                        Missione Comune (+1)
                      </label>

                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <label style={{ fontSize: 12 }}>
                          <input
                            type="radio"
                            name={`esito-${t.id}-${turnoIdx}-${gi}`}
                            checked={g.vittoria}
                            onChange={() => toggleField(t.id, turnoIdx, gi, "vittoria")}
                          />{" "}
                          V
                        </label>
                        <label style={{ fontSize: 12 }}>
                          <input
                            type="radio"
                            name={`esito-${t.id}-${turnoIdx}-${gi}`}
                            checked={g.pareggio}
                            onChange={() => toggleField(t.id, turnoIdx, gi, "pareggio")}
                          />{" "}
                          P
                        </label>
                      </div>

                      <label style={{ fontSize: 12 }}>
                        <input
                          type="checkbox"
                          checked={g.missioneLeggendaria}
                          onChange={() => toggleField(t.id, turnoIdx, gi, "missioneLeggendaria")}
                        />{" "}
                        Missione Leggendaria (+1)
                      </label>

                      <div style={{ fontSize: 12, fontWeight: 600 }}>
                        Parziale: {computeGiornataScore(g)}
                      </div>
                    </div>
                  </td>
                ))}

                <td style={{ textAlign: "center", fontWeight: "bold" }}>{totale}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
