import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, provider } from '../api/firebase.config';
import { signInWithPopup } from 'firebase/auth';
import logo from '../img/logo.png';
import googleLogo from '../img/google.png';
import './Login.css';

const API_URL = process.env.REACT_APP_API_URL;

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [reenviarVisible, setReenviarVisible] = useState(false);
  const [emailParaReenviar, setEmailParaReenviar] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) navigate('/feed');
  }, [navigate]);

  useEffect(() => {
    if (location.state?.mostrarReenvio && location.state?.email) {
      setReenviarVisible(true);
      setEmailParaReenviar(location.state.email);
    }
  }, [location.state]);

  const showMessage = (text, type = 'error') => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 5000);
  };

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
        showMessage(data.error || 'Error al iniciar sesión con Google');
      }
    } catch (error) {
      console.error('Error en Google Sign-In:', error);
      showMessage('Error al iniciar sesión con Google');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email && !password) return showMessage('Por favor, completa el correo y la contraseña.');
    if (!email) return showMessage('Por favor, introduce tu correo.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showMessage('El formato del correo es inválido.');
    if (!password) return showMessage('Por favor, introduce tu contraseña.');
    if (password.length < 6) return showMessage('La contraseña debe tener al menos 6 caracteres.');

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.status === 403 && data.error?.includes('verificar')) {
        showMessage(data.error);
        setReenviarVisible(true);
        setEmailParaReenviar(email);
        return;
      }

      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        showMessage('Inicio de sesión exitoso.', 'success');
        setTimeout(() => navigate('/feed'), 1000);
      } else {
        showMessage(data.error || 'Correo o contraseña incorrectos.');
      }
    } catch (error) {
      console.error('Error en login:', error);
      showMessage('Error en el servidor');
    }
  };

  const handleReenviarCorreo = async () => {
    try {
      const response = await fetch(`${API_URL}/verify-email/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailParaReenviar }),
      });

      const data = await response.json();
      if (response.ok) {
        showMessage('Correo de verificación reenviado correctamente.', 'success');
      } else {
        showMessage(data.error || 'Error al reenviar el correo.');
      }
    } catch (err) {
      showMessage('Error del servidor al reenviar verificación.');
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
              <i className="bx bx-envelope"></i>
              <input
                type="email"
                name="email"
                placeholder="Correo Electrónico"
                onChange={handleChange}
                required
              />
            </label>

            <label className="input-label password-label">
              <i className="bx bx-lock-alt"></i>
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

          {message.text && (
            <p className={`message ${message.type === 'success' ? 'success' : 'error'}`}>
              {message.text}
            </p>
          )}

          {reenviarVisible && (
            <div className="verificacion-mensaje">
              <button className="reenviar-btn" onClick={handleReenviarCorreo}>
                Reenviar correo de verificación
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;