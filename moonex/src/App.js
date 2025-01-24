import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
      <h1>Bienvenidos a Moonex</h1>
        <p>
          Colaborando con <strong>Liliana</strong> y <strong>Lara</strong>.
        </p>
        <button onClick={() => alert("¡Hola, equipo!")}>
          Haz clic aquí
        </button>
      </header>
    </div>
  );
}

export default App;
