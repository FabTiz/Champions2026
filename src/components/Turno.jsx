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
  onResetGiornata = () => {},
  onResetTurno = () => {},
  onSave = () => {},
  loading = false,
}) {
  const turnoIdx = selectedTurno - 1;

  function getCumulativeFlags(teamTurno, giornataIndex) {
    const giornate = teamTurno?.giornate?.slice(0, giornataIndex + 1) || [];

    return giornate.reduce(
      (acc, giornata) => {
        acc.missionePersonaleX = acc.missionePersonaleX || !!giornata.missionePersonaleX || !!giornata.missionePersonaleCompletata;
        acc.golParata = acc.golParata || !!giornata.golParata;
        acc.votiBassi = acc.votiBassi || !!giornata.votiBassi;
        return acc;
      },
      { missionePersonaleX: false, golParata: false, votiBassi: false }
    );
  }

  function isLeggendariaReached(teamTurno, giornataIndex) {
    const flags = getCumulativeFlags(teamTurno, giornataIndex);
    return !!(flags.missionePersonaleX && flags.golParata && flags.votiBassi);
  }

  function computeGiornataScore(teamTurno, giornataIndex) {
    const g = teamTurno?.giornate?.[giornataIndex];
    if (!g) return 0;

    let s = 0;
    if (g.missionePersonale && g.missionePersonaleCompletata) s += 1;
    if (g.missioneComune) s += 0.5;
    if (g.vittoria) s += 3;
    else if (g.pareggio) s += 1;

    const leggendariaNow = isLeggendariaReached(teamTurno, giornataIndex);
    const leggendariaBefore = giornataIndex > 0 ? isLeggendariaReached(teamTurno, giornataIndex - 1) : false;
    if (leggendariaNow && !leggendariaBefore) s += 1;

    return s;
  }

  function renderGiornataBlock(giornataIndex) {
    const giornataNumero = turnoIdx * 3 + giornataIndex + 1;
    const totaleGiornata = teams.reduce((acc, team) => {
      const teamTurno = team.perTurni?.[turnoIdx];
      return acc + computeGiornataScore(teamTurno, giornataIndex);
    }, 0);

    return (
      <div key={giornataIndex} style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "10px 0 6px" }}>
          <h3 style={{ margin: 0 }}>{giornataNumero}a giornata</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={() => onResetGiornata(giornataIndex)} style={{ padding: "6px 10px" }}>
              Reset giornata
            </button>
            <button type="button" onClick={() => onSaveGiornata(giornataIndex)} style={{ padding: "6px 10px" }}>
              Salva giornata
            </button>
          </div>
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
              const cumulativeFlags = getCumulativeFlags(teamTurno, giornataIndex);
              const previousFlags = giornataIndex > 0 ? getCumulativeFlags(teamTurno, giornataIndex - 1) : { missionePersonaleX: false, golParata: false, votiBassi: false };
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
                      title={g.missionePersonale ? "Spunta se la missione scelta è stata centrata" : "Scegli prima una missione"}
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
                      checked={!!cumulativeFlags.missionePersonaleX}
                      disabled={!g.missionePersonale || previousFlags.missionePersonaleX}
                      onChange={() => onToggleField(team.id, turnoIdx, giornataIndex, "missionePersonaleX")}
                      title={
                        previousFlags.missionePersonaleX
                          ? "Requisito gia raggiunto in una giornata precedente"
                          : g.missionePersonale
                            ? "Requisito cumulativo del turno"
                            : "Seleziona prima una missione personale"
                      }
                    />
                  </td>

                  <td style={cellCenter}>
                    <input
                      type="checkbox"
                      checked={!!cumulativeFlags.golParata}
                      disabled={previousFlags.golParata}
                      onChange={() => onToggleField(team.id, turnoIdx, giornataIndex, "golParata")}
                      title={previousFlags.golParata ? "Requisito gia raggiunto in una giornata precedente" : "Gol / Parato cumulativo nel turno"}
                    />
                  </td>

                  <td style={cellCenter}>
                    <input
                      type="checkbox"
                      checked={!!cumulativeFlags.votiBassi}
                      disabled={previousFlags.votiBassi}
                      onChange={() => onToggleField(team.id, turnoIdx, giornataIndex, "votiBassi")}
                      title={previousFlags.votiBassi ? "Requisito gia raggiunto in una giornata precedente" : "Voti bassi cumulativi nel turno"}
                    />
                  </td>

                  <td style={{ ...cellCenter, fontWeight: 600 }}>{computeGiornataScore(teamTurno, giornataIndex)}</td>

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

  function renderClassificaBlock(giornataIndex) {
    const classifica = teams
      .map(team => {
        const teamTurno = team.perTurni?.[turnoIdx];
        const giornate = teamTurno?.giornate?.slice(0, giornataIndex + 1) || [];

        const stats = giornate.reduce(
          (acc, g, index) => {
            acc.G += g.missionePersonale ? 1 : 0;
            acc.Vit += g.vittoria ? 1 : 0;
            acc.Par += g.pareggio ? 1 : 0;
            acc.MP += g.missionePersonaleCompletata ? 1 : 0;
            acc.MC += g.missioneComune ? 1 : 0;
            acc.ML = isLeggendariaReached(teamTurno, index) ? 1 : acc.ML;
            acc.Punti += computeGiornataScore(teamTurno, index);
            return acc;
          },
          { G: 0, Vit: 0, Par: 0, MP: 0, MC: 0, ML: 0, Punti: 0 }
        );

        return {
          squadra: team.nome,
          ...stats,
        };
      })
      .sort((a, b) => {
        if (b.Punti !== a.Punti) return b.Punti - a.Punti;
        if (b.Vit !== a.Vit) return b.Vit - a.Vit;
        if (b.MP !== a.MP) return b.MP - a.MP;
        return a.squadra.localeCompare(b.squadra);
      });

    return (
      <div style={{ margin: "0 0 28px" }}>
        <h3 style={{ margin: "12px 0 8px" }}>Classifica {giornataIndex + 1}a Giornata</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <thead>
            <tr>
              <th style={{ ...cellHeader, width: "6%" }}>Pos.</th>
              <th style={{ ...cellHeader, width: "20%", textAlign: "left" }}>Squadra</th>
              <th style={{ ...cellHeader, width: "6%" }}>G</th>
              <th style={{ ...cellHeader, width: "6%" }}>Vit</th>
              <th style={{ ...cellHeader, width: "6%" }}>Par</th>
              <th style={{ ...cellHeader, width: "6%" }}>MP</th>
              <th style={{ ...cellHeader, width: "6%" }}>MC</th>
              <th style={{ ...cellHeader, width: "6%" }}>ML</th>
              <th style={{ ...cellHeader, width: "6%" }}>Punti</th>
            </tr>
          </thead>
          <tbody>
            {classifica.map((row, index) => (
              <tr key={`${row.squadra}-${giornataIndex}`}>
                <td style={cellCenter}>{index + 1}</td>
                <td style={{ ...cellBase, fontWeight: 500 }}>{row.squadra}</td>
                <td style={cellCenter}>{row.G}</td>
                <td style={cellCenter}>{row.Vit}</td>
                <td style={cellCenter}>{row.Par}</td>
                <td style={cellCenter}>{row.MP}</td>
                <td style={cellCenter}>{row.MC}</td>
                <td style={cellCenter}>{row.ML}</td>
                <td style={{ ...cellCenter, fontWeight: 700 }}>{row.Punti}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, fontFamily: "Segoe UI, Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>Turno {selectedTurno}</h2>
          <div style={{ marginTop: 4, color: "#666" }}>
            Giornate {turnoIdx * 3 + 1}-{turnoIdx * 3 + 3}
          </div>
        </div>
        <div>
          <button onClick={onSave} disabled={loading} style={{ padding: "6px 12px" }}>
            {loading ? "Salvataggio..." : "Salva turno completo"}
          </button>
          <button
            type="button"
            onClick={onResetTurno}
            style={{ padding: "6px 12px", marginLeft: 8 }}
          >
            Reset turno completo
          </button>
        </div>
      </div>

      {renderGiornataBlock(0)}
      {renderGiornataBlock(1)}
      {renderGiornataBlock(2)}

      {renderClassificaBlock(0)}
      {renderClassificaBlock(1)}
      {renderClassificaBlock(2)}
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
