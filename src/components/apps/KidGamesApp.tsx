import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw, Trophy, Sparkles, Heart, Zap, Flame, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  playPopSound, playSparkleSound, playSuccessSound, 
  playBalloonPopSound, playMagicWandSound, playBoingSound 
} from '../../utils/sound';

interface KidGamesAppProps {
  onClose: () => void;
  soundEnabled: boolean;
}

const MEMORY_EMOJIS = ['🦄', '🐱', '🐶', '👑', '🌈', '🍭', '🌸', '🧁'];

interface Balloon {
  id: number;
  x: number; // percentage (8% to 85%)
  y: number; // percentage (110% at bottom to -20% at top)
  color: string;
  gradient: string;
  emoji: string;
  speed: number;
  size: number;
  points: number;
  type: 'normal' | 'star' | 'rainbow' | 'bomb' | 'kitty';
}

interface PopParticle {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
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
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('kidlauncher_balloon_highscore') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [combo, setCombo] = useState(0);
  const [comboText, setComboText] = useState('');
  const [popParticles, setPopParticles] = useState<PopParticle[]>([]);
  const comboTimerRef = useRef<any>(null);

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

  // Helper to generate a random balloon
  const createRandomBalloon = (startY = 105): Balloon => {
    const types: Balloon['type'][] = ['normal', 'normal', 'normal', 'star', 'rainbow', 'kitty', 'bomb'];
    const chosenType = types[Math.floor(Math.random() * types.length)];

    let gradient = 'from-pink-400 to-rose-500';
    let color = '#ec4899';
    let emoji = '🎈';
    let points = 1;
    let size = 68;

    if (chosenType === 'star') {
      gradient = 'from-amber-300 via-yellow-400 to-amber-500';
      color = '#f59e0b';
      emoji = '⭐';
      points = 5;
      size = 76;
    } else if (chosenType === 'rainbow') {
      gradient = 'from-fuchsia-400 via-pink-400 to-cyan-400';
      color = '#c084fc';
      emoji = '🌈';
      points = 10;
      size = 84;
    } else if (chosenType === 'kitty') {
      gradient = 'from-purple-400 to-indigo-500';
      color = '#818cf8';
      emoji = '🐱';
      points = 3;
      size = 72;
    } else if (chosenType === 'bomb') {
      gradient = 'from-emerald-400 via-teal-400 to-cyan-500';
      color = '#14b8a6';
      emoji = '💣';
      points = 8;
      size = 76;
    } else {
      const normalGradients = [
        'from-pink-400 to-rose-500',
        'from-purple-400 to-violet-600',
        'from-sky-400 to-blue-600',
        'from-rose-400 to-red-500',
        'from-teal-400 to-emerald-500',
        'from-amber-400 to-orange-500',
      ];
      gradient = normalGradients[Math.floor(Math.random() * normalGradients.length)];
      const emojis = ['🎈', '💖', '🍭', '🌸', '✨', '🍓'];
      emoji = emojis[Math.floor(Math.random() * emojis.length)];
    }

    return {
      id: Date.now() + Math.random(),
      x: Math.floor(Math.random() * 76) + 10,
      y: startY,
      color,
      gradient,
      emoji,
      speed: Math.random() * 0.4 + 0.35, // Smooth rising speed
      size,
      points,
      type: chosenType,
    };
  };

  // Init Balloons Game with immediate balloons already visible on screen!
  useEffect(() => {
    if (selectedGame !== 'balloons') return;

    // Seed 6 balloons at staggered heights so screen is NEVER empty!
    const initialBalloons: Balloon[] = [
      createRandomBalloon(25),
      createRandomBalloon(45),
      createRandomBalloon(65),
      createRandomBalloon(85),
      createRandomBalloon(100),
      createRandomBalloon(115),
    ];
    setBalloons(initialBalloons);

    // Game loop that smoothly animates balloons up
    const gameLoop = setInterval(() => {
      setBalloons((prev) => {
        // Move balloons up
        const updated = prev.map((b) => ({
          ...b,
          y: b.y - b.speed,
        }));

        // Filter out those that flew past the top (y < -20)
        const active = updated.filter((b) => b.y > -20);

        // Ensure we always have 6-8 balloons ascending
        if (active.length < 7) {
          active.push(createRandomBalloon(105));
        }

        return active;
      });
    }, 35);

    return () => clearInterval(gameLoop);
  }, [selectedGame]);

  const popBalloon = (balloon: Balloon, e?: React.MouseEvent) => {
    // Audio effect
    if (balloon.type === 'rainbow') {
      playMagicWandSound(soundEnabled);
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    } else if (balloon.type === 'bomb') {
      playBoingSound(soundEnabled);
      confetti({ particleCount: 90, spread: 100, origin: { y: 0.5 } });
    } else {
      playBalloonPopSound(1 + (combo % 5) * 0.1, soundEnabled);
    }

    // Spawn floating score particle
    const clickX = e ? balloon.x : balloon.x;
    const clickY = balloon.y;
    const newParticle: PopParticle = {
      id: Date.now() + Math.random(),
      x: clickX,
      y: clickY,
      text: `+${balloon.points}`,
      color: balloon.color,
    };
    setPopParticles((prev) => [...prev.slice(-6), newParticle]);

    setTimeout(() => {
      setPopParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
    }, 700);

    // Combo streak system
    setCombo((prevCombo) => {
      const nextCombo = prevCombo + 1;
      if (nextCombo >= 3) {
        setComboText(`¡Combo x${nextCombo}! 🔥`);
      }
      if (nextCombo % 5 === 0) {
        playSuccessSound(soundEnabled);
      }
      return nextCombo;
    });

    clearTimeout(comboTimerRef.current);
    comboTimerRef.current = setTimeout(() => {
      setCombo(0);
      setComboText('');
    }, 1800);

    // Special Bomb effect: pops all balloons on screen!
    if (balloon.type === 'bomb') {
      setBalloons((prev) => {
        const others = prev.filter((b) => b.id !== balloon.id);
        const extraPoints = others.reduce((sum, b) => sum + b.points, 0);
        updateScore(balloon.points + extraPoints);
        return [createRandomBalloon(105), createRandomBalloon(115)];
      });
    } else {
      // Remove popped balloon and spawn a new one from the bottom
      setBalloons((prev) => {
        const remaining = prev.filter((b) => b.id !== balloon.id);
        return [...remaining, createRandomBalloon(105)];
      });
      updateScore(balloon.points);
    }
  };

  const updateScore = (pts: number) => {
    setBalloonScore((prev) => {
      const next = prev + pts;
      if (next > highScore) {
        setHighScore(next);
        try {
          localStorage.setItem('kidlauncher_balloon_highscore', next.toString());
        } catch {
          // Ignore
        }
      }
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-amber-50 via-pink-50 to-purple-50 text-slate-800 select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 text-white shadow-md z-30">
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
          <span className="text-2xl animate-bounce">🎮</span>
          <h1 className="text-xl font-black tracking-wide">
            {selectedGame === 'menu' && 'Zona de Minijuegos Seguros'}
            {selectedGame === 'memory' && 'Memoria Mágica 🦄'}
            {selectedGame === 'balloons' && 'Reventar Globos 🎈'}
          </h1>
        </div>

        {selectedGame === 'memory' ? (
          <button
            onClick={startMemoryGame}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 active:scale-90"
            title="Reiniciar"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        ) : selectedGame === 'balloons' ? (
          <button
            onClick={() => {
              setBalloonScore(0);
              setCombo(0);
              setBalloons([
                createRandomBalloon(25),
                createRandomBalloon(45),
                createRandomBalloon(65),
                createRandomBalloon(85),
                createRandomBalloon(105),
              ]);
              playSparkleSound(soundEnabled);
            }}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 active:scale-90"
            title="Reiniciar Puntos"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-10" />
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-3 flex flex-col items-center justify-center relative">
        {selectedGame === 'menu' && (
          <div className="w-full max-w-sm flex flex-col gap-4">
            <div className="text-center p-3 bg-white/80 rounded-2xl border border-pink-200 shadow-sm">
              <h2 className="text-xl font-black text-purple-900 mb-1">
                ¡Elige un juego divertido! 🌟
              </h2>
              <p className="text-xs text-purple-700 font-bold">100% seguro, sin anuncios ni enlaces externos</p>
            </div>

            <button
              onClick={() => {
                setSelectedGame('memory');
                startMemoryGame();
                playSparkleSound(soundEnabled);
              }}
              className="p-5 rounded-3xl bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-xl flex items-center gap-4 hover:scale-102 active:scale-95 transition transform border-3 border-white/80 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/30 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition">
                🦄
              </div>
              <div className="text-left">
                <h3 className="text-xl font-black">Memoria Mágica</h3>
                <p className="text-xs text-pink-100 font-medium">Encuentra las parejas de animalitos y dulces</p>
              </div>
            </button>

            <button
              onClick={() => {
                setSelectedGame('balloons');
                setBalloonScore(0);
                playSparkleSound(soundEnabled);
              }}
              className="p-5 rounded-3xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 text-white shadow-xl flex items-center gap-4 hover:scale-102 active:scale-95 transition transform border-3 border-white/80 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/30 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition animate-bounce">
                🎈
              </div>
              <div className="text-left">
                <h3 className="text-xl font-black">Reventar Globos 3D</h3>
                <p className="text-xs text-amber-100 font-medium">¡Explota globos mágicos, arcoíris y estrellas!</p>
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
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full animate-bounce font-black">
                  ¡Ganaste, Princesa! 🎉👑
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
          <div className="relative w-full h-full max-w-md bg-gradient-to-b from-sky-300 via-sky-200 to-amber-100 rounded-3xl border-4 border-sky-400 overflow-hidden shadow-2xl flex flex-col justify-between p-3 select-none">
            {/* Background Sky Decor */}
            <div className="absolute top-4 left-6 text-4xl opacity-80 pointer-events-none animate-pulse">☁️</div>
            <div className="absolute top-12 right-10 text-5xl opacity-80 pointer-events-none">☁️</div>
            <div className="absolute top-2 right-4 text-4xl pointer-events-none animate-spin" style={{ animationDuration: '20s' }}>☀️</div>

            {/* Score & Combo Bar */}
            <div className="flex items-center justify-between z-20">
              <div className="flex items-center gap-2">
                <div className="bg-white/95 backdrop-blur px-3.5 py-1.5 rounded-2xl shadow-md font-black text-rose-600 flex items-center gap-1.5 text-base border border-pink-200">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span>{balloonScore} pts</span>
                </div>

                {highScore > 0 && (
                  <div className="bg-amber-100/90 px-2.5 py-1 rounded-xl text-xs font-black text-amber-800 flex items-center gap-1 border border-amber-300">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>Récord: {highScore}</span>
                  </div>
                )}
              </div>

              {comboText ? (
                <span className="text-xs bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black px-3 py-1.5 rounded-full shadow-lg animate-bounce">
                  {comboText}
                </span>
              ) : (
                <span className="text-xs bg-white/80 text-sky-900 font-bold px-3 py-1 rounded-full shadow-sm">
                  ¡Toca y revienta! 🎈
                </span>
              )}
            </div>

            {/* Floating Pop Particles (+1, +5, etc.) */}
            {popParticles.map((p) => (
              <div
                key={p.id}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                className="absolute pointer-events-none z-30 font-black text-2xl drop-shadow-lg animate-ping text-yellow-300"
              >
                {p.text} ✨
              </div>
            ))}

            {/* LIVE FLOATING BALLOONS */}
            <div className="absolute inset-0 overflow-hidden pointer-events-auto">
              {balloons.map((b) => (
                <button
                  key={b.id}
                  onClick={(e) => popBalloon(b, e)}
                  style={{
                    left: `${b.x}%`,
                    top: `${b.y}%`,
                    width: `${b.size}px`,
                    height: `${b.size * 1.3}px`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition-transform active:scale-125 cursor-pointer group"
                >
                  {/* Balloon Body with 3D Glossy Reflection */}
                  <div
                    className={`w-full h-full rounded-[50%/60%_60%_40%_40%] bg-gradient-to-br ${b.gradient} shadow-2xl relative flex items-center justify-center transform group-hover:scale-105 transition`}
                    style={{
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), inset -5px -5px 15px rgba(0,0,0,0.25), inset 5px 5px 12px rgba(255,255,255,0.6)',
                    }}
                  >
                    {/* Shiny Specular Highlight */}
                    <div className="absolute top-2 left-2.5 w-4 h-6 rounded-full bg-white/60 blur-[1px] rotate-[-30deg] pointer-events-none" />

                    {/* Emoji in center */}
                    <span className="text-2xl drop-shadow-md select-none transform group-hover:rotate-12 transition">
                      {b.emoji}
                    </span>

                    {/* Badge for special balloons */}
                    {b.type === 'rainbow' && (
                      <span className="absolute -top-1 -right-1 bg-yellow-300 text-slate-900 text-[9px] font-black px-1.5 py-0.5 rounded-full shadow">
                        +10
                      </span>
                    )}
                    {b.type === 'star' && (
                      <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 text-[9px] font-black px-1.5 py-0.5 rounded-full shadow">
                        +5
                      </span>
                    )}
                    {b.type === 'bomb' && (
                      <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow animate-pulse">
                        ¡BOOM!
                      </span>
                    )}
                  </div>

                  {/* Knot and String */}
                  <div
                    className="w-2.5 h-2 rounded-full -mt-0.5 shadow-sm"
                    style={{ backgroundColor: b.color }}
                  />
                  <div className="w-0.5 h-7 bg-slate-600/40 rounded-full" />
                </button>
              ))}
            </div>

            {/* Bottom Grass / Floor Decor */}
            <div className="z-10 bg-emerald-400/80 backdrop-blur-sm border-t-2 border-emerald-500 -mx-3 -mb-3 p-2 flex items-center justify-around text-lg">
              <span>🌸</span>
              <span className="text-[11px] font-black text-emerald-950 uppercase tracking-wider">
                ¡Los globos suben sin parar!
              </span>
              <span>🌼</span>
              <span>🌺</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
