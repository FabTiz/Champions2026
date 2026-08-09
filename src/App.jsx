import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Squadre from "./pages/Squadre";
import Calendario from "./pages/Calendario";

// nuove pagine
import Missioni from "./pages/Missioni";
import DashboardSquadre from "./pages/DashboardSquadre";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/squadre" element={<Squadre />} />
        <Route path="/calendario" element={<Calendario />} />

        {/* nuove rotte */}
        <Route path="/missioni" element={<Missioni />} />
        <Route path="/dashboard-squadre" element={<DashboardSquadre />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
