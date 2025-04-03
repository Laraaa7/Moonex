import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../img/logo.png';
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

  const handleClose = () => {
    navigate('/');
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { userName, email, password, confirmPassword } = formData;
  
    if (!userName || !email || !password || !confirmPassword) {
      setMessage('Por favor, completa todos los campos.');
      return;
    }
  
    // ✅ Validación de contraseña
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
        body: JSON.stringify({ nombre: userName, email, password })
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setMessage(data.message || 'Registro exitoso');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setMessage(data.error || 'Error al registrarse');
      }
    } catch (error) {
      console.error('Error en el registro:', error);
      setMessage('Error de conexión con el servidor.');
    }
  };
  

  return (
    <div className="register-container">
      <div className="register-left">
        <img src={logo} alt="Logo" className="register-logo" />
        <h2>Bienvenido</h2>
        <p>¿Ya tienes una cuenta? Inicia sesión aquí.</p>
        <button className="switch-button" onClick={handleLoginRedirect}>Iniciar Sesión</button>
      </div>

      <div className="register-right">
        <button className="close-button" onClick={handleClose}>×</button>
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
  );
};

export default Register;
