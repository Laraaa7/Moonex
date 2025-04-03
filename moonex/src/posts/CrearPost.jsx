import React, { useState } from 'react';
import Barranav from "../components/Barranav"; 
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import './CrearPost.css';

const CrearPost = () => {
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['image', 'video'],
      ['code-block', 'blockquote']
    ]
  };  

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'align',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'code-block', 'blockquote'
  ];

  const handlePublish = () => {
    console.log("Publicando post:", { title: postTitle, body: postBody });
  };

  const handleCancel = () => {
    setPostTitle('');
    setPostBody('');
  };

  return (
    <div>
      <Barranav />
      
      <div className="crear-post-container">
        <div className="crear-post-content">
          <h2 className="crear-post-title">Escribir Post</h2>
          
          <div className="form-group">
            <label htmlFor="post-title">Título <span className="required">*</span></label>
            <input 
              type="text" 
              id="post-title" 
              className="post-title-input"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="post-body">Contenido <span className="required">*</span></label>
            <ReactQuill 
              theme="snow"
              modules={modules}
              formats={formats}
              value={postBody}
              onChange={setPostBody}
              className="quill-editor"
              placeholder="Escribe el contenido de tu post aquí..."
            />
          </div>
          
          <div className="form-actions">
            <button 
              className="publish-button"
              onClick={handlePublish}
            >
              Publicar
            </button>
            <button 
              className="cancel-button"
              onClick={handleCancel}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearPost;
