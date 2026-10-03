import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, PhoneOff, Volume2, Heart, Sparkles, Smile, Star, Shield, Music, MessageCircle, User } from 'lucide-react';
import { EmergencyContact } from '../../types';
import { playSparkleSound, playPopSound, playPhoneDialTone, playRingtoneSound, playSuccessSound } from '../../utils/sound';
import confetti from 'canvas-confetti';

interface KidContactsAppProps {
  contacts: EmergencyContact[];
  onClose: () => void;
  soundEnabled: boolean;
}

interface RoleplayCharacter {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bgColor: string;
  voicePhrase: string;
  songText: string;
  jokeText: string;
}

const DEFAULT_CHARACTERS: RoleplayCharacter[] = [
  {
    id: 'mom',
    name: 'Mamá 👑',
    role: 'Familia',
    avatar: '👩‍👧',
    bgColor: 'from-pink-500 to-rose-600',
    voicePhrase: '¡Hola mi princesa hermosa! ¿Cómo va tu día tan genial? ¡Te quiero muchísimo!',
    songText: '🎵 "Un elefante se balanceaba sobre la tela de una araña..." 🎶',
    jokeText: '😹 ¿Qué le dice una impresora a otra? ¡Oye, esa hoja es tuya o es impresión mía! Hahaha'
  },
  {
    id: 'dad',
    name: 'Papá 🦸‍♂️',
    role: 'Familia',
    avatar: '👨‍👧',
    bgColor: 'from-blue-500 to-indigo-600',
    voicePhrase: '¡Hola campeona! ¡Papá está muy orgulloso de ti! ¡Sigue jugando y divirtiéndote!',
    songText: '🎵 "Estrellita dónde estás, me pregunto qué serás..." 🎶',
    jokeText: '😹 ¿Qué le dice un pez a otro pez? ¡Nada! Hahaha'
  },
  {
    id: 'grandma',
    name: 'Abuelita 👵',
    role: 'Familia',
    avatar: '👵',
    bgColor: 'from-purple-500 to-pink-600',
    voicePhrase: '¡Hola mi nietecita bella! Te mando un abrazo gigante y una galletita dulce 🍪💖',
    songText: '🎵 "Los pollitos dicen pío, pío, pío, cuando tienen hambre..." 🎶',
    jokeText: '😹 ¿Qué hace un perro con un taladro? ¡Ta-drando! Hahaha'
  },
  {
    id: 'elsa',
    name: 'Princesa Elsa ❄️',
    role: 'Amiga Mágica',
    avatar: '👸',
    bgColor: 'from-cyan-400 to-blue-600',
    voicePhrase: '¡Hola! Te mando un saludo mágico y helado desde el castillo de nieve ❄️✨',
    songText: '🎵 "Libre soy, libre soy, no puedo ocultarlo más..." 🎶',
    jokeText: '😹 ¿Qué le dice un muñeco de nieve a otro? ¿Sientes olor a zanahoria? Hahaha'
  },
  {
    id: 'unicorn',
    name: 'Unicornia Mágica 🦄',
    role: 'Mascota Fantástica',
    avatar: '🦄',
    bgColor: 'from-fuchsia-400 to-purple-600',
    voicePhrase: '¡Niiiiiigh! ¡Hola! Te mando lluvia de estrellas y polvo de arcoíris 🌈✨',
    songText: '🎵 "Arcoíris en el cielo, brillo, brillo sin parar..." 🎶',
    jokeText: '😹 ¿Qué hace un unicornio en la playa? ¡Magia bajo el sol! Hahaha'
  },
  {
    id: 'santa',
    name: 'Papá Noel 🎅',
    role: 'Polo Norte',
    avatar: '🎅',
    bgColor: 'from-red-500 to-rose-700',
    voicePhrase: '¡Ho Ho Ho! ¡Hola princesa! He estado mirando las estrellas y sé que has sido súper buena.',
    songText: '🎵 "Navidad, Navidad, dulce Navidad..." 🎶',
    jokeText: '😹 ¿Dónde guarda Santa sus regalos? ¡En el Polo Norte! Hahaha'
  },
  {
    id: 'doctor',
    name: 'Doctora Juguetes 🩺',
    role: 'Salud & Cuidado',
    avatar: '🩺',
    bgColor: 'from-teal-400 to-emerald-600',
    voicePhrase: '¡Hola! Chequeo rápido de la Doctora: ¡tu nivel de dulzura está en 100%! 💖',
    songText: '🎵 "A lavarse los dientes con sonrisa gigante..." 🎶',
    jokeText: '😹 ¿Qué le dice un termómetro a una curita? ¡Eres mi mejor amiga! Hahaha'
  },
  {
    id: 'robot',
    name: 'Robot Divertido 🤖',
    role: 'Tecno Amigo',
    avatar: '🤖',
    bgColor: 'from-amber-400 to-orange-600',
    voicePhrase: '¡Bip Bup Bip! Procesando llamada especial con la niña más inteligente del planeta 🚀',
    songText: '🎵 "Bip Bup Bap, baila el robot con compás..." 🎶',
    jokeText: '😹 ¿Qué come un robot? ¡Tuercas con salsa de aceite! Hahaha'
  }
];

export const KidContactsApp: React.FC<KidContactsAppProps> = ({ contacts, onClose, soundEnabled }) => {
  const [activeTab, setActiveTab] = useState<'contacts' | 'dialpad'>('contacts');
  const [dialedNumber, setDialedNumber] = useState('');
  
  // Call State
  const [callState, setCallState] = useState<'idle' | 'calling' | 'connected'>('idle');
  const [currentCallChar, setCurrentCallChar] = useState<RoleplayCharacter | null>(null);
  const [callTimer, setCallTimer] = useState(0);
  const [speechBubble, setSpeechBubble] = useState('');

  // Combine parent custom contacts + default characters
  const allCharacters: RoleplayCharacter[] = [
    ...contacts.map((c) => ({
      id: c.id,
      name: c.name,
      role: c.relation,
      avatar: c.avatarEmoji,
      bgColor: c.color,
      voicePhrase: `¡Hola mi niña linda! Soy ${c.name}. ¡Te mando un beso grandote y un abrazo apretado! 💖`,
      songText: '🎵 "Te quiero yo, y tú a mí, somos una familia feliz..." 🎶',
      jokeText: '😹 ¿Por qué las estrellas no van a la escuela? ¡Porque ya son muy brillantes! Hahaha'
    })),
    ...DEFAULT_CHARACTERS
  ];

  // Call timer effect
  useEffect(() => {
    let interval: any = null;
    if (callState === 'connected') {
      interval = setInterval(() => {
        setCallTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setCallTimer(0);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const speakText = (text: string) => {
    setSpeechBubble(text);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.95;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startRoleplayCall = (char: RoleplayCharacter) => {
    setCurrentCallChar(char);
    setCallState('calling');
    playRingtoneSound(soundEnabled);

    // Simulate 2 seconds of ringing before connecting
    setTimeout(() => {
      setCallState('connected');
      playSuccessSound(soundEnabled);
      speakText(char.voicePhrase);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.5 } });
    }, 2200);
  };

  const endRoleplayCall = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    playPopSound(soundEnabled);
    setCallState('idle');
    setCurrentCallChar(null);
    setSpeechBubble('');
  };

  const handleDialKeyPress = (key: string) => {
    playPhoneDialTone(key, soundEnabled);
    if (dialedNumber.length < 10) {
      setDialedNumber((prev) => prev + key);
    }
  };

  const handleDialCall = () => {
    if (!dialedNumber) return;
    // Find matching character or pick a fun random one
    const randomChar = allCharacters[Math.floor(Math.random() * allCharacters.length)];
    startRoleplayCall({
      ...randomChar,
      name: `Llamada al ${dialedNumber} 📞`,
    });
  };

  const sendKiss = () => {
    playSparkleSound(soundEnabled);
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    speakText('💋 ¡Muuuuua! ¡Qué besito tan dulce me mandaste! ¡Gracias mi vida!');
  };

  const singSong = () => {
    playSparkleSound(soundEnabled);
    confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
    if (currentCallChar) {
      speakText(currentCallChar.songText);
    }
  };

  const tellJoke = () => {
    playPopSound(soundEnabled);
    if (currentCallChar) {
      speakText(currentCallChar.jokeText);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white select-none">
      {/* ACTIVE CALL OVERLAY */}
      {callState !== 'idle' && currentCallChar && (
        <div className="fixed inset-0 z-60 bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 flex flex-col items-center justify-between p-6 overflow-hidden">
          {/* Top Status */}
          <div className="flex flex-col items-center gap-1 mt-4">
            <span className="px-3 py-1 rounded-full bg-pink-500/30 text-pink-300 font-bold text-xs">
              {callState === 'calling' ? '📞 Llamando...' : `🔴 En llamada (${formatTimer(callTimer)})`}
            </span>
            <h2 className="text-3xl font-black text-white mt-1 text-center">{currentCallChar.name}</h2>
            <span className="text-xs text-purple-200 font-medium">{currentCallChar.role}</span>
          </div>

          {/* Character Avatar in Call */}
          <div className="relative my-4 flex flex-col items-center">
            <div className={`w-36 h-36 rounded-full bg-gradient-to-tr ${currentCallChar.bgColor} flex items-center justify-center text-7xl shadow-2xl border-4 border-pink-400 ${callState === 'calling' ? 'animate-bounce' : 'animate-pulse'}`}>
              {currentCallChar.avatar}
            </div>

            {/* Speech Bubble */}
            {callState === 'connected' && speechBubble && (
              <div className="mt-6 max-w-xs p-4 bg-white text-slate-900 rounded-3xl rounded-tl-none shadow-2xl border-2 border-pink-300 text-sm font-bold text-center leading-relaxed animate-fade-in">
                {speechBubble}
              </div>
            )}
          </div>

          {/* Interactive Actions during Call */}
          {callState === 'connected' ? (
            <div className="w-full max-w-xs flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={sendKiss}
                  className="p-3 rounded-2xl bg-pink-600 hover:bg-pink-500 active:scale-95 text-white flex flex-col items-center gap-1 font-bold text-xs shadow-lg"
                >
                  <span className="text-xl">💋</span>
                  <span>Besito</span>
                </button>
                <button
                  onClick={singSong}
                  className="p-3 rounded-2xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white flex flex-col items-center gap-1 font-bold text-xs shadow-lg"
                >
                  <Music className="w-5 h-5 text-yellow-300" />
                  <span>Canción</span>
                </button>
                <button
                  onClick={tellJoke}
                  className="p-3 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 flex flex-col items-center gap-1 font-bold text-xs shadow-lg"
                >
                  <Smile className="w-5 h-5" />
                  <span>Chiste</span>
                </button>
              </div>

              {/* Hang up button */}
              <button
                onClick={endRoleplayCall}
                className="w-full py-4 rounded-3xl bg-rose-600 hover:bg-rose-500 text-white font-black text-lg flex items-center justify-center gap-2 shadow-xl active:scale-95 transition"
              >
                <PhoneOff className="w-6 h-6" />
                <span>Colgar Llamada</span>
              </button>
            </div>
          ) : (
            /* Cancel calling button */
            <button
              onClick={endRoleplayCall}
              className="w-20 h-20 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-2xl active:scale-90 transition mb-6"
            >
              <PhoneOff className="w-8 h-8" />
            </button>
          )}
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition text-white font-bold"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Salir</span>
        </button>

        <div className="flex items-center gap-2">
          <Phone className="w-6 h-6 text-pink-400" />
          <h1 className="text-xl font-bold tracking-wide">Teléfono de Rol Mágico</h1>
        </div>

        <div className="w-12" />
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex border-b border-slate-800 bg-slate-900/60 p-1">
        <button
          onClick={() => {
            setActiveTab('contacts');
            playPopSound(soundEnabled);
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'contacts' ? 'bg-pink-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          👥 Contactos Mágicos
        </button>
        <button
          onClick={() => {
            setActiveTab('dialpad');
            playPopSound(soundEnabled);
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'dialpad' ? 'bg-pink-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          🔢 Teclado Numérico
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
        {activeTab === 'contacts' ? (
          /* CONTACTS LIST */
          <div className="w-full max-w-sm flex flex-col gap-3">
            <div className="text-center p-3 bg-pink-950/40 rounded-2xl border border-pink-500/30">
              <p className="text-xs font-bold text-pink-200">
                Toca a cualquier personaje para iniciar una llamada de juego 💖
              </p>
            </div>

            {allCharacters.map((char) => (
              <button
                key={char.id}
                onClick={() => startRoleplayCall(char)}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-pink-500/50 flex items-center justify-between gap-3 transition active:scale-95 text-left group shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${char.bgColor} text-white flex items-center justify-center text-3xl shadow-md border border-white/20`}>
                    {char.avatar}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white group-hover:text-pink-300 transition">{char.name}</h3>
                    <span className="text-[10px] font-bold text-pink-300 bg-pink-950/60 px-2 py-0.5 rounded-full">
                      {char.role}
                    </span>
                  </div>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg active:scale-90 transition group-hover:bg-emerald-400">
                  <Phone className="w-5 h-5" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* DIALPAD KEYPAD */
          <div className="w-full max-w-xs flex flex-col items-center gap-4 py-2">
            {/* Number Display */}
            <div className="w-full h-14 bg-slate-900 border-2 border-pink-500/40 rounded-2xl flex items-center justify-between px-4 text-2xl font-mono font-bold text-pink-300 tracking-wider">
              <span>{dialedNumber || 'Ingresa número...'}</span>
              {dialedNumber && (
                <button
                  onClick={() => setDialedNumber((prev) => prev.slice(0, -1))}
                  className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-lg"
                >
                  ⌫
                </button>
              )}
            </div>

            {/* Keypad Grid */}
            <div className="grid grid-cols-3 gap-3 w-full">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
                <button
                  key={k}
                  onClick={() => handleDialKeyPress(k)}
                  className="w-full aspect-square rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 active:scale-90 transition flex flex-col items-center justify-center text-2xl font-black text-white shadow-md active:bg-pink-600"
                >
                  <span>{k}</span>
                </button>
              ))}
            </div>

            {/* Call Button */}
            <button
              onClick={handleDialCall}
              disabled={!dialedNumber}
              className={`w-full py-3.5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-xl transition active:scale-95 ${
                dialedNumber ? 'bg-emerald-500 hover:bg-emerald-400 text-white' : 'bg-slate-800 text-slate-500'
              }`}
            >
              <Phone className="w-6 h-6" />
              <span>Llamar Número</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
