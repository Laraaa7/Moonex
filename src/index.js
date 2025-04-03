import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import ChatPage from './pages/ChatPage';
import reportWebVitals from './reportWebVitals';
import LogisPage from './Login/Login';
import RegisPage from './Register/Register';
import FeedPage from './pages/FeedPage';

import { AuthContextProvider } from "./context/AuthContext";  

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthContextProvider>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/Login" element={<LogisPage />} />
        <Route path="/Register" element={<RegisPage />} />
        <Route path="/feed" element={<FeedPage />} />
      </Routes>
    </Router>
    </AuthContextProvider>
  </React.StrictMode>
);


reportWebVitals();