// src/components/Turno.jsx
import React, { useMemo } from "react";

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
  onSave = () => {},
  loading = false,
}) {
  const turnoIdx = selectedTurno - 1;

  function computeGiornataScore(g) {
    let s = 0;
    if (g.missionePersonale) s += 0.5;
    if (g.missionePersonaleX && g.golParata && g.votiBassi) s += 1;
    if (g.missioneComune) s += 1;
    if (g.vittoria) s += 3;
    else if (g.pareggio) s += 1;
    if (g.missioneLeggendaria) s += 1;
    return s;
  }

  const totalsByTeam = useMemo(() => {
    return teams.map(t => {
      const turno = t.perTurni?.[turnoIdx];
      const totale = turno
        ? turno.giornate.reduce((acc, g) => acc + computeGiornataScore(g), 0)
        : 0;
      return { id: t.id, nome: t.nome, totale, turno };
    });
  }, [teams, turnoIdx]);

  function renderMissionePersonaleXCell(team, giornataIndex, g) {
    const personalChecked = !!g.missionePersonale;
    const xChecked = !!g.missionePersonaleX;

    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <input
          type="checkbox"
          checked={xChecked}
          disabled={!personalChecked}
          onChange={() => onToggleField(team.id, turnoIdx, giornataIndex, "missionePersonaleX")}
          title={
            personalChecked
              ? "Missione Personale X"
              : "Attiva prima Missione Personale"
          }
        />
      </div>
    );
  }

  function renderEsitoCells(team, giornataIndex, g) {
    return (
      <>
        <td style={cellCenter}>
          <input
            type="checkbox"
            checked={!!g.vittoria}
            onChange={() => onToggleField(team.id, turnoIdx, giornataIndex, "vittoria")}
          />
        </td>
        <td style={cellCenter}>
          <input
            type="checkbox"
            checked={!!g.pareggio}
            onChange={() => onToggleField(team.id, turnoIdx, giornataIndex, "pareggio")}
          />
        </td>
      </>
    );
  }

  function renderGiornataBlock(giornataIndex) {
    const isLast = giornataIndex === 2;

    return (
      <div key={giornataIndex} style={{ marginBottom: 18 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <thead>
            <tr>
              <th style={{ ...cellHeader, width: "18%", textAlign: "left" }}>
                {giornataIndex + 1}a Giornata
              </th>
              {isLast && (
                <>
                  <th style={cellHeader}>Vittoria Turno +3</th>
                  <th style={cellHeader}>Pareggio Turno +1</th>
                </>
              )}
              <th style={cellHeader}>Missione Personale</th>
              <th style={cellHeader}>Missione Personale X +1</th>
              <th style={cellHeader}>Gol/Parata</th>
              <th style={cellHeader}>VotiBassi</th>
              <th style={cellHeader}>Missione Comune +1</th>
              {isLast && <th style={cellHeader}>Missione Leggendaria +1</th>}
              <th style={cellHeader}>Punteggio Totale</th>
            </tr>
          </thead>

          <tbody>
            {totalsByTeam.map(team => {
              const g = team.turno?.giornate?.[giornataIndex];
              if (!g) return null;

              return (
                <tr key={`${team.id}-g${giornataIndex}`}>
                  <td style={{ ...cellBase, fontWeight: 500 }}>{team.nome}</td>

                  {isLast && renderEsitoCells(team, giornataIndex, g)}

                  <td style={cellCenter}>
                    <select
                      value={g.missionePersonale ? "selected" : ""}
                      onChange={e =>
                        onToggleField(
                          team.id,
                          turnoIdx,
                          giornataIndex,
                          "missionePersonale",
                          e.target.value === "selected"
                        )
                      }
                      style={{ width: "96%", maxWidth: 180 }}
                    >
                      <option value="">Seleziona</option>
                      <option value="selected">Completata (+0.5)</option>
                    </select>
                  </td>

                  <td style={cellCenter}>{renderMissionePersonaleXCell(team, giornataIndex, g)}</td>

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

                  <td style={cellCenter}>
                    <input
                      type="checkbox"
                      checked={!!g.missioneComune}
                      onChange={() => onToggleField(team.id, turnoIdx, giornataIndex, "missioneComune")}
                    />
                  </td>

                  {isLast && (
                    <td style={cellCenter}>
                      <input
                        type="checkbox"
                        checked={!!g.missioneLeggendaria}
                        onChange={() => onToggleField(team.id, turnoIdx, giornataIndex, "missioneLeggendaria")}
                      />
                    </td>
                  )}

                  <td style={{ ...cellCenter, fontWeight: 600 }}>{computeGiornataScore(g)}</td>
                </tr>
              );
            })}
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

      <div style={{ marginTop: 8 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <thead>
            <tr>
              <th style={{ ...cellHeader, width: "70%", textAlign: "left" }}>Squadra</th>
              <th style={cellHeader}>Totale nelle 3 giornate</th>
            </tr>
          </thead>
          <tbody>
            {totalsByTeam.map(team => (
              <tr key={`${team.id}-totale`}>
                <td style={{ ...cellBase, fontWeight: 500 }}>{team.nome}</td>
                <td style={{ ...cellCenter, fontWeight: 700 }}>{team.totale}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
