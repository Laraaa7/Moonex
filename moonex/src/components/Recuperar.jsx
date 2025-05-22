// Manda el email para recibir el token
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Recuperar.css';

const API_URL = process.env.REACT_APP_API_URL;

const Recuperar = () => {
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviado, setEnviado] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');

    if (!email) {
      setMensaje('Por favor, ingresa tu correo electrónico.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/recuperar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setEnviado(true);
        setMensaje('Revisa tu correo para restablecer tu contraseña.');
      } else {
        setMensaje(data.error || 'Hubo un problema al enviar el correo.');
      }
    } catch (error) {
      console.error('Error al enviar solicitud:', error);
      setMensaje('Error del servidor. Intenta más tarde.');
    }
  };

  return (
    <div className="recuperar-wrapper">
      <div className="recuperar-container">
        <h2>Recuperar contraseña</h2>
        <p>Introduce tu correo y te enviaremos un enlace para restablecer tu contraseña.</p>
        <form onSubmit={handleSubmit} className="recuperar-form">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Enviar enlace</button>
        </form>
        {mensaje && (
          <p className={`mensaje ${enviado ? 'exito' : 'error'}`}>{mensaje}</p>
        )}
        <button className="volver-btn" onClick={() => navigate('/login')}>
          Volver al inicio de sesión
        </button>
      </div>
    </div>
  );
};

export default Recuperar;