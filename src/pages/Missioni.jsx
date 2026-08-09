import { useState } from "react";

export default function Missioni() {
  const [missions] = useState([
    { id: 1, title: "Creare tabella squadre", status: "completata" },
    { id: 2, title: "Collegare Supabase a Vercel", status: "completata" },
    { id: 3, title: "Implementare pagina Squadre", status: "in corso" },
    { id: 4, title: "Aggiungere giocatori", status: "da fare" },
  ]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Missioni</h1>
      <ul>
        {missions.map((m) => (
          <li key={m.id}>
            <strong>{m.title}</strong> — {m.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
