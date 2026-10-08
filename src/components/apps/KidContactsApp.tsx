import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Phone, PhoneOff, Volume2, Heart, Sparkles, Smile, Star, 
  Shield, Music, MessageCircle, User, Video, VideoOff, Gift, HelpCircle, 
  PartyPopper, Wand2, Mic, Bell, RefreshCw
} from 'lucide-react';
import { EmergencyContact } from '../../types';
import { 
  playSparkleSound, playPopSound, playPhoneDialTone, playRingtoneSound, 
  playSuccessSound, playHornSound, playBoingSound, playMagicWandSound, playApplauseSound 
} from '../../utils/sound';
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
  ringtoneType: string;
  voicePhrase: string;
  songText: string;
  personalGifts: string[];
}

const EXTENSIVE_JOKES: string[] = [
  '😹 ¿Qué le dice una impresora a otra? ¡Oye, esa hoja es tuya o es impresión mía!',
  '😹 ¿Qué le dice un pez a otro pez? ¡Nada!',
  '😹 ¿Qué hace una abeja en el gimnasio? ¡Zumba!',
  '😹 ¿Por qué las estrellas no van a la escuela? ¡Porque ya son muy brillantes!',
  '😹 ¿Qué le dice un muñeco de nieve a otro? ¿No sientes olor a zanahoria?',
  '😹 ¿Qué le dice un jardinero a otro? ¡Nos vemos cuando podamos!',
  '😹 ¿Qué hace un perro con un taladro? ¡Ta-drando!',
  '😹 ¿Por qué el libro de matemáticas estaba triste? ¡Porque tenía demasiados problemas!',
  '😹 ¿Qué le dice un semáforo a otro? ¡No me mires que me estoy cambiando de color!',
  '😹 ¿Cómo se despiden los químicos? ¡Ácido un placer!',
  '😹 ¿Qué le dijo el número 0 al número 8? ¡Qué bonito cinturón llevas puesto!',
  '😹 ¿Qué hace una vaca pensando en la luna? ¡Hace leche concentrada!',
  '😹 ¿Cuál es el colmo de un astronauta? ¡Estar cerca del sol y no tener bloqueador solar!',
  '😹 ¿Qué le dice una taza a otra? ¡Qué pasa, tacita!',
  '😹 ¿Por qué los pájaros vuelan hacia el sur en invierno? ¡Porque caminando tardarían demasiado!',
  '😹 ¿Qué le dijo un volcán a otro? ¡Te lavo mucho de corazón!',
  '😹 ¿Qué hace un dinosaurio cuando se enoja? ¡Tiene un tiranosaurio berrinche!',
];

const RIDDLES = [
  {
    question: 'Blanca por dentro, verde por fuera. Si quieres que te lo diga, espera... ¿Qué fruta es?',
    options: ['La Pera 🍐', 'La Manzana 🍎', 'El Plátano 🍌'],
    correct: 0,
    hint: '¡Es verde y muy jugosa!'
  },
  {
    question: 'Tengo agujas pero no sé coser, tengo números pero no sé leer... ¿Quién soy?',
    options: ['Un Zapato 👟', 'Un Reloj ⏰', 'Un Libro 📖'],
    correct: 1,
    hint: '¡Te dice la hora del recreo!'
  },
  {
    question: 'Oro parece, plata no es. Quien no lo adivine, bien tonto es... ¿Qué es?',
    options: ['El Plátano 🍌', 'La Fresa 🍓', 'El Limón 🍋'],
    correct: 0,
    hint: '¡A los monitos les encanta!'
  },
  {
    question: 'Llevo mi casita a cuestas, camino despacito y dejo un hilito brillante... ¿Quién soy?',
    options: ['La Tortuga 🐢', 'El Caracol 🐌', 'El Cangrejo 🦀'],
    correct: 1,
    hint: '¡Tiene antenitas simpáticas!'
  },
  {
    question: 'Vuelo en la noche, duermo de día, y nunca verás plumas en el ala mía... ¿Quién soy?',
    options: ['La Lechuza 🦉', 'El Murciélago 🦇', 'La Mariposa 🦋'],
    correct: 1,
    hint: '¡Es amigo de Batman!'
  }
];

const GIFTS_CATALOG = [
  { name: 'Un Helado de Fresa Gigante 🍦', emoji: '🍦', phrase: '¡Mmm, qué delicia de helado de fresa! ¡Muchas gracias, mi princesa!' },
  { name: 'Una Corona de Diamantes Mágicos 👑', emoji: '👑', phrase: '¡Guau, una corona resplandeciente! ¡Me la pongo ahora mismo!' },
  { name: 'Un Gatito de Peluche Suave 🧸', emoji: '🧸', phrase: '¡Ayyy qué tierno gatito de peluche! ¡Lo voy a abrazar todo el día!' },
  { name: 'Una Varita de Estrellas Brillantes ✨', emoji: '✨', phrase: '¡Abracadabra! ¡Esta varita mágica lanza chispitas de arcoíris!' },
  { name: 'Un Pastel de Chocolate con Fresas 🎂', emoji: '🎂', phrase: '¡Qué rico pastel de cumpleaños! ¡Te guardo un pedazo grande!' },
  { name: 'Un Cachorrito Juguetón 🐶', emoji: '🐶', phrase: '¡Guau guau! ¡Es el perrito más lindo del mundo! ¡Qué lindo detalle!' },
];

const DEFAULT_CHARACTERS: RoleplayCharacter[] = [
  {
    id: 'mom',
    name: 'Mamá 👑',
    role: 'Familia',
    avatar: '👩‍👧',
    bgColor: 'from-pink-500 via-rose-500 to-purple-600',
    ringtoneType: 'sweet',
    voicePhrase: '¡Hola mi princesa hermosa! ¿Cómo va tu día tan genial? ¡Mamá te ama con todo el corazón!',
    songText: '🎵 "Un elefante se balanceaba sobre la tela de una araña... y como veía que resistía, fue a llamar a otro elefante..." 🎶',
    personalGifts: ['Un abrazo apretadito 💖', 'Una galleta de avena 🍪', 'Flores hermosas 🌸']
  },
  {
    id: 'dad',
    name: 'Papá 🦸‍♂️',
    role: 'Familia',
    avatar: '👨‍👧',
    bgColor: 'from-blue-500 via-indigo-600 to-cyan-500',
    ringtoneType: 'hero',
    voicePhrase: '¡Hola mi campeona súper fuerte! ¡Papá está muy orgulloso de ti! ¡Sigue jugando y pasándola increíble!',
    songText: '🎵 "Estrellita dónde estás, en el cielo brillarás... como un diamante de verdad..." 🎶',
    personalGifts: ['Una medalla de oro 🏅', 'Un cochecito veloz 🏎️', 'Una pelota saltarina ⚽']
  },
  {
    id: 'grandma',
    name: 'Abuelita 👵',
    role: 'Familia',
    avatar: '👵',
    bgColor: 'from-purple-500 via-pink-500 to-amber-500',
    ringtoneType: 'warm',
    voicePhrase: '¡Hola mi nietecita bella y dulce! ¡Te mando un beso volador y un plato lleno de galletitas calientitas!',
    songText: '🎵 "Los pollitos dicen pío, pío, pío, cuando tienen hambre, cuando tienen frío..." 🎶',
    personalGifts: ['Un gorrito tejido 🧶', 'Dulces de caramelo 🍬', 'Un cuento mágico 📖']
  },
  {
    id: 'elsa',
    name: 'Princesa Elsa ❄️',
    role: 'Reino Helado',
    avatar: '👸',
    bgColor: 'from-cyan-400 via-sky-500 to-blue-700',
    ringtoneType: 'chimes',
    voicePhrase: '¡Hola! Te mando un saludo mágico y helado desde las torres del castillo de nieve y cristal ❄️✨',
    songText: '🎵 "Libre soy, libre soy, el frío es parte también de mí... ¡y no me detendré!" 🎶',
    personalGifts: ['Un copo de nieve mágico ❄️', 'Un trineo de hielo 🛷', 'Un vestido brillante 👗']
  },
  {
    id: 'unicorn',
    name: 'Unicornia Mágica 🦄',
    role: 'Reino Fantasía',
    avatar: '🦄',
    bgColor: 'from-fuchsia-400 via-purple-500 to-pink-500',
    ringtoneType: 'sparkle',
    voicePhrase: '¡Niiiiiigh! ¡Hola amiguita! ¡Te mando una lluvia brillante de estrellas y un puente de arcoíris dulce! 🌈',
    songText: '🎵 "Arcoíris en el cielo, brillo, brillo sin parar... vuela unicornio a jugar..." 🎶',
    personalGifts: ['Herraduras de purpurina ✨', 'Algodón de azúcar 🍭', 'Estrellitas de colores ⭐']
  },
  {
    id: 'santa',
    name: 'Papá Noel 🎅',
    role: 'Polo Norte',
    avatar: '🎅',
    bgColor: 'from-red-500 via-rose-600 to-red-800',
    ringtoneType: 'jingle',
    voicePhrase: '¡Ho Ho Ho! ¡Hola princesa hermosa! He estado mirando mi libro de oro y sé que has sido una niña súper buena y alegre.',
    songText: '🎵 "Navidad, Navidad, dulce Navidad... la alegría de este día hay que celebrar..." 🎶',
    personalGifts: ['Un cascabel dorado 🔔', 'Bastones de menta 🍬', 'Un reno de peluche 🦌']
  },
  {
    id: 'doctor',
    name: 'Doctora Juguetes 🩺',
    role: 'Clínica de Abrazos',
    avatar: '🩺',
    bgColor: 'from-teal-400 via-emerald-500 to-cyan-600',
    ringtoneType: 'pop',
    voicePhrase: '¡Hola! Chequeo rápido de la Doctora: ¡tu nivel de dulzura y diversión está en un súper 100%! 💖',
    songText: '🎵 "A lavarse los dientes con sonrisa gigante, chas chas chas, relucientes al instante..." 🎶',
    personalGifts: ['Curitas con arcoíris 🩹', 'Un estetoscopio rosa 🩺', 'Una piruleta sin azúcar 🍭']
  },
  {
    id: 'robot',
    name: 'Robot Divertido 🤖',
    role: 'Planeta Futuro',
    avatar: '🤖',
    bgColor: 'from-amber-400 via-orange-500 to-purple-600',
    ringtoneType: 'beeps',
    voicePhrase: '¡Bip Bup Bip! Iniciando llamada intergaláctica con la niña más inteligente y alegre del planeta Tierra 🚀',
    songText: '🎵 "Bip Bup Bap, baila el robot de metal... gira los brazos, qué sensacional..." 🎶',
    personalGifts: ['Tuercas de caramelo ⚙️', 'Baterías de estrellas 🔋', 'Antena de luces neón 📡']
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
  const [isSpeaking, setIsSpeaking] = useState(false);

  // New Dynamic & 3D Features
  const [isVideoCall, setIsVideoCall] = useState(true);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [voiceMod, setVoiceMod] = useState<'normal' | 'chipmunk' | 'robot' | 'giant'>('normal');
  const [currentRiddle, setCurrentRiddle] = useState<(typeof RIDDLES)[0] | null>(null);
  const [riddleResult, setRiddleResult] = useState<'correct' | 'wrong' | null>(null);
  const [giftOpened, setGiftOpened] = useState<(typeof GIFTS_CATALOG)[0] | null>(null);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; emoji: string; left: number }[]>([]);

  // Force portrait orientation lock on mobile devices
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.screen && 'orientation' in window.screen) {
        const orient = window.screen.orientation as any;
        if (orient && typeof orient.lock === 'function') {
          orient.lock('portrait').catch(() => {});
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  // Combined Characters
  const allCharacters: RoleplayCharacter[] = [
    ...contacts.map((c) => ({
      id: c.id,
      name: c.name,
      role: c.relation,
      avatar: c.avatarEmoji,
      bgColor: c.color,
      ringtoneType: 'sweet',
      voicePhrase: `¡Hola mi niña linda! Soy ${c.name}. ¡Te mando un beso grandote y un abrazo súper apretado! 💖`,
      songText: '🎵 "Te quiero yo, y tú a mí, somos una familia muy feliz..." 🎶',
      personalGifts: ['Un abrazo tierno 💖', 'Un beso dulce 💋', 'Una sorpresa 🎁']
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

  // Video call selfie camera preview
  useEffect(() => {
    if (callState === 'connected' && isVideoCall) {
      startSelfieCamera();
    } else {
      stopSelfieCamera();
    }
    return () => stopSelfieCamera();
  }, [callState, isVideoCall]);

  const startSelfieCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 320, height: 320 },
          audio: false
        });
        setCameraStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch {
      // Graceful fallback: user camera not available or denied
      setCameraStream(null);
    }
  };

  const stopSelfieCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
  };

  // Web Speech API Voice synthesis with voice modifier options!
  const speakText = (text: string) => {
    setSpeechBubble(text);
    setIsSpeaking(true);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';

      if (voiceMod === 'chipmunk') {
        utterance.rate = 1.25;
        utterance.pitch = 1.8;
      } else if (voiceMod === 'robot') {
        utterance.rate = 0.85;
        utterance.pitch = 0.6;
      } else if (voiceMod === 'giant') {
        utterance.rate = 0.75;
        utterance.pitch = 0.4;
      } else {
        utterance.rate = 0.95;
        utterance.pitch = 1.2;
      }

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsSpeaking(false), 3000);
    }
  };

  const startRoleplayCall = (char: RoleplayCharacter) => {
    setCurrentCallChar(char);
    setCallState('calling');
    playRingtoneSound(soundEnabled);
    setCurrentRiddle(null);
    setGiftOpened(null);
    setRiddleResult(null);

    // Ringing for 2.2 seconds then connect
    setTimeout(() => {
      setCallState('connected');
      playSuccessSound(soundEnabled);
      speakText(char.voicePhrase);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
    }, 2200);
  };

  const endRoleplayCall = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    stopSelfieCamera();
    playPopSound(soundEnabled);
    setCallState('idle');
    setCurrentCallChar(null);
    setSpeechBubble('');
    setIsSpeaking(false);
    setCurrentRiddle(null);
    setGiftOpened(null);
    setRiddleResult(null);
  };

  const handleDialKeyPress = (key: string) => {
    playPhoneDialTone(key, soundEnabled);
    if (dialedNumber.length < 10) {
      setDialedNumber((prev) => prev + key);
    }
  };

  const handleDialCall = () => {
    if (!dialedNumber) return;
    const randomChar = allCharacters[Math.floor(Math.random() * allCharacters.length)];
    startRoleplayCall({
      ...randomChar,
      name: `Llamada al ${dialedNumber} 📞`,
    });
  };

  // Fun Actions during Call
  const tellRandomJoke = () => {
    playPopSound(soundEnabled);
    const joke = EXTENSIVE_JOKES[Math.floor(Math.random() * EXTENSIVE_JOKES.length)];
    speakText(joke);
    playBoingSound(soundEnabled);
  };

  const sendSurpriseGift = () => {
    playMagicWandSound(soundEnabled);
    confetti({ particleCount: 65, spread: 75, origin: { y: 0.6 } });
    const randomGift = GIFTS_CATALOG[Math.floor(Math.random() * GIFTS_CATALOG.length)];
    setGiftOpened(randomGift);
    speakText(randomGift.phrase);
  };

  const startRiddleMinigame = () => {
    playMagicWandSound(soundEnabled);
    const riddle = RIDDLES[Math.floor(Math.random() * RIDDLES.length)];
    setCurrentRiddle(riddle);
    setRiddleResult(null);
    speakText(`¡Adivina, adivinador! ${riddle.question}`);
  };

  const answerRiddle = (choiceIdx: number) => {
    if (!currentRiddle) return;
    if (choiceIdx === currentRiddle.correct) {
      playApplauseSound(soundEnabled);
      confetti({ particleCount: 80, spread: 90, origin: { y: 0.5 } });
      setRiddleResult('correct');
      speakText('¡Siiii! ¡Acertaste, eres súper inteligente! 🎉👑');
    } else {
      playBoingSound(soundEnabled);
      setRiddleResult('wrong');
      speakText(`¡Casi casi! Pista: ${currentRiddle.hint}. ¡Intenta otra vez!`);
    }
  };

  const sendFloatingEmoji = (emoji: string) => {
    playSparkleSound(soundEnabled);
    const newHeart = {
      id: Date.now() + Math.random(),
      emoji,
      left: Math.floor(Math.random() * 70) + 15,
    };
    setFloatingHearts((prev) => [...prev.slice(-10), newHeart]);

    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 2000);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white select-none overflow-hidden">
      {/* ACTIVE CALL 3D FULLSCREEN MODAL */}
      {callState !== 'idle' && currentCallChar && (
        <div className="fixed inset-0 z-60 bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 flex flex-col items-center justify-between p-4 overflow-hidden">
          {/* FLOATING EMOJIS RISING EFFECT */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            {floatingHearts.map((h) => (
              <span
                key={h.id}
                style={{ left: `${h.left}%` }}
                className="absolute bottom-10 text-4xl animate-bounce transition-all drop-shadow-md"
              >
                {h.emoji}
              </span>
            ))}
          </div>

          {/* TOP STATUS BAR & CONTROLS */}
          <div className="w-full max-w-md flex items-center justify-between z-30 pt-1 px-2 shrink-0">
            <div className="flex flex-col">
              <span className="px-2.5 py-0.5 rounded-full bg-pink-500/30 text-pink-300 font-bold text-[11px] inline-flex items-center gap-1.5 self-start border border-pink-400/30">
                <span className={`w-2 h-2 rounded-full ${callState === 'calling' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                {callState === 'calling' ? 'Conectando...' : `En Vivo (${formatTimer(callTimer)})`}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5 drop-shadow-md">{currentCallChar.name}</h2>
              <span className="text-[10px] text-purple-200 font-bold">{currentCallChar.role}</span>
            </div>

            {/* Video Toggle & Voice Mod Selector */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setIsVideoCall(!isVideoCall);
                  playPopSound(soundEnabled);
                }}
                className={`p-2 rounded-xl border transition active:scale-90 ${
                  isVideoCall 
                    ? 'bg-emerald-500/80 border-emerald-400 text-white shadow-lg' 
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
                title="Videollamada Mágica"
              >
                {isVideoCall ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>

              <select
                value={voiceMod}
                onChange={(e) => {
                  setVoiceMod(e.target.value as any);
                  playSparkleSound(soundEnabled);
                }}
                className="bg-slate-900 border border-purple-400 text-pink-300 text-[11px] font-black rounded-xl px-2 py-1.5 cursor-pointer shadow-md"
              >
                <option value="normal">👑 Normal</option>
                <option value="chipmunk">🐿️ Ardillita</option>
                <option value="robot">🤖 Robot</option>
                <option value="giant">🐻 Gigante</option>
              </select>
            </div>
          </div>

          {/* Floating Camera Selfie PIP (Positioned at corner so it NEVER covers character's face!) */}
          {isVideoCall && (
            <div className="absolute top-16 right-3 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-2xl bg-slate-900 z-40 group">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
              {!cameraStream && (
                <div className="absolute inset-0 bg-slate-800 flex flex-col items-center justify-center text-[10px] font-bold text-emerald-300 p-1 text-center">
                  <span className="text-xl">👧</span>
                  <span>Tú</span>
                </div>
              )}
              <span className="absolute top-0.5 right-1 bg-emerald-500 text-slate-950 font-black text-[8px] px-1 rounded">
                Tú
              </span>
            </div>
          )}

          {/* CENTER 3D AVATAR & VIDEO CHAT CONTAINER (Responsive & Centered) */}
          <div className="relative my-auto flex flex-col items-center justify-center w-full max-w-sm z-20 min-h-0 overflow-hidden py-1">
            {/* 3D Pulsing Soundwave Halo behind character */}
            <div className={`absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr ${currentCallChar.bgColor} opacity-30 blur-xl transition duration-500 ${isSpeaking ? 'scale-125 animate-pulse' : 'scale-100'}`} />

            {/* Main Character Avatar with 3D Border & Audio Reaction */}
            <div className="relative">
              <div 
                className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr ${currentCallChar.bgColor} flex items-center justify-center text-6xl sm:text-7xl shadow-2xl border-4 border-pink-400/80 transition-transform duration-300 ${
                  callState === 'calling' ? 'animate-bounce' : isSpeaking ? 'scale-105 ring-6 ring-pink-400/40' : 'animate-pulse'
                }`}
                style={{
                  boxShadow: '0 15px 35px -8px rgba(236, 72, 153, 0.5), inset 0 0 15px rgba(255,255,255,0.4)'
                }}
              >
                {currentCallChar.avatar}
              </div>

              {/* Talking Mouth Indicator Badge */}
              {isSpeaking && (
                <div className="absolute -bottom-1 -right-1 bg-pink-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white animate-bounce">
                  <Volume2 className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            {/* Speech Dialogue Bubble */}
            {callState === 'connected' && speechBubble && (
              <div className="mt-2.5 max-w-xs px-3 py-1.5 bg-white/95 backdrop-blur-md text-slate-900 rounded-2xl rounded-tl-none shadow-xl border-2 border-pink-400 text-xs font-black text-center leading-snug animate-fade-in">
                {speechBubble}
              </div>
            )}

            {/* Surprise Gift Popup if opened */}
            {giftOpened && (
              <div className="mt-2 p-2 bg-gradient-to-r from-amber-200 via-pink-200 to-yellow-200 text-slate-900 rounded-xl shadow-lg border border-amber-400 text-xs font-black flex items-center gap-1.5 animate-bounce">
                <span className="text-2xl">{giftOpened.emoji}</span>
                <div className="text-left">
                  <span>¡Regalo Recibido!</span>
                  <p className="text-[10px] text-pink-900 font-bold">{giftOpened.name}</p>
                </div>
              </div>
            )}

            {/* Riddle Minigame UI */}
            {currentRiddle && (
              <div className="mt-2 w-full max-w-xs p-2.5 bg-purple-900/90 border-2 border-purple-400 rounded-2xl shadow-xl flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-yellow-300">¿Cuál es la respuesta correcta?</span>
                <div className="grid grid-cols-1 gap-1">
                  {currentRiddle.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => answerRiddle(idx)}
                      className="p-1.5 rounded-xl bg-white text-slate-900 font-black text-[11px] hover:bg-pink-100 active:scale-95 transition text-left"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* BOTTOM INTERACTIVE ACTION DECK (Compact to fit 100% on 1024x768 without cutoff) */}
          {callState === 'connected' ? (
            <div className="w-full max-w-md flex flex-col gap-1.5 z-30 pb-1 shrink-0">
              {/* Quick Floating Emojis Touch Bar */}
              <div className="flex items-center justify-around bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-white/20">
                {['💖', '⭐', '🦄', '🌈', '🍭', '🌸'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => sendFloatingEmoji(emoji)}
                    className="p-1 hover:bg-white/20 active:scale-125 transition text-lg sm:text-xl"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Action Buttons Row 1: Jokes, Gifts, Riddles, Songs */}
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  onClick={tellRandomJoke}
                  className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 flex flex-col items-center gap-0.5 font-black text-[10px] shadow"
                >
                  <Smile className="w-4 h-4" />
                  <span>Chiste 😹</span>
                </button>

                <button
                  onClick={sendSurpriseGift}
                  className="p-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 active:scale-95 text-white flex flex-col items-center gap-0.5 font-black text-[10px] shadow"
                >
                  <Gift className="w-4 h-4 text-yellow-300" />
                  <span>Regalo 🎁</span>
                </button>

                <button
                  onClick={startRiddleMinigame}
                  className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white flex flex-col items-center gap-0.5 font-black text-[10px] shadow"
                >
                  <HelpCircle className="w-4 h-4 text-cyan-300" />
                  <span>Adivinanza ❓</span>
                </button>

                <button
                  onClick={() => {
                    playSparkleSound(soundEnabled);
                    confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
                    speakText(currentCallChar.songText);
                  }}
                  className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white flex flex-col items-center gap-0.5 font-black text-[10px] shadow"
                >
                  <Music className="w-4 h-4 text-yellow-300" />
                  <span>Cantar 🎵</span>
                </button>
              </div>

              {/* Funny Soundboard Buttons Row 2 */}
              <div className="flex items-center justify-between gap-1 px-0.5">
                <button
                  onClick={() => playHornSound(soundEnabled)}
                  className="flex-1 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-amber-300 flex items-center justify-center gap-0.5 active:scale-95"
                >
                  <span>📯 Bocina</span>
                </button>
                <button
                  onClick={() => playBoingSound(soundEnabled)}
                  className="flex-1 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-pink-300 flex items-center justify-center gap-0.5 active:scale-95"
                >
                  <span>🌀 Boing</span>
                </button>
                <button
                  onClick={() => playMagicWandSound(soundEnabled)}
                  className="flex-1 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-cyan-300 flex items-center justify-center gap-0.5 active:scale-95"
                >
                  <span>✨ Magia</span>
                </button>
                <button
                  onClick={() => playApplauseSound(soundEnabled)}
                  className="flex-1 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-emerald-300 flex items-center justify-center gap-0.5 active:scale-95"
                >
                  <span>👏 Aplausos</span>
                </button>
              </div>

              {/* Big Red Hang Up Button (100% visible, never cut off) */}
              <button
                onClick={endRoleplayCall}
                className="w-full h-11 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl active:scale-95 transition border border-rose-400 mt-0.5"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Colgar Llamada</span>
              </button>
            </div>
          ) : (
            /* Cancel calling button during ringing */
            <button
              onClick={endRoleplayCall}
              className="w-16 h-16 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-2xl active:scale-90 transition mb-6 border-4 border-rose-400 animate-pulse shrink-0"
            >
              <PhoneOff className="w-7 h-7" />
            </button>
          )}
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 z-10">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition text-white font-bold"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Salir</span>
        </button>

        <div className="flex items-center gap-2">
          <Phone className="w-6 h-6 text-pink-400 animate-bounce" />
          <h1 className="text-xl font-black tracking-wide">Teléfono de Rol Mágico 3D</h1>
        </div>

        <div className="w-12" />
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex border-b border-slate-800 bg-slate-900/80 p-1.5 z-10">
        <button
          onClick={() => {
            setActiveTab('contacts');
            playPopSound(soundEnabled);
          }}
          className={`flex-1 py-2.5 rounded-2xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
            activeTab === 'contacts' ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>👥 Contactos Mágicos</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('dialpad');
            playPopSound(soundEnabled);
          }}
          className={`flex-1 py-2.5 rounded-2xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
            activeTab === 'dialpad' ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>🔢 Marcar Número</span>
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-hidden p-2 sm:p-4 flex flex-col items-center justify-center max-w-lg w-full mx-auto">
        {activeTab === 'contacts' ? (
          /* 3D CONTACTS TILES (Clean, proportional scrollable list) */
          <div className="w-full h-full overflow-y-auto flex flex-col gap-2.5 pb-4 px-1">
            <div className="text-center p-2.5 bg-gradient-to-r from-pink-950/50 via-purple-950/50 to-pink-950/50 rounded-2xl border border-pink-500/40 shadow-sm shrink-0">
              <p className="text-xs font-black text-pink-200">
                ¡Toca cualquier personaje para una videollamada mágica con voz, chistes y juegos! 💖
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
              {allCharacters.map((char) => (
                <button
                  key={char.id}
                  onClick={() => startRoleplayCall(char)}
                  className="p-3 rounded-2xl bg-slate-900/90 border-2 border-slate-800 hover:border-pink-500/70 flex items-center justify-between gap-3 transition-all duration-200 transform hover:scale-102 active:scale-95 text-left group shadow-lg relative overflow-hidden"
                >
                  <div className="flex items-center gap-2.5 z-10">
                    <div className={`w-13 h-13 rounded-2xl bg-gradient-to-tr ${char.bgColor} text-white flex items-center justify-center text-2xl shadow-md border border-white/30 transform group-hover:scale-105 transition`}>
                      {char.avatar}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white group-hover:text-pink-300 transition line-clamp-1">{char.name}</h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[9px] font-black text-pink-300 bg-pink-950/80 px-1.5 py-0.5 rounded-full border border-pink-500/30">
                          {char.role}
                        </span>
                        <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          En línea
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow active:scale-90 transition z-10 border border-emerald-300 shrink-0">
                    <Video className="w-5 h-5" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* 3D DIALPAD KEYPAD (100% Single Screen Fit Without Any Scrolling!) */
          <div className="w-full max-w-xs h-full flex flex-col justify-between py-1 px-2 select-none overflow-hidden">
            {/* Number Display Screen */}
            <div className="w-full h-12 bg-slate-900 border-2 border-pink-500/50 rounded-2xl flex items-center justify-between px-4 text-xl font-mono font-black text-pink-300 tracking-wider shadow-inner shrink-0">
              <span className="truncate">{dialedNumber || 'Marcar...'}</span>
              {dialedNumber && (
                <button
                  onClick={() => setDialedNumber((prev) => prev.slice(0, -1))}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg font-bold ml-2 shrink-0"
                >
                  ⌫
                </button>
              )}
            </div>

            {/* Keypad Grid (Fits seamlessly) */}
            <div className="grid grid-cols-3 gap-2 my-2 flex-1 items-stretch">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
                <button
                  key={k}
                  onClick={() => handleDialKeyPress(k)}
                  className="w-full h-full min-h-[46px] rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 active:scale-90 transition flex flex-col items-center justify-center text-xl font-black text-white shadow-md active:bg-pink-600 hover:border-pink-400/50"
                >
                  <span>{k}</span>
                </button>
              ))}
            </div>

            {/* Call Button (Always visible on bottom) */}
            <button
              onClick={handleDialCall}
              disabled={!dialedNumber}
              className={`w-full h-12 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-xl transition active:scale-95 border shrink-0 ${
                dialedNumber 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white border-emerald-300' 
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}
            >
              <Phone className="w-5 h-5 animate-pulse" />
              <span>Llamar Número</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
