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

    if (!userName || !email || !password || !confirmPassword) {
      setMessage('Por favor, completa todos los campos.');
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,12}$/;
    if (!passwordRegex.test(password)) {
      setMessage('La contraseña debe tener entre 6 y 12 caracteres, incluir al menos una mayúscula y un número.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Las contraseñas no coinciden.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: userName, email, password })
      });

      const data = await response.json();
      
      // Check if status is 201 (created) or 200 (ok)
      if (response.status === 201 || response.status === 200) {
        // Store both user and a dummy token for consistency with social logins
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.user.id); // Use user ID as token or adjust if your API returns a token
        
        console.log("Registro exitoso, redirigiendo a /feed"); // Debug logging
        navigate('/feed');
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
                onChange={handleChange}
                required
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