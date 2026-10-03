import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Delete } from 'lucide-react';
import { playPopSound, playSparkleSound, playSuccessSound } from '../../utils/sound';
import confetti from 'canvas-confetti';

interface KidCalculatorAppProps {
  onClose: () => void;
  soundEnabled: boolean;
}

export const KidCalculatorApp: React.FC<KidCalculatorAppProps> = ({ onClose, soundEnabled }) => {
  const [display, setDisplay] = useState('0');
  const [prevVal, setPrevVal] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [justCalculated, setJustCalculated] = useState(false);

  const handleDigit = (digit: string) => {
    playPopSound(soundEnabled);
    if (display === '0' || justCalculated) {
      setDisplay(digit);
      setJustCalculated(false);
    } else {
      if (display.length < 9) {
        setDisplay(display + digit);
      }
    }
  };

  const handleOp = (op: string) => {
    playSparkleSound(soundEnabled);
    setPrevVal(parseFloat(display));
    setOperation(op);
    setDisplay('0');
  };

  const calculate = () => {
    if (prevVal === null || operation === null) return;
    const current = parseFloat(display);
    let result = 0;

    switch (operation) {
      case '+':
        result = prevVal + current;
        break;
      case '-':
        result = prevVal - current;
        break;
      case '×':
        result = prevVal * current;
        break;
      case '÷':
        result = current === 0 ? 0 : prevVal / current;
        break;
      default:
        return;
    }

    playSuccessSound(soundEnabled);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    setDisplay(String(Math.round(result * 100) / 100));
    setPrevVal(null);
    setOperation(null);
    setJustCalculated(true);
  };

  const clear = () => {
    playPopSound(soundEnabled);
    setDisplay('0');
    setPrevVal(null);
    setOperation(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-emerald-50 text-slate-800 select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition text-white font-bold"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Salir</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-2xl">🧮</span>
          <h1 className="text-xl font-bold tracking-wide">Calculadora Kid</h1>
        </div>

        <div className="w-12" />
      </div>

      {/* Calculator Body */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-xs bg-white p-5 rounded-3xl shadow-2xl border-4 border-emerald-200 flex flex-col gap-4">
          {/* Display */}
          <div className="bg-emerald-900 text-white p-4 rounded-2xl flex flex-col items-end justify-center min-h-[90px] shadow-inner border-2 border-emerald-700">
            {prevVal !== null && (
              <span className="text-xs text-emerald-300 font-mono">
                {prevVal} {operation}
              </span>
            )}
            <span className="text-4xl font-black font-mono tracking-wider truncate w-full text-right text-yellow-300">
              {display}
            </span>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-4 gap-2.5">
            <button
              onClick={clear}
              className="col-span-2 py-3 rounded-2xl bg-rose-400 hover:bg-rose-500 font-extrabold text-white text-lg shadow active:scale-95 transition"
            >
              Borrar (C)
            </button>
            <button
              onClick={() => handleOp('÷')}
              className="py-3 rounded-2xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-black text-xl shadow active:scale-95 transition"
            >
              ÷
            </button>
            <button
              onClick={() => handleOp('×')}
              className="py-3 rounded-2xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-black text-xl shadow active:scale-95 transition"
            >
              ×
            </button>

            {['7', '8', '9'].map((d) => (
              <button
                key={d}
                onClick={() => handleDigit(d)}
                className="py-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-black text-2xl shadow active:scale-95 transition border border-emerald-100"
              >
                {d}
              </button>
            ))}
            <button
              onClick={() => handleOp('-')}
              className="py-3.5 rounded-2xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-black text-2xl shadow active:scale-95 transition"
            >
              -
            </button>

            {['4', '5', '6'].map((d) => (
              <button
                key={d}
                onClick={() => handleDigit(d)}
                className="py-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-black text-2xl shadow active:scale-95 transition border border-emerald-100"
              >
                {d}
              </button>
            ))}
            <button
              onClick={() => handleOp('+')}
              className="py-3.5 rounded-2xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-black text-2xl shadow active:scale-95 transition"
            >
              +
            </button>

            {['1', '2', '3'].map((d) => (
              <button
                key={d}
                onClick={() => handleDigit(d)}
                className="py-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-black text-2xl shadow active:scale-95 transition border border-emerald-100"
              >
                {d}
              </button>
            ))}
            <button
              onClick={calculate}
              className="row-span-2 py-3.5 rounded-2xl bg-gradient-to-b from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-amber-950 font-black text-3xl shadow-lg active:scale-95 transition flex items-center justify-center"
            >
              =
            </button>

            <button
              onClick={() => handleDigit('0')}
              className="col-span-2 py-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-black text-2xl shadow active:scale-95 transition border border-emerald-100"
            >
              0
            </button>
            <button
              onClick={() => handleDigit('.')}
              className="py-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-black text-2xl shadow active:scale-95 transition border border-emerald-100"
            >
              .
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
