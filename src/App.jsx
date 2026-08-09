import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Squadre from "./pages/Squadre";
import Calendario from "./pages/Calendario";
import Missioni from "./pages/Missioni";
import DashboardSquadre from "./pages/DashboardSquadre";

import Turno from "./pages/Turno";
import ClassificaChampions from "./pages/ClassificaChampions";
import AdminPanel from "./pages/AdminPanel";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Pagine principali */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/squadre" element={<Squadre />} />
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/missioni" element={<Missioni />} />
        <Route path="/dashboard-squadre" element={<DashboardSquadre />} />

        {/* Champions League Comp */}
        <Route path="/turno" element={<Turno />} />
        <Route path="/classifica-champions" element={<ClassificaChampions />} />

        {/* Admin Panel */}
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
