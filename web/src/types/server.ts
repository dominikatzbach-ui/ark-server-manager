export type ServerStatus = 'running' | 'stopped' | 'crashed' | 'updating' | 'installing';

export interface ServerResources {
  cpuPercent: number;
  ramUsedMb: number;
  ramTotalMb: number;
  uptimeSeconds: number;
}

export interface Server {
  id: string;
  name: string;
  map: ArkMap;
  status: ServerStatus;
  port: number;
  queryPort: number;
  rconPort: number;
  maxPlayers: number;
  currentPlayers: number;
  password?: string;
  resources?: ServerResources;
  version?: string;
  lastStarted?: string;
  createdAt: string;
}

export type ArkMap =
  | 'TheIsland'
  | 'TheCenter'
  | 'ScorchedEarth'
  | 'Aberration'
  | 'Extinction'
  | 'Genesis'
  | 'Genesis2'
  | 'CrystalIsles'
  | 'Fjordur'
  | 'LostIsland';

export interface MapInfo {
  id: ArkMap;
  label: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  dlc: boolean;
  theme: string;
  color: string;
}

export const MAP_INFO: Record<ArkMap, MapInfo> = {
  TheIsland: {
    id: 'TheIsland',
    label: 'The Island',
    description: 'Der klassische Startpunkt. Ausgewogene Ressourcen, alle Biome.',
    difficulty: 'Easy',
    dlc: false,
    theme: 'Urwald & Berge',
    color: '#10b981',
  },
  TheCenter: {
    id: 'TheCenter',
    label: 'The Center',
    description: 'Floating Islands und einzigartige Landschaft. Community-Karte.',
    difficulty: 'Medium',
    dlc: false,
    theme: 'Schwebende Inseln',
    color: '#3b82f6',
  },
  ScorchedEarth: {
    id: 'ScorchedEarth',
    label: 'Scorched Earth',
    description: 'Wüstenüberleben mit extremer Hitze und einzigartigen Dinos.',
    difficulty: 'Hard',
    dlc: true,
    theme: 'Wüste',
    color: '#f59e0b',
  },
  Aberration: {
    id: 'Aberration',
    label: 'Aberration',
    description: 'Unterirdische Welt ohne Sonne, radioaktive Zonen.',
    difficulty: 'Hard',
    dlc: true,
    theme: 'Unterirdisch',
    color: '#8b5cf6',
  },
  Extinction: {
    id: 'Extinction',
    label: 'Extinction',
    description: 'Postapokalyptische Erde mit Meks und Titanen.',
    difficulty: 'Expert',
    dlc: true,
    theme: 'Postapokalyptisch',
    color: '#ef4444',
  },
  Genesis: {
    id: 'Genesis',
    label: 'Genesis Part 1',
    description: 'Simulierte Biome mit HLNA-Missionen.',
    difficulty: 'Hard',
    dlc: true,
    theme: 'Simulationen',
    color: '#06b6d4',
  },
  Genesis2: {
    id: 'Genesis2',
    label: 'Genesis Part 2',
    description: 'Raumschiff-Setting, Abschluss der ARK-Story.',
    difficulty: 'Expert',
    dlc: true,
    theme: 'Weltraum',
    color: '#6366f1',
  },
  CrystalIsles: {
    id: 'CrystalIsles',
    label: 'Crystal Isles',
    description: 'Kristall-Landschaften und einzigartiger Reichtum.',
    difficulty: 'Medium',
    dlc: false,
    theme: 'Kristall',
    color: '#22d3ee',
  },
  Fjordur: {
    id: 'Fjordur',
    label: 'Fjordur',
    description: 'Nordische Mythologie, mehrere Welten, Runenvarianten.',
    difficulty: 'Hard',
    dlc: false,
    theme: 'Nordisch',
    color: '#a78bfa',
  },
  LostIsland: {
    id: 'LostIsland',
    label: 'Lost Island',
    description: 'Tropische Insel mit vielfältiger Fauna und Wyvern-Arten.',
    difficulty: 'Medium',
    dlc: false,
    theme: 'Tropisch',
    color: '#34d399',
  },
};

export interface ServerConfig {
  name: string;
  map: ArkMap;
  port: number;
  queryPort: number;
  rconPort: number;
  rconPassword: string;
  serverPassword?: string;
  adminPassword: string;
  maxPlayers: number;
  sessionName: string;
  // Gameplay
  xpMultiplier: number;
  tameSpeedMultiplier: number;
  harvestAmountMultiplier: number;
  playerDamageMultiplier: number;
  playerResistanceMultiplier: number;
  dinoCountMultiplier: number;
  // Gameplay flags
  pvpEnabled: boolean;
  battleEye: boolean;
  hardcore: boolean;
  allowFlyerCarry: boolean;
  noTributeDownloads: boolean;
  allowThirdPersonPlayer: boolean;
  alwaysNotifyPlayerLeft: boolean;
  alwaysNotifyPlayerJoined: boolean;
  // Mods
  activeMods: string[];
}

export const DEFAULT_CONFIG: Partial<ServerConfig> = {
  port: 7777,
  queryPort: 27015,
  rconPort: 32330,
  maxPlayers: 70,
  xpMultiplier: 1.0,
  tameSpeedMultiplier: 1.0,
  harvestAmountMultiplier: 1.0,
  playerDamageMultiplier: 1.0,
  playerResistanceMultiplier: 1.0,
  dinoCountMultiplier: 1.0,
  pvpEnabled: true,
  battleEye: true,
  hardcore: false,
  allowFlyerCarry: true,
  noTributeDownloads: false,
  allowThirdPersonPlayer: true,
  alwaysNotifyPlayerLeft: true,
  alwaysNotifyPlayerJoined: true,
  activeMods: [],
};
