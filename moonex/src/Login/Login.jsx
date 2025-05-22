import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, provider } from '../api/firebase.config';
import { signInWithPopup } from 'firebase/auth';
import logo from '../img/logo.png';
import googleLogo from '../img/google.png';
import './Login.css';

const API_URL = process.env.REACT_APP_API_URL;

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) navigate('/feed');
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegisterRedirect = () => {
    navigate('/register');
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const response = await fetch(`${API_URL}/login/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email || user.providerData[0]?.email || '',
          nombre: user.displayName,
          foto_perfil: user.photoURL,
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/feed');
      } else {
        setMessage(data.error || 'Error al iniciar sesión con Google');
      }
    } catch (error) {
      console.error("Error en Google Sign-In:", error);
      setMessage('Error al iniciar sesión con Google');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      setMessage('Por favor, completa todos los campos.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.token) {
        if (data.user?.verificado === 0) {
          setMessage('Debes verificar tu correo electrónico antes de iniciar sesión.');
          return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/feed');
      } else {
        setMessage(data.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error en login:', error);
      setMessage('Error en el servidor');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-left">
          <img src={logo} alt="Moonex Logo" className="login-logo" />
          <h2>Conecta bajo la misma luna</h2>

          <div className="login-buttons">
            <button className="btn-social" onClick={handleGoogleSignIn}>
              <img src={googleLogo} alt="Google" /> Iniciar con Google
            </button>
          </div>

          <div className="separator">o</div>

          <p className="register-text">¿No tienes una cuenta?</p>
          <button className="switch-btn" onClick={handleRegisterRedirect}>
            Registrarse
          </button>
        </div>

        <div className="login-right">
          <h2>Iniciar Sesión</h2>
          <form onSubmit={handleSubmit} className="login-form">
            <label className="input-label">
              <i className='bx bx-envelope'></i>
              <input
                type="email"
                name="email"
                placeholder="Correo Electrónico"
                onChange={handleChange}
                required
              />
            </label>

            <label className="input-label password-label">
              <i className='bx bx-lock-alt'></i>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Contraseña"
                onChange={handleChange}
                required
              />
              <i
                className={`bx ${showPassword ? 'bx-hide' : 'bx-show'} toggle-eye`}
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </label>

            <button type="submit">Iniciar Sesión</button>

            <p className="forgot-password">
              ¿Olvidaste tu contraseña?{' '}
              <span className="link" onClick={() => navigate('/recuperar')}>
                Recupérala aquí
              </span>
            </p>
          </form>

          {message && <p className="message">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default Login;