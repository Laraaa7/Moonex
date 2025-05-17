import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../img/logo.png';
import googleLogo from '../img/google.png';
import appleLogo from '../img/apple.png';
import { auth, provider } from '../api/firebase.config';
import { OAuthProvider, signInWithPopup } from 'firebase/auth';
import './Register.css';


const Register = () => {
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const API_URL = process.env.REACT_APP_API_URL;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

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
      localStorage.setItem('token', user.accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/feed');
    } catch (error) {
      console.error("Error en el registro con Google:", error);
      setMessage('Error al registrarse con Google');
    }
  };

  const handleAppleRegister = async () => {
    const provider = new OAuthProvider('apple.com');
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = OAuthProvider.credentialFromResult(result);
      const token = credential?.idToken;
      const user = result.user;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/feed');
    } catch (error) {
      console.error("Error al registrarse con Apple:", error);
      setMessage('Error al registrarse con Apple');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { userName, email, password, confirmPassword } = formData;
  
    // Validación: nombre de usuario
    if (!userName) {
      setMessage("El nombre de usuario es obligatorio.");
      return;
    }
    if (userName.length < 4) {
      setMessage("El nombre de usuario debe tener al menos 4 caracteres.");
      return;
    }
    if (!/^[a-z0-9_]+$/.test(userName)) {
      setMessage("El nombre de usuario solo puede contener letras minúsculas, números y guión bajo.");
      return;
    }
  
    // Validación: email
    if (!email) {
      setMessage("El correo electrónico es obligatorio.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("El formato del correo electrónico no es válido.");
      return;
    }
  
    // Validación: contraseña
    if (!password) {
      setMessage("La contraseña es obligatoria.");
      return;
    }
    if (password.length < 10 || password.length > 100) {
      setMessage("La contraseña debe tener entre 10 y 100 caracteres.");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setMessage("La contraseña debe incluir al menos una letra mayúscula.");
      return;
    }
    if (!/\d/.test(password)) {
      setMessage("La contraseña debe incluir al menos un número.");
      return;
    }
  
    // Validación: confirmación de contraseña
    if (!confirmPassword) {
      setMessage("Debes confirmar tu contraseña.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }
  
    // Envío al backend
    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: userName, email, password })
      });
  
      const data = await response.json();
  
      if (response.status === 201 || response.status === 200) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setMessage(data.error || 'Error al registrarse');
      }
    } catch (error) {
      console.error('Error en el registro:', error);
      setMessage('Error de conexión con el servidor.');
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
            <button className="btn-social" onClick={handleAppleRegister}>
              <img src={appleLogo} alt="Apple" /> Registrarse con Apple
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
              <i className='bx bx-user'></i>
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
                  maxLength={30}
                  minLength={6}
                />


            </label>

            <label>
              <i className='bx bx-envelope'></i>
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
              <i className='bx bx-lock-alt'></i>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                required
                maxLength={100}
                minLength={10}
              />
              <i
                className={`bx ${showPassword ? 'bx-hide' : 'bx-show'} toggle-eye`}
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </label>

            <label className="password-label">
              <i className='bx bx-lock-alt'></i>
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirmar Contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                maxLength={100}
                minLength={10}
              />
              <i
                className={`bx ${showConfirm ? 'bx-hide' : 'bx-show'} toggle-eye`}
                onClick={() => setShowConfirm(!showConfirm)}
              ></i>
            </label>

            <button type="submit">Registrarse</button>
          </form>
          {message && <p className="message">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default Register;
