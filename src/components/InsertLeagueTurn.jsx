import { useState } from "react";
import { supabase } from "../supabaseClient";

function InsertLeagueTurn() {
  const [form, setForm] = useState({
    turn_number: "",
    team_home_id: "",
    team_away_id: "",
    md1_home: "",
    md1_away: "",
    md2_home: "",
    md2_away: "",
    md3_home: "",
    md3_away: ""
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Calcolo totali
    const total_home =
      Number(form.md1_home) +
      Number(form.md2_home) +
      Number(form.md3_home);

    const total_away =
      Number(form.md1_away) +
      Number(form.md2_away) +
      Number(form.md3_away);

    // Determinazione risultato
    let result = "draw";
    let champions_home = 1;
    let champions_away = 1;

    const diff = Math.abs(total_home - total_away);

    if (diff >= 6) {
      if (total_home > total_away) {
        result = "home_win";
        champions_home = 3;
        champions_away = 0;
      } else {
        result = "away_win";
        champions_home = 0;
        champions_away = 3;
      }
    }

    // Inserimento in Supabase
    const { data, error } = await supabase.from("league_turns").insert([
      {
        turn_number: Number(form.turn_number),
        team_home_id: Number(form.team_home_id),
        team_away_id: Number(form.team_away_id),

        matchday_1_points_home: Number(form.md1_home),
        matchday_1_points_away: Number(form.md1_away),

        matchday_2_points_home: Number(form.md2_home),
        matchday_2_points_away: Number(form.md2_away),

        matchday_3_points_home: Number(form.md3_home),
        matchday_3_points_away: Number(form.md3_away),

        total_home,
        total_away,
        result,
        champions_points_home: champions_home,
        champions_points_away: champions_away
      }
    ]);

    console.log("DATA:", data);
    console.log("ERROR:", error);
    alert("Turno inserito correttamente!");
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Inserisci Turno League Phase</h2>

      <label>Turno (1-7)</label>
      <input name="turn_number" onChange={handleChange} />

      <label>ID Squadra Casa</label>
      <input name="team_home_id" onChange={handleChange} />

      <label>ID Squadra Trasferta</label>
      <input name="team_away_id" onChange={handleChange} />

      <h3>Giornata 1</h3>
      <input name="md1_home" placeholder="Casa" onChange={handleChange} />
      <input name="md1_away" placeholder="Trasferta" onChange={handleChange} />

      <h3>Giornata 2</h3>
      <input name="md2_home" placeholder="Casa" onChange={handleChange} />
      <input name="md2_away" placeholder="Trasferta" onChange={handleChange} />

      <h3>Giornata 3</h3>
      <input name="md3_home" placeholder="Casa" onChange={handleChange} />
      <input name="md3_away" placeholder="Trasferta" onChange={handleChange} />

      <button type="submit">Inserisci Turno</button>
    </form>
  );
}

export default InsertLeagueTurn;
