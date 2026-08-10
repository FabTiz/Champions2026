// src/components/Turno.jsx
import React from "react";

/**
 * Componente puramente presentazionale e di gestione stato locale passato via props.
 *
 * Props:
 * - teams: array di team con struttura { id, nome, perTurni: [{ giornate: [{...}] }, ...] }
 * - selectedTurno: numero 1..7
 * - onToggleField(teamId, turnoIndex, giornataIndex, field)
 * - onSave (opzionale)
 * - loading (opzionale)
 */

export default function Turno({
  teams = [],
  selectedTurno = 1,
  onToggleField = () => {},
  onSaveGiornata = () => {},
  onSave = () => {},
  loading = false,
}) {
  const turnoIdx = selectedTurno - 1;

  function computeGiornataScore(g) {
    let s = 0;
    if (g.missionePersonale && g.missionePersonaleCompletata) s += 1;
    if (g.missionePersonaleX && g.golParata && g.votiBassi) s += 1;
    if (g.missioneComune) s += 0.5;
    if (g.vittoria) s += 3;
    else if (g.pareggio) s += 1;
    return s;
  }

  function renderGiornataBlock(giornataIndex) {
    const totaleGiornata = teams.reduce((acc, team) => {
      const teamTurno = team.perTurni?.[turnoIdx];
      const giornata = teamTurno?.giornate?.[giornataIndex];
      return acc + (giornata ? computeGiornataScore(giornata) : 0);
    }, 0);

    return (
      <div key={giornataIndex} style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "10px 0 6px" }}>
          <h3 style={{ margin: 0 }}>{giornataIndex + 1}a giornata</h3>
          <button type="button" onClick={() => onSaveGiornata(giornataIndex)} style={{ padding: "6px 10px" }}>
            Salva parziale giornata
          </button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <thead>
            <tr>
              <th style={{ ...cellHeader, width: "14%", textAlign: "left" }}>Squadra</th>
              <th style={{ ...cellHeader, width: "13%" }}>Missione Personale</th>
              <th style={{ ...cellHeader, width: "9%" }}>Completata (si/no)</th>
              <th style={{ ...cellHeader, width: "10%" }}>Miss. Comune</th>
              <th style={{ ...cellHeader, width: "14%" }}>Vittoria/Pareggio Giornata</th>
              <th style={{ ...cellHeader, width: "11%" }}>Missione Personale X</th>
              <th style={{ ...cellHeader, width: "9%" }}>Gol / Parato</th>
              <th style={{ ...cellHeader, width: "9%" }}>Voti Bassi</th>
              <th style={{ ...cellHeader, width: "8%" }}>Punteggio</th>
              <th style={{ ...cellHeader, width: "3%" }}>Salva</th>
            </tr>
          </thead>

          <tbody>
            {teams.map(team => {
              const teamTurno = team.perTurni?.[turnoIdx];
              const g = teamTurno?.giornate?.[giornataIndex];
              if (!g) return null;

              return (
                <tr key={`${team.id}-g${giornataIndex}`}>
                  <td style={{ ...cellBase, fontWeight: 500 }}>{team.nome}</td>

                  <td style={cellCenter}>
                    <select
                      value={g.missionePersonale || ""}
                      onChange={e => onToggleField(team.id, turnoIdx, giornataIndex, "missionePersonale", e.target.value)}
                      style={{ width: "96%", maxWidth: 180 }}
                    >
                      <option value="">-- scegli missione --</option>
                      <option value="Dominio Offensivo">Dominio Offensivo</option>
                      <option value="Qualità di Squadra">Qualità di Squadra</option>
                      <option value="Bonus Diffuso">Bonus Diffuso</option>
                      <option value="One Shot">One Shot</option>
                      <option value="Continuità Europea">Continuità Europea</option>
                      <option value="Top Performer">Top Performer</option>
                    </select>
                  </td>

                  <td style={cellCenter}>
                    <input
                      type="checkbox"
                      checked={!!g.missionePersonaleCompletata}
                      onChange={() => onToggleField(team.id, turnoIdx, giornataIndex, "missionePersonaleCompletata")}
                      disabled={!g.missionePersonale}
                    />
                  </td>

                  <td style={cellCenter}>
                    <input
                      type="checkbox"
                      checked={!!g.missioneComune}
                      onChange={() => onToggleField(team.id, turnoIdx, giornataIndex, "missioneComune")}
                    />
                  </td>

                  <td style={cellCenter}>
                    <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                      <label style={inlineLabel}>
                        <input
                          type="checkbox"
                          checked={!!g.vittoria}
                          onChange={() => onToggleField(team.id, turnoIdx, giornataIndex, "vittoria")}
                        />
                        <span>V</span>
                      </label>
                      <label style={inlineLabel}>
                        <input
                          type="checkbox"
                          checked={!!g.pareggio}
                          onChange={() => onToggleField(team.id, turnoIdx, giornataIndex, "pareggio")}
                        />
                        <span>P</span>
                      </label>
                    </div>
                  </td>

                  <td style={cellCenter}>
                    <input
                      type="checkbox"
                      checked={!!g.missionePersonaleX}
                      disabled={!g.missionePersonale}
                      onChange={() => onToggleField(team.id, turnoIdx, giornataIndex, "missionePersonaleX")}
                      title={g.missionePersonale ? "Auto-attivata con Missione Personale" : "Seleziona prima una missione personale"}
                    />
                  </td>

                  <td style={cellCenter}>
                    <input
                      type="checkbox"
                      checked={!!g.golParata}
                      onChange={() => onToggleField(team.id, turnoIdx, giornataIndex, "golParata")}
                    />
                  </td>

                  <td style={cellCenter}>
                    <input
                      type="checkbox"
                      checked={!!g.votiBassi}
                      onChange={() => onToggleField(team.id, turnoIdx, giornataIndex, "votiBassi")}
                    />
                  </td>

                  <td style={{ ...cellCenter, fontWeight: 600 }}>{computeGiornataScore(g)}</td>

                  <td style={cellCenter}>
                    <button type="button" onClick={() => onSaveGiornata(giornataIndex)} style={{ padding: "4px 8px" }}>
                      Salva
                    </button>
                  </td>
                </tr>
              );
            })}
            <tr>
              <td style={{ ...cellBase, fontWeight: 700 }}>Totale giornata</td>
              <td style={cellCenter} colSpan={7} />
              <td style={{ ...cellCenter, fontWeight: 700 }}>{totaleGiornata}</td>
              <td style={cellCenter} />
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, fontFamily: "Segoe UI, Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Turno {selectedTurno}</h2>
        <div>
          <button onClick={onSave} disabled={loading} style={{ padding: "6px 12px" }}>
            {loading ? "Salvataggio..." : "Salva Totale Turno"}
          </button>
        </div>
      </div>

      {renderGiornataBlock(0)}
      {renderGiornataBlock(1)}
      {renderGiornataBlock(2)}
    </div>
  );
}

const cellHeader = {
  border: "1px solid #222",
  padding: "6px 8px",
  textAlign: "center",
  fontWeight: 600,
  fontSize: 13,
  background: "#fafafa",
};

const cellBase = {
  border: "1px solid #222",
  padding: "6px 8px",
  fontSize: 14,
};

const cellCenter = {
  ...cellBase,
  textAlign: "center",
};

const inlineLabel = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  fontSize: 12,
};
