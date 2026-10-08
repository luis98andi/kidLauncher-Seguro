import React, { useState, useRef } from 'react';
import { ArrowLeft, Trash2, Download, Sparkles, RefreshCw, RotateCcw, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playPopSound, playSparkleSound, playSuccessSound } from '../../utils/sound';

interface KidStickersAppProps {
  onClose: () => void;
  soundEnabled: boolean;
}

interface PlacedSticker {
  id: number;
  emoji: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

const BACKGROUNDS = [
  { id: 'fairy', name: 'Jardín de Hadas 🌸', bg: 'from-emerald-200 via-pink-100 to-purple-200', decor: '🌸🌺🌿🍄🧚' },
  { id: 'castle', name: 'Castillo Real 🏰', bg: 'from-pink-200 via-purple-200 to-indigo-200', decor: '🏰✨👑⭐💎' },
  { id: 'ocean', name: 'Océano Mágico 🌊', bg: 'from-cyan-200 via-blue-200 to-teal-200', decor: '🧜‍♀️🐬🪸🐚🌊' },
  { id: 'candy', name: 'Reino de Dulces 🍭', bg: 'from-amber-200 via-rose-200 to-fuchsia-200', decor: '🍭🧁🍦🍬🍓' },
];

const STICKERS = [
  '🦄', '👑', '💖', '🌈', '⭐', '🎀', '🐱', '🐰', 
  '🐶', '🧚‍♀️', '🧜‍♀️', '🌸', '🍭', '🧁', '🍦', '🍓', 
  '🦋', '💎', '🍄', '✨', '🎈', '🪄', '🌙', '🌟'
];

export const KidStickersApp: React.FC<KidStickersAppProps> = ({ onClose, soundEnabled }) => {
  const [selectedBg, setSelectedBg] = useState(BACKGROUNDS[0]);
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
  const [activeSticker, setActiveSticker] = useState<string>(STICKERS[0]);
  const boardRef = useRef<HTMLDivElement | null>(null);

  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    playPopSound(soundEnabled);
    const newSticker: PlacedSticker = {
      id: Date.now() + Math.random(),
      emoji: activeSticker,
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y)),
      size: Math.floor(Math.random() * 16) + 40,
      rotation: Math.floor(Math.random() * 30) - 15,
    };

    setPlacedStickers((prev) => [...prev, newSticker]);
    playSparkleSound(soundEnabled);
  };

  const removeSticker = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    playPopSound(soundEnabled);
    setPlacedStickers((prev) => prev.filter((s) => s.id !== id));
  };

  const clearBoard = () => {
    playPopSound(soundEnabled);
    setPlacedStickers([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900 text-slate-800 select-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-purple-600 text-white shadow-md z-20">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition text-white font-bold"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Salir</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-2xl animate-bounce">🦄</span>
          <h1 className="text-xl font-black tracking-wide">Álbum de Pegatinas Mágicas</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearBoard}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 active:scale-90 text-white"
            title="Limpiar Pegatinas"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Background World Selector */}
      <div className="flex items-center justify-center gap-2 py-2 px-3 bg-white/90 border-b border-pink-200 overflow-x-auto z-10">
        <span className="text-xs font-black text-purple-900 mr-1 flex items-center gap-1">
          <Layers className="w-4 h-4 text-pink-500" />
          Escenario:
        </span>
        {BACKGROUNDS.map((bg) => (
          <button
            key={bg.id}
            onClick={() => {
              setSelectedBg(bg);
              playPopSound(soundEnabled);
            }}
            className={`px-3 py-1.5 rounded-2xl text-xs font-black transition flex items-center gap-1 shrink-0 ${
              selectedBg.id === bg.id
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md scale-105'
                : 'bg-white text-slate-700 hover:bg-pink-50 border border-slate-200'
            }`}
          >
            {bg.name}
          </button>
        ))}
      </div>

      {/* Main Sticker Canvas */}
      <div className="flex-1 p-3 flex flex-col items-center justify-center relative overflow-hidden bg-slate-950">
        <div
          ref={boardRef}
          onClick={handleBoardClick}
          className={`relative w-full max-w-lg aspect-square sm:aspect-[4/3] rounded-3xl bg-gradient-to-br ${selectedBg.bg} border-4 border-white shadow-2xl overflow-hidden cursor-crosshair`}
        >
          {/* Background Ambient Elements */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-around opacity-30 text-5xl">
            {selectedBg.decor.split('').map((char, i) => (
              <span key={i} className="animate-pulse">{char}</span>
            ))}
          </div>

          {/* Interactive Placed Stickers */}
          {placedStickers.map((s) => (
            <div
              key={s.id}
              onClick={(e) => removeSticker(s.id, e)}
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                fontSize: `${s.size}px`,
                transform: `translate(-50%, -50%) rotate(${s.rotation}deg)`,
              }}
              className="absolute select-none hover:scale-125 transition-transform cursor-pointer drop-shadow-xl active:scale-95 group"
              title="Toca para quitar"
            >
              <span>{s.emoji}</span>
              <span className="opacity-0 group-hover:opacity-100 absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-0.5 text-[10px]">
                ✕
              </span>
            </div>
          ))}

          {placedStickers.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-4">
              <span className="text-4xl mb-1 animate-bounce">✨</span>
              <p className="text-xs sm:text-sm font-black text-purple-900 bg-white/80 px-4 py-2 rounded-2xl shadow-sm">
                ¡Toca cualquier lugar para pegar tu sticker {activeSticker}!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sticker Drawer */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-col gap-2 z-20">
        <div className="flex items-center justify-between text-xs text-pink-300 font-bold px-2">
          <span>Selecciona tu Sticker:</span>
          <span>Pegados: {placedStickers.length}</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 no-scrollbar">
          {STICKERS.map((stk) => (
            <button
              key={stk}
              onClick={() => {
                setActiveSticker(stk);
                playPopSound(soundEnabled);
              }}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-transform shrink-0 ${
                activeSticker === stk
                  ? 'bg-pink-500 text-white shadow-xl scale-110 ring-2 ring-white'
                  : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              {stk}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
