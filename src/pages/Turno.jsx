// src/pages/Turno.jsx
import React, { useEffect, useState } from "react";
import Turno from "../components/Turno";
import { supabase } from "../supabaseClient";

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
  missionePersonale: "",
  missionePersonaleCompletata: false,
  missionePersonaleX: false,
  golParata: false,
  votiBassi: false,
  missioneComune: false,
  vittoria: false,
  pareggio: false,
});

const makePerTurni = () =>
  Array.from({ length: 7 }, () => ({ giornate: [makeEmptyGiornata(), makeEmptyGiornata(), makeEmptyGiornata()] }));

export default function TurnoPage() {
  const [selectedTurno, setSelectedTurno] = useState(1);
  const [teams, setTeams] = useState(() =>
    TEAM_NAMES.map((nome, idx) => ({ id: `team-${idx + 1}`, nome, perTurni: makePerTurni() }))
  );
  const [loading, setLoading] = useState(false);
  const [remoteTurns, setRemoteTurns] = useState([]);
  const [saveMessage, setSaveMessage] = useState("");

  const draftStorageKey = "champions-turno-drafts-v1";

  function loadDrafts() {
    try {
      const raw = localStorage.getItem(draftStorageKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function persistDraft(turnNumber, giornataIndex, snapshotTeams) {
    const drafts = loadDrafts();
    drafts[turnNumber] = {
      turnNumber,
      giornataIndex,
      savedAt: new Date().toISOString(),
      teams: snapshotTeams,
    };
    localStorage.setItem(draftStorageKey, JSON.stringify(drafts));
  }

  function readDraft(turnNumber) {
    const drafts = loadDrafts();
    return drafts[String(turnNumber)] || drafts[turnNumber] || null;
  }

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    setLoading(true);
    supabase
      .from("league_turns")
      .select("*")
      .order("id", { ascending: false })
      .limit(5)
      .then(({ data, error }) => {
        if (!mounted) return;
        setLoading(false);
        if (error) {
          console.warn("Supabase read warning:", error);
          return;
        }
        setRemoteTurns(data || []);
      });
    return () => {
      mounted = false;
    };
  }, [supabase]);

  useEffect(() => {
    const draft = readDraft(selectedTurno);
    if (draft?.teams) {
      setTeams(draft.teams);
      setSaveMessage(`Bozza turno ${selectedTurno} caricata.`);
    } else {
      setSaveMessage("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTurno]);

  // clone helper per aggiornamenti immutabili
  const cloneTeams = prev =>
    prev.map(t => ({ ...t, perTurni: t.perTurni.map(turno => ({ giornate: turno.giornate.map(g => ({ ...g })) })) }));

  function onToggleField(teamId, turnoIndex, giornataIndex, field, forcedValue) {
    setTeams(prev => {
      const copy = cloneTeams(prev);
      const team = copy.find(x => x.id === teamId);
      if (!team) return prev;
      const g = team.perTurni[turnoIndex].giornate[giornataIndex];

      if (field === "missionePersonale") {
        g.missionePersonale = typeof forcedValue === "string" ? forcedValue : "";
        g.missionePersonaleCompletata = false;
        g.missionePersonaleX = !!g.missionePersonale;
        return copy;
      }

      if (field === "missionePersonaleCompletata") {
        g.missionePersonaleCompletata = typeof forcedValue === "boolean" ? forcedValue : !g.missionePersonaleCompletata;
        return copy;
      }

      if (field === "missioneComune") {
        g.missioneComune = typeof forcedValue === "boolean" ? forcedValue : !g.missioneComune;
        return copy;
      }

      if (field === "vittoria") {
        g.vittoria = typeof forcedValue === "boolean" ? forcedValue : !g.vittoria;
        if (g.vittoria) g.pareggio = false;
      } else if (field === "pareggio") {
        g.pareggio = typeof forcedValue === "boolean" ? forcedValue : !g.pareggio;
        if (g.pareggio) g.vittoria = false;
      } else if (field === "missionePersonaleX") {
        if (!g.missionePersonale) {
          g.missionePersonaleX = false;
        } else {
          g.missionePersonaleX = typeof forcedValue === "boolean" ? forcedValue : !g.missionePersonaleX;
        }
      } else {
        g[field] = typeof forcedValue === "boolean" ? forcedValue : !g[field];
      }

      return copy;
    });
  }

  // calcolo punteggio per giornata (stessa logica del componente)
  function computeGiornataScore(g) {
    let s = 0;
    if (g.missionePersonale && g.missionePersonaleCompletata) s += 1;
    if (g.missionePersonaleX && g.golParata && g.votiBassi) s += 1;
    if (g.missioneComune) s += 0.5;
    if (g.vittoria) s += 3;
    else if (g.pareggio) s += 1;
    return s;
  }

  function saveGiornataDraft(giornataIndex) {
    persistDraft(selectedTurno, giornataIndex, teams);
    setSaveMessage(`Bozza salvata per turno ${selectedTurno}, giornata ${giornataIndex + 1}.`);
  }

  async function onSave() {
    if (!supabase) {
      alert("Supabase client non disponibile. Salvataggio locale solo.");
      console.log("Stato teams:", teams);
      return;
    }

    setLoading(true);
    try {
      const turnoIdx = selectedTurno - 1;
      // Mappa payload: qui esempio che salva un record per ogni squadra come home (adatta ai tuoi id reali)
      const payload = teams.map((t, idx) => {
        const turno = t.perTurni[turnoIdx];
        return {
          turn_number: selectedTurno,
          team_home_id: idx + 1, // sostituisci con id reali
          team_away_id: null,
          matchday_1_points_home: computeGiornataScore(turno.giornate[0]),
          matchday_2_points_home: computeGiornataScore(turno.giornate[1]),
          matchday_3_points_home: computeGiornataScore(turno.giornate[2]),
          total_home: turno.giornate.reduce((acc, g) => acc + computeGiornataScore(g), 0),
        };
      });

      const { data, error } = await supabase.from("league_turns").insert(payload);

      if (error) {
        console.error("Errore insert Supabase:", error);
        alert("Errore salvataggio: vedi console");
      } else {
        console.log("Salvataggio riuscito:", data);
        const drafts = loadDrafts();
        delete drafts[selectedTurno];
        localStorage.setItem(draftStorageKey, JSON.stringify(drafts));
        alert("Salvataggio riuscito");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 12, display: "flex", gap: 12, alignItems: "center" }}>
        <label>
          Seleziona turno:
          <select value={selectedTurno} onChange={e => setSelectedTurno(Number(e.target.value))} style={{ marginLeft: 8 }}>
            {Array.from({ length: 7 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
          </select>
        </label>
        {saveMessage ? <span style={{ fontSize: 13, color: "#555" }}>{saveMessage}</span> : null}
      </div>

      <Turno
        teams={teams}
        selectedTurno={selectedTurno}
        onToggleField={onToggleField}
        onSaveGiornata={saveGiornataDraft}
        onSave={onSave}
        loading={loading}
      />

      <div style={{ marginTop: 16 }}>
        <h4>Ultimi turni dal DB (debug)</h4>
        <pre style={{ maxHeight: 200, overflow: "auto", background: "#f6f6f6", padding: 8 }}>
          {JSON.stringify(remoteTurns, null, 2)}
        </pre>
      </div>
    </div>
  );
}
