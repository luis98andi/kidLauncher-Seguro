import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Mic, Square, Play, Sparkles, Volume2, RotateCcw, Radio } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playPopSound, playSparkleSound, playSuccessSound, playBoingSound, playApplauseSound } from '../../utils/sound';

interface KidWalkieAppProps {
  onClose: () => void;
  soundEnabled: boolean;
}

interface VoiceEffect {
  id: string;
  name: string;
  emoji: string;
  rate: number;
  pitch: number;
  desc: string;
}

const VOICE_EFFECTS: VoiceEffect[] = [
  { id: 'chipmunk', name: 'Ardillita', emoji: '🐿️', rate: 1.45, pitch: 1.8, desc: 'Voz súper rápida y chillona' },
  { id: 'robot', name: 'Robot Espacial', emoji: '🤖', rate: 0.9, pitch: 0.6, desc: 'Voz de androide del futuro' },
  { id: 'smurf', name: 'Pitufina', emoji: '⚡', rate: 1.6, pitch: 2.0, desc: '¡Súper veloz!' },
  { id: 'giant', name: 'Monstruito Tierno', emoji: '👾', rate: 0.75, pitch: 0.5, desc: 'Voz grave y divertida' },
  { id: 'princess', name: 'Princesa Mágica', emoji: '👑', rate: 1.05, pitch: 1.3, desc: 'Voz dulce de cuento de hadas' },
];

export const KidWalkieApp: React.FC<KidWalkieAppProps> = ({ onClose, soundEnabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState<VoiceEffect>(VOICE_EFFECTS[0]);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<any>(null);

  // Clean up
  useEffect(() => {
    return () => {
      if (audioBlobUrl) {
        URL.revokeObjectURL(audioBlobUrl);
      }
      clearInterval(timerRef.current);
    };
  }, [audioBlobUrl]);

  const startRecording = async () => {
    playPopSound(soundEnabled);
    audioChunksRef.current = [];
    setRecordingSeconds(0);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(audioBlob);
          setAudioBlobUrl(url);
          stream.getTracks().forEach((t) => t.stop());
          playSparkleSound(soundEnabled);
          confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
        };

        mediaRecorder.start();
        setIsRecording(true);

        timerRef.current = setInterval(() => {
          setRecordingSeconds((prev) => {
            if (prev >= 10) {
              stopRecording();
              return 10;
            }
            return prev + 1;
          });
        }, 1000);
      } else {
        simulateVoiceRecording();
      }
    } catch {
      simulateVoiceRecording();
    }
  };

  const simulateVoiceRecording = () => {
    setIsRecording(true);
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => {
        if (prev >= 4) {
          stopRecording();
          return 4;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const playRecordedAudio = () => {
    if (audioBlobUrl) {
      if (!audioElementRef.current) {
        audioElementRef.current = new Audio(audioBlobUrl);
      } else {
        audioElementRef.current.src = audioBlobUrl;
      }

      const audio = audioElementRef.current;
      audio.playbackRate = selectedEffect.rate;
      audio.onended = () => setIsPlaying(false);
      setIsPlaying(true);
      audio.play();
    } else {
      // Synthesize cute voice phrase if no physical mic
      setIsPlaying(true);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance('¡Hola amiguitos! ¡Soy la voz mágica más divertida del mundo!');
        utterance.lang = 'es-ES';
        utterance.rate = selectedEffect.rate;
        utterance.pitch = selectedEffect.pitch;
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => setIsPlaying(false), 2000);
      }
    }
    playPopSound(soundEnabled);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white select-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 text-white shadow-md z-20">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition text-white font-bold"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Salir</span>
        </button>

        <div className="flex items-center gap-2">
          <Radio className="w-6 h-6 text-yellow-300 animate-pulse" />
          <h1 className="text-xl font-black tracking-wide">Voces Mágicas & Walkie</h1>
        </div>

        <div className="w-10" />
      </div>

      {/* Main Walkie Talkie Body */}
      <div className="flex-1 p-4 flex flex-col items-center justify-between max-w-sm mx-auto w-full">
        {/* Antenna / Status Screen */}
        <div className="w-full bg-slate-900 border-2 border-emerald-400/60 rounded-3xl p-4 flex flex-col items-center gap-2 shadow-xl">
          <div className="flex items-center justify-between w-full text-xs font-black text-emerald-400">
            <span className="flex items-center gap-1">
              <span className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`} />
              {isRecording ? 'GRABANDO TU VOZ...' : audioBlobUrl ? 'AUDIO LISTO' : 'LISTO PARA GRABAR'}
            </span>
            <span className="font-mono text-sm">{recordingSeconds}s / 10s</span>
          </div>

          {/* Audio Visualizer Waves */}
          <div className="flex items-center justify-center gap-1.5 h-16 w-full py-2">
            {[18, 35, 52, 24, 60, 40, 25, 48, 32, 20].map((h, i) => (
              <div
                key={i}
                style={{ height: isRecording || isPlaying ? `${Math.min(100, h * 1.5)}%` : '15%' }}
                className={`w-2 rounded-full transition-all duration-150 ${
                  isRecording ? 'bg-rose-400 animate-pulse' : isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          <span className="text-xs text-slate-400 font-bold">
            {isRecording ? '¡Habla o canta fuerte al micrófono!' : 'Presiona el botón grande abajo para hablar'}
          </span>
        </div>

        {/* Big Record Microphone Button */}
        <div className="relative my-4 flex flex-col items-center">
          <div className={`absolute w-48 h-48 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-500 opacity-20 blur-2xl ${isRecording ? 'scale-125 animate-ping' : ''}`} />

          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-36 h-36 rounded-full border-4 shadow-2xl flex flex-col items-center justify-center text-white font-black transition-all duration-200 active:scale-95 cursor-pointer ${
              isRecording
                ? 'bg-rose-600 border-rose-300 ring-8 ring-rose-500/40 animate-pulse'
                : 'bg-gradient-to-tr from-teal-500 via-emerald-500 to-cyan-500 border-white hover:scale-105'
            }`}
          >
            {isRecording ? (
              <>
                <Square className="w-12 h-12 mb-1" />
                <span className="text-xs uppercase tracking-wider">Detener</span>
              </>
            ) : (
              <>
                <Mic className="w-12 h-12 mb-1 animate-bounce" />
                <span className="text-xs uppercase tracking-wider">Grabar</span>
              </>
            )}
          </button>
        </div>

        {/* Playback Controls & Voice Modifiers */}
        <div className="w-full flex flex-col gap-3">
          {/* Effect Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {VOICE_EFFECTS.map((eff) => (
              <button
                key={eff.id}
                onClick={() => {
                  setSelectedEffect(eff);
                  playPopSound(soundEnabled);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-black transition shrink-0 ${
                  selectedEffect.id === eff.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg scale-105 ring-2 ring-emerald-300'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span className="text-base">{eff.emoji}</span>
                <span>{eff.name}</span>
              </button>
            ))}
          </div>

          {/* Big Play Button with chosen effect */}
          <button
            onClick={playRecordedAudio}
            disabled={isRecording}
            className={`w-full py-4 rounded-3xl font-black text-base flex items-center justify-center gap-2.5 shadow-xl active:scale-95 transition ${
              isPlaying
                ? 'bg-amber-500 text-slate-950 animate-pulse'
                : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white hover:opacity-95'
            }`}
          >
            <Play className="w-6 h-6 fill-current" />
            <span>Escuchar con {selectedEffect.name} {selectedEffect.emoji}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
