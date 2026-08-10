// src/pages/Turno.jsx
import React, { useEffect, useState } from "react";
import Turno from "../components/Turno";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

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
  Array.from({ length: 10 }, () => ({ giornate: [makeEmptyGiornata(), makeEmptyGiornata(), makeEmptyGiornata()] }));

export default function TurnoPage() {
  const [selectedTurno, setSelectedTurno] = useState(1);
  const [teams, setTeams] = useState(() =>
    TEAM_NAMES.map((nome, idx) => ({ id: `team-${idx + 1}`, nome, perTurni: makePerTurni() }))
  );
  const [loading, setLoading] = useState(false);
  const [remoteTurns, setRemoteTurns] = useState([]);
  const [selectedTurnRows, setSelectedTurnRows] = useState([]);
  const [saveMessage, setSaveMessage] = useState("");

  const draftStorageKey = "champions-turno-drafts-v1";
  const savedTurnStorageKey = "champions-turno-saved-v1";
  const turnDetailTable = "league_turn_details";

  function cloneTurnState(turnState) {
    return {
      giornate: turnState.giornate.map(giornata => ({ ...giornata })),
    };
  }

  function extractTurnState(snapshotTeams, turnNumber) {
    const turnIdx = turnNumber - 1;
    return snapshotTeams.map(team => ({
      id: team.id,
      nome: team.nome,
      turno: cloneTurnState(team.perTurni[turnIdx]),
    }));
  }

  function mergeTurnState(baseTeams, turnNumber, storedTurnState) {
    const turnIdx = turnNumber - 1;
    return baseTeams.map(team => {
      const storedTeam = storedTurnState.find(item => item.id === team.id);
      if (!storedTeam) return team;

      const nextPerTurni = team.perTurni.map((turno, index) =>
        index === turnIdx ? cloneTurnState(storedTeam.turno) : turno
      );

      return {
        ...team,
        perTurni: nextPerTurni,
      };
    });
  }

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
      turnState: extractTurnState(snapshotTeams, turnNumber),
    };
    localStorage.setItem(draftStorageKey, JSON.stringify(drafts));
  }

  function readDraft(turnNumber) {
    const drafts = loadDrafts();
    return drafts[String(turnNumber)] || drafts[turnNumber] || null;
  }

  function loadSavedTurns() {
    try {
      const raw = localStorage.getItem(savedTurnStorageKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function persistSavedTurn(turnNumber, snapshotTeams) {
    const savedTurns = loadSavedTurns();
    savedTurns[turnNumber] = {
      turnNumber,
      savedAt: new Date().toISOString(),
      turnState: extractTurnState(snapshotTeams, turnNumber),
    };
    localStorage.setItem(savedTurnStorageKey, JSON.stringify(savedTurns));
  }

  function readSavedTurn(turnNumber) {
    const savedTurns = loadSavedTurns();
    return savedTurns[String(turnNumber)] || savedTurns[turnNumber] || null;
  }

  async function fetchSavedTurnDetail(turnNumber) {
    const { data, error } = await supabase
      .from(turnDetailTable)
      .select("turn_number, turn_state, saved_at")
      .eq("turn_number", turnNumber)
      .maybeSingle();

    if (error) {
      console.warn("Supabase turn detail warning:", error);
      return null;
    }

    return data;
  }

  async function persistSavedTurnDetail(turnNumber, snapshotTeams) {
    const turnState = extractTurnState(snapshotTeams, turnNumber);

    const { error } = await supabase
      .from(turnDetailTable)
      .upsert(
        {
          turn_number: turnNumber,
          turn_state: turnState,
          saved_at: new Date().toISOString(),
        },
        { onConflict: "turn_number" }
      );

    if (error) {
      console.error("Errore save turn detail Supabase:", error);
      throw error;
    }
  }

  async function deleteSavedTurnDetail(turnNumber) {
    const { error } = await supabase
      .from(turnDetailTable)
      .delete()
      .eq("turn_number", turnNumber);

    if (error) {
      console.warn("Errore delete turn detail Supabase:", error);
    }
  }

  async function fetchRemoteTurns() {
    const { data, error } = await supabase
      .from("league_turns")
      .select("*")
      .order("id", { ascending: false })
      .limit(5);

    if (error) {
      console.warn("Supabase read warning:", error);
      return;
    }

    setRemoteTurns(data || []);
  }

  async function fetchSelectedTurnRows(turnNumber) {
    const { data, error } = await supabase
      .from("league_turns")
      .select("*")
      .eq("turn_number", turnNumber)
      .order("team_home_id", { ascending: true });

    if (error) {
      console.warn("Supabase selected turn warning:", error);
      setSelectedTurnRows([]);
      return;
    }

    setSelectedTurnRows(data || []);
  }

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    setLoading(true);
    Promise.all([fetchRemoteTurns(), fetchSelectedTurnRows(selectedTurno)]).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [supabase, selectedTurno]);

  useEffect(() => {
    let active = true;

    async function loadSelectedTurnState() {
      const draft = readDraft(selectedTurno);
      if (draft?.turnState) {
        if (!active) return;
        setTeams(prev => mergeTurnState(prev, selectedTurno, draft.turnState));
        setSaveMessage(`Bozza turno ${selectedTurno} caricata.`);
        return;
      }

      const remoteDetail = await fetchSavedTurnDetail(selectedTurno);
      if (remoteDetail?.turn_state) {
        if (!active) return;
        setTeams(prev => mergeTurnState(prev, selectedTurno, remoteDetail.turn_state));
        setSaveMessage(`Turno ${selectedTurno} caricato da Supabase.`);
        return;
      }

      const savedTurn = readSavedTurn(selectedTurno);
      if (savedTurn?.turnState) {
        if (!active) return;
        setTeams(prev => mergeTurnState(prev, selectedTurno, savedTurn.turnState));
        setSaveMessage(`Turno ${selectedTurno} caricato dai dati salvati.`);
        return;
      }

      if (active) {
        setSaveMessage("");
      }
    }

    loadSelectedTurnState();

    return () => {
      active = false;
    };
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
        g.missionePersonaleX = false;
        return copy;
      }

      if (field === "missionePersonaleCompletata") {
        g.missionePersonaleCompletata = typeof forcedValue === "boolean" ? forcedValue : !g.missionePersonaleCompletata;
        g.missionePersonaleX = !!g.missionePersonaleCompletata;
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
    if (g.missionePersonaleCompletata) s += 1;
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

  function resetGiornata(giornataIndex) {
    setTeams(prev => {
      const copy = cloneTeams(prev);
      copy.forEach(team => {
        const g = team.perTurni[selectedTurno - 1]?.giornate?.[giornataIndex];
        if (!g) return;
        g.missionePersonale = "";
        g.missionePersonaleCompletata = false;
        g.missionePersonaleX = false;
        g.golParata = false;
        g.votiBassi = false;
        g.missioneComune = false;
        g.vittoria = false;
        g.pareggio = false;
      });
      return copy;
    });
    setSaveMessage(`Giornata ${giornataIndex + 1} resettata.`);
  }

  function resetTotaleTurno() {
    const ok = window.confirm("Sei sicuro?\n\nVuoi resettare tutto il turno? (si/no)");
    if (!ok) return;

    setTeams(prev => {
      const copy = cloneTeams(prev);
      copy.forEach(team => {
        const turno = team.perTurni[selectedTurno - 1];
        if (!turno) return;
        turno.giornate = turno.giornate.map(() => ({
          missionePersonale: "",
          missionePersonaleCompletata: false,
          missionePersonaleX: false,
          golParata: false,
          votiBassi: false,
          missioneComune: false,
          vittoria: false,
          pareggio: false,
        }));
      });
      return copy;
    });

    const drafts = loadDrafts();
    delete drafts[selectedTurno];
    localStorage.setItem(draftStorageKey, JSON.stringify(drafts));
    const savedTurns = loadSavedTurns();
    delete savedTurns[selectedTurno];
    localStorage.setItem(savedTurnStorageKey, JSON.stringify(savedTurns));
    deleteSavedTurnDetail(selectedTurno);
    setSaveMessage(`Turno ${selectedTurno} resettato.`);
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

      const payload = teams.map((t, idx) => {
        const turno = t.perTurni[turnoIdx];
        const matchday1 = computeGiornataScore(turno.giornate[0]);
        const matchday2 = computeGiornataScore(turno.giornate[1]);
        const matchday3 = computeGiornataScore(turno.giornate[2]);
        const totalHome = matchday1 + matchday2 + matchday3;

        let result = "draw";
        let championsHome = 1;
        let championsAway = 1;

        if (totalHome >= 6) {
          result = "home_win";
          championsHome = 3;
          championsAway = 0;
        }

        return {
          turn_number: selectedTurno,
          team_home_id: idx + 1,
          team_away_id: idx + 1,
          matchday_1_points_home: matchday1,
          matchday_1_points_away: 0,
          matchday_2_points_home: matchday2,
          matchday_2_points_away: 0,
          matchday_3_points_home: matchday3,
          matchday_3_points_away: 0,
          total_home: totalHome,
          total_away: 0,
          result,
          champions_points_home: championsHome,
          champions_points_away: championsAway,
        };
      });

      const teamIds = teams.map((_, idx) => idx + 1);
      const { error: deleteError } = await supabase
        .from("league_turns")
        .delete()
        .eq("turn_number", selectedTurno)
        .in("team_home_id", teamIds);

      if (deleteError) {
        console.error("Errore delete Supabase:", deleteError);
        alert(`Errore cancellazione dati turno: ${deleteError.message}`);
        return;
      }

      const { data, error } = await supabase.from("league_turns").insert(payload).select();

      if (error) {
        console.error("Errore insert Supabase:", error);
        alert(`Errore salvataggio: ${error.message}`);
      } else {
        console.log("Salvataggio riuscito:", data);
        await persistSavedTurnDetail(selectedTurno, teams);
        persistSavedTurn(selectedTurno, teams);
        const drafts = loadDrafts();
        delete drafts[selectedTurno];
        localStorage.setItem(draftStorageKey, JSON.stringify(drafts));
        await fetchRemoteTurns();
        await fetchSelectedTurnRows(selectedTurno);
        setSaveMessage(`Turno ${selectedTurno} salvato su Supabase.`);
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
            {Array.from({ length: 10 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
          </select>
        </label>
        {saveMessage ? <span style={{ fontSize: 13, color: "#555" }}>{saveMessage}</span> : null}
      </div>

      <Link to="/" style={{ display: "inline-block", marginBottom: 16 }}>
        ⬅ Torna alla Home
      </Link>

      <Turno
        teams={teams}
        selectedTurno={selectedTurno}
        savedTurnRows={selectedTurnRows}
        onToggleField={onToggleField}
        onSaveGiornata={saveGiornataDraft}
        onResetGiornata={resetGiornata}
        onResetTurno={resetTotaleTurno}
        onSave={onSave}
        loading={loading}
      />

      <div style={{ marginTop: 16 }}>
        <h4>Ultimi turni dal DB (debug)</h4>
        {remoteTurns.length === 0 ? (
          <p style={{ background: "#f6f6f6", padding: 8 }}>Nessun turno salvato su Supabase. Quando salvi il turno completo, qui compariranno gli ultimi record.</p>
        ) : (
          <pre style={{ maxHeight: 200, overflow: "auto", background: "#f6f6f6", padding: 8 }}>
            {JSON.stringify(remoteTurns, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
