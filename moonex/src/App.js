import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import logo from './img/MoonexLuna.png';
import { Link } from 'react-router-dom';
import textoLogo from './img/Moonex_sin_luna.png';
import './App.css';

function App() {
  const navigate = useNavigate();

  return (
    <div className="App">
      <div className="logo-container">
        <img src={logo} className="App-logo" alt="logo luna" />
        <img src={textoLogo} className="App-logo-texto" alt="logo texto" />
      </div>
      <h1 className="titulo">Bienvenidos a Moonex</h1>
      <p className="slogan">Únete a la órbita.</p>
      <p className="creditos">Creado por <strong>Lara</strong> y <strong>Lili</strong>.</p>
      <button className="btn-main" onClick={() => navigate('/login')}>
        ¡Inicia tu viaje!
      </button>
    </div>

  );
}



export default App;
