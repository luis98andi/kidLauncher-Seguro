import { AppItem, ParentSettings } from '../types';

export const DEFAULT_SETTINGS: ParentSettings = {
  pin: '1234',
  recoveryQuestion: '¿Cuál es tu color favorito?',
  recoveryAnswer: 'rosa',
  kidName: 'Princesa',
  avatarEmoji: '👑',
  theme: 'pink-princess',
  iconSize: 'large',
  soundEnabled: true,
  bedtimeEnabled: false,
  bedtimeStart: '20:30',
  bedtimeEnd: '07:00',
  dailyLimitMinutes: 0,
  usedMinutesToday: 0,
  lastActiveDate: new Date().toISOString().split('T')[0],
  emergencyContacts: [
    {
      id: 'contact-mom',
      name: 'Mamá',
      relation: 'Madre',
      phone: '123456789',
      avatarEmoji: '👩‍🦰',
      color: 'from-pink-500 to-rose-400',
    },
    {
      id: 'contact-dad',
      name: 'Papá',
      relation: 'Padre',
      phone: '987654321',
      avatarEmoji: '👨',
      color: 'from-blue-500 to-indigo-400',
    },
    {
      id: 'contact-grandma',
      name: 'Abuelita',
      relation: 'Abuela',
      phone: '555123456',
      avatarEmoji: '👵',
      color: 'from-amber-400 to-orange-400',
    }
  ],
};

export const INITIAL_APPS: AppItem[] = [
  {
    id: 'app-paint',
    name: 'Pizarra Mágica',
    iconType: 'emoji',
    iconValue: '🎨',
    color: 'from-pink-400 via-rose-400 to-red-400',
    category: 'creativo',
    isHidden: false,
    isLockedWithPin: false,
    isSystem: true,
    internalAppId: 'paint',
    customBadge: 'DIBUJAR',
    order: 1,
  },
  {
    id: 'app-music',
    name: 'Música y Piano',
    iconType: 'emoji',
    iconValue: '🎵',
    color: 'from-purple-400 via-violet-400 to-indigo-400',
    category: 'divertido',
    isHidden: false,
    isLockedWithPin: false,
    isSystem: true,
    internalAppId: 'music',
    customBadge: 'SONIDOS',
    order: 2,
  },
  {
    id: 'app-camera',
    name: 'Fotos Divertidas',
    iconType: 'emoji',
    iconValue: '📷',
    color: 'from-teal-400 via-emerald-400 to-green-400',
    category: 'creativo',
    isHidden: false,
    isLockedWithPin: false,
    isSystem: true,
    internalAppId: 'camera',
    customBadge: 'FILTROS',
    order: 3,
  },
  {
    id: 'app-games',
    name: 'Juegos Seguros',
    iconType: 'emoji',
    iconValue: '🎮',
    color: 'from-amber-400 via-orange-400 to-yellow-400',
    category: 'juegos',
    isHidden: false,
    isLockedWithPin: false,
    isSystem: true,
    internalAppId: 'games',
    customBadge: 'MINIJUEGOS',
    order: 4,
  },
  {
    id: 'app-stories',
    name: 'Cuentos Mágicos',
    iconType: 'emoji',
    iconValue: '📖',
    color: 'from-fuchsia-400 via-pink-400 to-purple-400',
    category: 'educativo',
    isHidden: false,
    isLockedWithPin: false,
    isSystem: true,
    internalAppId: 'stories',
    customBadge: 'AUDIO',
    order: 5,
  },
  {
    id: 'app-contacts',
    name: 'Llamar a Familia',
    iconType: 'emoji',
    iconValue: '📞',
    color: 'from-sky-400 via-blue-400 to-cyan-400',
    category: 'familia',
    isHidden: false,
    isLockedWithPin: false,
    isSystem: true,
    internalAppId: 'contacts',
    customBadge: 'CONTACTOS',
    order: 6,
  },
  {
    id: 'app-routine',
    name: 'Mi Rutina',
    iconType: 'emoji',
    iconValue: '⭐',
    color: 'from-yellow-400 via-amber-400 to-orange-400',
    category: 'educativo',
    isHidden: false,
    isLockedWithPin: false,
    isSystem: true,
    internalAppId: 'routine',
    customBadge: 'ESTRELLAS',
    order: 7,
  },
  {
    id: 'app-calc',
    name: 'Calculadora Kid',
    iconType: 'emoji',
    iconValue: '🧮',
    color: 'from-emerald-400 via-teal-400 to-cyan-400',
    category: 'educativo',
    isHidden: false,
    isLockedWithPin: false,
    isSystem: true,
    internalAppId: 'calc',
    order: 8,
  },
  {
    id: 'app-diary',
    name: 'Mi Diario',
    iconType: 'emoji',
    iconValue: '💖',
    color: 'from-rose-400 via-pink-400 to-fuchsia-400',
    category: 'creativo',
    isHidden: false,
    isLockedWithPin: false,
    isSystem: true,
    internalAppId: 'diary',
    order: 9,
  },
  {
    id: 'app-pet',
    name: 'Mascota Mágica',
    iconType: 'emoji',
    iconValue: '🐱',
    color: 'from-amber-300 via-pink-400 to-rose-400',
    category: 'divertido',
    isHidden: false,
    isLockedWithPin: false,
    isSystem: true,
    internalAppId: 'pet',
    customBadge: 'CUIDAR',
    order: 10,
  },
  {
    id: 'app-stickers',
    name: 'Álbum Stickers',
    iconType: 'emoji',
    iconValue: '🦄',
    color: 'from-fuchsia-400 via-purple-400 to-pink-500',
    category: 'creativo',
    isHidden: false,
    isLockedWithPin: false,
    isSystem: true,
    internalAppId: 'stickers',
    customBadge: 'PEGATINAS',
    order: 11,
  },
  {
    id: 'app-walkie',
    name: 'Voces Mágicas',
    iconType: 'emoji',
    iconValue: '🎙️',
    color: 'from-cyan-400 via-teal-400 to-emerald-500',
    category: 'divertido',
    isHidden: false,
    isLockedWithPin: false,
    isSystem: true,
    internalAppId: 'walkie',
    customBadge: 'GRABAR',
    order: 12,
  },
  {
    id: 'app-dj',
    name: 'DJ y Ritmos',
    iconType: 'emoji',
    iconValue: '🎧',
    color: 'from-violet-500 via-purple-500 to-pink-500',
    category: 'divertido',
    isHidden: false,
    isLockedWithPin: false,
    isSystem: true,
    internalAppId: 'dj',
    customBadge: 'MÚSICA',
    order: 13,
  },
  {
    id: 'app-system-settings',
    name: 'Ajustes del Teléfono',
    iconType: 'emoji',
    iconValue: '⚙️',
    color: 'from-slate-600 via-gray-600 to-zinc-700',
    category: 'sistema',
    isHidden: true, // Hidden by default for child safety!
    isLockedWithPin: true,
    isSystem: true,
    customBadge: 'SOLO PADRES',
    order: 14,
  },
  {
    id: 'app-play-store',
    name: 'Google Play Store',
    iconType: 'emoji',
    iconValue: '🛍️',
    color: 'from-cyan-500 via-blue-600 to-indigo-600',
    category: 'sistema',
    isHidden: true, // Hidden by default!
    isLockedWithPin: true,
    url: 'https://play.google.com/store',
    customBadge: 'TIENDA',
    order: 15,
  },
  {
    id: 'app-browser',
    name: 'Navegador Web Libre',
    iconType: 'emoji',
    iconValue: '🌐',
    color: 'from-blue-600 via-indigo-600 to-purple-600',
    category: 'sistema',
    isHidden: true, // Hidden by default for child protection!
    isLockedWithPin: true,
    customBadge: 'RESTRINGIDO',
    order: 16,
  }
];

const SETTINGS_KEY = 'kidlauncher_settings_v1';
const APPS_KEY = 'kidlauncher_apps_v1';

export function loadSettings(): ParentSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {
    // Ignore error
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: ParentSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore error
  }
}

export function loadApps(): AppItem[] {
  try {
    const raw = localStorage.getItem(APPS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Filter out YouTube Kids and Aprender Jugando
        let sanitized = parsed.filter(
          (a: AppItem) => a.id !== 'app-yt-kids' && a.id !== 'app-khan-kids' && !a.url?.includes('youtubekids') && !a.url?.includes('khanacademy')
        );

        // Ensure new creative apps are present
        const existingIds = new Set(sanitized.map((a: AppItem) => a.id));
        INITIAL_APPS.forEach((initApp) => {
          if (!existingIds.has(initApp.id) && initApp.internalAppId) {
            sanitized.push(initApp);
          }
        });

        saveApps(sanitized);
        return sanitized;
      }
    }
  } catch {
    // Ignore error
  }
  return INITIAL_APPS;
}

export function saveApps(apps: AppItem[]): void {
  try {
    localStorage.setItem(APPS_KEY, JSON.stringify(apps));
  } catch {
    // Ignore error
  }
}
