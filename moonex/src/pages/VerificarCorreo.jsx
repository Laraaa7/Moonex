import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './VerificarCorreo.css';

const VerificarCorreo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [estado, setEstado] = useState('verificando'); // verificando | exito | error
  const [mensaje, setMensaje] = useState('');
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    if (!token) {
      setEstado('error');
      setMensaje('Token no válido o ausente.');
      return;
    }

    const verificar = async () => {
      try {
        const res = await fetch(`${API_URL}/verify-email?token=${token}`);
        const text = await res.text();

        if (res.ok) {
          setEstado('exito');
          setMensaje(text);
          setTimeout(() => navigate('/login'), 4000);
        } else {
          setEstado('error');
          setMensaje(text);
        }
      } catch (err) {
        setEstado('error');
        setMensaje('Error al verificar tu correo.');
      }
    };

    verificar();
  }, [location, navigate]);

  return (
    <div className="verificar-container">
      <div className={`verificar-box ${estado}`}>
        {estado === 'verificando' ? (
          <>
            <div className="spinner"></div>
            <h2>Verificando tu correo...</h2>
          </>
        ) : (
          <>
            <h2>{mensaje}</h2>
            {estado === 'exito' && <p>Redirigiendo al login...</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default VerificarCorreo;