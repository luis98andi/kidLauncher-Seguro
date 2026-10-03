import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Volume2, Pause, Sparkles, Heart } from 'lucide-react';
import { playPopSound, playSparkleSound } from '../../utils/sound';

interface KidStoriesAppProps {
  onClose: () => void;
  soundEnabled: boolean;
}

interface Story {
  id: string;
  title: string;
  emoji: string;
  gradient: string;
  moral: string;
  paragraphs: string[];
}

const STORIES: Story[] = [
  {
    id: 'unicorn',
    title: 'El Unicornio y la Estrella Caída',
    emoji: '🦄',
    gradient: 'from-pink-400 via-purple-400 to-indigo-400',
    moral: 'La bondad y ayudar a otros ilumina el mundo entero.',
    paragraphs: [
      'Había una vez en un bosque de algodón de azúcar, una unicornio pequeñita llamada Chispa. Su cuerno brillaba con todos los colores del arcoíris cuando estaba feliz.',
      'Una noche, una pequeña estrella cayó del cielo y aterrizó sobre un campo de flores. La estrellita estaba triste porque no sabía cómo volver a su hogar en el cielo nocturno.',
      'Chispa se acercó con dulzura, le dio un cálido abrazo y con un destello brillante de su cuerno, creó un arcoíris de luz brillante que subió hasta las nubes.',
      'La estrellita subió saltando de alegría y desde esa noche, siempre titila con más fuerza para saludar a su mejor amiga Chispa desde lo alto del cielo.'
    ]
  },
  {
    id: 'princess-dragon',
    title: 'La Princesa Valentina y el Dragón Bueno',
    emoji: '👑',
    gradient: 'from-rose-400 via-pink-400 to-amber-300',
    moral: 'Nunca juzgues a nadie por su apariencia, todos merecen amistad.',
    paragraphs: [
      'En un castillo rodeado de margaritas vivía la Princesa Valentina. A ella no le gustaba bordar, prefería explorar las montañas y buscar mariposas de colores.',
      'Un día escuchó un sollozo en una cueva. No era un monstruo temible, ¡era un pequeño dragón verde llamado Fufú que lloraba porque no podía hacer fuego, solo hacía pompas de jabón!',
      'Valentina sonrió, le aplaudió con entusiasmo y le dijo: "¡Hacer pompas de jabón es el talento más mágico y divertido de todo el reino!"',
      'Desde ese día, Valentina y Fufú llenaron el reino entero con fiestas de pompas de colores y fueron los mejores amigos inseparables.'
    ]
  },
  {
    id: 'kitty',
    title: 'Misi, la Gatita Soñadora',
    emoji: '🐱',
    gradient: 'from-teal-400 via-emerald-400 to-cyan-400',
    moral: 'Con imaginación y esfuerzo, puedes alcanzar tus más grandes sueños.',
    paragraphs: [
      'Misi era una gatita blanca con manchas rosas que miraba a los pajaritos volar y soñaba con tocar las nubes suaves como el algodón.',
      'Con la ayuda de sus amigos los ratoncitos y un par de hojas grandes de roble, construyó unas alas de flores perfumadas.',
      'Cuando sopló la brisa de primavera, Misi saltó suavemente y planeó sobre el prado verde, sintiendo el aire fresco y oliendo las flores desde arriba.',
      'Misi descubrió que con valentía y buenos amigos, los sueños más mágicos siempre se pueden hacer realidad.'
    ]
  }
];

export const KidStoriesApp: React.FC<KidStoriesAppProps> = ({ onClose, soundEnabled }) => {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Tu navegador no soporta lectura de voz');
      return;
    }

    window.speechSynthesis.cancel();

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.pitch = 1.3; // Cute friendly voice pitch
    utterance.rate = 0.9;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 text-slate-800 select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-purple-600 text-white shadow-md">
        <button
          onClick={() => {
            stopSpeaking();
            if (selectedStory) {
              setSelectedStory(null);
            } else {
              onClose();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition text-white font-bold"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">{selectedStory ? 'Cuentos' : 'Salir'}</span>
        </button>

        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-yellow-300" />
          <h1 className="text-xl font-bold tracking-wide">Cuentos Mágicos</h1>
        </div>

        {selectedStory ? (
          <button
            onClick={() => speakText(selectedStory.paragraphs.join(' '))}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-bold text-xs transition ${
              isSpeaking ? 'bg-rose-500 text-white animate-pulse' : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {isSpeaking ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isSpeaking ? 'Pausar' : 'Leer Voz'}</span>
          </button>
        ) : (
          <div className="w-12" />
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
        {!selectedStory ? (
          <div className="w-full max-w-md flex flex-col gap-4">
            <p className="text-center text-sm font-bold text-pink-600">
              Elige un cuento para leer o escuchar con voz mágica ✨
            </p>

            {STORIES.map((story) => (
              <button
                key={story.id}
                onClick={() => {
                  setSelectedStory(story);
                  playSparkleSound(soundEnabled);
                }}
                className={`p-5 rounded-3xl bg-gradient-to-r ${story.gradient} text-white shadow-lg flex items-center gap-4 hover:scale-102 active:scale-95 transition transform border-2 border-white/60 text-left`}
              >
                <div className="w-16 h-16 rounded-2xl bg-white/30 flex items-center justify-center text-4xl shadow-inner flex-shrink-0">
                  {story.emoji}
                </div>
                <div>
                  <h3 className="text-lg font-black">{story.title}</h3>
                  <p className="text-xs text-white/90 font-medium mt-1">
                    🌟 {story.moral}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="w-full max-w-lg bg-white p-6 rounded-3xl shadow-xl border-4 border-pink-100 flex flex-col gap-4">
            <div className="text-center pb-2 border-b border-pink-100">
              <span className="text-5xl">{selectedStory.emoji}</span>
              <h2 className="text-2xl font-black text-purple-950 mt-2">{selectedStory.title}</h2>
            </div>

            <div className="flex flex-col gap-4 text-slate-700 leading-relaxed text-base font-medium">
              {selectedStory.paragraphs.map((p, idx) => (
                <p key={idx} className="bg-pink-50/60 p-3.5 rounded-2xl border border-pink-100/80">
                  {p}
                </p>
              ))}
            </div>

            <div className="mt-3 p-4 rounded-2xl bg-gradient-to-r from-amber-100 to-pink-100 border border-amber-200/80 text-amber-900 text-xs font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span>Moraleja: {selectedStory.moral}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
