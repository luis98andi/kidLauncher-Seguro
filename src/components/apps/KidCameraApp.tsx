import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, Camera, RefreshCw, Sparkles, Download, Smile, Heart, Star, Crown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playPopSound, playSparkleSound } from '../../utils/sound';

interface KidCameraAppProps {
  onClose: () => void;
  soundEnabled: boolean;
}

const FRAMES = [
  { id: 'princess', name: 'Princesa 👑', border: 'border-8 border-pink-400', badge: '👑 Princesa Mágica' },
  { id: 'stars', name: 'Estrellitas ⭐', border: 'border-8 border-yellow-400', badge: '⭐ Súper Estrella' },
  { id: 'rainbow', name: 'Arcoíris 🌈', border: 'border-8 border-cyan-400', badge: '🌈 Dulce Sonrisa' },
  { id: 'cat', name: 'Gatita 🐱', border: 'border-8 border-purple-400', badge: '🐱 Linda Gatita' },
];

export const KidCameraApp: React.FC<KidCameraAppProps> = ({ onClose, soundEnabled }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedFrame, setSelectedFrame] = useState(FRAMES[0]);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    stopCamera();
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraError(null);
    } catch (err) {
      console.warn('Camera access denied or not available:', err);
      setCameraError('No se pudo acceder a la cámara. ¡Puedes tomar fotos simuladas!');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    playPopSound(soundEnabled);
  };

  const takePhotoWithCountdown = () => {
    if (countdown !== null) return;
    playPopSound(soundEnabled);
    setCountdown(3);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          captureCurrentFrame();
          return null;
        }
        playPopSound(soundEnabled);
        return prev - 1;
      });
    }, 800);
  };

  const captureCurrentFrame = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const width = 640;
    const height = 640;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (video && stream) {
      ctx.drawImage(video, 0, 0, width, height);
    } else {
      // Fallback cute background
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#ff758c');
      grad.addColorStop(1, '#ff7eb3');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      ctx.font = '70px serif';
      ctx.textAlign = 'center';
      ctx.fillText('👑✨💖', width / 2, height / 2 - 20);
      ctx.font = 'bold 36px Fredoka, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('¡Foto de Princesa!', width / 2, height / 2 + 50);
    }

    // Draw frame overlay
    ctx.strokeStyle = selectedFrame.id === 'princess' ? '#f43f5e' : selectedFrame.id === 'stars' ? '#eab308' : '#06b6d4';
    ctx.lineWidth = 24;
    ctx.strokeRect(12, 12, width - 24, height - 24);

    // Badge
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.roundRect(width / 2 - 140, height - 65, 280, 45, 20);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(selectedFrame.badge, width / 2, height - 35);

    const dataUrl = canvas.toDataURL('image/png');
    setCapturedPhoto(dataUrl);
    playSparkleSound(soundEnabled);
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
  };

  const savePhoto = () => {
    if (!capturedPhoto) return;
    const link = document.createElement('a');
    link.download = `foto-magica-${Date.now()}.png`;
    link.href = capturedPhoto;
    link.click();
    playSparkleSound(soundEnabled);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition text-white font-bold"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Salir</span>
        </button>

        <div className="flex items-center gap-2">
          <Camera className="w-6 h-6 text-pink-400" />
          <h1 className="text-xl font-bold tracking-wide">Cámara Divertida</h1>
        </div>

        <button
          onClick={switchCamera}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 text-white"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Main Viewfinder / Result */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden bg-black">
        {capturedPhoto ? (
          <div className="flex flex-col items-center gap-4 max-w-sm w-full">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-pink-400">
              <img src={capturedPhoto} alt="Foto tomada" className="w-full h-auto aspect-square object-cover" />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCapturedPhoto(null)}
                className="px-5 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 font-bold text-sm text-white transition active:scale-95"
              >
                Tomar otra 🔄
              </button>
              <button
                onClick={savePhoto}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 font-bold text-sm text-white shadow-lg transition active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Guardar en Fotos</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="relative w-full max-w-sm aspect-square rounded-3xl overflow-hidden shadow-2xl bg-slate-900 flex items-center justify-center">
            {/* Real Video or Simulation Notice */}
            {cameraError ? (
              <div className="text-center p-6 bg-gradient-to-b from-pink-900/60 to-purple-900/60 rounded-2xl m-4 border border-pink-500/30">
                <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-2 animate-bounce" />
                <h3 className="font-bold text-lg text-white mb-1">¡Estudio de Fotos Mágico!</h3>
                <p className="text-xs text-pink-200 mb-4">{cameraError}</p>
                <span className="text-xs bg-pink-500/40 text-pink-200 px-3 py-1 rounded-full">
                  Presiona el botón rosa abajo para crear tu foto ✨
                </span>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />
            )}

            {/* Frame Overlay */}
            <div className={`absolute inset-0 pointer-events-none rounded-3xl ${selectedFrame.border} flex flex-col justify-between p-3`}>
              <div className="flex justify-between items-center text-2xl">
                <span>✨</span>
                <span>💖</span>
              </div>
              <div className="self-center bg-black/60 backdrop-blur-sm px-4 py-1 rounded-full text-xs font-bold text-white tracking-wide border border-white/20">
                {selectedFrame.badge}
              </div>
            </div>

            {/* Countdown Overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-8xl font-black text-pink-400 animate-ping">
                  {countdown}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Frame Selector & Big Shutter Button */}
      {!capturedPhoto && (
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex flex-col gap-3 items-center">
          {/* Frames */}
          <div className="flex items-center gap-2 overflow-x-auto w-full max-w-sm justify-center py-1">
            {FRAMES.map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setSelectedFrame(f);
                  playPopSound(soundEnabled);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                  selectedFrame.id === f.id
                    ? 'bg-pink-500 text-white shadow-md scale-105'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>

          {/* Shutter Button */}
          <button
            onClick={takePhotoWithCountdown}
            className="w-18 h-18 rounded-full border-4 border-white bg-gradient-to-tr from-pink-500 via-rose-400 to-amber-300 p-1 shadow-lg active:scale-90 transition transform"
          >
            <div className="w-full h-full rounded-full bg-white/30 flex items-center justify-center">
              <Camera className="w-8 h-8 text-white drop-shadow" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
