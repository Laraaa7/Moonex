  // Modificación para index.js

  import React from 'react';
  import ReactDOM from 'react-dom/client';
  import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
  import './index.css';
  import App from './App';
  import ChatPage from './pages/ChatPage';
  import ProfilePage from './pages/ProfilePage';
  import reportWebVitals from './reportWebVitals';
  import CrearPostPage from './pages/CrearPostPage';
  import VerPostPage from './pages/VerPostPage';
  import UserProfilePage from './pages/UserProfilePage';
  import FeedPage from './pages/FeedPage';
  import LoginPage from './Login/Login';
  import RegisPage from './Register/Register';
  import { AuthContextProvider } from './context/AuthContext';
  import PrivateRoute from './components/PrivateRoute';

  const root = ReactDOM.createRoot(document.getElementById('root'));

  root.render(
    <React.StrictMode>
      <AuthContextProvider>
        <Router>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisPage />} />

            {/* Rutas protegidas (con token) */}
            <Route path="/" element={<PrivateRoute><App /></PrivateRoute>} />
            <Route path="/feed" element={<PrivateRoute><FeedPage /></PrivateRoute>} />
            <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
            <Route path="/chat/:username" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
            <Route path="/perfil" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="/crearPost" element={<PrivateRoute><CrearPostPage /></PrivateRoute>} />
            <Route path="/verPost/:id" element={<PrivateRoute><VerPostPage /></PrivateRoute>} />
            
            {/* Ruta de perfil de usuario dinámica */}
            <Route path="/perfilDeUsuario/:userId" element={<PrivateRoute><UserProfilePage /></PrivateRoute>} />
            
            {/* Mantener la ruta genérica para compatibilidad */}
            <Route path="/perfilDeUsuario" element={<PrivateRoute><UserProfilePage /></PrivateRoute>} />
          </Routes>
        </Router>
      </AuthContextProvider>
    </React.StrictMode>
  );

  reportWebVitals();