import React from 'react';
import "./ImageGrid.css";

const ImageGrid = ({ images }) => {
  if (!images || images.length === 0) return null;
  
  // Limitar a máximo 4 imágenes
  const displayImages = images.slice(0, 4);
  const totalImages = displayImages.length;
  
  // Altura base para diferentes configuraciones
  const singleImageHeight = '220px'; // Altura más pequeña para una sola imagen
  const multipleImageHeight = '150px'; // Mantener el tamaño original para múltiples imágenes
  
  // Estilos para diferentes configuraciones
  const gridStyles = {
    // Contenedor principal
    gridContainer: {
      display: 'grid',
      gap: '2px', 
      width: '100%',
      maxWidth: totalImages === 1 ? '380px' : '500px', // Ancho más pequeño para una sola imagen
      borderRadius: '15px',
      overflow: 'hidden',
      margin: '10px 0',
    },
    // Estilos específicos según el número de imágenes
    1: {
      gridTemplateColumns: '1fr',
      gridTemplateRows: '1fr',
    },
    2: {
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr',
    },
    3: {
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr',
    },
    4: {
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr',
    }
  };
  
  // Determinar estilo de cada imagen según su posición
  const getImageStyle = (index, totalImages) => {
    let style = {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    };
    
    if (totalImages === 3 && index === 0) {
      // Primera imagen de 3: ocupa toda la columna izquierda
      return {
        ...style,
        gridRow: '1 / span 2',
      };
    }
    
    return style;
  };
  
  return (
    <div
      className="post-image-grid"
      style={{
        ...gridStyles.gridContainer,
        ...gridStyles[totalImages],
        gridAutoRows: totalImages === 1 ? singleImageHeight : multipleImageHeight
      }}
    >
      {displayImages.map((image, index) => (
        <div
          key={index}
          style={getImageStyle(index, totalImages)}
          className="post-image-containerr"
        >
          <img
            src={image}
            alt={`Post image ${index + 1}`}
            style={getImageStyle(index, totalImages)}
            className="post-grid-image"
          />
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;