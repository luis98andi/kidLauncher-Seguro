import React from 'react';
import { X, Smartphone, Download, ExternalLink, CheckCircle2, ShieldCheck, Sparkles, FileCode, Lock } from 'lucide-react';
import { playPopSound, playSparkleSound } from '../utils/sound';

interface ApkGuideModalProps {
  onClose: () => void;
  soundEnabled: boolean;
}

export const ApkGuideModal: React.FC<ApkGuideModalProps> = ({ onClose, soundEnabled }) => {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const copyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    alert('¡Enlace copiado al portapapeles!');
    playPopSound(soundEnabled);
  };

  const downloadOfflinePackage = () => {
    playSparkleSound(soundEnabled);
    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KidLauncher Seguro</title>
</head>
<body style="font-family:sans-serif; text-align:center; padding:40px; background:#fdf2f8;">
  <h1>👑 KidLauncher Seguro - Android 11</h1>
  <p>Accede a tu Launcher desde aquí:</p>
  <a href="${currentUrl}" style="display:inline-block; background:#ec4899; color:white; padding:15px 30px; border-radius:30px; text-decoration:none; font-weight:bold; font-size:18px;">
    Abrir Launcher para la Niña 💖
  </a>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'KidLauncher-Acceso-Directo.html';
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-5 select-none">
      <div className="w-full max-w-xl max-h-[90vh] rounded-3xl bg-white shadow-2xl flex flex-col overflow-hidden border-4 border-emerald-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-md">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-6 h-6 text-yellow-300" />
            <div>
              <h2 className="text-xl font-black">Configurar como Launcher Predeterminado</h2>
              <p className="text-xs text-emerald-100">Instrucciones exactas para Android 11</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 text-slate-800">
          <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-xs font-medium text-purple-950 leading-relaxed">
            <strong className="text-sm font-black text-purple-900 block mb-1">
              🎯 Tienes toda la razón en tu duda técnica:
            </strong>
            Android exige un permiso especial nativo (<code>android.intent.category.HOME</code>) para que una app aparezca en los <em>"Ajustes de Android -&gt; Aplicación de Inicio Predeterminada"</em>. Para lograr que la niña no pueda salir de este launcher, tienes 2 métodos:
          </div>

          {/* Solution 1: Android 11 App Pinning / Kiosk Mode */}
          <div className="p-4 rounded-2xl bg-white border-2 border-emerald-500 shadow-sm flex flex-col gap-2.5">
            <div className="flex items-center gap-1.5 text-emerald-700">
              <Lock className="w-5 h-5" />
              <h3 className="font-extrabold text-base text-slate-900">
                Método 1: Bloquear la pantalla con "Fijar Aplicación" (Nativo de Android 11)
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Android 11 incluye una función nativa para fijar una app y evitar que los niños salgan o presionen el botón de inicio:
            </p>
            <ol className="text-xs text-slate-600 list-decimal list-inside space-y-1.5 leading-relaxed bg-emerald-50/50 p-3 rounded-xl">
              <li>Abre <strong>KidLauncher</strong> en tu teléfono.</li>
              <li>Abre las aplicaciones recientes (deslizando desde abajo o tocando el botón de cuadritos ▢).</li>
              <li>Toca el <strong>icono de KidLauncher</strong> arriba de la tarjeta y selecciona <strong>"Fijar" / "Pin"</strong>.</li>
              <li>¡Listo! El botón de Inicio queda deshabilitado. La niña no podrá salir de este Launcher sin que tú ingreses la contraseña del teléfono.</li>
            </ol>
          </div>

          {/* Solution 2: Native AndroidManifest.xml for full APK Launcher */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-wider self-start">
              Método 2: Para Compilación Nativa (Android Studio / Capacitor)
            </span>
            <h3 className="font-extrabold text-sm text-slate-900">
              Código `AndroidManifest.xml` para Launcher Predeterminado
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Si compilas este proyecto con Capacitor / Cordova para generar el archivo APK ejecutable en Android Studio, incluye la siguiente categoría en el archivo <code>AndroidManifest.xml</code>:
            </p>

            <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl text-[11px] font-mono overflow-x-auto">
{`<intent-filter>
  <action android:name="android.intent.action.MAIN" />
  <category android:name="android.intent.category.HOME" />
  <category android:name="android.intent.category.DEFAULT" />
</intent-filter>`}
            </pre>
            <p className="text-[11px] text-slate-500">
              Esto le indica a Android 11 que la app es una <strong>Home Application (Launcher oficial)</strong>.
            </p>
          </div>

          {/* Security Summary */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-2">
            <h4 className="font-black text-xs text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Resumen de Seguridad Parental:</span>
            </h4>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>🔒 <strong>PIN Parental por defecto:</strong> 1234.</li>
              <li>🙈 <strong>Apps Ocultas por defecto:</strong> Ajustes, Play Store y Navegador.</li>
              <li>🎨 <strong>Apps de la niña:</strong> Pizarra, Piano, Fotos, Minijuegos, Cuentos, Rutina y Llamada a Padres.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow active:scale-95 transition"
          >
            Entendido, ¡gracias!
          </button>
        </div>
      </div>
    </div>
  );
};
