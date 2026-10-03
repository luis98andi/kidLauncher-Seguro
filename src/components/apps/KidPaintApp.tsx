import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, Eraser, Trash2, Download, Sparkles, Undo, Palette } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playPopSound, playSparkleSound } from '../../utils/sound';

interface KidPaintAppProps {
  onClose: () => void;
  soundEnabled: boolean;
}

const COLORS = [
  '#ff2a6d', '#ff758c', '#ff54b0', '#9d4edd', '#5e60ce', 
  '#05d9e8', '#00f5d4', '#70e000', '#ffbe0b', '#fb5607', 
  '#ffffff', '#000000'
];

const STAMPS = ['🦄', '👑', '🌈', '💖', '🐱', '🐶', '🍭', '⭐', '🌸', '🎀', '🧁', '🦋'];

export const KidPaintApp: React.FC<KidPaintAppProps> = ({ onClose, soundEnabled }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedColor, setSelectedColor] = useState('#ff2a6d');
  const [brushSize, setBrushSize] = useState(12);
  const [isEraser, setIsEraser] = useState(false);
  const [selectedStamp, setSelectedStamp] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const isGlitter = selectedColor === 'rainbow';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions to parent container
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Save current content if any
      const tempImage = canvas.toDataURL();

      canvas.width = rect.width;
      canvas.height = rect.height;

      // Fill white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (tempImage && history.length > 0) {
        const img = new Image();
        img.src = tempImage;
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setHistory((prev) => [...prev.slice(-15), canvas.toDataURL()]);
  };

  const undo = () => {
    if (history.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    playPopSound(soundEnabled);
    const newHistory = [...history];
    const previousState = newHistory.pop();
    setHistory(newHistory);

    if (previousState) {
      const img = new Image();
      img.src = previousState;
      img.onload = () => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    saveState();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    playPopSound(soundEnabled);
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    saveState();

    if (selectedStamp) {
      // Place Stamp
      ctx.font = `${brushSize * 3 + 24}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selectedStamp, x, y);
      playSparkleSound(soundEnabled);
      return;
    }

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = isEraser ? brushSize * 2 : brushSize;
    ctx.strokeStyle = isEraser ? '#ffffff' : (isGlitter ? getRandomRainbow() : selectedColor);
    playPopSound(soundEnabled);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || selectedStamp) return;
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    if (isGlitter) {
      ctx.strokeStyle = getRandomRainbow();
      ctx.shadowBlur = 8;
      ctx.shadowColor = ctx.strokeStyle;
    } else {
      ctx.shadowBlur = 0;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.closePath();
    }
  };

  const getRandomRainbow = () => {
    const rainbowColors = ['#ff007f', '#ff7700', '#ffd200', '#00e5ff', '#a000ff', '#ff00aa'];
    return rainbowColors[Math.floor(Math.random() * rainbowColors.length)];
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    playSparkleSound(soundEnabled);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

    const link = document.createElement('a');
    link.download = `mi-dibujo-magico-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-rose-50 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-pink-500 via-rose-400 to-purple-500 text-white shadow-md">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/25 hover:bg-white/40 active:scale-95 transition text-white font-bold"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Salir</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-2xl">🎨</span>
          <h1 className="text-xl font-bold tracking-wide">Pizarra Mágica</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={history.length === 0}
            title="Deshacer"
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-40 transition active:scale-90"
          >
            <Undo className="w-5 h-5" />
          </button>
          <button
            onClick={clearCanvas}
            title="Borrar todo"
            className="p-2 rounded-full bg-red-400 hover:bg-red-500 transition active:scale-90 text-white"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            onClick={downloadDrawing}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-400 hover:bg-emerald-500 font-bold text-white shadow transition active:scale-95 text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Guardar</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative overflow-hidden bg-white touch-none">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full cursor-crosshair block"
        />
      </div>

      {/* Bottom Tool Bar */}
      <div className="bg-white/95 backdrop-blur border-t border-pink-100 p-2.5 flex flex-col gap-2 shadow-lg">
        {/* Colors and Stamp Selector */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 scrollbar-none">
          {/* Rainbow Glitter Tool */}
          <button
            onClick={() => {
              setSelectedColor('rainbow');
              setIsEraser(false);
              setSelectedStamp(null);
              playSparkleSound(soundEnabled);
            }}
            className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full font-bold text-xs text-white transition ${
              selectedColor === 'rainbow' && !isEraser && !selectedStamp
                ? 'ring-4 ring-purple-400 scale-105 shadow-md'
                : 'opacity-90'
            } bg-gradient-to-r from-pink-500 via-amber-400 to-cyan-400`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Arcoíris</span>
          </button>

          {/* Color Palettes */}
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setSelectedColor(c);
                setIsEraser(false);
                setSelectedStamp(null);
                playPopSound(soundEnabled);
              }}
              style={{ backgroundColor: c }}
              className={`w-9 h-9 rounded-full flex-shrink-0 border-2 border-white shadow-sm transition ${
                selectedColor === c && !isEraser && !selectedStamp
                  ? 'ring-4 ring-pink-400 scale-110'
                  : 'hover:scale-105'
              }`}
            />
          ))}

          {/* Eraser */}
          <button
            onClick={() => {
              setIsEraser(true);
              setSelectedStamp(null);
              playPopSound(soundEnabled);
            }}
            className={`flex-shrink-0 p-2 rounded-full border transition ${
              isEraser
                ? 'bg-rose-500 text-white ring-4 ring-rose-300 scale-110'
                : 'bg-rose-100 text-rose-600 hover:bg-rose-200'
            }`}
          >
            <Eraser className="w-5 h-5" />
          </button>
        </div>

        {/* Stamps Bar */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 px-1">
          <span className="text-xs font-bold text-pink-700 flex-shrink-0">Sellitos:</span>
          {STAMPS.map((stamp) => (
            <button
              key={stamp}
              onClick={() => {
                setSelectedStamp(selectedStamp === stamp ? null : stamp);
                setIsEraser(false);
                playPopSound(soundEnabled);
              }}
              className={`w-9 h-9 rounded-xl flex-shrink-0 text-xl flex items-center justify-center transition ${
                selectedStamp === stamp
                  ? 'bg-pink-200 ring-4 ring-pink-400 scale-115 shadow'
                  : 'bg-pink-50 hover:bg-pink-100'
              }`}
            >
              {stamp}
            </button>
          ))}
        </div>

        {/* Size Slider */}
        <div className="flex items-center justify-between px-2 pt-1 border-t border-pink-50 text-xs text-pink-700 font-bold">
          <span>Grosor del pincel</span>
          <div className="flex items-center gap-2 w-48">
            <span className="text-xs">Fino</span>
            <input
              type="range"
              min="4"
              max="36"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-full accent-pink-500"
            />
            <span className="text-sm">Grueso</span>
          </div>
        </div>
      </div>
    </div>
  );
};
