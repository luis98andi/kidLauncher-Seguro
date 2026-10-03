import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, Camera, RefreshCw, Sparkles, Download, Heart, Star, Crown, Trash2, Image } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playPopSound, playSparkleSound, playCameraShutterSound } from '../../utils/sound';

interface KidCameraAppProps {
  onClose: () => void;
  soundEnabled: boolean;
}

export interface SnapchatFilter {
  id: string;
  name: string;
  icon: string;
  badge: string;
  bgGradient: string;
}

const FILTERS: SnapchatFilter[] = [
  { id: 'puppy', name: 'Perrito 🐶', icon: '🐶', badge: '🐶 Perrito Tierno', bgGradient: 'from-amber-400 to-orange-500' },
  { id: 'kitty', name: 'Gatita 🐱', icon: '🐱', badge: '🐱 Gatita Mágica', bgGradient: 'from-pink-400 to-purple-500' },
  { id: 'princess', name: 'Princesa 👑', icon: '👑', badge: '👑 Princesa Real', bgGradient: 'from-rose-400 to-pink-600' },
  { id: 'bunny', name: 'Conejito 🐰', icon: '🐰', badge: '🐰 Conejito Rosa', bgGradient: 'from-purple-400 to-indigo-500' },
  { id: 'glasses', name: 'Gafas ⭐', icon: '🕶️', badge: '🕶️ Estrellas Neon', bgGradient: 'from-yellow-400 to-amber-500' },
  { id: 'rainbow', name: 'Arcoíris 🌈', icon: '🦄', badge: '🌈 Unicornia Mágica', bgGradient: 'from-cyan-400 to-teal-500' },
];

export const KidCameraApp: React.FC<KidCameraAppProps> = ({ onClose, soundEnabled }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<SnapchatFilter>(FILTERS[0]);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [showGallery, setShowGallery] = useState(false);

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
        video: {
          facingMode: facingMode,
          width: { ideal: 720 },
          height: { ideal: 720 }
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraError(null);
    } catch (err) {
      console.warn('Camera access denied or not available:', err);
      setCameraError('No pudimos conectar con la cámara física. ¡Usa el Estudio de Fotos Mágico!');
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
    }, 700);
  };

  const captureCurrentFrame = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const size = 720;
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw background stream or cute simulation
    if (video && stream && video.readyState >= 2) {
      ctx.save();
      if (facingMode === 'user') {
        // Mirror selfie camera
        ctx.translate(size, 0);
        ctx.scale(-1, 1);
      }
      
      // Calculate aspect ratio crop
      const vWidth = video.videoWidth || size;
      const vHeight = video.videoHeight || size;
      const minDim = Math.min(vWidth, vHeight);
      const sx = (vWidth - minDim) / 2;
      const sy = (vHeight - minDim) / 2;

      ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, size, size);
      ctx.restore();
    } else {
      // Simulation canvas
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, '#f472b6');
      grad.addColorStop(1, '#a855f7');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // Face silhouette
      ctx.fillStyle = '#fce7f3';
      ctx.beginPath();
      ctx.arc(size / 2, size / 2 + 20, 180, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.arc(size / 2 - 60, size / 2, 16, 0, Math.PI * 2);
      ctx.arc(size / 2 + 60, size / 2, 16, 0, Math.PI * 2);
      ctx.fill();

      // Smile
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2 + 30, 70, 0.2, Math.PI - 0.2);
      ctx.stroke();
    }

    // DRAW AR SNAPCHAT FILTER OVERLAYS ON CANVAS
    drawFilterOverlay(ctx, activeFilter.id, size);

    playCameraShutterSound(soundEnabled);
    const dataUrl = canvas.toDataURL('image/png');
    setCapturedPhoto(dataUrl);
    setGallery((prev) => [dataUrl, ...prev]);
    playSparkleSound(soundEnabled);
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
  };

  const drawFilterOverlay = (ctx: CanvasRenderingContext2D, filterId: string, size: number) => {
    const cx = size / 2;

    if (filterId === 'puppy') {
      // Puppy Ears on top
      ctx.font = '130px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🐶', cx, 150);

      // Dog Nose
      ctx.fillStyle = '#3f2212';
      ctx.beginPath();
      ctx.ellipse(cx, size / 2 + 40, 30, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tongue
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(cx + 10, size / 2 + 85, 25, 0, Math.PI);
      ctx.fill();

      // Cheeks
      ctx.fillStyle = 'rgba(244, 114, 182, 0.5)';
      ctx.beginPath();
      ctx.arc(cx - 110, size / 2 + 30, 35, 0, Math.PI * 2);
      ctx.arc(cx + 110, size / 2 + 30, 35, 0, Math.PI * 2);
      ctx.fill();
    } else if (filterId === 'kitty') {
      // Cat Ears & Bow
      ctx.font = '140px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🐱', cx, 150);

      // Whiskers
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      // Left Whiskers
      ctx.beginPath();
      ctx.moveTo(cx - 50, size / 2 + 40); ctx.lineTo(cx - 160, size / 2 + 20);
      ctx.moveTo(cx - 50, size / 2 + 55); ctx.lineTo(cx - 170, size / 2 + 55);
      ctx.moveTo(cx - 50, size / 2 + 70); ctx.lineTo(cx - 160, size / 2 + 90);
      // Right Whiskers
      ctx.moveTo(cx + 50, size / 2 + 40); ctx.lineTo(cx + 160, size / 2 + 20);
      ctx.moveTo(cx + 50, size / 2 + 55); ctx.lineTo(cx + 170, size / 2 + 55);
      ctx.moveTo(cx + 50, size / 2 + 70); ctx.lineTo(cx + 160, size / 2 + 90);
      ctx.stroke();

      // Pink Nose
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(cx, size / 2 + 35, 18, 0, Math.PI * 2);
      ctx.fill();
    } else if (filterId === 'princess') {
      // Tiara / Crown
      ctx.font = '150px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👑', cx, 130);

      // Rosy Cheeks
      ctx.fillStyle = 'rgba(236, 72, 153, 0.45)';
      ctx.beginPath();
      ctx.arc(cx - 120, size / 2 + 40, 45, 0, Math.PI * 2);
      ctx.arc(cx + 120, size / 2 + 40, 45, 0, Math.PI * 2);
      ctx.fill();

      // Sparkles around
      ctx.font = '50px sans-serif';
      ctx.fillText('✨', cx - 180, 200);
      ctx.fillText('✨', cx + 180, 200);
      ctx.fillText('💖', cx - 210, size / 2 + 100);
      ctx.fillText('💖', cx + 210, size / 2 + 100);
    } else if (filterId === 'bunny') {
      // Bunny Ears
      ctx.font = '150px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🐰', cx, 140);

      // Bunny Nose
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.ellipse(cx, size / 2 + 35, 20, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bunny Whiskers
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx - 30, size / 2 + 35); ctx.lineTo(cx - 130, size / 2 + 25);
      ctx.moveTo(cx - 30, size / 2 + 45); ctx.lineTo(cx - 130, size / 2 + 55);
      ctx.moveTo(cx + 30, size / 2 + 35); ctx.lineTo(cx + 130, size / 2 + 25);
      ctx.moveTo(cx + 30, size / 2 + 45); ctx.lineTo(cx + 130, size / 2 + 55);
      ctx.stroke();
    } else if (filterId === 'glasses') {
      // Star Glasses over Eyes
      ctx.font = '140px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🕶️', cx, size / 2 - 10);

      // Stars
      ctx.font = '60px sans-serif';
      ctx.fillText('⭐', cx - 180, size / 2 - 100);
      ctx.fillText('⭐', cx + 180, size / 2 - 100);
      ctx.fillText('🌟', cx, 100);
    } else if (filterId === 'rainbow') {
      // Unicorn Horn
      ctx.font = '150px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🦄', cx, 140);

      // Rainbow Cheeks
      ctx.font = '70px sans-serif';
      ctx.fillText('🌈', cx - 140, size / 2 + 40);
      ctx.fillText('🌈', cx + 140, size / 2 + 40);
      ctx.fillText('✨', cx - 200, 220);
      ctx.fillText('✨', cx + 200, 220);
    }

    // Border Frame & Badge
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 16;
    ctx.strokeRect(10, 10, size - 20, size - 20);

    // Badge Banner at bottom
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.roundRect(cx - 160, size - 75, 320, 50, 25);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(activeFilter.badge, cx, size - 42);
  };

  const downloadPhoto = (dataUrl: string) => {
    const link = document.createElement('a');
    link.download = `foto-snapchat-${Date.now()}.png`;
    link.href = dataUrl;
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
          <h1 className="text-xl font-bold tracking-wide">Cámara con Filtros Snapchat</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGallery(!showGallery)}
            className="p-2 rounded-full bg-pink-600/80 hover:bg-pink-500 active:scale-95 text-white relative"
            title="Galería de Fotos"
          >
            <Image className="w-5 h-5" />
            {gallery.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-slate-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {gallery.length}
              </span>
            )}
          </button>

          <button
            onClick={switchCamera}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 text-white"
            title="Cambiar Cámara (Selfie / Trasera)"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Viewfinder / Gallery / Captured Photo */}
      <div className="flex-1 flex flex-col items-center justify-center p-3 relative overflow-hidden bg-black">
        {showGallery ? (
          /* Gallery Mode */
          <div className="w-full max-w-md h-full flex flex-col p-2">
            <div className="flex items-center justify-between mb-3 px-2">
              <h3 className="text-lg font-bold text-pink-300 flex items-center gap-2">
                <Image className="w-5 h-5" />
                Mis Fotos Guardadas ({gallery.length})
              </h3>
              <button
                onClick={() => setShowGallery(false)}
                className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-full font-bold hover:bg-slate-700"
              >
                Volver a la Cámara 📸
              </button>
            </div>

            {gallery.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Camera className="w-12 h-12 text-slate-600" />
                <p className="text-sm">¡Aún no has tomado fotos! Tómate una selfie divertida.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-3 p-1">
                {gallery.map((photo, idx) => (
                  <div key={idx} className="relative rounded-2xl overflow-hidden border-2 border-pink-400 shadow-lg group bg-slate-900">
                    <img src={photo} alt={`Foto ${idx}`} className="w-full aspect-square object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        onClick={() => downloadPhoto(photo)}
                        className="p-2 rounded-full bg-pink-500 text-white shadow hover:scale-110 active:scale-90"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setGallery(gallery.filter((_, i) => i !== idx))}
                        className="p-2 rounded-full bg-rose-600 text-white shadow hover:scale-110 active:scale-90"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : capturedPhoto ? (
          /* Captured Photo Result View */
          <div className="flex flex-col items-center gap-3 max-w-sm w-full">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-pink-400">
              <img src={capturedPhoto} alt="Foto Snapchat" className="w-full h-auto aspect-square object-cover" />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCapturedPhoto(null)}
                className="px-5 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 font-bold text-sm text-white transition active:scale-95"
              >
                Tomar otra 🔄
              </button>
              <button
                onClick={() => downloadPhoto(capturedPhoto)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 font-bold text-sm text-white shadow-lg transition active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Guardar Foto</span>
              </button>
            </div>
          </div>
        ) : (
          /* Live Camera Viewfinder with Snapchat Overlay */
          <div className="relative w-full max-w-sm aspect-square rounded-3xl overflow-hidden shadow-2xl bg-slate-900 flex items-center justify-center">
            {cameraError ? (
              <div className="text-center p-6 bg-gradient-to-b from-pink-900/70 to-purple-900/70 rounded-2xl m-4 border border-pink-500/30">
                <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-2 animate-bounce" />
                <h3 className="font-bold text-lg text-white mb-1">¡Estudio de Fotos Snapchat!</h3>
                <p className="text-xs text-pink-200 mb-4">{cameraError}</p>
                <span className="text-xs bg-pink-500/40 text-pink-200 px-3 py-1 rounded-full">
                  Presiona el botón de la cámara para tomar tu selfie simulada ✨
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

            {/* LIVE SNAPCHAT AR FILTER OVERLAY */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 overflow-hidden">
              {/* Filter Top Element */}
              <div className="text-center text-7xl animate-bounce drop-shadow-md pt-2">
                {activeFilter.id === 'puppy' && '🐶'}
                {activeFilter.id === 'kitty' && '🐱'}
                {activeFilter.id === 'princess' && '👑'}
                {activeFilter.id === 'bunny' && '🐰'}
                {activeFilter.id === 'glasses' && '🕶️'}
                {activeFilter.id === 'rainbow' && '🦄'}
              </div>

              {/* Cheeks / Whiskers / Center Overlay */}
              <div className="flex justify-between items-center px-4 text-4xl">
                {activeFilter.id === 'puppy' && (
                  <>
                    <span>🐾</span>
                    <span className="text-3xl bg-pink-500/80 px-2 py-0.5 rounded-full text-white font-black">👅</span>
                    <span>🐾</span>
                  </>
                )}
                {activeFilter.id === 'kitty' && (
                  <>
                    <span>💖</span>
                    <span className="text-2xl text-pink-300 font-black">😽</span>
                    <span>💖</span>
                  </>
                )}
                {activeFilter.id === 'princess' && (
                  <>
                    <span>✨</span>
                    <span>✨</span>
                  </>
                )}
                {activeFilter.id === 'bunny' && (
                  <>
                    <span>🌸</span>
                    <span>🌸</span>
                  </>
                )}
                {activeFilter.id === 'glasses' && (
                  <>
                    <span>⭐</span>
                    <span>⭐</span>
                  </>
                )}
                {activeFilter.id === 'rainbow' && (
                  <>
                    <span>🌈</span>
                    <span>🌈</span>
                  </>
                )}
              </div>

              {/* Badge Banner */}
              <div className="self-center bg-slate-950/80 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black text-pink-300 border border-pink-500/40 shadow-lg">
                {activeFilter.badge}
              </div>
            </div>

            {/* Countdown Overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                <span className="text-9xl font-black text-pink-400 animate-ping">
                  {countdown}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Snapchat Filter Selector & Big Shutter Button */}
      {!capturedPhoto && !showGallery && (
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col gap-3 items-center">
          {/* Filters Horizontal Carousel */}
          <div className="flex items-center gap-2.5 overflow-x-auto w-full max-w-md py-1 px-2 no-scrollbar">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setActiveFilter(f);
                  playPopSound(soundEnabled);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition transform shrink-0 ${
                  activeFilter.id === f.id
                    ? `bg-gradient-to-r ${f.bgGradient} text-white shadow-lg scale-105 ring-2 ring-white`
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span className="text-lg">{f.icon}</span>
                <span>{f.name}</span>
              </button>
            ))}
          </div>

          {/* Big Shutter Button */}
          <button
            onClick={takePhotoWithCountdown}
            className="w-20 h-20 rounded-full border-4 border-white bg-gradient-to-tr from-pink-500 via-rose-400 to-yellow-300 p-1 shadow-2xl active:scale-90 transition transform"
            title="Tomar Foto con Filtro"
          >
            <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center">
              <Camera className="w-9 h-9 text-white drop-shadow-md" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
