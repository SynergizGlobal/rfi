import React, { useRef, useState, useEffect } from 'react';
import './CameraCapture.css';


export default function CameraCapture({ facingMode = 'user', onCapture, onCancel }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [captured, setCaptured] = useState(false);
  const [imageData, setImageData] = useState(null);

  useEffect(() => {
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
        });
        videoRef.current.srcObject = stream;
        setStream(stream);
      } catch (err) {
        console.error('Camera error:', err);
        alert('Camera access denied or not supported.');
        onCancel();
      }
    };
    getMedia();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [facingMode]);

  const handleCapture = () => {
    const context = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvasRef.current.toDataURL('image/jpeg');
    setImageData(dataUrl);
    setCaptured(true);
  };

  const handleConfirm = () => {
    onCapture(imageData);
    stream?.getTracks().forEach(track => track.stop());
  };

  const handleRetake = () => {
    setCaptured(false);
    setImageData(null);
  };

  return (
    <div className="camera-popup">
      {!captured ? (
        <>
          <video ref={videoRef} autoPlay playsInline />
          <button onClick={handleCapture}>📸 Capture</button>
          <button onClick={onCancel}>Cancel</button>
        </>
      ) : (
        <>
          <img src={imageData} alt="Captured" />
          <button onClick={handleConfirm}>✅ Use Photo</button>
          <button onClick={handleRetake}>🔁 Retake</button>
        </>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

