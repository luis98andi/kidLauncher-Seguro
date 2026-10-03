import React, { useState } from 'react';
import { Download, Sparkles, Smartphone, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  onOpenApkGuide?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ onOpenApkGuide }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as standalone PWA launcher
  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-700 text-xs font-bold">
        <Check className="w-3.5 h-3.5" />
        <span>Launcher Instalado</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Direct PWA / Android Install button */}
        {isInstallable && (
          <button
            onClick={install}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-xs shadow-md active:scale-95 transition transform animate-pulse"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Instalar como App</span>
          </button>
        )}

        {/* iOS Fallback */}
        {isIOS && !isInstallable && (
          <button
            onClick={() => setShowIOSGuide(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-700 font-bold text-xs transition"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Instalar en Pantalla</span>
          </button>
        )}

        {/* APK / Android 11 Info Guide Button */}
        {onOpenApkGuide && (
          <button
            onClick={onOpenApkGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-purple-700 font-black text-xs shadow-sm border border-purple-200 transition active:scale-95"
          >
            <Smartphone className="w-3.5 h-3.5 text-purple-600" />
            <span>Guía APK / Android 11</span>
          </button>
        )}
      </div>

      {/* iOS Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border-4 border-pink-200">
            <h3 className="text-lg font-black text-slate-900">Instalar Launcher en Pantalla</h3>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              1. Toca el botón <strong>Compartir</strong> (icono de cuadrado con flecha hacia arriba).<br />
              2. Baja y selecciona <strong>"Añadir a pantalla de inicio"</strong>.<br />
              3. ¡Listo! Se abrirá a pantalla completa como una app nativa.
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-2xl bg-pink-500 py-2.5 text-sm font-bold text-white hover:bg-pink-600 shadow transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
