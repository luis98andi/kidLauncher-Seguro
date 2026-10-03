import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Trophy, Sparkles, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playPopSound, playSparkleSound, playSuccessSound } from '../../utils/sound';

interface KidGamesAppProps {
  onClose: () => void;
  soundEnabled: boolean;
}

const MEMORY_EMOJIS = ['🦄', '🐱', '🐶', '👑', '🌈', '🍭', '🌸', '🧁'];

interface Balloon {
  id: number;
  x: number;
  color: string;
  emoji: string;
  speed: number;
  size: number;
}

export const KidGamesApp: React.FC<KidGamesAppProps> = ({ onClose, soundEnabled }) => {
  const [selectedGame, setSelectedGame] = useState<'menu' | 'memory' | 'balloons'>('menu');

  // Memory Game State
  const [cards, setCards] = useState<{ id: number; emoji: string; isFlipped: boolean; isMatched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [memoryMatches, setMemoryMatches] = useState(0);

  // Balloons Game State
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [balloonScore, setBalloonScore] = useState(0);

  // Init Memory Game
  const startMemoryGame = () => {
    const duplicated = [...MEMORY_EMOJIS, ...MEMORY_EMOJIS];
    const shuffled = duplicated
      .sort(() => Math.random() - 0.5)
      .map((emoji, idx) => ({
        id: idx,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffled);
    setFlippedCards([]);
    setMemoryMatches(0);
  };

  const handleCardClick = (index: number) => {
    if (flippedCards.length === 2 || cards[index].isFlipped || cards[index].isMatched) return;

    playPopSound(soundEnabled);
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const [firstIdx, secondIdx] = newFlipped;
      if (cards[firstIdx].emoji === cards[secondIdx].emoji) {
        // Match found!
        setTimeout(() => {
          newCards[firstIdx].isMatched = true;
          newCards[secondIdx].isMatched = true;
          setCards(newCards);
          setFlippedCards([]);
          setMemoryMatches((prev) => {
            const next = prev + 1;
            if (next === MEMORY_EMOJIS.length) {
              playSuccessSound(soundEnabled);
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
            } else {
              playSparkleSound(soundEnabled);
            }
            return next;
          });
        }, 400);
      } else {
        // No match, flip back
        setTimeout(() => {
          newCards[firstIdx].isFlipped = false;
          newCards[secondIdx].isFlipped = false;
          setCards(newCards);
          setFlippedCards([]);
        }, 800);
      }
    }
  };

  // Init Balloons Game
  useEffect(() => {
    if (selectedGame !== 'balloons') return;

    const colors = ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];
    const emojis = ['⭐', '💖', '🦄', '🎀', '🎈', '✨'];

    const interval = setInterval(() => {
      setBalloons((prev) => [
        ...prev.slice(-12),
        {
          id: Date.now() + Math.random(),
          x: Math.random() * 80 + 10,
          color: colors[Math.floor(Math.random() * colors.length)],
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          speed: Math.random() * 2 + 3,
          size: Math.random() * 20 + 60,
        },
      ]);
    }, 900);

    return () => clearInterval(interval);
  }, [selectedGame]);

  const popBalloon = (id: number) => {
    playPopSound(soundEnabled);
    setBalloons((prev) => prev.filter((b) => b.id !== id));
    setBalloonScore((prev) => {
      const next = prev + 1;
      if (next % 10 === 0) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        playSuccessSound(soundEnabled);
      }
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-amber-50 via-pink-50 to-purple-50 text-slate-800 select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 text-white shadow-md">
        <button
          onClick={() => {
            if (selectedGame !== 'menu') {
              setSelectedGame('menu');
            } else {
              onClose();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition text-white font-bold"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">{selectedGame === 'menu' ? 'Salir' : 'Juegos'}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-2xl">🎮</span>
          <h1 className="text-xl font-bold tracking-wide">
            {selectedGame === 'menu' && 'Zona de Juegos'}
            {selectedGame === 'memory' && 'Memoria Mágica'}
            {selectedGame === 'balloons' && 'Reventar Globos'}
          </h1>
        </div>

        {selectedGame === 'memory' && (
          <button
            onClick={startMemoryGame}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 active:scale-90"
            title="Reiniciar"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}
        {selectedGame !== 'memory' && <div className="w-10" />}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
        {selectedGame === 'menu' && (
          <div className="w-full max-w-sm flex flex-col gap-4">
            <h2 className="text-center text-xl font-black text-purple-900 mb-2">
              ¡Elige un juego divertido! 🌟
            </h2>

            <button
              onClick={() => {
                setSelectedGame('memory');
                startMemoryGame();
                playSparkleSound(soundEnabled);
              }}
              className="p-5 rounded-3xl bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-xl flex items-center gap-4 hover:scale-102 active:scale-95 transition transform border-2 border-white/60"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/30 flex items-center justify-center text-3xl shadow-inner">
                🦄
              </div>
              <div className="text-left">
                <h3 className="text-xl font-extrabold">Memoria Mágica</h3>
                <p className="text-xs text-pink-100 font-medium">Encuentra las parejas de animalitos y dulces</p>
              </div>
            </button>

            <button
              onClick={() => {
                setSelectedGame('balloons');
                setBalloonScore(0);
                setBalloons([]);
                playSparkleSound(soundEnabled);
              }}
              className="p-5 rounded-3xl bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-xl flex items-center gap-4 hover:scale-102 active:scale-95 transition transform border-2 border-white/60"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/30 flex items-center justify-center text-3xl shadow-inner">
                🎈
              </div>
              <div className="text-left">
                <h3 className="text-xl font-extrabold">Reventar Globos</h3>
                <p className="text-xs text-amber-100 font-medium">¡Explota todos los globos flotantes!</p>
              </div>
            </button>
          </div>
        )}

        {selectedGame === 'memory' && (
          <div className="w-full max-w-md flex flex-col items-center gap-4">
            <div className="flex items-center justify-between w-full px-2 text-sm font-bold text-purple-900">
              <span className="bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
                Parejas: {memoryMatches} / {MEMORY_EMOJIS.length}
              </span>
              {memoryMatches === MEMORY_EMOJIS.length && (
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full animate-bounce">
                  ¡Ganaste! 🎉👑
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2.5 w-full">
              {cards.map((card, idx) => (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(idx)}
                  disabled={card.isMatched || card.isFlipped}
                  className={`aspect-square rounded-2xl text-3xl flex items-center justify-center shadow-md transition-all duration-300 transform ${
                    card.isFlipped || card.isMatched
                      ? 'bg-white border-2 border-pink-400 rotate-y-180 scale-100 shadow-lg'
                      : 'bg-gradient-to-br from-pink-400 to-purple-500 hover:scale-105 active:scale-95'
                  } ${card.isMatched ? 'opacity-80 ring-2 ring-emerald-400' : ''}`}
                >
                  {card.isFlipped || card.isMatched ? (
                    <span>{card.emoji}</span>
                  ) : (
                    <span className="text-xl text-white/80">⭐</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedGame === 'balloons' && (
          <div className="relative w-full h-[70vh] max-w-md bg-sky-200/50 rounded-3xl border-4 border-sky-300 overflow-hidden shadow-inner flex flex-col justify-between p-3">
            {/* Score header */}
            <div className="flex items-center justify-between z-10">
              <div className="bg-white/90 backdrop-blur px-4 py-1.5 rounded-full shadow font-extrabold text-pink-600 flex items-center gap-1.5 text-base">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>Puntos: {balloonScore}</span>
              </div>
              <span className="text-xs bg-sky-100 text-sky-800 font-bold px-3 py-1 rounded-full">
                ¡Toca los globos! 🎈
              </span>
            </div>

            {/* Floating Balloons */}
            {balloons.map((b) => (
              <button
                key={b.id}
                onClick={() => popBalloon(b.id)}
                style={{
                  left: `${b.x}%`,
                  backgroundColor: b.color,
                  width: `${b.size}px`,
                  height: `${b.size * 1.25}px`,
                }}
                className="absolute bottom-[-100px] rounded-full shadow-lg flex flex-col items-center justify-center text-white font-black animate-float transition transform active:scale-125 cursor-pointer"
              >
                <span className="text-2xl drop-shadow">{b.emoji}</span>
                <div className="w-1.5 h-3 bg-white/40 absolute -bottom-2 rounded-full" />
              </button>
            ))}

            {balloons.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-sky-600/70 font-bold text-sm">
                ¡Los globos están subiendo! 🎈✨
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
