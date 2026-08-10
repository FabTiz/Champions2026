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

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #ccc" }}>
            <th style={{ width: "18%", padding: 8 }}>Squadra</th>
            <th style={{ width: "24%", textAlign: "center", padding: 8 }}>Giornata 1</th>
            <th style={{ width: "24%", textAlign: "center", padding: 8 }}>Giornata 2</th>
            <th style={{ width: "24%", textAlign: "center", padding: 8 }}>Giornata 3</th>
            <th style={{ width: "10%", textAlign: "center", padding: 8 }}>Punteggio Totale</th>
          </tr>
        </thead>

        <tbody>
          {totalsByTeam.map(t => {
            const turno = t.turno;
            const totale = t.totale;
            return (
              <tr key={t.id} style={{ borderTop: "1px solid #eee" }}>
                <td style={{ padding: "8px 6px" }}>{t.nome}</td>

                {turno?.giornate.map((g, gi) => (
                  <td key={gi} style={{ padding: 8, verticalAlign: "top" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
                      <label style={{ fontSize: 12 }}>
                        <input
                          type="checkbox"
                          checked={!!g.missionePersonale}
                          onChange={() => onToggleField(t.id, turnoIdx, gi, "missionePersonale")}
                        />{" "}
                        Missione Personale (+0.5)
                      </label>

                      <label style={{ fontSize: 12 }}>
                        <input
                          type="checkbox"
                          checked={!!g.missionePersonaleX}
                          onChange={() => onToggleField(t.id, turnoIdx, gi, "missionePersonaleX")}
                        />{" "}
                        Missione Personale X
                      </label>

                      <div style={{ fontSize: 11, color: "#555", textAlign: "center" }}>
                        Conta +1 solo se Gol/Parata + Voto 5
                      </div>

                      <label style={{ fontSize: 12 }}>
                        <input
                          type="checkbox"
                          checked={!!g.golParata}
                          onChange={() => onToggleField(t.id, turnoIdx, gi, "golParata")}
                        />{" "}
                        Gol/Parata
                      </label>

                      <label style={{ fontSize: 12 }}>
                        <input
                          type="checkbox"
                          checked={!!g.votiBassi}
                          onChange={() => onToggleField(t.id, turnoIdx, gi, "votiBassi")}
                        />{" "}
                        Voto 5 (VotiBassi)
                      </label>

                      <label style={{ fontSize: 12 }}>
                        <input
                          type="checkbox"
                          checked={!!g.missioneComune}
                          onChange={() => onToggleField(t.id, turnoIdx, gi, "missioneComune")}
                        />{" "}
                        Missione Comune (+1)
                      </label>

                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <label style={{ fontSize: 12 }}>
                          <input
                            type="radio"
                            name={`esito-${t.id}-${turnoIdx}-${gi}`}
                            checked={!!g.vittoria}
                            onChange={() => onToggleField(t.id, turnoIdx, gi, "vittoria")}
                          />{" "}
                          V
                        </label>
                        <label>
                          <input
                            type="radio"
                            name={`esito-${t.id}-${turnoIdx}-${gi}`}
                            checked={!!g.pareggio}
                            onChange={() => onToggleField(t.id, turnoIdx, gi, "pareggio")}
                          />{" "}
                          P
                        </label>
                      </div>

                      <label style={{ fontSize: 12 }}>
                        <input
                          type="checkbox"
                          checked={!!g.missioneLeggendaria}
                          onChange={() => onToggleField(t.id, turnoIdx, gi, "missioneLeggendaria")}
                        />{" "}
                        Missione Leggendaria (+1)
                      </label>

                      <div style={{ fontSize: 12, fontWeight: 600 }}>Parziale: {computeGiornataScore(g)}</div>
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
