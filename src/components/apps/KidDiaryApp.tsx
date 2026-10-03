import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Sparkles, Smile, Plus, Trash2 } from 'lucide-react';
import { playPopSound, playSparkleSound } from '../../utils/sound';
import confetti from 'canvas-confetti';

interface KidDiaryAppProps {
  onClose: () => void;
  soundEnabled: boolean;
}

interface DiaryEntry {
  id: string;
  date: string;
  mood: string;
  text: string;
  sticker: string;
}

const MOODS = ['😊 Feliz', '🤩 Emocionada', '🦄 Mágica', '😴 Con Sueño', '🎨 Creativa'];
const STICKERS = ['💖', '🦄', '⭐', '🌈', '🍭', '🌸', '👑', '🐱'];

export const KidDiaryApp: React.FC<KidDiaryAppProps> = ({ onClose, soundEnabled }) => {
  const [entries, setEntries] = useState<DiaryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('kid_diary_entries');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: '1',
        date: new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }),
        mood: '😊 Feliz',
        text: '¡Hoy jugué mucho y dibujé un hermoso unicornio en mi tablet! ✨',
        sticker: '🦄',
      }
    ];
  });

  const [currentText, setCurrentText] = useState('');
  const [selectedMood, setSelectedMood] = useState(MOODS[0]);
  const [selectedSticker, setSelectedSticker] = useState(STICKERS[0]);

  useEffect(() => {
    localStorage.setItem('kid_diary_entries', JSON.stringify(entries));
  }, [entries]);

  const addEntry = () => {
    if (!currentText.trim()) return;

    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }),
      mood: selectedMood,
      text: currentText.trim(),
      sticker: selectedSticker,
    };

    setEntries([newEntry, ...entries]);
    setCurrentText('');
    playSparkleSound(soundEnabled);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  const deleteEntry = (id: string) => {
    playPopSound(soundEnabled);
    setEntries(entries.filter((e) => e.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-rose-50 text-slate-800 select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-rose-400 via-pink-500 to-fuchsia-500 text-white shadow-md">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition text-white font-bold"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Salir</span>
        </button>

        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-pink-200 fill-pink-200 animate-pulse" />
          <h1 className="text-xl font-bold tracking-wide">Mi Diario Bonito</h1>
        </div>

        <div className="w-12" />
      </div>

      {/* Diary Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
        <div className="w-full max-w-md flex flex-col gap-4">
          {/* New Entry Box */}
          <div className="bg-white p-4 rounded-3xl shadow-lg border-2 border-pink-200 flex flex-col gap-3">
            <h3 className="font-black text-pink-800 text-base">¿Qué hiciste hoy de divertido? ✍️</h3>

            {/* Mood selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {MOODS.map((m) => (
                <button
                  key={m}
                  onClick={() => { setSelectedMood(m); playPopSound(soundEnabled); }}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition flex-shrink-0 ${
                    selectedMood === m ? 'bg-pink-500 text-white shadow' : 'bg-pink-50 text-pink-700'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Sticker selector */}
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              <span className="text-xs font-bold text-pink-600 flex-shrink-0">Sticker:</span>
              {STICKERS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setSelectedSticker(s); playPopSound(soundEnabled); }}
                  className={`w-8 h-8 rounded-xl text-lg flex items-center justify-center transition flex-shrink-0 ${
                    selectedSticker === s ? 'bg-pink-200 ring-2 ring-pink-400 scale-110' : 'bg-pink-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              placeholder="Escribe algo lindo de tu día aquí..."
              className="w-full h-24 p-3 rounded-2xl bg-pink-50/50 border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm resize-none"
            />

            <button
              onClick={addEntry}
              disabled={!currentText.trim()}
              className="py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold shadow-md active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Guardar en Mi Diario</span>
            </button>
          </div>

          {/* Past Entries */}
          <div className="flex flex-col gap-3">
            <h4 className="font-black text-pink-900 text-sm px-1">Tus Recuerdos Guardados:</h4>

            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white p-4 rounded-3xl border border-pink-200 shadow-sm flex flex-col gap-2 relative"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{entry.sticker}</span>
                    <span className="text-xs font-bold text-slate-500 capitalize">{entry.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-pink-100 text-pink-800 font-bold px-2 py-0.5 rounded-full">
                      {entry.mood}
                    </span>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="p-1 text-slate-400 hover:text-red-500 transition"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed font-medium pl-1">
                  {entry.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
