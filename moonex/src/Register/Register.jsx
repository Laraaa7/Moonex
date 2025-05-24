import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../img/logo.png';
import googleLogo from '../img/google.png';
import { auth, provider } from '../api/firebase.config';
import { signInWithPopup } from 'firebase/auth';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const handleGoogleRegister = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const response = await fetch(`${API_URL}/api/register/google`, {
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
        setMessage({ text: data.error || 'Error al registrarse con Google', type: 'error' });
      }
    } catch (error) {
      console.error('Error en el registro con Google:', error);
      setMessage({ text: 'Error al registrarse con Google', type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { userName, email, password, confirmPassword } = formData;

    if (!userName || userName.length < 4 || !/^[a-z0-9_]+$/.test(userName)) {
      setMessage({ text: 'Nombre de usuario inválido (minúsculas, números, guiones bajos, mínimo 4 caracteres).', type: 'error' });
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({ text: 'Correo electrónico inválido.', type: 'error' });
      return;
    }

    if (!password || password.length < 10 || password.length > 100 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      setMessage({ text: 'Contraseña inválida. Mínimo 10 caracteres, una mayúscula y un número.', type: 'error' });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ text: 'Las contraseñas no coinciden.', type: 'error' });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: userName, email, password })
      });

      const data = await response.json();

      if (response.ok && data.message) {
        setMessage({ text: data.message, type: 'success' });

        setTimeout(() => {
          navigate('/login', { state: { mostrarReenvio: true, email } });
        }, 4000);
      } else {
        setMessage({ text: data.error || 'Error al registrarse.', type: 'error' });
      }
    } catch (error) {
      console.error('Error en el registro:', error);
      setMessage({ text: 'Error de conexión con el servidor.', type: 'error' });
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-container">
        <div className="register-left">
          <img src={logo} alt="Logo" className="register-logo" />
          <h2>Únete a la Órbita</h2>

          <div className="login-buttons">
            <button className="btn-social" onClick={handleGoogleRegister}>
              <img src={googleLogo} alt="Google" /> Registrarse con Google
            </button>
          </div>

          <div className="separator">o</div>

          <p className="register-text">¿Ya tienes una cuenta?</p>
          <button className="switch-button" onClick={handleLoginRedirect}>
            Iniciar Sesión
          </button>
        </div>

        <div className="register-right">
          <h2>Crear una Cuenta</h2>

          <form onSubmit={handleSubmit} className="register-form">
            <label>
              <i className="bx bx-user"></i>
              <input
                type="text"
                name="userName"
                placeholder="Nombre Usuario"
                value={formData.userName}
                onChange={(e) => {
                  let valor = e.target.value;
                  valor = valor.replace(/[^a-z0-9_]/g, '');
                  valor = valor.slice(0, 30);
                  setFormData({ ...formData, userName: valor });
                }}
                required
              />
            </label>

            <label>
              <i className="bx bx-envelope"></i>
              <input
                type="email"
                name="email"
                placeholder="Correo Electrónico"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </label>

            <label className="password-label">
              <i className="bx bx-lock-alt"></i>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <i
                className={`bx ${showPassword ? 'bx-hide' : 'bx-show'} toggle-eye`}
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </label>

            <label className="password-label">
              <i className="bx bx-lock-alt"></i>
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirmar Contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <i
                className={`bx ${showConfirm ? 'bx-hide' : 'bx-show'} toggle-eye`}
                onClick={() => setShowConfirm(!showConfirm)}
              ></i>
            </label>

            <button type="submit">Registrarse</button>
          </form>

          {message.text && (
            <p className={`message ${message.type}`}>
              {message.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;