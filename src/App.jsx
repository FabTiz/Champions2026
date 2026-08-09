import { supabase } from './supabaseClient';
import InsertLeagueTurn from "./components/InsertLeagueTurn";

function App() {
  return (
    <>
      <h1>Champions League Comp</h1>
      <InsertLeagueTurn />
    </>
  );
}

export default App;
