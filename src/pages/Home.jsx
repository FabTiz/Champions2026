import { Link } from "react-router-dom";

export default function Home() {
  const cardStyle = {
    width: "250px",
    padding: "20px",
    borderRadius: "12px",
    background: "#ffffff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    textAlign: "center",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
  };

  const cardHover = {
    transform: "scale(1.05)",
    boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
  };

  const containerStyle = {
    display: "flex",
    gap: "30px",
    marginTop: "40px",
    justifyContent: "center",
    flexWrap: "wrap",
  };

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>
        Champions League Comp
      </h1>

      <div style={containerStyle}>
        {/* DASHBOARD */}
        <Link to="/dashboard" style={{ textDecoration: "none", color: "inherit" }}>
          <div
            style={cardStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHover)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
          >
            <h2>Dashboard</h2>
            <p>Statistiche, riepilogo, classifiche</p>
          </div>
        </Link>

        {/* SQUADRE */}
        <Link to="/squadre" style={{ textDecoration: "none", color: "inherit" }}>
          <div
            style={cardStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHover)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
          >
            <h2>Squadre</h2>
            <p>Gestione squadre e dettagli</p>
          </div>
        </Link>

        {/* CALENDARIO */}
        <Link to="/calendario" style={{ textDecoration: "none", color: "inherit" }}>
          <div
            style={cardStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHover)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
          >
            <h2>Calendario</h2>
            <p>Giornate, turni e risultati</p>
          </div>
        </Link>

        {/* MISSIONI */}
        <Link to="/missioni" style={{ textDecoration: "none", color: "inherit" }}>
          <div
            style={cardStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHover)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
          >
            <h2>Missioni</h2>
            <p>Regole, bonus e obiettivi</p>
          </div>
        </Link>

        {/* TURNO CHAMPIONS */}
        <Link to="/turno" style={{ textDecoration: "none", color: "inherit" }}>
          <div
            style={cardStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHover)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
          >
            <h2>Turno Champions</h2>
            <p>Scelta missioni e calcolo bonus</p>
          </div>
        </Link>

        {/* CLASSIFICA CHAMPIONS */}
        <Link to="/classifica-champions" style={{ textDecoration: "none", color: "inherit" }}>
          <div
            style={cardStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHover)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
          >
            <h2>Classifica Champions</h2>
            <p>Punti, fantapunti, differenze</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
