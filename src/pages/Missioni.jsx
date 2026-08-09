import { Link } from "react-router-dom";

const backBtn = {
  display: "inline-block",
  padding: "10px 15px",
  background: "#ddd",
  borderRadius: "8px",
  textDecoration: "none",
  fontSize: "18px",
  color: "#000",
  transition: "0.2s",
  marginTop: "30px",
};

const backBtnHover = {
  background: "#ccc",
};

export default function Missioni() {
  return (
    <div style={{ padding: "30px", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        Missioni – Champions League Comp
      </h1>

      <section style={{ marginBottom: "40px" }}>
        <h2>📍 League Phase</h2>
        <p>
          La competizione si sviluppa in <strong>21 giornate</strong>, suddivise in{" "}
          <strong>7 turni da 3 giornate</strong> ciascuno.  
          Ogni squadra affronta tutte le altre 7.
        </p>

        <h3>Punteggio del turno</h3>
        <ul>
          <li>🟢 <strong>Vittoria</strong> (≥ 6 fantapunti di vantaggio) → +3 punti</li>
          <li>🟡 <strong>Pareggio</strong> (&lt; 6 punti di scarto) → +1 punto a entrambe</li>
        </ul>
        <p>
          A questi punti si aggiungono gli eventuali bonus ottenuti tramite le missioni.
        </p>
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>🎯 Missioni del Turno</h2>

        <h3>🌍 Missione Comune (+0,5)</h3>
        <p><strong>Regolarità:</strong> la differenza tra il punteggio più alto e quello più basso della squadra nelle tre giornate non deve superare i 10 punti.</p>

        <h3>👤 Missione Personale (+1)</h3>
        <p>Ogni fantallenatore sceglie una missione prima del turno:</p>
        <ul>
          <li>⚽ <strong>Dominio Offensivo:</strong> almeno 5 gol complessivi</li>
          <li>📈 <strong>Qualità di Squadra:</strong> almeno 216 fantapunti</li>
          <li>🌟 <strong>Bonus Diffuso:</strong> almeno 6 bonus da ≥ 4 giocatori</li>
          <li>🔥 <strong>One Shot:</strong> almeno 76 punti in una giornata</li>
          <li>🛡️ <strong>Continuità Europea:</strong> mai sotto 68 punti</li>
          <li>🏆 <strong>Top Performer:</strong> almeno 2 giornate su 3 nella Top 4</li>
        </ul>

        <h3>⭐ Missione Leggendaria (+1)</h3>
        <p>Per completarla devono verificarsi tutte le seguenti condizioni:</p>
        <ul>
          <li>Completare la Missione Personale scelta</li>
          <li>Almeno uno tra:
            <ul>
              <li>gol di un Difensore</li>
              <li>gol di un Centrocampista</li>
              <li>rigore parato da un Portiere</li>
            </ul>
          </li>
          <li>Massimo 5 voti ≤ 5 (voto originale) nelle tre giornate</li>
        </ul>
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>📊 Classifica Champions – League Phase</h2>
        <p>Criteri:</p>
        <ul>
          <li>Punti in Classifica Champions</li>
          <li>Scontri diretti</li>
          <li>Fantapunti complessivi</li>
          <li>Differenza fantapunti</li>
        </ul>
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>🏁 Playoff</h2>
        <p>Le 8 squadre accedono ai Playoff (9 giornate):</p>
        <ul>
          <li>Quarti di Finale (3 giornate)</li>
          <li>Semifinali (3 giornate)</li>
          <li>Finali (3 giornate)</li>
        </ul>

        <h3>🎯 Scelta degli avversari</h3>
        <p>Bonus per posizione e scelta dell’avversario come da regolamento.</p>

        <h3>⭐ Uomo Champions</h3>
        <p>Attivo solo nei Playoff. Bonus/malus basati sul ruolo e sui gol.</p>
      </section>

      <section>
        <h2>🏆 Ranking Champions</h2>
        <p>
          Classifica storica dal 1° all’8° posto, valida per teste di serie, sorteggi e future meccaniche.
        </p>
      </section>

      {/* TORNA ALLA HOME */}
      <Link
        to="/"
        style={backBtn}
        onMouseEnter={(e) => Object.assign(e.currentTarget.style, backBtnHover)}
        onMouseLeave={(e) => Object.assign(e.currentTarget.style, backBtn)}
      >
        ⬅ Torna alla Home
      </Link>
    </div>
  );
}
