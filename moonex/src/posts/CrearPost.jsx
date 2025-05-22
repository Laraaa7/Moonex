import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from "@mui/material";
import Barranav from "../components/Barranav"; 
import BarraSuperiorMovil from "../components/BarraSuperiorMovil";
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import './CrearPost.css';

const API_URL = process.env.REACT_APP_API_URL;

const CrearPost = () => {
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 480px)");

  const getPlainTextLength = (html) => {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent?.trim().length || 0;
  };

  const plainContentLength = getPlainTextLength(postBody);
  const titleTooLong = postTitle.length > 50;
  const contentTooLong = plainContentLength > 280;

  const isPublishDisabled =
    !postTitle.trim() ||
    plainContentLength === 0 ||
    titleTooLong ||
    contentTooLong;

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }],
      ['image']
    ]
  };

  const formats = ['bold', 'italic', 'underline', 'strike', 'list', 'image'];

  const handlePublish = async () => {
    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (isPublishDisabled || !storedUser) {
      setMessage('Completa todos los campos correctamente');
      setMessageType('error');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/crear-post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: storedUser.id,
          titulo: postTitle,
          username: storedUser.username,
          nombre: storedUser.nombre,
          contenido: postBody,
          imagen: '',
          foto_perfil: storedUser.foto_perfil || ''
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Post publicado correctamente');
        setMessageType('success');
        setPostTitle('');
        setPostBody('');
        setTimeout(() => {
          navigate('/feed');
        }, 1000);
      } else {
        setMessage(data.error || 'Error al publicar');
        setMessageType('error');
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Error al conectar con el servidor");
      setMessageType('error');
    }
  };

  const handleCancel = () => {
    setPostTitle('');
    setPostBody('');
    setMessage('');
    setMessageType('');
  };

  return (
    <div>
      <Barranav />
      {isMobile && <BarraSuperiorMovil />}
      <div className="crear-post-container">
        <div className="crear-post-content">
          <h2 className="crear-post-title">Escribir Post</h2>

          <div className="form-group">
            <label>Título <span className="required">*</span></label>
            <input
              type="text"
              className="post-title-input"
              value={postTitle}
              maxLength={50}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder="Escribe el título de tu post"
              required
            />
            <div className={`char-counter ${titleTooLong ? 'over-limit' : ''}`}>
              {postTitle.length}/50
            </div>
          </div>

          <div className="form-group">
            <label>Contenido <span className="required">*</span></label>
            <ReactQuill
              theme="snow"
              modules={modules}
              formats={formats}
              value={postBody}
              onChange={setPostBody}
              className="quill-editor"
              placeholder=" Añade el contenido de tu post"
            />
            <div className={`char-counter ${contentTooLong ? 'over-limit' : ''}`}>
              {plainContentLength}/280
            </div>
          </div>

          {message && (
            <p className={`message ${messageType}`}>{message}</p>
          )}

          <div className="form-actions">
            <button
              className="publish-button"
              onClick={handlePublish}
              disabled={isPublishDisabled}
              style={{ opacity: isPublishDisabled ? 0.6 : 1, cursor: isPublishDisabled ? 'not-allowed' : 'pointer' }}
            >
              Publicar
            </button>
            <button className="cancel-button" onClick={handleCancel}>Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearPost;
