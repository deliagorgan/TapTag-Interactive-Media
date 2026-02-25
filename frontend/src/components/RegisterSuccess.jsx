import React from 'react';
import Lottie from 'lottie-react';
import successAnimation from '../media/success.json'; // ajustează calea

const RegisterSuccess = ({ onComplete }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Lottie
        animationData={successAnimation}
        loop={false}
        onComplete={onComplete}
        style={{ width: 200, height: 200 }}
      />
    </div>
  );
};

export default RegisterSuccess;
