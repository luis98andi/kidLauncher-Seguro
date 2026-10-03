import React from 'react';
import { ArrowLeft, Phone, Heart, Star, Shield } from 'lucide-react';
import { EmergencyContact } from '../../types';
import { playSparkleSound, playPopSound } from '../../utils/sound';
import confetti from 'canvas-confetti';

interface KidContactsAppProps {
  contacts: EmergencyContact[];
  onClose: () => void;
  soundEnabled: boolean;
}

export const KidContactsApp: React.FC<KidContactsAppProps> = ({ contacts, onClose, soundEnabled }) => {
  const handleCall = (contact: EmergencyContact) => {
    playSparkleSound(soundEnabled);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    window.location.href = `tel:${contact.phone}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-sky-50 text-slate-800 select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 text-white shadow-md">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition text-white font-bold"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Salir</span>
        </button>

        <div className="flex items-center gap-2">
          <Phone className="w-6 h-6 text-yellow-300 animate-bounce" />
          <h1 className="text-xl font-bold tracking-wide">Llamar a Familia</h1>
        </div>

        <div className="w-12" />
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
        <div className="w-full max-w-sm flex flex-col gap-4">
          <div className="text-center p-3 bg-white/80 rounded-2xl border border-sky-100 shadow-sm">
            <p className="text-sm font-bold text-sky-900">
              Toca la foto para llamar a tu familia de inmediato 💖
            </p>
          </div>

          {contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => handleCall(contact)}
              className="p-4 rounded-3xl bg-white hover:bg-sky-50 border-3 border-sky-200 shadow-xl flex items-center justify-between gap-4 transition transform hover:scale-102 active:scale-95 text-left"
            >
              <div className="flex items-center gap-3">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${contact.color} text-white flex items-center justify-center text-3xl shadow-md`}>
                  {contact.avatarEmoji}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">{contact.name}</h3>
                  <span className="text-xs font-bold text-sky-600 bg-sky-100 px-2.5 py-0.5 rounded-full">
                    {contact.relation}
                  </span>
                </div>
              </div>

              <div className="w-13 h-13 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg active:scale-90 transition">
                <Phone className="w-6 h-6" />
              </div>
            </button>
          ))}

          {contacts.length === 0 && (
            <div className="text-center p-8 bg-white rounded-3xl border border-dashed border-sky-300">
              <p className="text-sm text-slate-500">Tus papás pueden agregar números de teléfono en los Ajustes Parentales.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
