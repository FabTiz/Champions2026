export default function Calendario() {
  const events = [
    { date: "2026-08-10", title: "Allenamento Iron Team" },
    { date: "2026-08-12", title: "Partita PanzaSoccer7 vs TrapoTeam" },
    { date: "2026-08-15", title: "Riunione staff" },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h1>Calendario</h1>

      <ul>
        {events.map((e, index) => (
          <li key={index}>
            <strong>{e.date}</strong> — {e.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
