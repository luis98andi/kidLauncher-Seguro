import React, { useState } from 'react';
import { 
  X, Eye, EyeOff, Lock, Unlock, Plus, Trash2, Settings, ShieldCheck, 
  Clock, Moon, Palette, Phone, Smartphone, Sparkles, RefreshCw, Key,
  CheckCircle2, Search, ExternalLink, Play
} from 'lucide-react';
import { AppItem, ParentSettings, EmergencyContact, ThemeType, IconSizeType } from '../types';
import { playPopSound, playSparkleSound, playSuccessSound } from '../utils/sound';
import { INITIAL_APPS } from '../utils/storage';
import confetti from 'canvas-confetti';

interface ParentDashboardModalProps {
  apps: AppItem[];
  settings: ParentSettings;
  onUpdateApps: (apps: AppItem[]) => void;
  onUpdateSettings: (settings: ParentSettings) => void;
  onLaunchApp: (app: AppItem) => void;
  onClose: () => void;
  onOpenApkGuide: () => void;
}

const THEMES: { id: ThemeType; name: string; icon: string; preview: string }[] = [
  { id: 'pink-princess', name: 'Rosa Princesa', icon: '👑', preview: 'from-pink-400 to-rose-300' },
  { id: 'unicorn-magic', name: 'Unicornio Mágico', icon: '🦄', preview: 'from-fuchsia-400 to-purple-400' },
  { id: 'galaxy-night', name: 'Galaxia Brillante', icon: '🌌', preview: 'from-indigo-600 to-purple-800' },
  { id: 'mint-pastel', name: 'Menta Pastel', icon: '🍃', preview: 'from-teal-300 to-emerald-400' },
  { id: 'sunshine-candy', name: 'Sol y Dulces', icon: '☀️', preview: 'from-amber-300 to-yellow-400' },
];

export const ParentDashboardModal: React.FC<ParentDashboardModalProps> = ({
  apps,
  settings,
  onUpdateApps,
  onUpdateSettings,
  onLaunchApp,
  onClose,
  onOpenApkGuide,
}) => {
  const [activeTab, setActiveTab] = useState<'apps' | 'hidden' | 'time' | 'customize' | 'security' | 'apk'>('apps');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // New app modal state
  const [isAddingApp, setIsAddingApp] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppEmoji, setNewAppEmoji] = useState('🌟');
  const [newAppUrl, setNewAppUrl] = useState('');
  const [newAppCategory, setNewAppCategory] = useState<AppItem['category']>('divertido');

  // Change PIN state
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Recovery Q&A state
  const [recoveryQuestion, setRecoveryQuestion] = useState(settings.recoveryQuestion);
  const [recoveryAnswer, setRecoveryAnswer] = useState(settings.recoveryAnswer);
  const [savedSettingsSuccess, setSavedSettingsSuccess] = useState(false);

  // New Contact State
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactRelation, setContactRelation] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmoji, setContactEmoji] = useState('👩');

  const toggleHideApp = (appId: string) => {
    playPopSound(settings.soundEnabled);
    const updated = apps.map((app) =>
      app.id === appId ? { ...app, isHidden: !app.isHidden } : app
    );
    onUpdateApps(updated);
  };

  const toggleLockApp = (appId: string) => {
    playPopSound(settings.soundEnabled);
    const updated = apps.map((app) =>
      app.id === appId ? { ...app, isLockedWithPin: !app.isLockedWithPin } : app
    );
    onUpdateApps(updated);
  };

  const deleteApp = (appId: string) => {
    if (window.confirm('¿Deseas eliminar este acceso directo?')) {
      playPopSound(settings.soundEnabled);
      const updated = apps.filter((app) => app.id !== appId);
      onUpdateApps(updated);
    }
  };

  const handleCreateApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim()) return;

    const newApp: AppItem = {
      id: `app-custom-${Date.now()}`,
      name: newAppName.trim(),
      iconType: 'emoji',
      iconValue: newAppEmoji,
      color: 'from-pink-400 to-purple-500',
      category: newAppCategory,
      isHidden: false,
      isLockedWithPin: false,
      url: newAppUrl.trim() || undefined,
      customBadge: 'NUEVO',
      order: apps.length + 1,
    };

    onUpdateApps([...apps, newApp]);
    setIsAddingApp(false);
    setNewAppName('');
    setNewAppUrl('');
    playSuccessSound(settings.soundEnabled);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
  };

  const handleRestoreDefaultApps = () => {
    if (window.confirm('¿Restablecer la lista de aplicaciones original?')) {
      onUpdateApps(INITIAL_APPS);
      playSuccessSound(settings.soundEnabled);
    }
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (oldPin !== settings.pin) {
      setPinChangeMsg({ text: 'El PIN actual no coincide.', isError: true });
      return;
    }
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinChangeMsg({ text: 'El nuevo PIN debe tener exactamente 4 números.', isError: true });
      return;
    }
    if (newPin !== confirmPin) {
      setPinChangeMsg({ text: 'La confirmación del nuevo PIN no coincide.', isError: true });
      return;
    }

    onUpdateSettings({ ...settings, pin: newPin });
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
    setPinChangeMsg({ text: '¡PIN cambiado con éxito!', isError: false });
    playSuccessSound(settings.soundEnabled);
  };

  const handleSaveSecurityQA = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      recoveryQuestion,
      recoveryAnswer,
    });
    setSavedSettingsSuccess(true);
    setTimeout(() => setSavedSettingsSuccess(false), 2000);
    playSuccessSound(settings.soundEnabled);
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) return;

    const newContact: EmergencyContact = {
      id: `contact-${Date.now()}`,
      name: contactName.trim(),
      relation: contactRelation.trim() || 'Familiar',
      phone: contactPhone.trim(),
      avatarEmoji: contactEmoji,
      color: 'from-rose-500 to-pink-400',
    };

    onUpdateSettings({
      ...settings,
      emergencyContacts: [...settings.emergencyContacts, newContact],
    });

    setIsAddingContact(false);
    setContactName('');
    setContactPhone('');
    setContactRelation('');
    playSuccessSound(settings.soundEnabled);
  };

  const deleteContact = (id: string) => {
    onUpdateSettings({
      ...settings,
      emergencyContacts: settings.emergencyContacts.filter((c) => c.id !== id),
    });
    playPopSound(settings.soundEnabled);
  };

  const filteredApps = apps.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === 'all'
        ? true
        : filterCategory === 'hidden'
        ? app.isHidden
        : filterCategory === 'locked'
        ? app.isLockedWithPin
        : app.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const hiddenApps = apps.filter((a) => a.isHidden);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-2 sm:p-4 select-none">
      <div className="w-full max-w-2xl h-[90vh] rounded-3xl bg-white shadow-2xl flex flex-col overflow-hidden border-4 border-purple-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-purple-700 via-indigo-700 to-pink-600 text-white shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl shadow-inner">
              🛡️
            </div>
            <div>
              <h2 className="text-xl font-black tracking-wide">Panel de Control Parental</h2>
              <p className="text-xs text-purple-200 font-medium">Gestión de aplicaciones y seguridad</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-purple-50/80 border-b border-purple-100 overflow-x-auto">
          <button
            onClick={() => { setActiveTab('apps'); playPopSound(settings.soundEnabled); }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 ${
              activeTab === 'apps' ? 'bg-purple-600 text-white shadow' : 'text-purple-800 hover:bg-purple-100'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Ocultar / Bloquear Apps</span>
          </button>

          <button
            onClick={() => { setActiveTab('hidden'); playPopSound(settings.soundEnabled); }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 ${
              activeTab === 'hidden' ? 'bg-purple-600 text-white shadow' : 'text-purple-800 hover:bg-purple-100'
            }`}
          >
            <EyeOff className="w-4 h-4" />
            <span>Bóveda Oculta ({hiddenApps.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('time'); playPopSound(settings.soundEnabled); }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 ${
              activeTab === 'time' ? 'bg-purple-600 text-white shadow' : 'text-purple-800 hover:bg-purple-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Tiempo y Noche</span>
          </button>

          <button
            onClick={() => { setActiveTab('customize'); playPopSound(settings.soundEnabled); }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 ${
              activeTab === 'customize' ? 'bg-purple-600 text-white shadow' : 'text-purple-800 hover:bg-purple-100'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Personalización</span>
          </button>

          <button
            onClick={() => { setActiveTab('security'); playPopSound(settings.soundEnabled); }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 ${
              activeTab === 'security' ? 'bg-purple-600 text-white shadow' : 'text-purple-800 hover:bg-purple-100'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Cambiar PIN</span>
          </button>

          <button
            onClick={() => { setActiveTab('apk'); playPopSound(settings.soundEnabled); }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 ${
              activeTab === 'apk' ? 'bg-emerald-600 text-white shadow' : 'text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android 11 / APK</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
          {/* TAB 1: Apps Manager (Hide & Lock) */}
          {activeTab === 'apps' && (
            <div className="flex flex-col gap-4">
              <div className="p-3.5 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl border border-purple-200 text-purple-950 text-xs font-medium leading-relaxed flex items-start gap-2.5">
                <span className="text-xl flex-shrink-0">💡</span>
                <div>
                  <strong className="font-bold">Control total de aplicaciones:</strong><br />
                  • <strong>Ocultar (🙈):</strong> La aplicación desaparece por completo de la pantalla de la niña.<br />
                  • <strong>Bloquear (🔒):</strong> La niña verá el icono pero requerirá tu PIN de 4 dígitos para abrirse.
                </div>
              </div>

              {/* Actions & Filters */}
              <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar aplicación..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsAddingApp(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow active:scale-95 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Agregar App / Enlace</span>
                  </button>
                  <button
                    onClick={handleRestoreDefaultApps}
                    className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold"
                    title="Restablecer apps por defecto"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add Custom App Form */}
              {isAddingApp && (
                <form onSubmit={handleCreateApp} className="p-4 bg-white rounded-2xl border-2 border-purple-300 shadow-lg flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-purple-900 text-sm">Crear Nuevo Acceso Directo o Web App</h4>
                    <button type="button" onClick={() => setIsAddingApp(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700">Nombre de la App:</label>
                      <input
                        type="text"
                        value={newAppName}
                        onChange={(e) => setNewAppName(e.target.value)}
                        placeholder="Ej. Disney+, Juegos de Letras..."
                        required
                        className="w-full mt-1 p-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-400"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700">Icono Emoji:</label>
                      <input
                        type="text"
                        value={newAppEmoji}
                        onChange={(e) => setNewAppEmoji(e.target.value)}
                        placeholder="Ej. 🏰, 🎈, 🐱"
                        maxLength={2}
                        className="w-full mt-1 p-2 rounded-xl border border-slate-300 text-xs text-center text-lg"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-700">Enlace Web / URL (Opcional):</label>
                      <input
                        type="url"
                        value={newAppUrl}
                        onChange={(e) => setNewAppUrl(e.target.value)}
                        placeholder="https://ejemplo.com"
                        className="w-full mt-1 p-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingApp(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs shadow hover:bg-purple-700"
                    >
                      Guardar App
                    </button>
                  </div>
                </form>
              )}

              {/* Apps List */}
              <div className="flex flex-col gap-2">
                {filteredApps.map((app) => (
                  <div
                    key={app.id}
                    className={`p-3.5 rounded-2xl bg-white border transition shadow-sm flex items-center justify-between gap-3 ${
                      app.isHidden
                        ? 'border-slate-300 bg-slate-100/70 opacity-75'
                        : app.isLockedWithPin
                        ? 'border-amber-300 bg-amber-50/40'
                        : 'border-slate-200 hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${app.color} text-white flex items-center justify-center text-2xl shadow-sm flex-shrink-0`}>
                        {app.iconValue}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-sm text-slate-900 truncate">{app.name}</h4>
                          {app.customBadge && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                              {app.customBadge}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                          <span className="capitalize">{app.category}</span>
                          {app.isHidden && (
                            <span className="text-rose-600 font-bold flex items-center gap-0.5">
                              • 🙈 Oculta para niña
                            </span>
                          )}
                          {app.isLockedWithPin && (
                            <span className="text-amber-600 font-bold flex items-center gap-0.5">
                              • 🔒 Pide PIN
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                      {/* Hide Toggle */}
                      <button
                        onClick={() => toggleHideApp(app.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                          app.isHidden
                            ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        }`}
                        title={app.isHidden ? 'Mostrar en pantalla de la niña' : 'Ocultar a la niña'}
                      >
                        {app.isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        <span className="hidden sm:inline">{app.isHidden ? 'Oculta' : 'Visible'}</span>
                      </button>

                      {/* Lock Toggle */}
                      <button
                        onClick={() => toggleLockApp(app.id)}
                        className={`p-2 rounded-xl transition ${
                          app.isLockedWithPin
                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                        title={app.isLockedWithPin ? 'Desbloquear app' : 'Bloquear con PIN'}
                      >
                        {app.isLockedWithPin ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>

                      {!app.isSystem && (
                        <button
                          onClick={() => deleteApp(app.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Eliminar acceso directo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Hidden Apps Vault */}
          {activeTab === 'hidden' && (
            <div className="flex flex-col gap-4">
              <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">Bóveda Secreta de Padres</h3>
                  <p className="text-xs text-slate-300">
                    Aplicaciones ocultas a la niña. Puedes abrirlas directamente desde aquí.
                  </p>
                </div>
                <span className="text-2xl">🗝️</span>
              </div>

              {hiddenApps.length === 0 ? (
                <div className="text-center p-8 bg-white rounded-2xl border border-dashed border-slate-300">
                  <p className="text-sm font-bold text-slate-600">No hay ninguna aplicación oculta actualmente.</p>
                  <p className="text-xs text-slate-400 mt-1">Ve a la pestaña "Ocultar / Bloquear Apps" para ocultar apps que no quieras que la niña use.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {hiddenApps.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${app.color} text-white flex items-center justify-center text-2xl shadow`}>
                          {app.iconValue}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{app.name}</h4>
                          <span className="text-[11px] text-rose-600 font-bold">Oculta a la niña</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onClose();
                          onLaunchApp(app);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Abrir</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Screen Time & Bedtime */}
          {activeTab === 'time' && (
            <div className="flex flex-col gap-4">
              {/* Daily Limit */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Límite de Tiempo Diario</h3>
                    <p className="text-xs text-slate-500">Bloquea el launcher cuando se agote el tiempo</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-1">
                  {[
                    { label: 'Sin límite', value: 0 },
                    { label: '30 minutos', value: 30 },
                    { label: '45 minutos', value: 45 },
                    { label: '1 hora', value: 60 },
                    { label: '1.5 horas', value: 90 },
                    { label: '2 horas', value: 120 },
                  ].map((limit) => (
                    <button
                      key={limit.value}
                      onClick={() => {
                        onUpdateSettings({ ...settings, dailyLimitMinutes: limit.value });
                        playPopSound(settings.soundEnabled);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                        settings.dailyLimitMinutes === limit.value
                          ? 'bg-purple-600 text-white shadow'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {limit.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bedtime Mode */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon className="w-5 h-5 text-indigo-600" />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Modo Hora de Dormir (Bloqueo Nocturno)</h3>
                      <p className="text-xs text-slate-500">Muestra una pantalla relajante para ir a dormir</p>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={settings.bedtimeEnabled}
                    onChange={(e) => {
                      onUpdateSettings({ ...settings, bedtimeEnabled: e.target.checked });
                      playPopSound(settings.soundEnabled);
                    }}
                    className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                  />
                </div>

                {settings.bedtimeEnabled && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                    <div>
                      <label className="text-xs font-bold text-slate-700">Hora de inicio:</label>
                      <input
                        type="time"
                        value={settings.bedtimeStart}
                        onChange={(e) => onUpdateSettings({ ...settings, bedtimeStart: e.target.value })}
                        className="w-full mt-1 p-2 rounded-xl border border-slate-300 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700">Hora de despertar:</label>
                      <input
                        type="time"
                        value={settings.bedtimeEnd}
                        onChange={(e) => onUpdateSettings({ ...settings, bedtimeEnd: e.target.value })}
                        className="w-full mt-1 p-2 rounded-xl border border-slate-300 text-xs font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Customization & Contacts */}
          {activeTab === 'customize' && (
            <div className="flex flex-col gap-4">
              {/* Girl Name and Avatar */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
                <h3 className="font-bold text-sm text-slate-900">Nombre de la Niña y Avatar</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-600">Nombre mostrado en el saludo:</label>
                    <input
                      type="text"
                      value={settings.kidName}
                      onChange={(e) => onUpdateSettings({ ...settings, kidName: e.target.value })}
                      placeholder="Ej. Sofía, Princesa, Camila"
                      className="w-full mt-1 p-2 rounded-xl border border-slate-300 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600">Emoji:</label>
                    <input
                      type="text"
                      value={settings.avatarEmoji}
                      onChange={(e) => onUpdateSettings({ ...settings, avatarEmoji: e.target.value })}
                      maxLength={2}
                      className="w-full mt-1 p-2 rounded-xl border border-slate-300 text-center text-lg font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Theme Selector */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
                <h3 className="font-bold text-sm text-slate-900">Tema Visual y Colores</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        onUpdateSettings({ ...settings, theme: t.id });
                        playSparkleSound(settings.soundEnabled);
                      }}
                      className={`p-3 rounded-2xl border-2 flex items-center gap-2.5 transition text-left ${
                        settings.theme === t.id
                          ? 'border-purple-600 bg-purple-50 shadow-md scale-102 font-black text-purple-900'
                          : 'border-slate-200 hover:border-purple-200 text-slate-700'
                      }`}
                    >
                      <span className="text-2xl">{t.icon}</span>
                      <div>
                        <span className="text-xs block">{t.name}</span>
                        <div className={`w-8 h-2 rounded-full bg-gradient-to-r ${t.preview} mt-1`} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon Size & Sounds */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Tamaño de Iconos</h3>
                  <div className="flex gap-2 mt-2">
                    {[
                      { id: 'normal', label: 'Normal' },
                      { id: 'large', label: 'Grande' },
                      { id: 'xlarge', label: 'Extra Grande' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => onUpdateSettings({ ...settings, iconSize: s.id as IconSizeType })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          settings.iconSize === s.id
                            ? 'bg-purple-600 text-white shadow'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <input
                    type="checkbox"
                    id="soundToggle"
                    checked={settings.soundEnabled}
                    onChange={(e) => onUpdateSettings({ ...settings, soundEnabled: e.target.checked })}
                    className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                  />
                  <label htmlFor="soundToggle" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Efectos de Sonido Mágicos
                  </label>
                </div>
              </div>

              {/* Family Contacts */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900">Números de Teléfono de Familia</h3>
                  <button
                    onClick={() => setIsAddingContact(true)}
                    className="px-3 py-1 rounded-xl bg-purple-600 text-white text-xs font-bold shadow"
                  >
                    + Agregar Familiar
                  </button>
                </div>

                {isAddingContact && (
                  <form onSubmit={handleAddContact} className="p-3 bg-purple-50 rounded-xl border border-purple-200 flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Nombre (ej. Mamá)"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        required
                        className="p-2 rounded-lg border border-slate-300 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Parentesco (ej. Madre)"
                        value={contactRelation}
                        onChange={(e) => setContactRelation(e.target.value)}
                        className="p-2 rounded-lg border border-slate-300 text-xs"
                      />
                      <input
                        type="tel"
                        placeholder="Teléfono"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        required
                        className="p-2 rounded-lg border border-slate-300 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Emoji (👩)"
                        value={contactEmoji}
                        onChange={(e) => setContactEmoji(e.target.value)}
                        maxLength={2}
                        className="p-2 rounded-lg border border-slate-300 text-xs text-center text-base"
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingContact(false)}
                        className="px-3 py-1 bg-slate-200 rounded-lg text-xs font-bold"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-bold"
                      >
                        Guardar
                      </button>
                    </div>
                  </form>
                )}

                <div className="flex flex-col gap-2">
                  {settings.emergencyContacts.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{c.avatarEmoji}</span>
                        <div>
                          <span className="font-bold text-slate-800">{c.name}</span> ({c.relation}): <span className="text-slate-500 font-mono">{c.phone}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteContact(c.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Security & Change PIN */}
          {activeTab === 'security' && (
            <div className="flex flex-col gap-4">
              {/* Change PIN Form */}
              <form onSubmit={handleChangePin} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
                <h3 className="font-bold text-sm text-slate-900">Cambiar Contraseña / PIN de 4 Dígitos</h3>

                {pinChangeMsg && (
                  <div className={`p-3 rounded-xl text-xs font-bold ${
                    pinChangeMsg.isError ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {pinChangeMsg.text}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600">PIN Actual:</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={oldPin}
                      onChange={(e) => setOldPin(e.target.value)}
                      placeholder="1234"
                      required
                      className="w-full mt-1 p-2 rounded-xl border border-slate-300 text-center font-mono text-base font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600">Nuevo PIN (4 dígitos):</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="****"
                      required
                      className="w-full mt-1 p-2 rounded-xl border border-slate-300 text-center font-mono text-base font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600">Confirmar Nuevo PIN:</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      placeholder="****"
                      required
                      className="w-full mt-1 p-2 rounded-xl border border-slate-300 text-center font-mono text-base font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="self-end px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow mt-2"
                >
                  Actualizar PIN
                </button>
              </form>

              {/* Recovery Q&A */}
              <form onSubmit={handleSaveSecurityQA} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
                <h3 className="font-bold text-sm text-slate-900">Pregunta Secreta para Recuperar PIN</h3>
                <p className="text-xs text-slate-500">Por si olvidas el PIN de 4 dígitos:</p>

                {savedSettingsSuccess && (
                  <div className="p-3 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800">
                    ¡Pregunta de seguridad guardada con éxito!
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-600">Pregunta:</label>
                  <input
                    type="text"
                    value={recoveryQuestion}
                    onChange={(e) => setRecoveryQuestion(e.target.value)}
                    required
                    className="p-2 rounded-xl border border-slate-300 text-xs font-medium"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-600">Respuesta:</label>
                  <input
                    type="text"
                    value={recoveryAnswer}
                    onChange={(e) => setRecoveryAnswer(e.target.value)}
                    required
                    className="p-2 rounded-xl border border-slate-300 text-xs font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="self-end px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow mt-1"
                >
                  Guardar Pregunta Secreta
                </button>
              </form>
            </div>
          )}

          {/* TAB 6: Android 11 / APK Guide */}
          {activeTab === 'apk' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl shadow-md">
                <h3 className="font-black text-base">Cómo Instalar en Android 11 (Fácil y Rápido) 📱</h3>
                <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
                  Para Android 11 tienes dos formas directas de tener este Launcher como aplicación instalada a pantalla completa:
                </p>
              </div>

              {/* Method 1 */}
              <div className="p-4 bg-white rounded-2xl border-2 border-emerald-300 shadow-sm flex flex-col gap-2">
                <span className="text-xs font-black uppercase text-emerald-600 tracking-wider">
                  Método 1: Instalación Directa (Sin necesidad de APK externa)
                </span>
                <h4 className="font-black text-slate-900 text-sm">Instalar desde Google Chrome en tu Android 11</h4>
                <ol className="text-xs text-slate-600 list-decimal list-inside space-y-1 mt-1 leading-relaxed">
                  <li>Abre este enlace en el navegador <strong>Google Chrome</strong> de tu teléfono Android 11.</li>
                  <li>Toca el menú de <strong>tres puntos (⋮)</strong> arriba a la derecha.</li>
                  <li>Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Añadir a la pantalla de inicio"</strong>.</li>
                  <li>¡Listo! Se instalará con su propio icono de estrella mágica 🌟 y abrirá a pantalla completa.</li>
                </ol>
              </div>

              {/* Method 2 */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
                <span className="text-xs font-black uppercase text-purple-600 tracking-wider">
                  Método 2: Generar APK Nativa con PWABuilder
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Si necesitas el archivo <strong className="font-bold">.apk</strong> físico para instalar por Bluetooth o WhatsApp:
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={onOpenApkGuide}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Ver Guía Completa de Generación de APK</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
