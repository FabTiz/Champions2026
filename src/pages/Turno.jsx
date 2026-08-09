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

const backBtnHover = {
  background: "#ccc",
};

export default function Turno() {
  const [giornata, setGiornata] = useState("");
  const [turno, setTurno] = useState(null);
  const [squads, setSquads] = useState([]);
  const [missioniScelte, setMissioniScelte] = useState({});
  const [risultatiTurno, setRisultatiTurno] = useState([]);

  // Turni
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

  // Carica squadre
  useEffect(() => {
    async function loadSquads() {
      const { data } = await supabase.from("squads").select("*");
      setSquads(data || []);
    }
    loadSquads();
  }, []);

  // Quando selezioni la giornata → calcola il turno
  useEffect(() => {
    if (!giornata) return;
    const t = TURNS.find((t) => t.giornate.includes(Number(giornata)));
    setTurno(t);
  }, [giornata]);

  // Carica risultati delle 3 giornate del turno
  useEffect(() => {
    async function loadRisultati() {
      if (!turno) return;
      const { data } = await supabase
        .from("risultati")
        .select("*")
        .in("giornata", turno.giornate);

      setRisultatiTurno(data || []);
    }
    loadRisultati();
  }, [turno]);

  // Salva missione personale scelta
  async function salvaMissione(squadId, missione) {
    await supabase.from("missioni_personali_scelte").upsert({
      turno_id: turno.id,
      squad_id: squadId,
      missione,
    });
  }

  // Calcolo missioni del turno
  function calcolaMissioniPerSquadra(squadId) {
    const risultati = risultatiTurno.filter((r) => r.squad_id === squadId);

    if (risultati.length !== 3) return null;

    const scores = risultati.map((r) => r.fantapunti);
    const totaleFantapunti = scores.reduce((a, b) => a + b, 0);

    const comune = Math.max(...scores) - Math.min(...scores) <= 10;

    const missionePersonale = missioniScelte[squadId];
    let personale = false;

    const r = {
      golTotali: risultati.reduce((a, b) => a + b.gol, 0),
      bonusTotali: risultati.reduce((a, b) => a + b.assist + b.rigori_parati, 0),
      giocatoriConBonus: risultati.filter((x) => x.assist + x.rigori_parati > 0).length,
      top4Count: risultati.filter((x) => x.top4).length,
      votiBassi: risultati.reduce((a, b) => a + b.voti_bassi, 0),
      eventoSpeciale: risultati.some((x) => x.evento_speciale),
    };

    switch (missionePersonale) {
      case "Dominio Offensivo":
        personale = r.golTotali >= 5;
        break;
      case "Qualità di Squadra":
        personale = totaleFantapunti >= 216;
        break;
      case "Bonus Diffuso":
        personale = r.bonusTotali >= 6 && r.giocatoriConBonus >= 4;
        break;
      case "One Shot":
        personale = scores.some((s) => s >= 76);
        break;
      case "Continuità Europea":
        personale = scores.every((s) => s >= 68);
        break;
      case "Top Performer":
        personale = r.top4Count >= 2;
        break;
    }

    const leggendaria = personale && r.eventoSpeciale && r.votiBassi <= 5;

    return { comune, personale, leggendaria };
  }

  // Salva missioni completate
  async function salvaMissioniCompletate() {
    for (const squad of squads) {
      const result = calcolaMissioniPerSquadra(squad.id);
      if (!result) continue;

      await supabase.from("missioni_completate").upsert({
        turno_id: turno.id,
        squad_id: squad.id,
        comune: result.comune,
        personale: result.personale,
        leggendaria: result.leggendaria,
      });
    }
    alert("Missioni calcolate e salvate!");
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>Gestione Turno Champions</h1>

      {/* TORNA ALLA HOME - IN ALTO */}
      <Link
        to="/"
        style={backBtn}
        onMouseEnter={(e) => Object.assign(e.currentTarget.style, backBtnHover)}
        onMouseLeave={(e) => Object.assign(e.currentTarget.style, backBtn)}
      >
        ⬅ Torna alla Home
      </Link>

      {/* Selezione giornata */}
      <label>Seleziona giornata:</label>
      <select
        value={giornata}
        onChange={(e) => setGiornata(e.target.value)}
      >
        <option value="">-- scegli --</option>
        {Array.from({ length: 21 }, (_, i) => i + 1).map((g) => (
          <option key={g} value={g}>
            {g}ª giornata
          </option>
        ))}
      </select>

      {/* TORNA ALLA HOME - SUBITO DOPO IL MENU */}
      <Link
        to="/"
        style={backBtn}
        onMouseEnter={(e) => Object.assign(e.currentTarget.style, backBtnHover)}
        onMouseLeave={(e) => Object.assign(e.currentTarget.style, backBtn)}
      >
        ⬅ Torna alla Home
      </Link>

      {/* Mostra turno */}
      {turno && (
        <div style={{ marginTop: "20px" }}>
          <h2>Turno {turno.id}</h2>
          <p>Giornate: {turno.giornate.join(", ")}</p>
        </div>
      )}

      {/* Scelta missioni personali */}
      {turno && (
        <div style={{ marginTop: "30px" }}>
          <h3>Missioni Personali</h3>

          {squads.map((squad) => (
            <div key={squad.id} style={{ marginBottom: "15px" }}>
              <strong>{squad.name}</strong>

              <select
                value={missioniScelte[squad.id] || ""}
                onChange={(e) => {
                  const missione = e.target.value;
                  setMissioniScelte((prev) => ({
                    ...prev,
                    [squad.id]: missione,
                  }));
                  salvaMissione(squad.id, missione);
                }}
                style={{ marginLeft: "10px" }}
              >
                <option value="">-- scegli missione --</option>
                {PERSONAL_MISSIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Calcolo missioni */}
      {turno && (
        <button
          onClick={salvaMissioniCompletate}
          style={{
            marginTop: "30px",
            padding: "10px 20px",
            fontSize: "16px",
          }}
        >
          Calcola Missioni del Turno
        </button>
      )}
    </div>
  );
}
