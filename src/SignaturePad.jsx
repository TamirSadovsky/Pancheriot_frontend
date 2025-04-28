import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import './SignaturePad.css';

const SignaturePad = ({ onCancel, onConfirm }) => {
  const sigCanvas = useRef();

  const handleClear = () => {
    sigCanvas.current.clear();
  };

  const handleConfirm = () => {
    if (!sigCanvas.current.isEmpty()) {
      const dataUrl = sigCanvas.current.toDataURL('image/png'); // 👈 use toDataURL directly
      onConfirm(dataUrl);
    }
  };

  return (
    <div className="signature-modal">
      <div className="signature-box">
        <h3>חתימה</h3>
        <SignatureCanvas
          penColor="black"
          canvasProps={{ width: 500, height: 200, className: 'sig-canvas' }}
          ref={sigCanvas}
        />
        <div className="signature-buttons">
          <button onClick={handleClear} className="clear-btn">נקה</button>
          <button onClick={onCancel} className="cancel-btn">ביטול</button>
          <button onClick={handleConfirm} className="confirm-btn">אישור</button>
        </div>
      </div>
    </div>
  );
};

export default SignaturePad;
