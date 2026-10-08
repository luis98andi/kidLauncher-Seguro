import React from 'react';

// Pixel art renderer for authentic 8-bit Tamagotchi / Digimon V-Pet experience.
// Uses crisp SVG pixel matrices (shapeRendering="crispEdges") for razor-sharp retro visuals.

export type PetSpecies = 'pyro' | 'luna' | 'aether';
export type EvolutionStage = 'egg' | 'baby' | 'in_training' | 'rookie' | 'champion' | 'mega';

interface PixelSpriteProps {
  species: PetSpecies;
  stage: EvolutionStage;
  frame?: number; // 0 or 1 for idle bounce
  action?: 'idle' | 'eating' | 'sleeping' | 'attacking' | 'hurt' | 'happy';
  size?: number;
  className?: string;
}

// 16x16 / 20x20 / 24x24 pixel grids
// Key: '.' = transparent, letters represent color palette entries
export interface SpriteData {
  width: number;
  height: number;
  palette: Record<string, string>;
  rows: string[];
}

// Color palettes for retro LCD & color modes
export const SPRITE_PALETTES = {
  pyro: {
    '.': 'transparent',
    'K': '#18181b', // Outline dark
    'O': '#ea580c', // Orange base (Agumon/Dino)
    'L': '#fb923c', // Light orange
    'Y': '#facc15', // Yellow belly / claws
    'W': '#ffffff', // Eye shine
    'R': '#dc2626', // Red mouth / fire
    'B': '#78350f', // Brown stripes / horns
    'G': '#4ade80', // Green accent
  },
  luna: {
    '.': 'transparent',
    'K': '#0f172a', // Outline dark
    'B': '#2563eb', // Blue base (Gabumon/Wolf)
    'L': '#60a5fa', // Light blue
    'W': '#ffffff', // White fur / shine
    'Y': '#fde047', // Yellow horn
    'P': '#a855f7', // Purple markings
    'R': '#f43f5e', // Pink blush / nose
  },
  aether: {
    '.': 'transparent',
    'K': '#1e1b4b', // Outline dark
    'C': '#f59e0b', // Cream / tan (Patamon/Angel)
    'L': '#fde68a', // Light yellow
    'W': '#ffffff', // White wings / belly
    'R': '#fb7185', // Rose cheeks
    'G': '#10b981', // Emerald gem
    'Y': '#eab308', // Gold halo
  },
  misc: {
    '.': 'transparent',
    'K': '#18181b',
    'B': '#92400e', // Brown meat
    'L': '#d97706', // Light meat
    'W': '#ffffff', // Bone white
    'R': '#ef4444', // Red
    'P': '#78350f', // Poop dark
    'Q': '#a16207', // Poop light
    'Y': '#facc15', // Yellow
    'C': '#06b6d4', // Cyan water
    'M': '#ec4899', // Pink pill
  }
};

/* -------------------------------------------------------------
   PIXEL MATRICES (Designed specifically for authentic retro look)
   ------------------------------------------------------------- */

// EGG SPRITES (16x16)
const EGG_SPRITES: Record<PetSpecies, [string[], string[]]> = {
  pyro: [
    [
      ".....KKKKKK.....",
      "...KKYYYYYYKK...",
      "..KYYYYOYYYYYK..",
      ".KYYYOOOOOYYYYK.",
      ".KYYOOOOOOOOYYK.",
      "KYYOORRRROOOYYK",
      "KYYORRRRRROOYYK",
      "KYYOORRRROOOYYK",
      "KYYOOOOOOOOOYYK",
      "KYYOOOOOOOOOYYK",
      ".KYYOOOOOOOYYK.",
      ".KYYYOOOOOYYYYK.",
      "..KYYYYYYYYYK...",
      "...KKYYYYYYKK...",
      ".....KKKKKK.....",
      "................"
    ],
    [
      ".....KKKKKK.....",
      "...KKYYYYYYKK...",
      "..KYYYYOYYYYYK..",
      ".KYYYOOOOOYYYYK.",
      ".KYYOOKKOOOOYYK.",
      "KYYOORKKROOOYYK",
      "KYYORKKKKROOYYK",
      "KYYOORKKROOOYYK",
      "KYYOOOKKOOOOYYK",
      "KYYOOOOOOOOOYYK",
      ".KYYOOOOOOOYYK.",
      ".KYYYOOOOOYYYYK.",
      "..KYYYYYYYYYK...",
      "...KKYYYYYYKK...",
      ".....KKKKKK.....",
      "................"
    ]
  ],
  luna: [
    [
      ".....KKKKKK.....",
      "...KKWWWWWWKK...",
      "..KWWWWBWWWWK...",
      ".KWWWWBBBBWWWWK.",
      ".KWWWBBBBBBWWWK.",
      "KWWWBBPPEEBBWWK",
      "KWWWBPPPEEBBWWK",
      "KWWWBBPPEEBBWWK",
      "KWWWBBBBBBBBWWK",
      "KWWWBBBBBBBBWWK",
      ".KWWWBBBBBBWWWK.",
      ".KWWWWBBBBWWWWK.",
      "..KWWWWWWWWWK...",
      "...KKWWWWWWKK...",
      ".....KKKKKK.....",
      "................"
    ],
    [
      ".....KKKKKK.....",
      "...KKWWWWWWKK...",
      "..KWWWWBWWWWK...",
      ".KWWWWBBBBWWWWK.",
      ".KWWWBKKBBBBWWWK",
      "KWWWBKPPKKBBWWK",
      "KWWWBPPKKKBBWWK",
      "KWWWBKPPKKBBWWK",
      "KWWWBKKBBBBBWWK",
      "KWWWBBBBBBBBWWK",
      ".KWWWBBBBBBWWWK.",
      ".KWWWWBBBBWWWWK.",
      "..KWWWWWWWWWK...",
      "...KKWWWWWWKK...",
      ".....KKKKKK.....",
      "................"
    ]
  ],
  aether: [
    [
      ".....KKKKKK.....",
      "...KKLLLLLLKK...",
      "..KLLLLCLLLLLK..",
      ".KLLLLCCCCLLLLK.",
      ".KLLLCCCCCCLLLK.",
      "KLLLCCRRRRCCLLK",
      "KLLCCRRRRRRCCLK",
      "KLLLCCRRRRCCLLK",
      "KLLLCCCCCCCCLLK",
      "KLLLCCCCCCCCLLK",
      ".KLLLCCCCCCLLLK.",
      ".KLLLLCCCCLLLLK.",
      "..KLLLLLLLLLK...",
      "...KKLLLLLLKK...",
      ".....KKKKKK.....",
      "................"
    ],
    [
      ".....KKKKKK.....",
      "...KKLLLLLLKK...",
      "..KLLLLCLLLLLK..",
      ".KLLLLCCCCLLLLK.",
      ".KLLLKKCCCCLLLK.",
      "KLLLKKRRKKCCLLK",
      "KLLCCRRKKRRCCLK",
      "KLLLKKRRKKCCLLK",
      "KLLLKKCCCCLLLLK.",
      "KLLLCCCCCCCCLLK",
      ".KLLLCCCCCCLLLK.",
      ".KLLLLCCCCLLLLK.",
      "..KLLLLLLLLLK...",
      "...KKLLLLLLKK...",
      ".....KKKKKK.....",
      "................"
    ]
  ]
};

// BABY STAGE (16x16) - Cute blob / puff
const BABY_SPRITES: Record<PetSpecies, [string[], string[]]> = {
  pyro: [
    [
      "................",
      ".....KKKKKK.....",
      "...KKOOOOOOKK...",
      "..KOLOOOOOLOKK..",
      ".KOLLOOOOOLLOKK.",
      ".KOLKWOKKWOLLOK.",
      "KOLOKWOKKWOLOKK.",
      "KOLOOOOOOOOLLOK.",
      "KOLOOORRROOOLLOK",
      "KOLOOOOOOOOLLOK.",
      ".KOLOOOOOOLLOKK.",
      "..KOLOOOLLOKKK..",
      "...KKOOLLOKK....",
      "....KKYKKYK.....",
      "....KK..KK......",
      "................"
    ],
    [
      "................",
      "................",
      ".....KKKKKK.....",
      "...KKOOOOOOKK...",
      "..KOLOOOOOLOKK..",
      ".KOLLOOOOOLLOKK.",
      "KOLKKWOKKKWLLOKK",
      "KOLOOOOOOOOLLOK.",
      "KOLOOORRROOOLLOK",
      "KOLOOOOOOOOLLOK.",
      ".KOLOOOOOOLLOKK.",
      "..KOLOOOLLOKKK..",
      "...KKYYKKYYK....",
      "....KK..KK......",
      "................",
      "................"
    ]
  ],
  luna: [
    [
      "................",
      ".....KKKKKK.....",
      "...KKWWWWWWKK...",
      "..KWWWLWWWLWWK..",
      ".KWWWWLWWWLWWWK.",
      ".KWWKWOKKWOWWWK.",
      "KWWOKWOKKWOWWWK.",
      "KWWWWWWWWWWWWWWK",
      "KWWWWWRRRWWWWWWK",
      "KWWWWWWWWWWWWWWK",
      ".KWWWWWWWWWWWWK.",
      "..KWWWLWWWLWWK..",
      "...KKWWLWWLKK...",
      "....KKWKKWK.....",
      "....KK..KK......",
      "................"
    ],
    [
      "................",
      "................",
      ".....KKKKKK.....",
      "...KKWWWWWWKK...",
      "..KWWWLWWWLWWK..",
      ".KWWWWLWWWLWWWK.",
      "KWWKKWOKKKWOWWWK",
      "KWWWWWWWWWWWWWWK",
      "KWWWWWRRRWWWWWWK",
      "KWWWWWWWWWWWWWWK",
      ".KWWWWWWWWWWWWK.",
      "..KWWWLWWWLWWK..",
      "...KKWWLWWLKK...",
      "....KKWKKWK.....",
      "................",
      "................"
    ]
  ],
  aether: [
    [
      "................",
      ".....KKKKKK.....",
      "...KKCCCCCCKK...",
      "..KCCCLCCCLCCK..",
      ".KCCCCLCCCLCCCK.",
      ".KCCKWOKKWOKCCK.",
      "KCCWKWOKKWOKCCCK",
      "KCCCCCCCCCCCCCCK",
      "KCCCCCCRRCCCCCCK",
      "KCCCCCCCCCCCCCCK",
      ".KCCCCCCCCCCCCK.",
      "..KCCCLCCCLCCK..",
      "...KKCCLCCLKK...",
      "....KKCKKCK.....",
      "....KK..KK......",
      "................"
    ],
    [
      "................",
      "................",
      ".....KKKKKK.....",
      "...KKCCCCCCKK...",
      "..KCCCLCCCLCCK..",
      ".KCCCCLCCCLCCCK.",
      "KCCKKWOKKKWCCCCK",
      "KCCCCCCCCCCCCCCK",
      "KCCCCCCRRCCCCCCK",
      "KCCCCCCCCCCCCCCK",
      ".KCCCCCCCCCCCCK.",
      "..KCCCLCCCLCCK..",
      "...KKCCLCCLKK...",
      "....KKCKKCK.....",
      "................",
      "................"
    ]
  ]
};

// IN-TRAINING STAGE (20x20) - Small creature with ears / horns
const IN_TRAINING_SPRITES: Record<PetSpecies, [string[], string[]]> = {
  pyro: [
    [
      "...KK.......KK......",
      "..KLLK.....KLLK.....",
      "..KLOK.....KLOK.....",
      "...KOKKKKKKKOK......",
      "..KKOOOOOOOOOOKK....",
      ".KOOOOOOOOOOOOOOK...",
      ".KOOKWOKKKKWOKOOK...",
      "KOOOKWOKKKKWOKOOOK..",
      "KOOOOOOOOOOOOOOOOK..",
      "KOOOOOKRRRKOOOOOOK..",
      "KOOOOOORRROOOOOOOK..",
      ".KOOOOOOOOOOOOOOK...",
      ".KOOOOYYYYYYOOOOK...",
      "..KKOOYYYYYYOOKK....",
      "...KKOOOOOOOOKK.....",
      "....KKKKKKKKKK......",
      "....KKYK..KKYK......",
      "....KKKK..KKKK......",
      "....................",
      "...................."
    ],
    [
      "....................",
      "...KK.......KK......",
      "..KLLK.....KLLK.....",
      "..KLOK.....KLOK.....",
      "...KOKKKKKKKOK......",
      "..KKOOOOOOOOOOKK....",
      ".KOOOOOOOOOOOOOOK...",
      "KOOOKKWOKKKKWKOOOK..",
      "KOOOOOOOOOOOOOOOOK..",
      "KOOOOOKRRRKOOOOOOK..",
      "KOOOOOORRROOOOOOOK..",
      ".KOOOOOOOOOOOOOOK...",
      ".KOOOOYYYYYYOOOOK...",
      "..KKOOYYYYYYOOKK....",
      "...KKOOOOOOOOKK.....",
      "....KKKKKKKKKK......",
      "....KYYK..KYYK......",
      "....KKKK..KKKK......",
      "....................",
      "...................."
    ]
  ],
  luna: [
    [
      "........KK..........",
      ".......KYYK.........",
      ".......KYYK.........",
      "......KYYYYK........",
      "....KKKYYYYKKK......",
      "..KKWWWWWWWWWWKK....",
      ".KWWWWWWWWWWWWWWK...",
      ".KWWKWOKKKKWOKWWK...",
      "KWWWKWOKKKKWOKWWWK..",
      "KWWWWWWWWWWWWWWWWK..",
      "KWWWWWKRRRWWWWWWWK..",
      ".KWWWWWRRRWWWWWWK...",
      ".KWWWWWWWWWWWWWWK...",
      "..KKWWWWWWWWWWKK....",
      "...KKWWWWWWWWKK.....",
      "....KKKKKKKKKK......",
      "....KKWK..KKWK......",
      "....KKKK..KKKK......",
      "....................",
      "...................."
    ],
    [
      "....................",
      "........KK..........",
      ".......KYYK.........",
      ".......KYYK.........",
      "......KYYYYK........",
      "....KKKYYYYKKK......",
      "..KKWWWWWWWWWWKK....",
      ".KWWKKWOKKKKWKWWK...",
      "KWWWWWWWWWWWWWWWWK..",
      "KWWWWWKRRRWWWWWWWK..",
      ".KWWWWWRRRWWWWWWK...",
      ".KWWWWWWWWWWWWWWK...",
      "..KKWWWWWWWWWWKK....",
      "...KKWWWWWWWWKK.....",
      "....KKKKKKKKKK......",
      "....KKWK..KKWK......",
      "....KKKK..KKKK......",
      "....................",
      "....................",
      "...................."
    ]
  ],
  aether: [
    [
      "KK................KK",
      "KLLK............KLLK",
      ".KLLK..........KLLK.",
      "..KLOKKKKKKKKKKLOK..",
      "..KKOCCCCCCCCCCOKK..",
      ".KCCCCCCCCCCCCCCK...",
      ".KCCKWOKKKKWOKCCK...",
      "KCCCKWOKKKKWOKCCCK..",
      "KCCCCCCCCCCCCCCCCK..",
      "KCCCCCRRRRCCCCCCK...",
      ".KCCCCCCCCCCCCCCK...",
      ".KCCCCWWWWWWCCCCK...",
      "..KKCCWWWWWWCCKK....",
      "...KKCCCCCCCCKK.....",
      "....KKKKKKKKKK......",
      "....KKCK..KKCK......",
      "....KKKK..KKKK......",
      "....................",
      "....................",
      "...................."
    ],
    [
      "....................",
      "KK................KK",
      "KLLK............KLLK",
      ".KLLK..........KLLK.",
      "..KLOKKKKKKKKKKLOK..",
      "..KKOCCCCCCCCCCOKK..",
      ".KCCKKWOKKKKWKCCK...",
      "KCCCCCCCCCCCCCCCCK..",
      "KCCCCCRRRRCCCCCCK...",
      ".KCCCCCCCCCCCCCCK...",
      ".KCCCCWWWWWWCCCCK...",
      "..KKCCWWWWWWCCKK....",
      "...KKCCCCCCCCKK.....",
      "....KKKKKKKKKK......",
      "....KKCK..KKCK......",
      "....KKKK..KKKK......",
      "....................",
      "....................",
      "....................",
      "...................."
    ]
  ]
};

// ROOKIE STAGE (24x24) - Classic Digimon: Agumon, Gabumon, Patamon
const ROOKIE_SPRITES: Record<PetSpecies, [string[], string[]]> = {
  pyro: [ // Agumon style
    [
      "..........KKKKKK........",
      "........KKOOOOOOKK......",
      ".......KOOOOOOOOOOK.....",
      "......KOOOOOOOOOOOOK....",
      "......KOOKWOKKKKWOKK....",
      ".....KOOOKWOKKKKWOKOK...",
      ".....KOOOOOOOOOOOOOOK...",
      ".....KOOOOOOOOOOOOOOK...",
      ".....KOOOOORRRRKOOOOK...",
      "......KOOOORRRROOOOK....",
      "......KKKOOOOOOOOKKK....",
      ".....KKOOOOOOOOOOOOKK...",
      "....KOOOKKKKKKKKOOOOK...",
      "...KOOOOKYYYYYYKOOOOK...",
      "...KOOOKYYYYYYYYKOOOK...",
      "...KOOOKYYYYYYYYKOOOK...",
      "...KOOOKYYYYYYYYKOOOK...",
      "....KOOKKKKKKKKKOOK.....",
      ".....KKK........KKK.....",
      "....KYYYK......KYYYK....",
      "...KYYYYYK....KYYYYYK...",
      "...KKKKKKK....KKKKKKK...",
      "........................",
      "........................"
    ],
    [
      "..........KKKKKK........",
      "........KKOOOOOOKK......",
      ".......KOOOOOOOOOOK.....",
      "......KOOOOOOOOOOOOK....",
      "......KOOKKWOKKKKWOK....",
      ".....KOOOKKWOKKKKWOKOK..",
      ".....KOOOOOOOOOOOOOOK...",
      ".....KOOOOOOOOOOOOOOK...",
      ".....KOOOOORRRRKOOOOK...",
      "......KOOOORRRROOOOK....",
      "......KKKOOOOOOOOKKK....",
      ".....KKOOOOOOOOOOOOKK...",
      "....KOOOKKKKKKKKOOOOK...",
      "...KOOOOKYYYYYYKOOOOK...",
      "...KOOOKYYYYYYYYKOOOK...",
      "...KOOOKYYYYYYYYKOOOK...",
      "...KOOOKYYYYYYYYKOOOK...",
      "....KOOKKKKKKKKKOOK.....",
      "....KYYYK......KKK......",
      "...KYYYYYK....KYYYK.....",
      "...KKKKKKK...KYYYYYK....",
      ".............KKKKKKK....",
      "........................",
      "........................"
    ]
  ],
  luna: [ // Gabumon style
    [
      "...........KK...........",
      "..........KYYK..........",
      "..........KYYK..........",
      ".........KKYYKK.........",
      "........KKWWWWKK........",
      ".......KWWWWWWWWK.......",
      "......KWWKWOKKWOWK......",
      ".....KWWWKWOKKWOWWK.....",
      ".....KWWWWWWWWWWWWK.....",
      ".....KWWWWWKKWWWWWK.....",
      "......KWWWWRRWWWWK......",
      ".....KKKWWWWWWWWKKK.....",
      "....KBBKKWWWWWWKKBBK....",
      "...KBBBBKKKKKKKKBBBBK...",
      "...KBBBPBBBBBBBBPBBBK...",
      "...KBBBPBBBBBBBBPBBBK...",
      "....KBBBBBBBBBBBBBBK....",
      ".....KKKKKKKKKKKKKK.....",
      "......KWWK....KWWK......",
      ".....KWWWWK..KWWWWK.....",
      ".....KWWWWK..KWWWWK.....",
      ".....KKKKKK..KKKKKK.....",
      "........................",
      "........................"
    ],
    [
      "...........KK...........",
      "..........KYYK..........",
      "..........KYYK..........",
      ".........KKYYKK.........",
      "........KKWWWWKK........",
      ".......KWWWWWWWWK.......",
      "......KWWKKWOKKWOWK.....",
      ".....KWWWKKWOKKWOWWK....",
      ".....KWWWWWWWWWWWWK.....",
      ".....KWWWWWKKWWWWWK.....",
      "......KWWWWRRWWWWK......",
      ".....KKKWWWWWWWWKKK.....",
      "....KBBKKWWWWWWKKBBK....",
      "...KBBBBKKKKKKKKBBBBK...",
      "...KBBBPBBBBBBBBPBBBK...",
      "...KBBBPBBBBBBBBPBBBK...",
      "....KBBBBBBBBBBBBBBK....",
      ".....KKKKKKKKKKKKKK.....",
      ".....KWWWWK...KWWK......",
      ".....KWWWWK..KWWWWK.....",
      ".....KKKKKK..KWWWWK.....",
      ".............KKKKKK.....",
      "........................",
      "........................"
    ]
  ],
  aether: [ // Patamon style with wings
    [
      "KK....................KK",
      "KLLK................KLLK",
      ".KLLKK............KKLLK.",
      "..KLLLKKKKKKKKKKKKLLLK..",
      "...KLLCCCCCCCCCCCCLLK...",
      "....KCCCCCCCCCCCCCCK....",
      "...KCCKWOKKKKKKWOKCCK...",
      "..KCCCKWOKKKKKKWOKCCCK..",
      "..KCCCCCCCCCCCCCCCCCCK..",
      "..KCCCCCCCCCCCCCCCCCCK..",
      "..KCCCCCCCRRRRCCCCCCK...",
      "...KCCCCCCCCCCCCCCCCK...",
      "....KKCCCCCCCCCCCCKK....",
      "...KWWKKKKKKKKKKKKWWK...",
      "..KWWWWCCCCCCCCCCWWWWK..",
      "..KWWWWCCCCCCCCCCWWWWK..",
      "...KWWKKKKKKKKKKKKWWK...",
      ".....KCCK......KCCK.....",
      "....KCCCK......KCCCK....",
      "....KKKKK......KKKKK....",
      "........................",
      "........................",
      "........................",
      "........................"
    ],
    [
      ".KK..................KK.",
      "..KLLK..............KLLK",
      "...KLLKK..........KKLLK.",
      "....KLLLKKKKKKKKKKLLLK..",
      ".....KLLCCCCCCCCCCLLK...",
      "....KCCCCCCCCCCCCCCK....",
      "...KCCKKWOKKKKKKWKKCCK..",
      "..KCCCCCCCCCCCCCCCCCCK..",
      "..KCCCCCCCCCCCCCCCCCCK..",
      "..KCCCCCCCRRRRCCCCCCK...",
      "...KCCCCCCCCCCCCCCCCK...",
      "....KKCCCCCCCCCCCCKK....",
      "...KWWKKKKKKKKKKKKWWK...",
      "..KWWWWCCCCCCCCCCWWWWK..",
      "..KWWWWCCCCCCCCCCWWWWK..",
      "...KWWKKKKKKKKKKKKWWK...",
      "....KCCCK......KCCK.....",
      "....KKKKK.....KCCCK.....",
      "..............KKKKK.....",
      "........................",
      "........................",
      "........................",
      "........................",
      "........................"
    ]
  ]
};

// CHAMPION STAGE (28x28) - Greymon, Garurumon, Angemon
const CHAMPION_SPRITES: Record<PetSpecies, [string[], string[]]> = {
  pyro: [ // Greymon style (Brown helmet, horns, orange body with blue stripes)
    [
      "..........KKKKKKKK..........",
      "........KKBBBBBBBBKK........",
      ".......KBBBBBBBBBBBBK.......",
      "......KBBBBBBBBBBBBBBK......",
      ".....KKBBBBBBBBBBBBBBKK.....",
      "....KBBBKWOKKKKWOKBBBBK.....",
      "...KBBBBKWOKKKKWOKBBBBK.....",
      "...KBBBBBBBBBBBBBBBBBBK.....",
      "...KBBBBBKRRRRRRKBBBBBK.....",
      "....KBBBBKRRRRRRKBBBBK......",
      ".....KKKKKKKKKKKKKKKK.......",
      "....KKOOOOOOOOOOOOOOKK......",
      "...KOOOOOOOBBBOOOOOOOOK.....",
      "..KOOOOOOOOBBBOOOOOOOOOK....",
      "..KOOOYYYOOOOOOOOYYYOOOK....",
      "..KOOYYYYYYYYYYYYYYYOOOK....",
      "..KOOYYYYYYYYYYYYYYYOOOK....",
      "...KOOYYYYYYYYYYYYYOOOK.....",
      "....KKOOOOOOOOOOOOOOKK......",
      ".....KKKKKKKKKKKKKKKK.......",
      ".....KYYYYK....KYYYYK.......",
      "....KYYYYYK....KYYYYYK......",
      "...KYYYYYYK....KYYYYYYK.....",
      "...KKKKKKKK....KKKKKKKK.....",
      "............................",
      "............................",
      "............................",
      "............................"
    ],
    [
      "..........KKKKKKKK..........",
      "........KKBBBBBBBBKK........",
      ".......KBBBBBBBBBBBBK.......",
      "......KBBBBBBBBBBBBBBK......",
      ".....KKBBBBBBBBBBBBBBKK.....",
      "....KBBBKWOKKKKWOKBBBBK.....",
      "...KBBBBKWOKKKKWOKBBBBK.....",
      "...KBBBBBBBBBBBBBBBBBBK.....",
      "...KBBBBBKRRRRRRKBBBBBK.....",
      "....KBBBBKRRRRRRKBBBBK......",
      ".....KKKKKKKKKKKKKKKK.......",
      "....KKOOOOOOOOOOOOOOKK......",
      "...KOOOOOOOBBBOOOOOOOOK.....",
      "..KOOOOOOOOBBBOOOOOOOOOK....",
      "..KOOOYYYOOOOOOOOYYYOOOK....",
      "..KOOYYYYYYYYYYYYYYYOOOK....",
      "..KOOYYYYYYYYYYYYYYYOOOK....",
      "...KOOYYYYYYYYYYYYYOOOK.....",
      "....KKOOOOOOOOOOOOOOKK......",
      "....KYYYYYK.....KKKKK.......",
      "...KYYYYYYK....KYYYYK.......",
      "...KKKKKKKK...KYYYYYK.......",
      "..............KKKKKKK.......",
      "............................",
      "............................",
      "............................",
      "............................",
      "............................"
    ]
  ],
  luna: [ // Garurumon style
    [
      "..........KKKKKKKK..........",
      "........KKWWWWWWWWKK........",
      ".......KWWWWWWWWWWWWK.......",
      "......KWWBBWWWWWWBBWWK......",
      ".....KWWBBBBWWWWBBBBWWK.....",
      "....KWWWWKWOKKKKWOKWWWWK....",
      "....KWWWWKWOKKKKWOKWWWWK....",
      "....KWWWWWWWWWWWWWWWWWWK....",
      "....KWWWWWWKRRWWWWWWWWWK....",
      ".....KWWWWWRRRWWWWWWWWK.....",
      "....KKWWWWWWWWWWWWWWWWKK....",
      "...KBBKKWWWWWWWWWWWWKKBBK...",
      "..KBBBBKKKKKKKKKKKKKKBBBBK..",
      "..KBBBBBBBBBBBBBBBBBBBBBBK..",
      "..KBBBPBBBBBBBBBBBBBBPBBBK..",
      "..KBBBPBBBBBBBBBBBBBBPBBBK..",
      "...KBBBBBBBBBBBBBBBBBBBBK...",
      "....KKBBBBBBBBBBBBBBBBKK....",
      ".....KKKKKKKKKKKKKKKKKK.....",
      ".....KWWWWK......KWWWWK.....",
      "....KWWWWWK......KWWWWWK....",
      "...KWWWWWWK......KWWWWWWK...",
      "...KKKKKKKK......KKKKKKKK...",
      "............................",
      "............................",
      "............................",
      "............................",
      "............................"
    ],
    [
      "..........KKKKKKKK..........",
      "........KKWWWWWWWWKK........",
      ".......KWWWWWWWWWWWWK.......",
      "......KWWBBWWWWWWBBWWK......",
      ".....KWWBBBBWWWWBBBBWWK.....",
      "....KWWWWKWOKKKKWOKWWWWK....",
      "....KWWWWKWOKKKKWOKWWWWK....",
      "....KWWWWWWWWWWWWWWWWWWK....",
      "....KWWWWWWKRRWWWWWWWWWK....",
      ".....KWWWWWRRRWWWWWWWWK.....",
      "....KKWWWWWWWWWWWWWWWWKK....",
      "...KBBKKWWWWWWWWWWWWKKBBK...",
      "..KBBBBKKKKKKKKKKKKKKBBBBK..",
      "..KBBBBBBBBBBBBBBBBBBBBBBK..",
      "..KBBBPBBBBBBBBBBBBBBPBBBK..",
      "..KBBBPBBBBBBBBBBBBBBPBBBK..",
      "...KBBBBBBBBBBBBBBBBBBBBK...",
      "....KKBBBBBBBBBBBBBBBBKK....",
      "....KWWWWWK......KKKKK......",
      "...KWWWWWWK.....KWWWWK......",
      "...KKKKKKKK....KWWWWWK......",
      "...............KKKKKKK......",
      "............................",
      "............................",
      "............................",
      "............................",
      "............................",
      "............................"
    ]
  ],
  aether: [ // Angemon style (6 wings, angelic white & gold)
    [
      "KK........KKKKKK........KK",
      "KWWK....KKYYYYYYKK....KWWK",
      ".KWWK..KYYYYYYYYYYK..KWWK.",
      "..KWWKKYYYYYYYYYYYYKKWWK..",
      "...KWWKWWWWWWWWWWWWKWWK...",
      "....KKWWWWWWWWWWWWWWKK....",
      "...KWWKKWOKKKKKKWOKKWWK...",
      "..KWWWWKWOKKKKKKWOKWWWWK..",
      "..KWWWWWWWWWWWWWWWWWWWWK..",
      "..KWWWWWWWWWWWWWWWWWWWWK..",
      "...KWWWWWWWRRRRWWWWWWWK...",
      "....KKWWWWWWWWWWWWWWKK....",
      "....KYYKKKKKKKKKKKKYYK....",
      "...KYYYYWWWWWWWWWWYYYYK...",
      "..KYYYYYWWWWWWWWWWYYYYYK..",
      "..KYYYYYWWWWWWWWWWYYYYYK..",
      "...KYYYYKKKKKKKKKKYYYYK...",
      "....KKYYK........KYYKK....",
      ".....KWWK........KWWK.....",
      "....KWWWK........KWWWK....",
      "....KKKKK........KKKKK....",
      "..........................",
      "..........................",
      "..........................",
      "..........................",
      "..........................",
      "..........................",
      ".........................."
    ],
    [
      ".KK.......KKKKKK.......KK.",
      "..KWWK..KKYYYYYYKK..KWWK..",
      "...KWWKKYYYYYYYYYYKKWWK...",
      "....KWWKYYYYYYYYYYKWWK....",
      "....KKWWWWWWWWWWWWWWKK....",
      "...KWWKKWOKKKKKKWOKKWWK...",
      "..KWWWWKWOKKKKKKWOKWWWWK..",
      "..KWWWWWWWWWWWWWWWWWWWWK..",
      "..KWWWWWWWWWWWWWWWWWWWWK..",
      "...KWWWWWWWRRRRWWWWWWWK...",
      "....KKWWWWWWWWWWWWWWKK....",
      "....KYYKKKKKKKKKKKKYYK....",
      "...KYYYYWWWWWWWWWWYYYYK...",
      "..KYYYYYWWWWWWWWWWYYYYYK..",
      "..KYYYYYWWWWWWWWWWYYYYYK..",
      "...KYYYYKKKKKKKKKKYYYYK...",
      "....KWWWK........KYYKK....",
      "....KKKKK........KWWK.....",
      "................KWWWK.....",
      "................KKKKK.....",
      "..........................",
      "..........................",
      "..........................",
      "..........................",
      "..........................",
      "..........................",
      "..........................",
      ".........................."
    ]
  ]
};

// MEGA STAGE (28x28) - War-Mon, Metal-Fenrir, Seraphim (Cyber armored supreme)
const MEGA_SPRITES: Record<PetSpecies, [string[], string[]]> = {
  pyro: CHAMPION_SPRITES.pyro,
  luna: CHAMPION_SPRITES.luna,
  aether: CHAMPION_SPRITES.aether,
};

// ITEM SPRITES (Food, Poop, Medicine, Water)
export const ITEM_SPRITES = {
  meat: [
    "....KKKK....",
    "...KWWWWK...",
    "..KWWKKWWK..",
    ".KWWKLLKWWK.",
    ".KWKLLLLKWK.",
    "KBLBBBBBBLBK",
    "KBLLLLLLLLBK",
    "KBLBBBBBBLBK",
    ".KWKLLLLKWK.",
    ".KWWKLLKWWK.",
    "..KWWKKWWK..",
    "....KKKK...."
  ],
  poop: [
    "......KK......",
    ".....KQQK.....",
    "....KQPPQK....",
    "...KQQQQQQK...",
    "..KQPPPPPPQK..",
    ".KQQQQQQQQQQK.",
    "KQPPPPPPPPPPQK",
    "KQQQQQQQQQQQQK",
    "KQPPKWKKKWPPQK",
    "KQPPKWKKKWPPQK",
    "KQQQKKKKKKQQQK",
    ".KKKKKKKKKKKK."
  ],
  syringe: [
    "..........KK..",
    ".........KRRK.",
    "........KRRKK.",
    ".......KWWKK..",
    "......KWWKK...",
    ".....KRRKK....",
    "....KRRKK.....",
    "...KWWKK......",
    "..KWWKK.......",
    ".KKKK.........",
    "KK............",
    "K............."
  ],
  water: [
    "....KK....",
    "...KCCK...",
    "..KCCCCK..",
    ".KCCCCCCK.",
    ".KCCCCCCK.",
    "KCCCCCCCCK",
    "KCCCCCCCCK",
    "KCCCCCCCCK",
    ".KCCCCCCK.",
    "..KCCCCK..",
    "...KKKK...",
    ".........."
  ]
};

export const PetSprite: React.FC<PixelSpriteProps> = ({
  species,
  stage,
  frame = 0,
  action = 'idle',
  size = 120,
  className = '',
}) => {
  // Select row matrix
  let rows: string[] = [];
  const palette = SPRITE_PALETTES[species];
  const safeFrame = frame % 2;

  if (stage === 'egg') {
    rows = EGG_SPRITES[species][safeFrame];
  } else if (stage === 'baby') {
    rows = BABY_SPRITES[species][safeFrame];
  } else if (stage === 'in_training') {
    rows = IN_TRAINING_SPRITES[species][safeFrame];
  } else if (stage === 'rookie') {
    rows = ROOKIE_SPRITES[species][safeFrame];
  } else if (stage === 'champion') {
    rows = CHAMPION_SPRITES[species][safeFrame];
  } else {
    rows = MEGA_SPRITES[species][safeFrame];
  }

  if (!rows || rows.length === 0) return null;

  const height = rows.length;
  const width = rows[0]?.length || height;

  return (
    <div 
      className={`inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: '100%', shapeRendering: 'crispEdges' }}
      >
        {rows.map((row, y) => {
          return row.split('').map((char, x) => {
            const color = palette[char as keyof typeof palette];
            if (!color || color === 'transparent') return null;
            return (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={1}
                height={1}
                fill={color}
              />
            );
          });
        })}
      </svg>
    </div>
  );
};

// Item Sprite component for food, poop, etc.
export const PixelItem: React.FC<{ item: 'meat' | 'poop' | 'syringe' | 'water'; size?: number; className?: string }> = ({
  item,
  size = 32,
  className = '',
}) => {
  const rows = ITEM_SPRITES[item];
  const palette = SPRITE_PALETTES.misc;
  const height = rows.length;
  const width = rows[0].length;

  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: '100%', shapeRendering: 'crispEdges' }}
      >
        {rows.map((row, y) =>
          row.split('').map((char, x) => {
            const color = palette[char as keyof typeof palette];
            if (!color || color === 'transparent') return null;
            return <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} />;
          })
        )}
      </svg>
    </div>
  );
};
