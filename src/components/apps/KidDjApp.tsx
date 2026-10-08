import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Square, Music, Sparkles, Disc, Volume2, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  playMusicalNote, playPopSound, playSparkleSound, playHornSound, 
  playBoingSound, playBalloonPopSound, playApplauseSound 
} from '../../utils/sound';

interface KidDjAppProps {
  onClose: () => void;
  soundEnabled: boolean;
}

interface SoundPad {
  id: string;
  name: string;
  emoji: string;
  color: string;
  soundType: 'note' | 'horn' | 'boing' | 'pop' | 'sparkle' | 'applause';
  freq?: number;
}

const PADS: SoundPad[] = [
  { id: 'p1', name: 'Do Mágico', emoji: '🎹', color: 'from-pink-500 to-rose-500', soundType: 'note', freq: 523.25 },
  { id: 'p2', name: 'Mi Dulce', emoji: '🎵', color: 'from-purple-500 to-indigo-500', soundType: 'note', freq: 659.25 },
  { id: 'p3', name: 'Sol Fiesta', emoji: '🎶', color: 'from-cyan-400 to-blue-500', soundType: 'note', freq: 783.99 },
  { id: 'p4', name: 'Bocina', emoji: '🎺', color: 'from-amber-400 to-orange-500', soundType: 'horn' },
  { id: 'p5', name: 'Campanitas', emoji: '🔔', color: 'from-emerald-400 to-teal-500', soundType: 'sparkle' },
  { id: 'p6', name: 'Resorte', emoji: '🌀', color: 'from-fuchsia-500 to-pink-500', soundType: 'boing' },
  { id: 'p7', name: 'Burbuja Pop', emoji: '🫧', color: 'from-sky-400 to-cyan-500', soundType: 'pop' },
  { id: 'p8', name: 'Aplausos', emoji: '👏', color: 'from-yellow-400 to-amber-500', soundType: 'applause' },
  { id: 'p9', name: 'Do Alto', emoji: '✨', color: 'from-rose-500 to-red-500', soundType: 'note', freq: 1046.50 },
];

export const KidDjApp: React.FC<KidDjAppProps> = ({ onClose, soundEnabled }) => {
  const [activePad, setActivePad] = useState<string | null>(null);
  const [isLooping, setIsLooping] = useState(false);
  const loopTimerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      clearInterval(loopTimerRef.current);
    };
  }, []);

  const triggerPad = (pad: SoundPad) => {
    setActivePad(pad.id);
    setTimeout(() => setActivePad(null), 250);

    if (pad.soundType === 'note' && pad.freq) {
      playMusicalNote(pad.freq, 'triangle', 0.35);
    } else if (pad.soundType === 'horn') {
      playHornSound(soundEnabled);
    } else if (pad.soundType === 'boing') {
      playBoingSound(soundEnabled);
    } else if (pad.soundType === 'sparkle') {
      playSparkleSound(soundEnabled);
    } else if (pad.soundType === 'applause') {
      playApplauseSound(soundEnabled);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    } else if (pad.soundType === 'pop') {
      playBalloonPopSound(1.2, soundEnabled);
    }
  };

  const toggleAutoBeat = () => {
    if (isLooping) {
      clearInterval(loopTimerRef.current);
      setIsLooping(false);
      playPopSound(soundEnabled);
    } else {
      setIsLooping(true);
      playSparkleSound(soundEnabled);

      let step = 0;
      const sequence = ['p1', 'p7', 'p2', 'p5', 'p3', 'p4', 'p2', 'p9'];
      loopTimerRef.current = setInterval(() => {
        const padId = sequence[step % sequence.length];
        const targetPad = PADS.find((p) => p.id === padId);
        if (targetPad) {
          triggerPad(targetPad);
        }
        step++;
      }, 450);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white select-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-700 via-purple-700 to-pink-600 text-white shadow-md z-20">
        <button
          onClick={() => {
            clearInterval(loopTimerRef.current);
            onClose();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition text-white font-bold"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Salir</span>
        </button>

        <div className="flex items-center gap-2">
          <Disc className={`w-6 h-6 text-pink-400 ${isLooping ? 'animate-spin' : ''}`} />
          <h1 className="text-xl font-black tracking-wide">DJ Fiesta & Ritmos</h1>
        </div>

        <button
          onClick={toggleAutoBeat}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black shadow transition active:scale-95 ${
            isLooping ? 'bg-amber-400 text-slate-950 animate-pulse' : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          {isLooping ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isLooping ? 'Parar Beat' : 'Beat Automático'}</span>
        </button>
      </div>

      {/* Main Launchpad Grid */}
      <div className="flex-1 p-4 flex flex-col items-center justify-center max-w-sm mx-auto w-full">
        <div className="grid grid-cols-3 gap-3 w-full aspect-square">
          {PADS.map((pad) => (
            <button
              key={pad.id}
              onClick={() => triggerPad(pad)}
              className={`rounded-3xl bg-gradient-to-tr ${pad.color} border-2 border-white/40 shadow-2xl flex flex-col items-center justify-center gap-1 transition-all duration-150 active:scale-90 cursor-pointer ${
                activePad === pad.id ? 'scale-105 ring-4 ring-white brightness-125' : 'hover:scale-102'
              }`}
              style={{
                boxShadow: activePad === pad.id ? '0 0 25px rgba(255, 255, 255, 0.8)' : undefined,
              }}
            >
              <span className="text-3xl sm:text-4xl">{pad.emoji}</span>
              <span className="text-[11px] font-black text-white/95">{pad.name}</span>
            </button>
          ))}
        </div>

        {/* Tip */}
        <p className="text-xs text-purple-300 font-bold mt-4 text-center bg-slate-900/80 px-4 py-2 rounded-2xl border border-purple-500/30">
          ¡Toca los botones de colores para crear tu propia canción! 🎶✨
        </p>
      </div>
    </div>
  );
};
