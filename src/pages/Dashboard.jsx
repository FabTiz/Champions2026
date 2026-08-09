export default function Dashboard() {
  const cardStyle = {
    flex: "1",
    minWidth: "250px",
    padding: "20px",
    borderRadius: "12px",
    background: "#ffffff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
  };

  const cardHover = {
    transform: "scale(1.03)",
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
        Dashboard
      </h1>

      <div style={containerStyle}>
        <div
          style={cardStyle}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
        >
          <h2>Statistiche Generali</h2>
          <p>Partite giocate, gol totali, media punti</p>
        </div>

        <div
          style={cardStyle}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
        >
          <h2>Ultimi Turni</h2>
          <p>Visualizza gli ultimi turni inseriti</p>
        </div>

        <div
          style={cardStyle}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
        >
          <h2>Prossime Partite</h2>
          <p>Calendario delle prossime giornate</p>
        </div>
      </div>
    </div>
  );
}
