import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Circle, Star, Sparkles, Trophy } from 'lucide-react';
import { playSparkleSound, playSuccessSound, playPopSound } from '../../utils/sound';
import confetti from 'canvas-confetti';

interface KidRoutineAppProps {
  onClose: () => void;
  soundEnabled: boolean;
}

interface RoutineItem {
  id: string;
  title: string;
  emoji: string;
  points: number;
}

const DEFAULT_ROUTINES: RoutineItem[] = [
  { id: '1', title: 'Cepillarme los dientes 🦷', emoji: '🪥', points: 1 },
  { id: '2', title: 'Ordenar mis juguetes 🧸', emoji: '🧹', points: 1 },
  { id: '3', title: 'Comer toda mi comida 🥗', emoji: '🍎', points: 1 },
  { id: '4', title: 'Hacer mis deberes escolares 📚', emoji: '✏️', points: 1 },
  { id: '5', title: 'Ponerse el pijama bonito 👗', emoji: '🌙', points: 1 },
];

export const KidRoutineApp: React.FC<KidRoutineAppProps> = ({ onClose, soundEnabled }) => {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    const isNowDone = !completed[id];
    setCompleted((prev) => ({ ...prev, [id]: isNowDone }));

    if (isNowDone) {
      playSparkleSound(soundEnabled);
      const totalDone = Object.values({ ...completed, [id]: true }).filter(Boolean).length;
      if (totalDone === DEFAULT_ROUTINES.length) {
        playSuccessSound(soundEnabled);
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });
      }
    } else {
      playPopSound(soundEnabled);
    }
  };

  const starsEarned = Object.values(completed).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-amber-50 text-slate-800 select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-500 text-white shadow-md">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition text-white font-bold"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Salir</span>
        </button>

        <div className="flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-200 fill-yellow-200 animate-spin" />
          <h1 className="text-xl font-bold tracking-wide">Mi Rutina de Estrellas</h1>
        </div>

        <div className="w-12" />
      </div>

      {/* Routine Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
        <div className="w-full max-w-sm flex flex-col gap-4">
          {/* Star Counter */}
          <div className="bg-gradient-to-r from-amber-400 to-yellow-300 p-5 rounded-3xl text-amber-950 shadow-lg flex items-center justify-between border-2 border-white/60">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-900">Estrellitas Ganadas</span>
              <h2 className="text-3xl font-black">{starsEarned} / {DEFAULT_ROUTINES.length} ⭐</h2>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/40 flex items-center justify-center text-3xl shadow-inner">
              🏆
            </div>
          </div>

          {/* List */}
          <div className="flex flex-col gap-3">
            {DEFAULT_ROUTINES.map((item) => {
              const isDone = !!completed[item.id];
              return (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`p-4 rounded-3xl border-2 transition transform flex items-center justify-between shadow-md text-left ${
                    isDone
                      ? 'bg-emerald-50 border-emerald-400 scale-98 text-emerald-900'
                      : 'bg-white border-amber-200 hover:border-amber-300 active:scale-95 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{item.emoji}</span>
                    <span className={`font-black text-base ${isDone ? 'line-through text-emerald-700' : ''}`}>
                      {item.title}
                    </span>
                  </div>

                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    isDone ? 'bg-emerald-500 text-white' : 'border-2 border-amber-300 text-transparent'
                  }`}>
                    {isDone ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                  </div>
                </button>
              );
            })}
          </div>

          {starsEarned === DEFAULT_ROUTINES.length && (
            <div className="p-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-3xl text-center shadow-xl animate-bounce">
              <h3 className="font-black text-lg">¡Felicidades, Princesa! 👑🎉</h3>
              <p className="text-xs text-pink-100 mt-1">¡Has completado todas tus tareas de hoy! ¡Te has ganado un súper abrazo!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
