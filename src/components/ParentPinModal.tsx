import React, { useState } from 'react';
import { ShieldCheck, Lock, X, AlertCircle, KeyRound, HelpCircle } from 'lucide-react';
import { playPopSound, playErrorSound, playSuccessSound } from '../utils/sound';

interface ParentPinModalProps {
  correctPin: string;
  recoveryQuestion: string;
  recoveryAnswer: string;
  soundEnabled: boolean;
  title?: string;
  description?: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const ParentPinModal: React.FC<ParentPinModalProps> = ({
  correctPin,
  recoveryQuestion,
  recoveryAnswer,
  soundEnabled,
  title = 'Zona de Padres',
  description = 'Ingresa el PIN de 4 dígitos para acceder a los controles parentales y apps ocultas.',
  onSuccess,
  onClose,
}) => {
  const [pin, setPin] = useState('');
  const [isError, setIsError] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryInput, setRecoveryInput] = useState('');
  const [recoveryError, setRecoveryError] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    playPopSound(soundEnabled);
    const nextPin = pin + digit;
    setPin(nextPin);
    setIsError(false);

    if (nextPin.length === 4) {
      if (nextPin === correctPin) {
        playSuccessSound(soundEnabled);
        setTimeout(() => {
          onSuccess();
        }, 150);
      } else {
        playErrorSound(soundEnabled);
        setIsError(true);
        setTimeout(() => {
          setPin('');
        }, 600);
      }
    }
  };

  const handleBackspace = () => {
    playPopSound(soundEnabled);
    setPin((prev) => prev.slice(0, -1));
    setIsError(false);
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (recoveryInput.trim().toLowerCase() === recoveryAnswer.trim().toLowerCase()) {
      playSuccessSound(soundEnabled);
      alert(`¡Respuesta correcta! Tu PIN actual es: ${correctPin}`);
      setShowRecovery(false);
      setRecoveryError(false);
    } else {
      playErrorSound(soundEnabled);
      setRecoveryError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 select-none">
      <div className={`w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border-4 ${
        isError ? 'border-rose-500 animate-wiggle' : 'border-purple-200'
      } transition duration-200`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500">Protección con Contraseña</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!showRecovery ? (
          <div className="flex flex-col items-center mt-4">
            <p className="text-center text-xs text-slate-600 mb-4 px-2">
              {description}
            </p>

            {/* PIN Dots */}
            <div className="flex items-center gap-4 my-2">
              {[0, 1, 2, 3].map((index) => {
                const filled = pin.length > index;
                return (
                  <div
                    key={index}
                    className={`w-5 h-5 rounded-full transition-all duration-200 ${
                      isError
                        ? 'bg-rose-500 scale-110'
                        : filled
                        ? 'bg-purple-600 scale-125 shadow-md'
                        : 'border-2 border-purple-200 bg-purple-50'
                    }`}
                  />
                );
              })}
            </div>

            {isError && (
              <span className="text-xs font-bold text-rose-500 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> PIN incorrecto. Intenta de nuevo.
              </span>
            )}

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2.5 w-full mt-5 max-w-[260px]">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleDigit(digit)}
                  className="h-14 rounded-2xl bg-slate-100 hover:bg-purple-50 active:bg-purple-200 text-slate-800 active:scale-95 font-black text-2xl shadow-sm transition border border-slate-200 flex items-center justify-center"
                >
                  {digit}
                </button>
              ))}

              <button
                onClick={() => {
                  setPin('');
                  setShowRecovery(true);
                }}
                className="h-14 rounded-2xl bg-slate-50 text-slate-500 hover:text-purple-700 font-bold text-xs flex flex-col items-center justify-center"
                title="Recuperar PIN"
              >
                <HelpCircle className="w-4 h-4 mb-0.5" />
                <span>¿Olvidaste?</span>
              </button>

              <button
                onClick={() => handleDigit('0')}
                className="h-14 rounded-2xl bg-slate-100 hover:bg-purple-50 active:bg-purple-200 text-slate-800 active:scale-95 font-black text-2xl shadow-sm transition border border-slate-200 flex items-center justify-center"
              >
                0
              </button>

              <button
                onClick={handleBackspace}
                className="h-14 rounded-2xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 active:scale-95 font-bold text-sm shadow-sm transition border border-slate-200 flex items-center justify-center"
                title="Borrar dígito"
              >
                ⌫
              </button>
            </div>

            <div className="mt-4 text-center">
              <span className="text-[11px] text-slate-400 font-medium">
                PIN inicial por defecto: <strong className="text-slate-600 font-bold">1234</strong>
              </span>
            </div>
          </div>
        ) : (
          /* Recovery Mode */
          <form onSubmit={handleRecoverySubmit} className="flex flex-col gap-4 mt-4">
            <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100">
              <p className="text-xs font-bold text-purple-900 mb-1">Pregunta de Seguridad:</p>
              <p className="text-sm font-black text-purple-950">{recoveryQuestion}</p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">Tu Respuesta Secreta:</label>
              <input
                type="text"
                value={recoveryInput}
                onChange={(e) => {
                  setRecoveryInput(e.target.value);
                  setRecoveryError(false);
                }}
                placeholder="Escribe la respuesta..."
                className="w-full p-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm font-medium"
              />
              {recoveryError && (
                <span className="text-xs font-bold text-rose-500">Respuesta incorrecta.</span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowRecovery(false)}
                className="flex-1 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Volver al PIN
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow"
              >
                Verificar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
