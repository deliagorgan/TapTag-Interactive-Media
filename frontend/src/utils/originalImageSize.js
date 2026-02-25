// src/hooks/useImageSize.js

import { useState, useEffect } from 'react';

const useImageSize = (base64String) => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (base64String) {
      const imgElement = new Image();
      imgElement.onload = () => {
        setSize({ width: imgElement.naturalWidth, height: imgElement.naturalHeight });
      };
      imgElement.src = `data:image/jpeg;base64,${base64String}`;
    }
  }, [base64String]);

  return size;
};

export default useImageSize;  // Exportă funcția ca default
