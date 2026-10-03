export type ThemeType = 'pink-princess' | 'unicorn-magic' | 'galaxy-night' | 'mint-pastel' | 'sunshine-candy';
export type IconSizeType = 'normal' | 'large' | 'xlarge';

export interface AppItem {
  id: string;
  name: string;
  iconType: 'lucide' | 'emoji' | 'custom';
  iconValue: string; // icon name or emoji or image data/url
  color: string; // Tailwind gradient or hex
  category: 'divertido' | 'creativo' | 'educativo' | 'familia' | 'sistema' | 'juegos';
  isHidden: boolean; // True = hidden from kid launcher
  isLockedWithPin: boolean; // True = requires parent PIN to open
  isSystem?: boolean;
  internalAppId?: 'paint' | 'music' | 'camera' | 'stories' | 'calc' | 'games' | 'routine' | 'diary' | 'contacts' | 'gallery';
  url?: string; // For web apps / YouTube Kids / etc.
  phone?: string; // For call shortcuts
  customBadge?: string;
  order: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string; // Mamá, Papá, etc.
  phone: string;
  avatarEmoji: string;
  color: string;
}

export interface ParentSettings {
  pin: string; // 4 digits, default '1234'
  recoveryQuestion: string;
  recoveryAnswer: string;
  kidName: string;
  avatarEmoji: string;
  theme: ThemeType;
  iconSize: IconSizeType;
  soundEnabled: boolean;
  bedtimeEnabled: boolean;
  bedtimeStart: string; // '20:30'
  bedtimeEnd: string; // '07:00'
  dailyLimitMinutes: number; // 0 = no limit
  usedMinutesToday: number;
  lastActiveDate: string;
  emergencyContacts: EmergencyContact[];
}
