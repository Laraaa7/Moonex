import { useState } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import './ResetPassword.css';

const API_URL = process.env.REACT_APP_API_URL;

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [exito, setExito] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');

    if (
      !password ||
      password.length < 10 ||
      password.length > 100 ||
      !/[A-Z]/.test(password) || 
      !/\d/.test(password)
    ) {
      setMensaje('La contraseña debe tener entre 10 y 100 caracteres, contener al menos una mayúscula y un número.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setExito(true);
        setMensaje('Contraseña actualizada correctamente. Redirigiendo al login...');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setMensaje(data.error || 'Error al actualizar la contraseña.');
      }
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      setMensaje('Error del servidor. Intenta más tarde.');
    }
  };

  return (
    <div className="reset-wrapper">
      <div className="reset-container">
        <h2>Restablecer contraseña</h2>
        <form onSubmit={handleSubmit} className="reset-form">
          <div className="input-password-wrapper">
            <input
              type={mostrarPassword ? 'text' : 'password'}
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="toggle-password"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              title={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {mostrarPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
          <button type="submit">Guardar contraseña</button>
        </form>
        {mensaje && (
          <p className={`mensaje ${exito ? 'exito' : 'error'}`}>{mensaje}</p>
        )}
        <button className="volver-btn" onClick={() => navigate('/login')}>
          Volver al inicio de sesión
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;