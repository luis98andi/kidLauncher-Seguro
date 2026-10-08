import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, RotateCcw, Volume2, Shield, Swords, Dumbbell, 
  BookOpen, Sparkles, Trophy, Heart, Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  playTamagotchiBeep, playTamagotchiEat, playTamagotchiEvolve, 
  playTamagotchiAttack, playTamagotchiHit,
  playPopSound, playSparkleSound, playSuccessSound, playBoingSound 
} from '../../utils/sound';
import { PetSprite, PixelItem, PetSpecies, EvolutionStage } from './pet/PetSprites';

interface KidPetAppProps {
  onClose: () => void;
  soundEnabled: boolean;
}

export interface DigimonState {
  species: PetSpecies;
  stage: EvolutionStage;
  name: string;
  hunger: number;     // 0 - 100
  happiness: number;  // 0 - 100
  energy: number;     // 0 - 100
  strength: number;   // 0 - 100 (from training & battles)
  xp: number;         // 0 - 100 (triggers evolution at 100)
  battlesWon: number;
  trophies: number;
  isSleeping: boolean;
  hasPoop: boolean;
  isSick: boolean;
  ageDays: number;
}

const DEFAULT_PET: DigimonState = {
  species: 'pyro',
  stage: 'baby',
  name: 'Botamon',
  hunger: 80,
  happiness: 85,
  energy: 90,
  strength: 40,
  xp: 35,
  battlesWon: 0,
  trophies: 1,
  isSleeping: false,
  hasPoop: false,
  isSick: false,
  ageDays: 1,
};

const STAGE_NAMES: Record<PetSpecies, Record<EvolutionStage, string>> = {
  pyro: {
    egg: 'Huevo Ígneo',
    baby: 'Botamon',
    in_training: 'Koromon',
    rookie: 'Agumon',
    champion: 'Greymon',
    mega: 'War-Greymon',
  },
  luna: {
    egg: 'Huevo Ártico',
    baby: 'Poyomon',
    in_training: 'Tsunomon',
    rookie: 'Gabumon',
    champion: 'Garurumon',
    mega: 'Metal-Garurumon',
  },
  aether: {
    egg: 'Huevo Sagrado',
    baby: 'Puttimon',
    in_training: 'Tokomon',
    rookie: 'Patamon',
    champion: 'Angemon',
    mega: 'Seraphimon',
  },
};

export const KidPetApp: React.FC<KidPetAppProps> = ({ onClose, soundEnabled }) => {
  // Load saved state or default
  const [pet, setPet] = useState<DigimonState>(() => {
    try {
      const saved = localStorage.getItem('kidlauncher_digipet_v3');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_PET;
  });

  // App tabs: main Console, Gym & Training, Battle Arena, Digidex album
  const [viewTab, setViewTab] = useState<'console' | 'gym' | 'battle' | 'dex'>('console');

  // Menu inside LCD console
  const [activeMenu, setActiveMenu] = useState<'none' | 'food' | 'clean' | 'stats'>('none');
  const [selectedFood, setSelectedFood] = useState<'meat' | 'bread'>('meat');

  // Animation states
  const [frame, setFrame] = useState(0); // 0 or 1 for pixel bounce
  const [actionAnim, setActionAnim] = useState<'idle' | 'eating' | 'bath' | 'evolving' | 'happy' | 'attacking'>('idle');
  const [dialogue, setDialogue] = useState('¡Digi-Pet V-Pet 8-Bit listo! 🐾');
  const [eggTaps, setEggTaps] = useState(0);

  // Shell theme style
  const [shellTheme, setShellTheme] = useState<'cyber-blue' | 'neon-pink' | 'retro-gold' | 'mint-green'>('cyber-blue');
  const [lcdPalette, setLcdPalette] = useState<'classic-green' | 'amber' | 'cyber-cyan'>('classic-green');

  // Gym Training State (Punch Timing Bar)
  const [gymBarPos, setGymBarPos] = useState(50);
  const [gymBarDirection, setGymBarDirection] = useState(1);
  const [isGymActive, setIsGymActive] = useState(false);
  const [gymFeedback, setGymFeedback] = useState<string | null>(null);

  // Battle Arena State
  const [battleEnemyHp, setBattleEnemyHp] = useState(100);
  const [battlePetHp, setBattlePetHp] = useState(100);
  const [battleTurn, setBattleTurn] = useState<'player' | 'enemy' | 'over'>('player');
  const [battleLog, setBattleLog] = useState<string>('¡Un Kuwagamon salvaje apareció en el Coliseo!');
  const [battleEffect, setBattleEffect] = useState<'none' | 'player_atk' | 'enemy_atk'>('none');

  // Frame bounce ticker (every 600ms for authentic retro 2-frame animation)
  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((f) => (f === 0 ? 1 : 0));
    }, 600);
    return () => clearInterval(timer);
  }, []);

  // Save state
  useEffect(() => {
    try {
      localStorage.setItem('kidlauncher_digipet_v3', JSON.stringify(pet));
    } catch {
      // Ignore
    }
  }, [pet]);

  // Tamagotchi natural life loop (decay hunger/energy slowly)
  useEffect(() => {
    const tickTimer = setInterval(() => {
      setPet((prev) => {
        if (prev.stage === 'egg') return prev;

        const hungerDec = prev.isSleeping ? 1 : 2;
        const energyDec = prev.isSleeping ? -4 : 1; // recovers when sleeping
        const happyDec = prev.hasPoop || prev.isSick ? 3 : 1;

        const newHunger = Math.max(10, prev.hunger - hungerDec);
        const newEnergy = Math.min(100, Math.max(10, prev.energy - energyDec));
        const newHappy = Math.max(10, prev.happiness - happyDec);

        // 12% chance of poop if full
        const shouldPoop = !prev.hasPoop && newHunger > 50 && Math.random() < 0.12;

        return {
          ...prev,
          hunger: newHunger,
          energy: newEnergy,
          happiness: newHappy,
          hasPoop: prev.hasPoop || shouldPoop,
          isSick: prev.isSick || (prev.hasPoop && Math.random() < 0.08),
        };
      });
    }, 15000);

    return () => clearInterval(tickTimer);
  }, []);

  // Gym training bar ticker
  useEffect(() => {
    if (!isGymActive) return;
    const interval = setInterval(() => {
      setGymBarPos((pos) => {
        let next = pos + gymBarDirection * 5;
        if (next >= 95) {
          setGymBarDirection(-1);
          return 95;
        }
        if (next <= 5) {
          setGymBarDirection(1);
          return 5;
        }
        return next;
      });
    }, 35);
    return () => clearInterval(interval);
  }, [isGymActive, gymBarDirection]);

  // FOOD ACTION
  const handleFeed = (type: 'meat' | 'bread') => {
    playTamagotchiBeep('confirm', soundEnabled);
    playTamagotchiEat(soundEnabled);
    setActionAnim('eating');

    const hungerBoost = type === 'meat' ? 30 : 15;
    const strBoost = type === 'meat' ? 6 : 2;

    setDialogue(type === 'meat' ? '¡Ñam! ¡Carne asada de poder (+30 Hambre)! 🍖' : '¡Delicioso pan de energía (+15 Hambre)! 🥖');

    setPet((p) => ({
      ...p,
      hunger: Math.min(100, p.hunger + hungerBoost),
      strength: Math.min(100, p.strength + strBoost),
      happiness: Math.min(100, p.happiness + 15),
      xp: Math.min(100, p.xp + (type === 'meat' ? 10 : 5)),
    }));

    setTimeout(() => {
      setActionAnim('idle');
      setActiveMenu('none');
    }, 1600);
  };

  // CLEAN SHOWER / POOP
  const handleClean = () => {
    playTamagotchiBeep('confirm', soundEnabled);
    playSparkleSound(soundEnabled);
    setActionAnim('bath');
    setDialogue('¡Ducha de burbujas! El Digivice quedó resplandeciente 🧼✨');

    setPet((p) => ({
      ...p,
      hasPoop: false,
      happiness: Math.min(100, p.happiness + 20),
      xp: Math.min(100, p.xp + 8),
    }));

    setTimeout(() => {
      setActionAnim('idle');
      setActiveMenu('none');
    }, 1500);
  };

  // MEDICINE
  const handleHeal = () => {
    playTamagotchiBeep('confirm', soundEnabled);
    playSparkleSound(soundEnabled);
    setDialogue('¡Inyección de salud y vitaminas administrada! 💉💖');
    setPet((p) => ({
      ...p,
      isSick: false,
      energy: Math.min(100, p.energy + 35),
      happiness: Math.min(100, p.happiness + 20),
    }));
  };

  // SLEEP / LIGHTS
  const toggleSleep = () => {
    playTamagotchiBeep('select', soundEnabled);
    setPet((p) => {
      const willSleep = !p.isSleeping;
      setDialogue(willSleep ? '🌙 Luces apagadas... Tu Digimon duerme Zzz' : '☀️ ¡Luces encendidas! Lleno de energía y vitalidad');
      return {
        ...p,
        isSleeping: willSleep,
        energy: willSleep ? p.energy : Math.min(100, p.energy + 25),
      };
    });
  };

  // PET / PRAISE (Button C or screen tap)
  const handlePet = () => {
    playTamagotchiBeep('confirm', soundEnabled);
    playSparkleSound(soundEnabled);
    setActionAnim('happy');
    setDialogue(`¡Acariciaste a ${pet.name}! Brinca de alegría 💕`);
    confetti({ particleCount: 25, spread: 40, origin: { y: 0.6 } });

    setPet((p) => ({
      ...p,
      happiness: Math.min(100, p.happiness + 15),
    }));

    setTimeout(() => {
      setActionAnim('idle');
    }, 1400);
  };

  // EGG HATCHING
  const tapEgg = () => {
    playPopSound(soundEnabled);
    setEggTaps((prev) => {
      const next = prev + 1;
      if (next >= 4) {
        playTamagotchiEvolve(soundEnabled);
        confetti({ particleCount: 75, spread: 80, origin: { y: 0.5 } });
        setDialogue(`¡EL HUEVO SE HA ABIERTO! ¡Nació ${STAGE_NAMES[pet.species].baby}! 🎉✨`);
        setPet((p) => ({
          ...p,
          stage: 'baby',
          name: STAGE_NAMES[p.species].baby,
          xp: 25,
          hunger: 90,
          energy: 90,
        }));
        return 0;
      }
      setDialogue(`¡Frotando el huevo! (${next}/4 toques para que nazca 🐣)`);
      return next;
    });
  };

  // EVOLUTION TRIGGER
  const triggerEvolution = () => {
    playTamagotchiEvolve(soundEnabled);
    setActionAnim('evolving');
    setDialogue('⚡ ¡DIGIEVOLUCIÓN EN PROCESO! ¡ENERGÍA DIGITAL AL MÁXIMO! ⚡');
    confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 } });

    setTimeout(() => {
      setPet((prev) => {
        let nextStage: EvolutionStage = 'baby';
        if (prev.stage === 'egg') nextStage = 'baby';
        else if (prev.stage === 'baby') nextStage = 'in_training';
        else if (prev.stage === 'in_training') nextStage = 'rookie';
        else if (prev.stage === 'rookie') nextStage = 'champion';
        else if (prev.stage === 'champion') nextStage = 'mega';
        else nextStage = 'mega';

        const newName = STAGE_NAMES[prev.species][nextStage];
        setDialogue(`¡DIGIEVOLUCIÓN EXITOSA! ¡Ahora es ${newName}! 🌟🏆`);

        return {
          ...prev,
          stage: nextStage,
          name: newName,
          xp: 0,
          hunger: 100,
          happiness: 100,
          energy: 100,
          strength: Math.min(100, prev.strength + 25),
        };
      });
      setActionAnim('idle');
    }, 2400);
  };

  // GYM TRAINING (Power Punch Strike)
  const hitGymPunch = () => {
    if (!isGymActive) {
      setIsGymActive(true);
      setGymFeedback(null);
      setDialogue('¡Presiona GOLPE cuando la aguja esté en la zona verde central!');
      return;
    }

    // Evaluate punch accuracy: target is 40 - 60
    const diff = Math.abs(gymBarPos - 50);
    setIsGymActive(false);

    if (diff <= 10) {
      // Perfect critical hit
      playTamagotchiAttack(soundEnabled);
      playSuccessSound(soundEnabled);
      setGymFeedback('¡GOLPE PERFECTO! 💥 +15 Fuerza, +20 XP');
      setDialogue('¡Poder absoluto! Tu Digimon destrozó la roca de entrenamiento 🥊🔥');
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });

      setPet((p) => ({
        ...p,
        strength: Math.min(100, p.strength + 15),
        xp: Math.min(100, p.xp + 20),
        happiness: Math.min(100, p.happiness + 10),
      }));
    } else if (diff <= 25) {
      // Good hit
      playTamagotchiHit(soundEnabled);
      setGymFeedback('¡Buen golpe! 👊 +8 Fuerza, +10 XP');
      setDialogue('¡Buen entrenamiento! Músculos digitales fortalecidos 💪');

      setPet((p) => ({
        ...p,
        strength: Math.min(100, p.strength + 8),
        xp: Math.min(100, p.xp + 10),
      }));
    } else {
      // Missed
      playBoingSound(soundEnabled);
      setGymFeedback('¡Casi! Inténtalo de nuevo 💦');
      setDialogue('¡Resbaló! La concentración es la clave del Digivice 🎯');
    }
  };

  // BATTLE ARENA LOGIC
  const startNewBattle = () => {
    setBattleEnemyHp(100);
    setBattlePetHp(100);
    setBattleTurn('player');
    setBattleEffect('none');
    setBattleLog('¡Un Kuwagamon cibernético te desafía en el Coliseo! ⚔️');
  };

  const executeBattleAction = (type: 'attack' | 'special' | 'shield') => {
    if (battleTurn !== 'player') return;

    if (type === 'attack') {
      playTamagotchiAttack(soundEnabled);
      setBattleEffect('player_atk');
      const dmg = Math.floor(25 + (pet.strength / 100) * 20);
      const newEnemyHp = Math.max(0, battleEnemyHp - dmg);
      setBattleEnemyHp(newEnemyHp);
      setBattleLog(`¡${pet.name} golpeó con Garras Digitales infligiendo -${dmg} daño! 💥`);

      if (newEnemyHp <= 0) {
        handleBattleVictory();
        return;
      }
    } else if (type === 'special') {
      if (pet.energy < 20) {
        setBattleLog('¡No tienes suficiente energía para el Ataque Especial! Usa ataque normal.');
        return;
      }
      playTamagotchiEvolve(soundEnabled);
      setBattleEffect('player_atk');
      const dmg = Math.floor(45 + (pet.strength / 100) * 30);
      const newEnemyHp = Math.max(0, battleEnemyHp - dmg);
      setBattleEnemyHp(newEnemyHp);
      setBattleLog(`🔥 ¡MEGA IMPACTO DIGITAL! Tu Digimon liberó su ataque supremo infligiendo -${dmg} daño!`);

      setPet((p) => ({ ...p, energy: Math.max(0, p.energy - 20) }));

      if (newEnemyHp <= 0) {
        handleBattleVictory();
        return;
      }
    } else {
      // Shield
      playTamagotchiBeep('confirm', soundEnabled);
      setBattleLog(`🛡️ ¡${pet.name} activó Escudo de Luz! Bloqueará el próximo golpe.`);
    }

    // Enemy counter turn
    setBattleTurn('enemy');
    setTimeout(() => {
      setBattleEffect('enemy_atk');
      playTamagotchiHit(soundEnabled);

      const enemyDmg = type === 'shield' ? 5 : 20;
      const nextPetHp = Math.max(0, battlePetHp - enemyDmg);
      setBattlePetHp(nextPetHp);
      setBattleLog(
        type === 'shield' 
          ? '¡Tu escudo absorbió casi todo el impacto del enemigo (-5 HP)! 🛡️' 
          : `¡El rival atacó con Pinzas Láser causando -${enemyDmg} daño!`
      );

      setBattleEffect('none');

      if (nextPetHp <= 0) {
        setBattleTurn('over');
        setBattleLog('Tu Digimon quedó exhausto... Dale medicina y déjalo descansar 🛌');
      } else {
        setBattleTurn('player');
      }
    }, 1200);
  };

  const handleBattleVictory = () => {
    playSuccessSound(soundEnabled);
    setBattleTurn('over');
    setBattleLog('🏆 ¡VICTORIA! ¡Venciste al monstruo rival! +Trofeo, +35 XP 🌟');
    confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });

    setPet((p) => ({
      ...p,
      battlesWon: p.battlesWon + 1,
      trophies: p.trophies + 1,
      xp: Math.min(100, p.xp + 35),
      happiness: 100,
    }));
  };

  // CHANGE SPECIES
  const selectSpecies = (spec: PetSpecies) => {
    playTamagotchiBeep('confirm', soundEnabled);
    const newName = STAGE_NAMES[spec][pet.stage];
    setPet((p) => ({
      ...p,
      species: spec,
      name: newName,
    }));
    setDialogue(`¡Especie cambiada a ${newName}!`);
  };

  // RESET PET
  const resetToEgg = () => {
    if (window.confirm('¿Deseas reiniciar tu mascota con un nuevo Huevo Digital?')) {
      playPopSound(soundEnabled);
      setPet({
        ...DEFAULT_PET,
        stage: 'egg',
        name: STAGE_NAMES[pet.species].egg,
        xp: 0,
        hunger: 100,
        happiness: 100,
        energy: 100,
      });
      setEggTaps(0);
      setDialogue('¡Un nuevo huevo misterioso ha llegado! Tócalo para eclosionar 🥚✨');
      setActiveMenu('none');
    }
  };

  // LCD theme styles
  const getLcdBgClass = () => {
    switch (lcdPalette) {
      case 'classic-green':
        return 'from-[#86efac] via-[#4ade80] to-[#22c55e] text-slate-950';
      case 'amber':
        return 'from-[#fef08a] via-[#fde047] to-[#eab308] text-slate-950';
      case 'cyber-cyan':
        return 'from-[#a5f3fc] via-[#67e8f9] to-[#38bdf8] text-slate-950';
      default:
        return 'from-[#86efac] via-[#4ade80] to-[#22c55e] text-slate-950';
    }
  };

  const getShellClass = () => {
    switch (shellTheme) {
      case 'cyber-blue':
        return 'from-blue-600 via-indigo-600 to-sky-700 border-blue-400 shadow-blue-900/50';
      case 'neon-pink':
        return 'from-pink-500 via-rose-500 to-fuchsia-600 border-pink-300 shadow-pink-900/50';
      case 'retro-gold':
        return 'from-amber-400 via-yellow-500 to-amber-600 border-yellow-200 shadow-amber-950/50';
      case 'mint-green':
        return 'from-teal-400 via-emerald-500 to-cyan-600 border-teal-200 shadow-emerald-950/50';
      default:
        return 'from-blue-600 via-indigo-600 to-sky-700 border-blue-400 shadow-blue-900/50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white select-none overflow-hidden h-[100dvh]">
      {/* Top Header Bar (Compact for 1024x768) */}
      <header className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 z-30 shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition text-white font-black text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver</span>
        </button>

        {/* View Switcher Tabs (Console / Gym / Battle / Digidex) */}
        <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-xs font-bold">
          <button
            onClick={() => { playTamagotchiBeep('select', soundEnabled); setViewTab('console'); }}
            className={`px-2.5 py-1 rounded-lg transition ${
              viewTab === 'console' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            🕹️ Consola V-Pet
          </button>
          <button
            onClick={() => { playTamagotchiBeep('select', soundEnabled); setViewTab('gym'); }}
            className={`px-2.5 py-1 rounded-lg transition ${
              viewTab === 'gym' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            🥊 Gimnasio
          </button>
          <button
            onClick={() => { playTamagotchiBeep('select', soundEnabled); setViewTab('battle'); if (battleEnemyHp <= 0) startNewBattle(); }}
            className={`px-2.5 py-1 rounded-lg transition ${
              viewTab === 'battle' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            ⚔️ Coliseo
          </button>
          <button
            onClick={() => { playTamagotchiBeep('select', soundEnabled); setViewTab('dex'); }}
            className={`px-2.5 py-1 rounded-lg transition ${
              viewTab === 'dex' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            📖 Álbum Dex
          </button>
        </div>

        {/* New Egg / Reset Button */}
        <button
          onClick={resetToEgg}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold active:scale-95 transition"
          title="Nuevo Huevo"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden sm:inline">Nuevo Huevo</span>
        </button>
      </header>

      {/* Main View Area (Optimized for 1024x768 without cutoffs) */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 min-h-0 overflow-y-auto">
        {/* ============================================================== */}
        {/* TAB 1: CONSOLE V-PET (Authentic Digivice / Tamagotchi Handheld) */}
        {/* ============================================================== */}
        {viewTab === 'console' && (
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 w-full max-w-4xl h-full max-h-[580px]">
            {/* PHYSICAL HANDHELD DEVICE CHASSIS */}
            <div 
              className={`relative w-full max-w-[340px] sm:max-w-[360px] h-full max-h-[520px] rounded-[48px] p-3 sm:p-4 shadow-2xl flex flex-col justify-between items-center border-4 bg-gradient-to-br ${getShellClass()} select-none`}
              style={{
                boxShadow: '0 15px 35px rgba(0,0,0,0.7), inset 0 4px 8px rgba(255,255,255,0.4), inset 0 -4px 8px rgba(0,0,0,0.4)',
              }}
            >
              {/* Keychain loop */}
              <div className="absolute -top-3 w-8 h-8 rounded-full border-4 border-slate-400/80 -z-10" />

              {/* Console Badge Header */}
              <div className="flex items-center justify-between w-full px-2 text-[10px] font-mono font-black tracking-widest uppercase text-white/90 drop-shadow">
                <span>DIGIVICE 8-BIT</span>
                <span className="bg-black/40 px-2 py-0.5 rounded-full border border-white/20">
                  {pet.name} (Nv.{pet.stage.toUpperCase()})
                </span>
              </div>

              {/* RETRO LCD SCREEN (With Pixel-art graphics & 8-bit styling) */}
              <div 
                className={`w-full flex-1 rounded-2xl bg-gradient-to-b ${getLcdBgClass()} border-4 border-slate-900 shadow-inner p-2 flex flex-col justify-between relative overflow-hidden my-1.5 transition-colors`}
                style={{
                  boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.4)',
                  backgroundImage: 'radial-gradient(rgba(0,0,0,0.06) 10%, transparent 10%)',
                  backgroundSize: '8px 8px',
                }}
              >
                {/* LCD Screen Glass Glare Highlight */}
                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/35 to-transparent pointer-events-none rounded-t-xl" />

                {/* LCD Top Functional Pixel Menu Icons */}
                <div className="flex items-center justify-between px-1 py-0.5 bg-black/15 rounded-lg text-xs z-10 font-mono font-bold">
                  <button
                    onClick={() => { playTamagotchiBeep('select', soundEnabled); setActiveMenu((m) => m === 'food' ? 'none' : 'food'); }}
                    className={`px-1.5 py-0.5 rounded transition ${activeMenu === 'food' ? 'bg-black text-yellow-300 scale-105' : 'hover:scale-105'}`}
                    title="Alimentar"
                  >
                    🍖 COMIDA
                  </button>
                  <button
                    onClick={toggleSleep}
                    className={`px-1.5 py-0.5 rounded transition ${pet.isSleeping ? 'bg-indigo-950 text-white' : 'hover:scale-105'}`}
                    title="Luces / Dormir"
                  >
                    {pet.isSleeping ? '🌙 LUZ' : '💡 LUZ'}
                  </button>
                  <button
                    onClick={handleClean}
                    className={`px-1.5 py-0.5 rounded transition ${pet.hasPoop ? 'animate-bounce bg-rose-600 text-white' : 'hover:scale-105'}`}
                    title="Ducha / Limpiar"
                  >
                    🚿 DUCHA
                  </button>
                  <button
                    onClick={() => { playTamagotchiBeep('select', soundEnabled); setActiveMenu((m) => m === 'stats' ? 'none' : 'stats'); }}
                    className={`px-1.5 py-0.5 rounded transition ${activeMenu === 'stats' ? 'bg-black text-white' : 'hover:scale-105'}`}
                    title="Estado"
                  >
                    📊 STATS
                  </button>
                </div>

                {/* LCD Center Display Screen */}
                <div className="flex-1 flex flex-col items-center justify-center relative my-1 z-10 min-h-0">
                  {/* SICK INDICATOR */}
                  {pet.isSick && (
                    <div 
                      onClick={handleHeal}
                      className="absolute top-1 left-2 flex items-center gap-1 bg-rose-600 text-white px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse cursor-pointer shadow"
                    >
                      <PixelItem item="syringe" size={16} />
                      <span>¡CURAR!</span>
                    </div>
                  )}

                  {/* EVOLUTION READY BADGE */}
                  {pet.xp >= 100 && pet.stage !== 'mega' && (
                    <button
                      onClick={triggerEvolution}
                      className="absolute top-1 right-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black animate-bounce shadow-md z-30"
                    >
                      ⚡ ¡EVOLUCIONAR!
                    </button>
                  )}

                  {/* PIXEL SPRITE DISPLAY */}
                  <div 
                    onClick={pet.stage === 'egg' ? tapEgg : handlePet}
                    className={`cursor-pointer transition-transform duration-200 ${
                      actionAnim === 'evolving' ? 'scale-125 animate-spin' :
                      actionAnim === 'eating' ? 'animate-bounce' :
                      actionAnim === 'happy' ? 'scale-110 -translate-y-2' : ''
                    }`}
                  >
                    <PetSprite
                      species={pet.species}
                      stage={pet.stage}
                      frame={frame}
                      size={pet.stage === 'egg' ? 100 : pet.stage === 'baby' ? 110 : 130}
                    />
                  </div>

                  {/* POOP SPRITE (Classic Pixel Poop next to pet if dirty) */}
                  {pet.hasPoop && (
                    <div 
                      onClick={handleClean}
                      className="absolute right-4 bottom-2 cursor-pointer animate-bounce hover:scale-110 transition"
                      title="¡Toca para limpiar!"
                    >
                      <PixelItem item="poop" size={32} />
                    </div>
                  )}

                  {/* EATING SPRITE (Pixel Meat) */}
                  {actionAnim === 'eating' && (
                    <div className="absolute left-4 bottom-2 animate-pulse">
                      <PixelItem item="meat" size={32} />
                    </div>
                  )}

                  {/* SLEEPING ZZZ ANIMATION */}
                  {pet.isSleeping && (
                    <div className="absolute top-2 right-4 font-mono font-black text-indigo-900 text-sm animate-bounce">
                      Z z z...
                    </div>
                  )}

                  {/* OVERLAY 1: FOOD SELECTION */}
                  {activeMenu === 'food' && (
                    <div className="absolute inset-0 bg-slate-900/95 rounded-xl p-2 flex flex-col items-center justify-center gap-2 text-white animate-fade-in z-20 font-mono">
                      <span className="text-[11px] font-bold text-yellow-300">ELIGE ALIMENTO PIXEL:</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleFeed('meat')}
                          className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-800 hover:bg-orange-600 border border-orange-400 active:scale-95 transition"
                        >
                          <PixelItem item="meat" size={32} />
                          <span className="text-[10px] font-bold text-orange-200">Carne (+30)</span>
                        </button>
                        <button
                          onClick={() => handleFeed('bread')}
                          className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-800 hover:bg-amber-600 border border-amber-400 active:scale-95 transition"
                        >
                          <span className="text-2xl">🥖</span>
                          <span className="text-[10px] font-bold text-amber-200">Pan (+15)</span>
                        </button>
                      </div>
                      <button
                        onClick={() => setActiveMenu('none')}
                        className="text-[10px] text-slate-400 underline mt-1"
                      >
                        Cancelar ✕
                      </button>
                    </div>
                  )}

                  {/* OVERLAY 2: STATS METERS */}
                  {activeMenu === 'stats' && (
                    <div className="absolute inset-0 bg-slate-950/95 rounded-xl p-2 flex flex-col justify-between text-white animate-fade-in z-20 font-mono text-[10px]">
                      <div className="flex items-center justify-between font-black text-yellow-300 border-b border-slate-800 pb-0.5">
                        <span>{pet.name}</span>
                        <span>Día {pet.ageDays} • 🏆 {pet.trophies}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 font-bold">
                        <div>
                          <div className="flex justify-between text-rose-400">
                            <span>HAMBRE:</span>
                            <span>{pet.hunger}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-0.5 overflow-hidden">
                            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${pet.hunger}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-amber-400">
                            <span>FELICIDAD:</span>
                            <span>{pet.happiness}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-0.5 overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pet.happiness}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-indigo-400">
                            <span>ENERGÍA:</span>
                            <span>{pet.energy}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-0.5 overflow-hidden">
                            <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${pet.energy}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-cyan-400">
                            <span>FUERZA:</span>
                            <span>{pet.strength}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-0.5 overflow-hidden">
                            <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${pet.strength}%` }} />
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-purple-300 font-bold">
                          <span>XP EVOLUCIÓN:</span>
                          <span>{pet.xp}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full mt-0.5 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${pet.xp}%` }} />
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveMenu('none')}
                        className="text-center text-slate-400 underline"
                      >
                        Cerrar ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* LCD Dialogue Bar */}
                <div className="bg-black/90 px-2 py-1 rounded text-center text-[10px] font-mono font-bold text-yellow-300 truncate z-10">
                  {dialogue}
                </div>
              </div>

              {/* RETRO 3 PHYSICAL BUTTONS (A, B, C) */}
              <div className="w-full flex items-center justify-around py-1 px-3">
                {/* Button A: Menu Select / Cycle */}
                <button
                  onClick={() => {
                    playTamagotchiBeep('select', soundEnabled);
                    setActiveMenu((prev) => prev === 'none' ? 'food' : prev === 'food' ? 'stats' : 'none');
                  }}
                  className="w-10 h-10 rounded-full bg-yellow-300 active:bg-yellow-400 border-2 border-slate-900 shadow-lg flex items-center justify-center text-xs font-black text-slate-950 active:scale-90 transition transform"
                  title="Botón A: Seleccionar"
                >
                  A
                </button>

                {/* Button B: Action / Confirm */}
                <button
                  onClick={() => {
                    if (activeMenu === 'food') handleFeed('meat');
                    else if (pet.stage === 'egg') tapEgg();
                    else if (pet.hasPoop) handleClean();
                    else if (pet.isSick) handleHeal();
                    else handlePet();
                  }}
                  className="w-11 h-11 rounded-full bg-rose-500 active:bg-rose-600 border-2 border-slate-900 shadow-xl flex items-center justify-center text-xs font-black text-white active:scale-90 transition transform -mt-2"
                  title="Botón B: Confirmar / Acción"
                >
                  B
                </button>

                {/* Button C: Cancel / Pet */}
                <button
                  onClick={() => {
                    playTamagotchiBeep('cancel', soundEnabled);
                    setActiveMenu('none');
                    handlePet();
                  }}
                  className="w-10 h-10 rounded-full bg-cyan-400 active:bg-cyan-500 border-2 border-slate-900 shadow-lg flex items-center justify-center text-xs font-black text-slate-950 active:scale-90 transition transform"
                  title="Botón C: Acariciar / Cancelar"
                >
                  C
                </button>
              </div>
            </div>

            {/* SIDE PANEL: Quick Controls & Customizer (Visible on Desktop / 1024x768) */}
            <div className="hidden md:flex flex-col justify-between w-64 h-full max-h-[520px] bg-slate-900/90 border border-slate-800 rounded-3xl p-3 backdrop-blur shadow-xl text-xs font-mono">
              <div>
                <h3 className="font-black text-yellow-300 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-800">
                  <span>👾</span>
                  <span>PANEL DE CUIDADOS</span>
                </h3>

                {/* Quick Care Buttons */}
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  <button
                    onClick={() => handleFeed('meat')}
                    className="p-2 rounded-xl bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/40 text-orange-200 font-bold flex items-center gap-1.5 active:scale-95 transition"
                  >
                    <span>🍖</span>
                    <span>Alimentar</span>
                  </button>
                  <button
                    onClick={handleClean}
                    className="p-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-200 font-bold flex items-center gap-1.5 active:scale-95 transition"
                  >
                    <span>🚿</span>
                    <span>Bañar</span>
                  </button>
                  <button
                    onClick={handlePet}
                    className="p-2 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/40 text-pink-200 font-bold flex items-center gap-1.5 active:scale-95 transition"
                  >
                    <span>💕</span>
                    <span>Acariciar</span>
                  </button>
                  <button
                    onClick={toggleSleep}
                    className="p-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 font-bold flex items-center gap-1.5 active:scale-95 transition"
                  >
                    <span>{pet.isSleeping ? '☀️ Despertar' : '🌙 Dormir'}</span>
                  </button>
                </div>

                {/* Choose Species */}
                <div className="mt-3">
                  <span className="text-[10px] text-slate-400 font-bold">ESPECIE V-PET:</span>
                  <div className="flex gap-1 mt-1">
                    <button
                      onClick={() => selectSpecies('pyro')}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition ${
                        pet.species === 'pyro' ? 'bg-orange-600 text-white border-orange-400' : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      🔥 Pyro
                    </button>
                    <button
                      onClick={() => selectSpecies('luna')}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition ${
                        pet.species === 'luna' ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      ❄️ Luna
                    </button>
                    <button
                      onClick={() => selectSpecies('aether')}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition ${
                        pet.species === 'aether' ? 'bg-amber-600 text-white border-amber-400' : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      ✨ Sagrado
                    </button>
                  </div>
                </div>

                {/* Shell color changer */}
                <div className="mt-3">
                  <span className="text-[10px] text-slate-400 font-bold">CARCASA DIGIVICE:</span>
                  <div className="flex gap-1.5 mt-1">
                    {(['cyber-blue', 'neon-pink', 'retro-gold', 'mint-green'] as const).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setShellTheme(theme)}
                        className={`w-6 h-6 rounded-full border-2 transition ${
                          shellTheme === theme ? 'border-white scale-110' : 'border-transparent opacity-70'
                        } ${
                          theme === 'cyber-blue' ? 'bg-blue-500' :
                          theme === 'neon-pink' ? 'bg-pink-500' :
                          theme === 'retro-gold' ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                        title={theme}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Status footer pill */}
              <div className="p-2 bg-slate-950/80 rounded-xl border border-slate-800 text-[10px] text-slate-400">
                <div className="flex justify-between">
                  <span>Trofeos: 🏆 {pet.trophies}</span>
                  <span>Victorias: ⚔️ {pet.battlesWon}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: GYM & TRAINING MINIGAME (POWER PUNCH STRIKE)             */}
        {/* ============================================================== */}
        {viewTab === 'gym' && (
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col items-center justify-between gap-4 shadow-2xl font-mono text-center">
            <div>
              <h2 className="text-base font-black text-yellow-300 flex items-center justify-center gap-2">
                <Dumbbell className="w-5 h-5 text-yellow-400" />
                <span>GIMNASIO DE FUERZA DIGITAL</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                ¡Golpea la roca cuando el puntero esté en el centro para dar un golpe crítico!
              </p>
            </div>

            {/* Live Pet in gym */}
            <div className="py-2">
              <PetSprite
                species={pet.species}
                stage={pet.stage}
                frame={frame}
                size={120}
              />
            </div>

            {/* Timing meter bar */}
            <div className="w-full max-w-sm flex flex-col gap-1.5">
              <div className="relative w-full h-8 bg-slate-950 rounded-xl border-2 border-slate-700 overflow-hidden flex items-center">
                {/* Target sweet spot zone (Green center) */}
                <div className="absolute left-[40%] right-[40%] h-full bg-emerald-500/50 border-x-2 border-emerald-400 flex items-center justify-center text-[10px] font-black text-emerald-200">
                  ¡CRÍTICO!
                </div>
                {/* Good hit zone */}
                <div className="absolute left-[25%] right-[25%] h-full bg-yellow-500/20 pointer-events-none" />

                {/* Moving Indicator */}
                <div 
                  className="absolute top-0 bottom-0 w-3 bg-rose-500 rounded-sm shadow-md transition-all duration-75"
                  style={{ left: `${gymBarPos}%` }}
                />
              </div>

              {gymFeedback && (
                <div className="text-xs font-black text-yellow-300 animate-bounce">
                  {gymFeedback}
                </div>
              )}
            </div>

            {/* Gym Action Button */}
            <button
              onClick={hitGymPunch}
              className={`w-full max-w-sm py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition active:scale-95 shadow-lg ${
                isGymActive 
                  ? 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white animate-pulse' 
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white'
              }`}
            >
              {isGymActive ? '🥊 ¡GOLPEAR AHORA!' : '⚡ INICIAR ENTRENAMIENTO'}
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: RETRO BATTLE COLISEUM                                  */}
        {/* ============================================================== */}
        {viewTab === 'battle' && (
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between gap-3 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-black text-yellow-300 flex items-center gap-1.5">
                <Swords className="w-4 h-4 text-rose-400" />
                <span>COLISEO RETRO 8-BIT</span>
              </span>
              <span className="text-slate-400">Victorias: 🏆 {pet.battlesWon}</span>
            </div>

            {/* Arena Ring Display */}
            <div className="relative w-full h-44 bg-slate-950 rounded-2xl border-2 border-slate-800 p-2 flex items-center justify-between overflow-hidden">
              {/* Pet Side */}
              <div className={`flex flex-col items-center transition-transform ${battleEffect === 'player_atk' ? 'translate-x-6' : ''}`}>
                <PetSprite
                  species={pet.species}
                  stage={pet.stage}
                  frame={frame}
                  size={80}
                />
                <span className="text-[10px] font-bold text-white mt-1">{pet.name}</span>
                <div className="w-20 h-2 bg-slate-800 rounded-full mt-0.5 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${battlePetHp}%` }} />
                </div>
              </div>

              {/* VS Emblem */}
              <div className="text-base font-black text-rose-500 animate-pulse">
                VS
              </div>

              {/* Enemy Side (Rival Monster) */}
              <div className={`flex flex-col items-center transition-transform ${battleEffect === 'enemy_atk' ? '-translate-x-6' : ''}`}>
                <div className="w-16 h-16 rounded-xl bg-rose-950 border border-rose-500/50 flex items-center justify-center text-3xl shadow">
                  👾
                </div>
                <span className="text-[10px] font-bold text-rose-300 mt-1">Kuwagamon</span>
                <div className="w-20 h-2 bg-slate-800 rounded-full mt-0.5 overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${battleEnemyHp}%` }} />
                </div>
              </div>
            </div>

            {/* Battle Log Message */}
            <div className="bg-black/80 p-2 rounded-xl border border-slate-800 text-center font-bold text-yellow-300 truncate">
              {battleLog}
            </div>

            {/* Battle Controls */}
            {battleTurn === 'over' ? (
              <button
                onClick={startNewBattle}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-black text-xs active:scale-95 transition"
              >
                ⚔️ RETAR A OTRO MONSTRUO
              </button>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <button
                  disabled={battleTurn !== 'player'}
                  onClick={() => executeBattleAction('attack')}
                  className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 text-white font-black text-xs transition"
                >
                  ⚡ Ataque
                </button>
                <button
                  disabled={battleTurn !== 'player' || pet.energy < 20}
                  onClick={() => executeBattleAction('special')}
                  className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 disabled:opacity-50 text-white font-black text-xs transition"
                >
                  🔥 Especial
                </button>
                <button
                  disabled={battleTurn !== 'player'}
                  onClick={() => executeBattleAction('shield')}
                  className="py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-95 disabled:opacity-50 text-white font-black text-xs transition"
                >
                  🛡️ Escudo
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: DIGIDEX (DISCOVERABLE EVOLUTIONS ALBUM)                  */}
        {/* ============================================================== */}
        {viewTab === 'dex' && (
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col gap-3 shadow-2xl font-mono text-xs overflow-y-auto max-h-[520px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-black text-yellow-300 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>DIGIDEX • ÁLBUM DE EVOLUCIONES</span>
              </span>
              <span className="text-slate-400">Colecciona todas las fases</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['pyro', 'luna', 'aether'] as const).map((spec) => (
                <div key={spec} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col gap-2">
                  <div className="font-black text-sm text-center uppercase tracking-wider text-yellow-400 border-b border-slate-800 pb-1">
                    {spec === 'pyro' ? '🔥 Línea Fuego' : spec === 'luna' ? '❄️ Línea Hielo' : '✨ Línea Sagrada'}
                  </div>

                  <div className="flex flex-col gap-1 text-[11px]">
                    <div className="flex items-center justify-between p-1 bg-slate-900/60 rounded">
                      <span className="text-slate-400">1. Bebé:</span>
                      <span className="font-bold text-white">{STAGE_NAMES[spec].baby}</span>
                    </div>
                    <div className="flex items-center justify-between p-1 bg-slate-900/60 rounded">
                      <span className="text-slate-400">2. En Entreno:</span>
                      <span className="font-bold text-white">{STAGE_NAMES[spec].in_training}</span>
                    </div>
                    <div className="flex items-center justify-between p-1 bg-slate-900/60 rounded">
                      <span className="text-slate-400">3. Novato:</span>
                      <span className="font-bold text-white">{STAGE_NAMES[spec].rookie}</span>
                    </div>
                    <div className="flex items-center justify-between p-1 bg-slate-900/60 rounded">
                      <span className="text-slate-400">4. Campeón:</span>
                      <span className="font-bold text-white">{STAGE_NAMES[spec].champion}</span>
                    </div>
                    <div className="flex items-center justify-between p-1 bg-slate-900/60 rounded">
                      <span className="text-slate-400">5. Mega:</span>
                      <span className="font-bold text-yellow-300">{STAGE_NAMES[spec].mega}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => { selectSpecies(spec); setViewTab('console'); }}
                    className={`mt-1 py-1 rounded-lg text-center font-bold text-[10px] transition ${
                      pet.species === spec ? 'bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {pet.species === spec ? '✓ En uso' : 'Seleccionar Especie'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
