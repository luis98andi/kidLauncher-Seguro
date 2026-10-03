import React from 'react';
import { Moon, Star, Lock, Sparkles } from 'lucide-react';
import { playPopSound } from '../utils/sound';

interface BedtimeLockScreenProps {
  kidName: string;
  onUnlockParent: () => void;
  soundEnabled: boolean;
}

export const BedtimeLockScreen: React.FC<BedtimeLockScreenProps> = ({
  kidName,
  onUnlockParent,
  soundEnabled,
}) => {
  return (
    <div className="fixed inset-0 z-40 bg-gradient-to-b from-indigo-950 via-slate-950 to-purple-950 text-white flex flex-col items-center justify-between p-6 select-none">
      {/* Top Stars */}
      <div className="flex items-center justify-between w-full max-w-sm pt-4">
        <Star className="w-6 h-6 text-yellow-300 animate-sparkle" />
        <span className="text-xs bg-indigo-900/60 text-indigo-200 px-3 py-1 rounded-full border border-indigo-700/50">
          🌙 Hora de Dormir
        </span>
        <Star className="w-5 h-5 text-yellow-200 animate-sparkle" />
      </div>

      {/* Main Sleep Card */}
      <div className="flex flex-col items-center text-center gap-4 max-w-sm">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-600/30 to-purple-500/30 flex items-center justify-center animate-pulse-gentle">
            <span className="text-7xl">😴🌙</span>
          </div>
          <div className="absolute -top-2 -right-2 text-2xl animate-float">✨</div>
          <div className="absolute -bottom-2 -left-2 text-xl animate-float">💤</div>
        </div>

        <h1 className="text-2xl font-black text-white">
          ¡A Soñar con los Angelitos, {kidName}! 🧸
        </h1>

        <p className="text-sm text-indigo-200 leading-relaxed font-medium bg-indigo-900/40 p-4 rounded-3xl border border-indigo-700/30">
          La pantalla está descansando hasta mañana. Es hora de cepillarse los dientes, ponerse el pijama y soñar cosas mágicas y bonitas. 🌟💖
        </p>

        <div className="flex items-center gap-2 text-xs text-yellow-300 font-bold bg-yellow-950/40 px-4 py-2 rounded-full border border-yellow-500/30">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>¡Mañana jugaremos más en tu tablet!</span>
        </div>
      </div>

      {/* Parent Unlock Button */}
      <div className="pb-4">
        <button
          onClick={() => {
            playPopSound(soundEnabled);
            onUnlockParent();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-indigo-200 text-xs font-bold transition border border-white/15 active:scale-95"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Desbloquear Modo Padres (PIN)</span>
        </button>
      </div>
    </div>
  );
};
