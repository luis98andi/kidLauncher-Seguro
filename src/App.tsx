/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Lock, Settings, Shield, Sparkles, Clock, Battery, Wifi, Heart,
  Smartphone, Plus, Volume2, VolumeX, Moon, Sun, Star
} from 'lucide-react';
import { AppItem, ParentSettings, EmergencyContact, ThemeType } from './types';
import { loadApps, saveApps, loadSettings, saveSettings } from './utils/storage';
import { playPopSound, playSparkleSound, playTapSound } from './utils/sound';
import { ParentPinModal } from './components/ParentPinModal';
import { ParentDashboardModal } from './components/ParentDashboardModal';
import { ApkGuideModal } from './components/ApkGuideModal';
import { BedtimeLockScreen } from './components/BedtimeLockScreen';
import { PWAInstallButton } from './components/PWAInstallButton';

// Kid Mini Apps
import { KidPaintApp } from './components/apps/KidPaintApp';
import { KidMusicApp } from './components/apps/KidMusicApp';
import { KidCameraApp } from './components/apps/KidCameraApp';
import { KidGamesApp } from './components/apps/KidGamesApp';
import { KidStoriesApp } from './components/apps/KidStoriesApp';
import { KidCalculatorApp } from './components/apps/KidCalculatorApp';
import { KidContactsApp } from './components/apps/KidContactsApp';
import { KidRoutineApp } from './components/apps/KidRoutineApp';
import { KidDiaryApp } from './components/apps/KidDiaryApp';
import { KidPetApp } from './components/apps/KidPetApp';
import { KidStickersApp } from './components/apps/KidStickersApp';
import { KidWalkieApp } from './components/apps/KidWalkieApp';
import { KidDjApp } from './components/apps/KidDjApp';
import confetti from 'canvas-confetti';

export default function App() {
  const [apps, setApps] = useState<AppItem[]>(loadApps);
  const [settings, setSettings] = useState<ParentSettings>(loadSettings);
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [bgSparkles, setBgSparkles] = useState<{ id: number; x: number; y: number }[]>([]);

  // Modals & Navigation
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinModalMode, setPinModalMode] = useState<'dashboard' | 'unlock_app' | 'bedtime_override'>('dashboard');
  const [pendingLockedApp, setPendingLockedApp] = useState<AppItem | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showApkGuide, setShowApkGuide] = useState(false);
  const [activeMiniApp, setActiveMiniApp] = useState<string | null>(null);
  const [isBedtimeOverridden, setIsBedtimeOverridden] = useState(false);
  const [selectedDailyMood, setSelectedDailyMood] = useState('👑 Feliz');

  // Time & Clock update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })
      );
      setDateStr(
        now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Save settings on update
  const handleUpdateSettings = (newSettings: ParentSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Save apps on update
  const handleUpdateApps = (newApps: AppItem[]) => {
    setApps(newApps);
    saveApps(newApps);
  };

  // Check Bedtime mode
  const isBedtimeActive = () => {
    if (!settings.bedtimeEnabled || isBedtimeOverridden) return false;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = settings.bedtimeStart.split(':').map(Number);
    const [endH, endM] = settings.bedtimeEnd.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (startMinutes > endMinutes) {
      // Overnight (e.g. 20:30 to 07:00)
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    } else {
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    }
  };

  const handleAppClick = (app: AppItem) => {
    playPopSound(settings.soundEnabled);

    // If app is locked with parent PIN
    if (app.isLockedWithPin) {
      setPendingLockedApp(app);
      setPinModalMode('unlock_app');
      setShowPinModal(true);
      return;
    }

    launchApp(app);
  };

  const launchApp = (app: AppItem) => {
    if (app.internalAppId) {
      setActiveMiniApp(app.internalAppId);
      return;
    }

    if (app.phone || app.id === 'app-contacts') {
      setActiveMiniApp('contacts');
      return;
    }

    if (app.url) {
      window.open(app.url, '_blank', 'noopener,noreferrer');
      return;
    }

    alert(`Abriendo ${app.name}...`);
  };

  const handlePinSuccess = () => {
    setShowPinModal(false);
    if (pinModalMode === 'dashboard') {
      setShowDashboard(true);
    } else if (pinModalMode === 'unlock_app' && pendingLockedApp) {
      launchApp(pendingLockedApp);
      setPendingLockedApp(null);
    } else if (pinModalMode === 'bedtime_override') {
      setIsBedtimeOverridden(true);
    }
  };

  // Theme Background Map
  const getThemeClass = (theme: ThemeType) => {
    switch (theme) {
      case 'pink-princess':
        return 'bg-gradient-to-br from-pink-200 via-rose-100 to-fuchsia-200 text-slate-800';
      case 'unicorn-magic':
        return 'bg-gradient-to-br from-fuchsia-200 via-purple-100 to-indigo-200 text-slate-800';
      case 'galaxy-night':
        return 'bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white';
      case 'mint-pastel':
        return 'bg-gradient-to-br from-teal-100 via-emerald-50 to-cyan-100 text-slate-800';
      case 'sunshine-candy':
        return 'bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 text-slate-800';
      default:
        return 'bg-gradient-to-br from-pink-200 via-rose-100 to-fuchsia-200 text-slate-800';
    }
  };

  // Icon Size Grid Map (Optimized for 1024x768 and modern responsive screens)
  const getGridClass = (size: ParentSettings['iconSize']) => {
    switch (size) {
      case 'normal':
        return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-2.5';
      case 'large':
        return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5 sm:gap-3';
      case 'xlarge':
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-3.5';
      default:
        return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5 sm:gap-3';
    }
  };

  const getTileSizeClass = (size: ParentSettings['iconSize']) => {
    switch (size) {
      case 'normal':
        return 'p-2 sm:p-2.5 rounded-2xl min-h-[85px] sm:min-h-[95px]';
      case 'large':
        return 'p-2.5 sm:p-3 rounded-2xl min-h-[95px] sm:min-h-[110px]';
      case 'xlarge':
        return 'p-3 sm:p-4 rounded-3xl min-h-[115px] sm:min-h-[130px]';
      default:
        return 'p-2.5 sm:p-3 rounded-2xl min-h-[95px] sm:min-h-[110px]';
    }
  };

  const getIconSizeClass = (size: ParentSettings['iconSize']) => {
    switch (size) {
      case 'normal':
        return 'text-2xl sm:text-3xl w-10 h-10 sm:w-11 sm:h-11';
      case 'large':
        return 'text-3xl sm:text-4xl w-11 h-11 sm:w-13 sm:h-13';
      case 'xlarge':
        return 'text-4xl sm:text-5xl w-13 h-13 sm:w-16 sm:h-16';
      default:
        return 'text-3xl sm:text-4xl w-11 h-11 sm:w-13 sm:h-13';
    }
  };

  // Visible apps for the child (excludes hidden apps)
  const visibleApps = apps.filter((a) => !a.isHidden);

  // If bedtime active
  if (isBedtimeActive()) {
    return (
      <BedtimeLockScreen
        kidName={settings.kidName}
        onUnlockParent={() => {
          setPinModalMode('bedtime_override');
          setShowPinModal(true);
        }}
        soundEnabled={settings.soundEnabled}
      />
    );
  }

  const handleWallpaperClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, input, select, textarea, a, video')) return;

    const newSparkle = {
      id: Date.now() + Math.random(),
      x: e.clientX,
      y: e.clientY,
    };
    setBgSparkles((prev) => [...prev.slice(-6), newSparkle]);
    playSparkleSound(settings.soundEnabled);

    setTimeout(() => {
      setBgSparkles((prev) => prev.filter((s) => s.id !== newSparkle.id));
    }, 700);
  };

  return (
    <div 
      onClick={handleWallpaperClick}
      className={`fixed inset-0 select-none overflow-hidden flex flex-col ${getThemeClass(settings.theme)} transition-colors duration-500`}
    >
      {/* Interactive Wallpaper Sparkles */}
      {bgSparkles.map((s) => (
        <span
          key={s.id}
          style={{ left: s.x, top: s.y }}
          className="fixed pointer-events-none text-3xl animate-ping -translate-x-1/2 -translate-y-1/2 z-30 select-none"
        >
          ✨
        </span>
      ))}

      {/* Sparkle decorative background elements */}
      <div className="absolute top-10 left-5 text-2xl opacity-40 animate-float pointer-events-none">✨</div>
      <div className="absolute top-40 right-6 text-3xl opacity-30 animate-pulse-gentle pointer-events-none">🦄</div>
      <div className="absolute bottom-20 left-8 text-2xl opacity-40 animate-float pointer-events-none">⭐</div>
      <div className="absolute bottom-32 right-10 text-2xl opacity-30 animate-pulse-gentle pointer-events-none">💖</div>

      {/* Android-style Status Bar */}
      <header className="flex items-center justify-between px-4 py-2 bg-black/10 backdrop-blur-sm border-b border-black/5 z-20">
        <div className="flex items-center gap-2 text-xs font-black tracking-wide">
          <span className="text-sm font-bold">{timeStr || '10:30'}</span>
          <span className="opacity-60 hidden sm:inline">•</span>
          <span className="opacity-75 hidden sm:inline capitalize">{dateStr}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 opacity-80 text-xs font-bold">
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>

          {/* Parental Access Button (Protected with PIN) */}
          <button
            onClick={() => {
              playPopSound(settings.soundEnabled);
              setPinModalMode('dashboard');
              setShowPinModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow transition transform active:scale-90"
            title="Zona de Padres (Ocultar/Bloquear apps)"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Padres</span>
          </button>
        </div>
      </header>

      {/* Main Launcher Home Content */}
      <main className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 sm:py-3 flex flex-col max-w-5xl mx-auto w-full z-10">
        {/* Kid Greeting & Clock Widget (Compact for 1024x768) */}
        <section className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 p-3 sm:p-3.5 rounded-2xl bg-white/75 backdrop-blur-md shadow-md border-2 border-white/80 mb-2.5 transition">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-pink-400 to-rose-400 flex items-center justify-center text-2xl sm:text-3xl shadow-md animate-bounce shrink-0">
              {settings.avatarEmoji || '👑'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-800">
                  ¡Hola, {settings.kidName}!
                </h1>
                <Sparkles className="w-4 h-4 text-amber-500 animate-sparkle" />
              </div>
              <p className="text-[11px] text-slate-500 font-bold capitalize">
                {dateStr}
              </p>
            </div>
          </div>

          {/* Quick Mood Pill */}
          <div className="flex items-center gap-1 bg-pink-50/80 p-1 rounded-xl border border-pink-200">
            {['👑 Feliz', '🦄 Mágica', '⭐ Genial', '🎨 Creativa'].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setSelectedDailyMood(m);
                  playSparkleSound(settings.soundEnabled);
                  confetti({ particleCount: 30, spread: 50, origin: { y: 0.3 } });
                }}
                className={`px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition ${
                  selectedDailyMood === m
                    ? 'bg-pink-500 text-white shadow-sm scale-105'
                    : 'text-pink-700 hover:bg-pink-100'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </section>

        {/* App Grid */}
        <div className={`grid ${getGridClass(settings.iconSize)} w-full pb-6`}>
          {visibleApps.map((app) => (
            <button
              key={app.id}
              onClick={() => handleAppClick(app)}
              className={`flex flex-col items-center justify-center gap-2 bg-white/85 hover:bg-white backdrop-blur-md border-3 border-white/90 shadow-xl transition-all duration-200 transform hover:scale-103 active:scale-95 cursor-pointer relative group ${getTileSizeClass(
                settings.iconSize
              )}`}
            >
              {/* Lock Indicator if PIN-locked */}
              {app.isLockedWithPin && (
                <div className="absolute top-2 right-2 p-1.5 rounded-full bg-amber-400 text-amber-950 shadow-md">
                  <Lock className="w-3.5 h-3.5" />
                </div>
              )}

              {/* Badge */}
              {app.customBadge && !app.isLockedWithPin && (
                <span className="absolute top-2 right-2 text-[9px] font-black px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 shadow-sm">
                  {app.customBadge}
                </span>
              )}

              {/* Big App Icon */}
              <div
                className={`rounded-3xl bg-gradient-to-tr ${app.color} text-white flex items-center justify-center shadow-md transform group-hover:scale-110 transition duration-200 ${getIconSizeClass(
                  settings.iconSize
                )}`}
              >
                {app.iconValue}
              </div>

              {/* App Label */}
              <span className="font-black text-sm sm:text-base text-slate-800 text-center tracking-tight line-clamp-1">
                {app.name}
              </span>
            </button>
          ))}
        </div>
      </main>

      {/* Floating Bottom Quick Action */}
      <footer className="px-4 py-3 bg-white/40 backdrop-blur-md border-t border-white/40 flex items-center justify-between z-20">
        <button
          onClick={() => {
            setActiveMiniApp('paint');
            playSparkleSound(settings.soundEnabled);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-black text-xs shadow-lg active:scale-95 transition"
        >
          <span>🎨 Pizarra de Dibujo</span>
        </button>

        <button
          onClick={() => {
            setActiveMiniApp('pet');
            playSparkleSound(settings.soundEnabled);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400 text-white font-black text-xs shadow-md active:scale-95 transition"
        >
          <span>🐾 Mi Mascota Mágica</span>
        </button>
      </footer>

      {/* PIN Verification Modal */}
      {showPinModal && (
        <ParentPinModal
          correctPin={settings.pin}
          recoveryQuestion={settings.recoveryQuestion}
          recoveryAnswer={settings.recoveryAnswer}
          soundEnabled={settings.soundEnabled}
          title={
            pinModalMode === 'dashboard'
              ? 'Zona de Padres'
              : pinModalMode === 'unlock_app'
              ? `Desbloquear ${pendingLockedApp?.name || 'App'}`
              : 'Desbloquear Hora de Dormir'
          }
          description={
            pinModalMode === 'dashboard'
              ? 'Ingresa tu PIN de 4 dígitos para ocultar/bloquear apps y cambiar ajustes.'
              : 'Esta aplicación requiere autorización de los padres con PIN.'
          }
          onSuccess={handlePinSuccess}
          onClose={() => {
            setShowPinModal(false);
            setPendingLockedApp(null);
          }}
        />
      )}

      {/* Parental Control Dashboard */}
      {showDashboard && (
        <ParentDashboardModal
          apps={apps}
          settings={settings}
          onUpdateApps={handleUpdateApps}
          onUpdateSettings={handleUpdateSettings}
          onLaunchApp={launchApp}
          onClose={() => setShowDashboard(false)}
          onOpenApkGuide={() => {
            setShowDashboard(false);
            setShowApkGuide(true);
          }}
        />
      )}

      {/* APK & Android 11 Guide Modal */}
      {showApkGuide && (
        <ApkGuideModal
          onClose={() => setShowApkGuide(false)}
          soundEnabled={settings.soundEnabled}
        />
      )}

      {/* Active Kid Mini Apps */}
      {activeMiniApp === 'paint' && (
        <KidPaintApp
          onClose={() => setActiveMiniApp(null)}
          soundEnabled={settings.soundEnabled}
        />
      )}

      {activeMiniApp === 'music' && (
        <KidMusicApp
          onClose={() => setActiveMiniApp(null)}
          soundEnabled={settings.soundEnabled}
        />
      )}

      {activeMiniApp === 'camera' && (
        <KidCameraApp
          onClose={() => setActiveMiniApp(null)}
          soundEnabled={settings.soundEnabled}
        />
      )}

      {activeMiniApp === 'games' && (
        <KidGamesApp
          onClose={() => setActiveMiniApp(null)}
          soundEnabled={settings.soundEnabled}
        />
      )}

      {activeMiniApp === 'stories' && (
        <KidStoriesApp
          onClose={() => setActiveMiniApp(null)}
          soundEnabled={settings.soundEnabled}
        />
      )}

      {activeMiniApp === 'calc' && (
        <KidCalculatorApp
          onClose={() => setActiveMiniApp(null)}
          soundEnabled={settings.soundEnabled}
        />
      )}

      {activeMiniApp === 'contacts' && (
        <KidContactsApp
          contacts={settings.emergencyContacts}
          onClose={() => setActiveMiniApp(null)}
          soundEnabled={settings.soundEnabled}
        />
      )}

      {activeMiniApp === 'routine' && (
        <KidRoutineApp
          onClose={() => setActiveMiniApp(null)}
          soundEnabled={settings.soundEnabled}
        />
      )}

      {activeMiniApp === 'diary' && (
        <KidDiaryApp
          onClose={() => setActiveMiniApp(null)}
          soundEnabled={settings.soundEnabled}
        />
      )}

      {activeMiniApp === 'pet' && (
        <KidPetApp
          onClose={() => setActiveMiniApp(null)}
          soundEnabled={settings.soundEnabled}
        />
      )}

      {activeMiniApp === 'stickers' && (
        <KidStickersApp
          onClose={() => setActiveMiniApp(null)}
          soundEnabled={settings.soundEnabled}
        />
      )}

      {activeMiniApp === 'walkie' && (
        <KidWalkieApp
          onClose={() => setActiveMiniApp(null)}
          soundEnabled={settings.soundEnabled}
        />
      )}

      {activeMiniApp === 'dj' && (
        <KidDjApp
          onClose={() => setActiveMiniApp(null)}
          soundEnabled={settings.soundEnabled}
        />
      )}
    </div>
  );
}
