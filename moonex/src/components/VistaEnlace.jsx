import React, { useEffect, useState } from "react";
import "./VistaEnlace.css"; 

const API_BASE_URL = process.env.REACT_APP_API_URL;

const VistaEnlace = ({ url }) => {
  const [vista, setVista] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerVista = async () => {
      try {
        console.log("Solicitando vista previa para:", url);
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/link-preview?url=${encodeURIComponent(url)}`);
        
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log("Datos recibidos:", data);
        
        if (data.title || data.description || data.image) {
          setVista(data);
        } else {
          throw new Error("No se pudo obtener la vista previa");
        }
      } catch (err) {
        console.error("Error al obtener vista previa:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (url && isValidUrl(url)) {
      obtenerVista();
    }
  }, [url]);

  // Función para validar URLs
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  if (loading) {
    return <div className="link-preview-loading">Cargando vista previa...</div>;
  }

  if (error || !vista) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="link-preview-fallback">
        {url}
      </a>
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="link-preview-card">
      {vista.image && (
        <div className="link-preview-image-container">
          <img
            src={vista.image}
            alt="Vista previa"
            className="link-preview-image"
            onError={(e) => (e.target.style.display = 'none')}
          />
        </div>
      )}
      <div className="link-preview-content">
        <h4 className="link-preview-title">{vista.title}</h4>
        {vista.description && <p className="link-preview-description">{vista.description}</p>}
        <span className="link-preview-domain">{vista.siteName}</span>
      </div>
    </a>
  );
};

export default VistaEnlace;
