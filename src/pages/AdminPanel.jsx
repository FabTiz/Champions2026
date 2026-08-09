import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function AdminPanel() {
  const [openSection, setOpenSection] = useState(null);

  const toggle = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Admin Panel – Champions League Comp</h1>

      <Section title="Squadre" id="squadre" openSection={openSection} toggle={toggle}>
        <SquadreAdmin />
      </Section>

      <Section title="Turni" id="turni" openSection={openSection} toggle={toggle}>
        <TurniAdmin />
      </Section>

      <Section title="Giornate" id="giornate" openSection={openSection} toggle={toggle}>
        <GiornateAdmin />
      </Section>

      <Section title="Risultati" id="risultati" openSection={openSection} toggle={toggle}>
        <RisultatiAdmin />
      </Section>

      <Section title="Missioni Personali" id="missioni_personali" openSection={openSection} toggle={toggle}>
        <MissioniPersonaliAdmin />
      </Section>

      <Section title="Missioni Completate" id="missioni_completate" openSection={openSection} toggle={toggle}>
        <MissioniCompletateAdmin />
      </Section>

      <Section title="League Phase (league_turns)" id="league_turns" openSection={openSection} toggle={toggle}>
        <LeagueTurnsAdmin />
      </Section>

      <Section title="Playoff" id="playoffs" openSection={openSection} toggle={toggle}>
        <PlayoffAdmin />
      </Section>

      <Section title="Uomo Champions" id="uomo_champions" openSection={openSection} toggle={toggle}>
        <UomoChampionsAdmin />
      </Section>
    </div>
  );
}

/* -------------------- COMPONENTE SEZIONE -------------------- */

function Section({ title, id, openSection, toggle, children }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <h2
        onClick={() => toggle(id)}
        style={{
          cursor: "pointer",
          background: "#eee",
          padding: "10px",
          borderRadius: "8px",
        }}
      >
        {title}
      </h2>

      {openSection === id && (
        <div style={{ padding: "15px", border: "1px solid #ccc", borderRadius: "8px" }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* -------------------- SEZIONE SQUADRE -------------------- */

function SquadreAdmin() {
  const [name, setName] = useState("");
  const [squads, setSquads] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase.from("squads").select("*");
    setSquads(data || []);
  }

  async function addSquad() {
    await supabase.from("squads").insert({ name });
    setName("");
    load();
  }

  return (
    <>
      <h3>Aggiungi Squadra</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome squadra" />
      <button onClick={addSquad}>Aggiungi</button>

      <h3>Lista Squadre</h3>
      <ul>
        {squads.map((s) => (
          <li key={s.id}>{s.name}</li>
        ))}
      </ul>
    </>
  );
}

/* -------------------- SEZIONE TURNI -------------------- */

function TurniAdmin() {
  const [turni, setTurni] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase.from("turni").select("*");
    setTurni(data || []);
  }

  return (
    <>
      <h3>Turni</h3>
      <ul>
        {turni.map((t) => (
          <li key={t.id}>
            Turno {t.id} – {t.nome}
          </li>
        ))}
      </ul>
    </>
  );
}

/* -------------------- SEZIONE GIORNATE -------------------- */

function GiornateAdmin() {
  const [giornate, setGiornate] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase.from("giornate").select("*");
    setGiornate(data || []);
  }

  return (
    <>
      <h3>Giornate</h3>
      <ul>
        {giornate.map((g) => (
          <li key={g.id}>
            Giornata {g.id} – Turno {g.turno_id}
          </li>
        ))}
      </ul>
    </>
  );
}

/* -------------------- SEZIONE RISULTATI -------------------- */

function RisultatiAdmin() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase.from("risultati").select("*");
    setResults(data || []);
  }

  return (
    <>
      <h3>Risultati</h3>
      <ul>
        {results.map((r) => (
          <li key={r.id}>
            Giornata {r.giornata} – Squadra {r.squad_id} – {r.fantapunti} punti
          </li>
        ))}
      </ul>
    </>
  );
}

/* -------------------- SEZIONE MISSIONI PERSONALI -------------------- */

function MissioniPersonaliAdmin() {
  const [missioni, setMissioni] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase.from("missioni_personali_scelte").select("*");
    setMissioni(data || []);
  }

  return (
    <>
      <h3>Missioni Personali Scelte</h3>
      <ul>
        {missioni.map((m) => (
          <li key={m.id}>
            Turno {m.turno_id} – Squadra {m.squad_id} – {m.missione}
          </li>
        ))}
      </ul>
    </>
  );
}

/* -------------------- SEZIONE MISSIONI COMPLETATE -------------------- */

function MissioniCompletateAdmin() {
  const [missioni, setMissioni] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase.from("missioni_completate").select("*");
    setMissioni(data || []);
  }

  return (
    <>
      <h3>Missioni Completate</h3>
      <ul>
        {missioni.map((m) => (
          <li key={m.id}>
            Turno {m.turno_id} – Squadra {m.squad_id} – Comune: {m.comune ? "✔" : "✘"} – Personale: {m.personale ? "✔" : "✘"} – Leggendaria: {m.leggendaria ? "✔" : "✘"}
          </li>
        ))}
      </ul>
    </>
  );
}

/* -------------------- SEZIONE LEAGUE TURNS -------------------- */

function LeagueTurnsAdmin() {
  const [turns, setTurns] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase.from("league_turns").select("*");
    setTurns(data || []);
  }

  return (
    <>
      <h3>League Phase – Turni</h3>
      <ul>
        {turns.map((t) => (
          <li key={t.id}>
            Turno {t.turn_number} – {t.team_home_id} vs {t.team_away_id} – Totali: {t.total_home} / {t.total_away}
          </li>
        ))}
      </ul>
    </>
  );
}

/* -------------------- SEZIONE PLAYOFF -------------------- */

function PlayoffAdmin() {
  const [playoffs, setPlayoffs] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase.from("playoffs").select("*");
    setPlayoffs(data || []);
  }

  return (
    <>
      <h3>Playoff</h3>
      <ul>
        {playoffs.map((p) => (
          <li key={p.id}>
            {p.phase} – {p.team_home_id} vs {p.team_away_id} – Totali: {p.total_home} / {p.total_away}
          </li>
        ))}
      </ul>
    </>
  );
}

/* -------------------- SEZIONE UOMO CHAMPIONS -------------------- */

function UomoChampionsAdmin() {
  const [data, setData] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase.from("uomo_champions").select("*");
    setData(data || []);
  }

  return (
    <>
      <h3>Uomo Champions</h3>
      <ul>
        {data.map((u) => (
          <li key={u.id}>
            {u.fase} – Squadra {u.squad_id} – {u.giocatore} ({u.ruolo}) – Bonus: {u.bonus} – Malus: {u.malus}
          </li>
        ))}
      </ul>
    </>
  );
}
