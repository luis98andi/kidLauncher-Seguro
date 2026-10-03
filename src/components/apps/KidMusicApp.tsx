import React, { useState } from 'react';
import { ArrowLeft, Music, Sparkles, Volume2, Pause, Play, Heart } from 'lucide-react';
import { playMusicalNote, playSparkleSound, playPopSound } from '../../utils/sound';
import confetti from 'canvas-confetti';

interface KidMusicAppProps {
  onClose: () => void;
  soundEnabled: boolean;
}

const PIANO_KEYS = [
  { note: 'DO', freq: 261.63, color: 'from-rose-400 to-pink-500', emoji: '🍓' },
  { note: 'RE', freq: 293.66, color: 'from-orange-400 to-amber-500', emoji: '🍊' },
  { note: 'MI', freq: 329.63, color: 'from-amber-300 to-yellow-400', emoji: '⭐' },
  { note: 'FA', freq: 349.23, color: 'from-emerald-400 to-green-500', emoji: '🍀' },
  { note: 'SOL', freq: 392.00, color: 'from-sky-400 to-blue-500', emoji: '💎' },
  { note: 'LA', freq: 440.00, color: 'from-indigo-400 to-purple-500', emoji: '🔮' },
  { note: 'SI', freq: 493.88, color: 'from-purple-400 to-fuchsia-500', emoji: '🦄' },
  { note: 'DO+', freq: 523.25, color: 'from-pink-500 to-rose-600', emoji: '👑' },
];

const ANIMAL_SOUNDS = [
  { name: 'Gatito', emoji: '🐱', soundName: '¡Miau!', freq: 650, type: 'sine' },
  { name: 'Perrito', emoji: '🐶', soundName: '¡Guau!', freq: 320, type: 'sawtooth' },
  { name: 'Pajarito', emoji: '🐦', soundName: '¡Pío!', freq: 1100, type: 'sine' },
  { name: 'Ranita', emoji: '🐸', soundName: '¡Croac!', freq: 180, type: 'square' },
  { name: 'Pollito', emoji: '🐥', soundName: '¡Pío pío!', freq: 950, type: 'triangle' },
  { name: 'Ovejita', emoji: '🐑', soundName: '¡Beee!', freq: 280, type: 'sawtooth' },
];

const LULLABIES = [
  {
    title: 'Estrellita, ¿Dónde Estás?',
    notes: [261.63, 261.63, 392.00, 392.00, 440.00, 440.00, 392.00, 349.23, 349.23, 329.63, 329.63, 293.66, 293.66, 261.63],
    tempo: 450,
  },
  {
    title: 'Canción de Cuna Mágica',
    notes: [329.63, 329.63, 392.00, 329.63, 329.63, 392.00, 329.63, 392.00, 523.25, 493.88, 440.00, 392.00],
    tempo: 500,
  },
  {
    title: 'Campanitas de Cristal',
    notes: [523.25, 493.88, 440.00, 392.00, 349.23, 329.63, 293.66, 261.63, 293.66, 329.63, 349.23, 392.00, 523.25],
    tempo: 350,
  }
];

export const KidMusicApp: React.FC<KidMusicAppProps> = ({ onClose, soundEnabled }) => {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [activeAnimal, setActiveAnimal] = useState<string | null>(null);
  const [playingSongIndex, setPlayingSongIndex] = useState<number | null>(null);
  const [tab, setTab] = useState<'piano' | 'animals' | 'lullaby'>('piano');

  const playKey = (key: typeof PIANO_KEYS[0]) => {
    setActiveKey(key.note);
    playMusicalNote(key.freq, 'sine', 0.5);
    setTimeout(() => setActiveKey(null), 250);
  };

  const playAnimal = (animal: typeof ANIMAL_SOUNDS[0]) => {
    setActiveAnimal(animal.name);
    playMusicalNote(animal.freq, animal.type as OscillatorType, 0.4);
    setTimeout(() => setActiveAnimal(null), 300);
  };

  const playLullaby = (index: number) => {
    if (playingSongIndex === index) {
      setPlayingSongIndex(null);
      return;
    }

    setPlayingSongIndex(index);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.5 } });

    const song = LULLABIES[index];
    song.notes.forEach((note, i) => {
      setTimeout(() => {
        playMusicalNote(note, 'sine', 0.6);
        if (i === song.notes.length - 1) {
          setTimeout(() => setPlayingSongIndex(null), 800);
        }
      }, i * song.tempo);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-purple-900 via-indigo-900 to-slate-950 text-white select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-purple-950/80 backdrop-blur border-b border-purple-800/50">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition text-white font-bold"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Salir</span>
        </button>

        <div className="flex items-center gap-2">
          <Music className="w-6 h-6 text-pink-400 animate-pulse" />
          <h1 className="text-xl font-bold tracking-wide">Música Mágica</h1>
        </div>

        <div className="w-16" />
      </div>

      {/* Tabs */}
      <div className="flex p-2 gap-2 justify-center bg-purple-950/50">
        <button
          onClick={() => { setTab('piano'); playPopSound(soundEnabled); }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm transition ${
            tab === 'piano' ? 'bg-pink-500 text-white shadow-lg scale-105' : 'bg-purple-900/40 text-purple-200'
          }`}
        >
          🎹 <span>Piano</span>
        </button>
        <button
          onClick={() => { setTab('animals'); playPopSound(soundEnabled); }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm transition ${
            tab === 'animals' ? 'bg-amber-500 text-white shadow-lg scale-105' : 'bg-purple-900/40 text-purple-200'
          }`}
        >
          🐱 <span>Sonidos</span>
        </button>
        <button
          onClick={() => { setTab('lullaby'); playPopSound(soundEnabled); }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm transition ${
            tab === 'lullaby' ? 'bg-indigo-500 text-white shadow-lg scale-105' : 'bg-purple-900/40 text-purple-200'
          }`}
        >
          🌙 <span>Melodías</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
        {tab === 'piano' && (
          <div className="w-full max-w-lg flex flex-col items-center gap-6">
            <div className="text-center">
              <span className="text-xs uppercase tracking-widest text-pink-300 font-bold bg-pink-900/50 px-3 py-1 rounded-full border border-pink-500/30">
                Toca las teclas de colores
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 w-full">
              {PIANO_KEYS.map((key) => (
                <button
                  key={key.note}
                  onClick={() => playKey(key)}
                  className={`h-40 rounded-2xl flex flex-col items-center justify-between p-3 bg-gradient-to-b ${key.color} shadow-xl transform transition duration-100 active:scale-95 active:translate-y-2 border-b-4 border-black/30 ${
                    activeKey === key.note ? 'scale-105 ring-4 ring-white ring-offset-2 ring-offset-purple-900' : ''
                  }`}
                >
                  <span className="text-2xl drop-shadow">{key.emoji}</span>
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-black tracking-wider drop-shadow-md">{key.note}</span>
                    <Sparkles className="w-4 h-4 text-white/70" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === 'animals' && (
          <div className="w-full max-w-md grid grid-cols-2 sm:grid-cols-3 gap-4">
            {ANIMAL_SOUNDS.map((animal) => (
              <button
                key={animal.name}
                onClick={() => playAnimal(animal)}
                className={`p-5 rounded-3xl bg-purple-800/40 hover:bg-purple-700/60 border-2 border-purple-500/30 flex flex-col items-center justify-center gap-2 transition transform active:scale-90 ${
                  activeAnimal === animal.name ? 'ring-4 ring-amber-400 bg-amber-500/30 scale-105' : ''
                }`}
              >
                <span className="text-5xl animate-bounce">{animal.emoji}</span>
                <span className="font-bold text-lg text-purple-100">{animal.name}</span>
                <span className="text-xs bg-purple-950/70 px-2.5 py-0.5 rounded-full text-pink-300 font-bold">
                  {animal.soundName}
                </span>
              </button>
            ))}
          </div>
        )}

        {tab === 'lullaby' && (
          <div className="w-full max-w-md flex flex-col gap-3">
            <p className="text-center text-sm text-purple-200 mb-2">
              Melodías suaves para relajarse y soñar bonito ✨
            </p>
            {LULLABIES.map((song, i) => (
              <div
                key={song.title}
                className="p-4 rounded-2xl bg-purple-900/60 border border-purple-600/40 flex items-center justify-between shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pink-500/30 flex items-center justify-center text-xl">
                    🌙
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">{song.title}</h3>
                    <p className="text-xs text-purple-300">Relajante y mágica</p>
                  </div>
                </div>

                <button
                  onClick={() => playLullaby(i)}
                  className={`p-3 rounded-full font-bold transition shadow ${
                    playingSongIndex === i
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:scale-105 active:scale-95'
                  }`}
                >
                  {playingSongIndex === i ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
