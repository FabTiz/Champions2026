import { supabase } from './supabaseClient';
import InsertLeagueTurn from "./components/InsertLeagueTurn";

function App() {
  async function testConnection() {
    const { data, error } = await supabase.from('test').select('*');
    console.log("DATA:", data);
    console.log("ERROR:", error);
  }

  testConnection();

  return (
    <>
      <h1>Champions League Comp</h1>
      <InsertLeagueTurn />
    </>
  );
}

export default App;

