import React, { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import './ScrollArriba.css';

const ScrollArriba = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 1) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollArriba = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <div className={`scroll-arriba ${isVisible ? 'visible' : ''}`} onClick={scrollArriba}>
      <FaArrowUp className="scroll-icon" />
    </div>
  );
};

export default ScrollArriba;