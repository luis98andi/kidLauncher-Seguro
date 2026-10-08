import React, { useState } from 'react';
import { ArrowLeft, Heart, Sparkles, Utensils, Bath, Smile, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playPopSound, playSparkleSound, playBoingSound, playMagicWandSound } from '../../utils/sound';

interface KidPetAppProps {
  onClose: () => void;
  soundEnabled: boolean;
}

interface PetType {
  id: string;
  name: string;
  species: string;
  avatar: string;
  color: string;
  soundEmoji: string;
  greeting: string;
}

const PETS: PetType[] = [
  { id: 'cat', name: 'Gatita Luna', species: 'Gatita', avatar: '🐱', color: 'from-pink-400 to-rose-400', soundEmoji: '🐾 ¡Miau!', greeting: '¡Ronroneo de amor! 💖' },
  { id: 'bunny', name: 'Conejito Pompón', species: 'Conejito', avatar: '🐰', color: 'from-purple-400 to-pink-400', soundEmoji: '🌸 ¡Ñam!', greeting: '¡Saltitos de alegría! 🐰' },
  { id: 'dog', name: 'Perrito Toby', species: 'Perrito', avatar: '🐶', color: 'from-amber-400 to-orange-400', soundEmoji: '🦴 ¡Guau!', greeting: '¡Moviendo la colita! 🐶' },
  { id: 'unicorn', name: 'Unicornia Chispa', species: 'Unicornia', avatar: '🦄', color: 'from-cyan-400 to-purple-500', soundEmoji: '✨ ¡Nigh!', greeting: '¡Magia de arcoíris! 🌈' },
];

export const KidPetApp: React.FC<KidPetAppProps> = ({ onClose, soundEnabled }) => {
  const [selectedPet, setSelectedPet] = useState<PetType>(PETS[0]);
  const [hunger, setHunger] = useState(85);
  const [cleanliness, setCleanliness] = useState(90);
  const [happiness, setHappiness] = useState(80);
  const [heartsCount, setHeartsCount] = useState(15);
  const [petActionState, setPetActionState] = useState<'idle' | 'eating' | 'bathing' | 'happy'>('idle');
  const [petSpeech, setPetSpeech] = useState(PETS[0].greeting);
  const [accessory, setAccessory] = useState<'none' | 'crown' | 'bow' | 'glasses' | 'hat'>('none');
  const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number }[]>([]);

  // Feed Pet
  const feedPet = (foodName: string, foodEmoji: string) => {
    playPopSound(soundEnabled);
    setHunger((prev) => Math.min(100, prev + 20));
    setHappiness((prev) => Math.min(100, prev + 10));
    setHeartsCount((prev) => prev + 2);
    setPetActionState('eating');
    setPetSpeech(`¡Mmm, qué rico ${foodName}! ${foodEmoji}`);

    setTimeout(() => {
      setPetActionState('idle');
    }, 1400);
  };

  // Bathe Pet
  const bathePet = () => {
    playMagicWandSound(soundEnabled);
    setCleanliness(100);
    setHappiness((prev) => Math.min(100, prev + 15));
    setHeartsCount((prev) => prev + 3);
    setPetActionState('bathing');
    setPetSpeech('¡Qué refrescante y limpio! 🧼✨');

    const newBubbles = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 60 + 20,
      y: Math.random() * 40 + 30,
    }));
    setBubbles(newBubbles);

    setTimeout(() => {
      setPetActionState('idle');
      setBubbles([]);
    }, 1800);
  };

  // Pet / Caress
  const caressPet = () => {
    playSparkleSound(soundEnabled);
    setHappiness((prev) => Math.min(100, prev + 25));
    setHeartsCount((prev) => prev + 5);
    setPetActionState('happy');
    setPetSpeech(`¡Te quiero mucho! ${selectedPet.soundEmoji} 💖`);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.5 } });

    setTimeout(() => {
      setPetActionState('idle');
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-pink-100 via-rose-50 to-purple-100 text-slate-800 select-none overflow-hidden h-[100dvh] max-h-[100dvh]">
      {/* Header (Compact) */}
      <div className="flex items-center justify-between px-3 py-1.5 sm:py-2 bg-gradient-to-r from-pink-500 via-rose-400 to-purple-500 text-white shadow-md z-20 shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Salir</span>
        </button>

        <div className="flex items-center gap-1.5">
          <span className="text-xl animate-bounce">🐾</span>
          <h1 className="text-base sm:text-lg font-black tracking-wide">Mi Mascota Mágica</h1>
        </div>

        <div className="flex items-center gap-1 bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-black">
          <Heart className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
          <span>{heartsCount}</span>
        </div>
      </div>

      {/* Pet Selector Tabs (Compact) */}
      <div className="flex items-center justify-center gap-1.5 py-1 px-2 bg-white/70 backdrop-blur-sm border-b border-pink-200 overflow-x-auto z-10 shrink-0">
        {PETS.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setSelectedPet(p);
              setPetSpeech(p.greeting);
              playPopSound(soundEnabled);
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black transition shrink-0 ${
              selectedPet.id === p.id
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md scale-102'
                : 'bg-white text-slate-700 hover:bg-pink-50 border border-pink-200'
            }`}
          >
            <span className="text-base">{p.avatar}</span>
            <span>{p.name}</span>
          </button>
        ))}
      </div>

      {/* Center Interactive Stage (Flexibly scales to any screen height like 1024x768) */}
      <div className="flex-1 flex flex-col items-center justify-between p-2 max-w-sm mx-auto w-full min-h-0 overflow-hidden">
        {/* Status Bars (Compact) */}
        <div className="w-full grid grid-cols-3 gap-2 bg-white/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-pink-200 shadow-sm shrink-0">
          <div>
            <div className="flex items-center justify-between text-[10px] font-black text-rose-600 mb-0.5">
              <span>🍓 Comida</span>
              <span>{hunger}%</span>
            </div>
            <div className="w-full h-1.5 bg-rose-100 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full transition-all duration-300" style={{ width: `${hunger}%` }} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-[10px] font-black text-cyan-600 mb-0.5">
              <span>🧼 Baño</span>
              <span>{cleanliness}%</span>
            </div>
            <div className="w-full h-1.5 bg-cyan-100 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 rounded-full transition-all duration-300" style={{ width: `${cleanliness}%` }} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-[10px] font-black text-amber-600 mb-0.5">
              <span>💖 Amor</span>
              <span>{happiness}%</span>
            </div>
            <div className="w-full h-1.5 bg-amber-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all duration-300" style={{ width: `${happiness}%` }} />
            </div>
          </div>
        </div>

        {/* Speech Bubble (Compact) */}
        <div className="my-1 bg-white/95 px-3 py-1 rounded-2xl rounded-bl-none shadow border-2 border-pink-300 text-xs font-black text-pink-900 animate-bounce shrink-0 text-center max-w-xs">
          {petSpeech}
        </div>

        {/* Central Character Body (Scales dynamically so it never gets cut off!) */}
        <div className="relative flex flex-col items-center justify-center my-auto">
          {/* Pet Aura */}
          <div className={`absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr ${selectedPet.color} opacity-30 blur-xl animate-pulse`} />

          {/* Interactive Pet Button */}
          <button
            onClick={caressPet}
            className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr ${selectedPet.color} border-4 border-white shadow-2xl flex items-center justify-center text-6xl sm:text-7xl transition-transform duration-200 active:scale-125 cursor-pointer select-none group relative ${
              petActionState === 'eating' ? 'animate-bounce' : petActionState === 'happy' ? 'scale-110 rotate-6' : 'hover:scale-105'
            }`}
          >
            <span>{selectedPet.avatar}</span>

            {/* Accessory Overlays */}
            {accessory === 'crown' && (
              <span className="absolute -top-4 sm:-top-5 text-3xl sm:text-4xl animate-bounce">👑</span>
            )}
            {accessory === 'bow' && (
              <span className="absolute -top-2 right-1 text-2xl sm:text-3xl">🎀</span>
            )}
            {accessory === 'glasses' && (
              <span className="absolute top-8 sm:top-10 text-3xl sm:text-4xl">🕶️</span>
            )}
            {accessory === 'hat' && (
              <span className="absolute -top-4 text-3xl sm:text-4xl">🎩</span>
            )}
          </button>

          {/* Bubbles on bathe */}
          {bubbles.map((b) => (
            <div
              key={b.id}
              style={{ left: `${b.x}%`, top: `${b.y}%` }}
              className="absolute text-2xl animate-ping pointer-events-none"
            >
              🫧
            </div>
          ))}

          <span className="text-[10px] font-black text-pink-700 bg-pink-100/90 px-2.5 py-0.5 rounded-full mt-1.5 border border-pink-300 shadow-sm shrink-0">
            ¡Tócame para mimarme! 💕
          </span>
        </div>

        {/* Accessory Dressing Bar (Compact) */}
        <div className="flex items-center gap-1.5 my-1 shrink-0">
          <span className="text-[11px] font-black text-slate-600">Disfraz:</span>
          {[
            { id: 'none', label: 'Sin disfraz', icon: '❌' },
            { id: 'crown', label: 'Corona', icon: '👑' },
            { id: 'bow', label: 'Lazo', icon: '🎀' },
            { id: 'glasses', label: 'Gafas', icon: '🕶️' },
            { id: 'hat', label: 'Gorro', icon: '🎩' },
          ].map((acc) => (
            <button
              key={acc.id}
              onClick={() => {
                setAccessory(acc.id as any);
                playSparkleSound(soundEnabled);
              }}
              className={`p-1 rounded-xl border text-sm transition ${
                accessory === acc.id ? 'bg-pink-500 text-white shadow scale-110' : 'bg-white text-slate-700 hover:bg-pink-50'
              }`}
              title={acc.label}
            >
              {acc.icon}
            </button>
          ))}
        </div>

        {/* Action Controls Deck (Compact & always 100% visible) */}
        <div className="w-full grid grid-cols-4 gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border-2 border-pink-200 shadow-lg shrink-0">
          <button
            onClick={() => feedPet('fresita', '🍓')}
            className="p-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 active:scale-95 text-white flex flex-col items-center gap-0.5 font-black text-[10px] shadow"
          >
            <span className="text-xl">🍓</span>
            <span>Fresita</span>
          </button>

          <button
            onClick={() => feedPet('galleta', '🍪')}
            className="p-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 flex flex-col items-center gap-0.5 font-black text-[10px] shadow"
          >
            <span className="text-xl">🍪</span>
            <span>Galleta</span>
          </button>

          <button
            onClick={bathePet}
            className="p-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-white flex flex-col items-center gap-0.5 font-black text-[10px] shadow"
          >
            <span className="text-xl">🧼</span>
            <span>Bañar</span>
          </button>

          <button
            onClick={caressPet}
            className="p-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 active:scale-95 text-white flex flex-col items-center gap-0.5 font-black text-[10px] shadow"
          >
            <span className="text-xl">💖</span>
            <span>Mimar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
