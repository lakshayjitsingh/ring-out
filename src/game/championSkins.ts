import { type ChampionId } from './championModels';

export type SkinRarity = 'default' | 'rare' | 'epic' | 'legendary';

export interface ChampionSkin {
  id: string;
  championId: ChampionId;
  name: string;
  rarity: SkinRarity;
  tagline: string;
  description: string;
  themeColor: string;
  glowColor: number;
  badge: string;
  gemCost: number;
  unlockedByDefault?: boolean;
}

export const CHAMPION_SKINS_DATA: Record<ChampionId, ChampionSkin[]> = {
  leo: [
    {
      id: 'leo_default',
      championId: 'leo',
      name: 'Classic Coastal Scout',
      rarity: 'default',
      tagline: 'Standard Island Brawler Attire',
      description: 'Emerald vest, backwards cap, quick coastal reflexes.',
      themeColor: '#10b981',
      glowColor: 0x10b981,
      badge: 'DEFAULT',
      gemCost: 0,
      unlockedByDefault: true,
    },
    // Rare 1
    {
      id: 'leo_sunset',
      championId: 'leo',
      name: 'Sunset Reef Leo',
      rarity: 'rare',
      tagline: 'Tropical Coral & Golden Hour Diver',
      description: 'Sun-kissed coral orange fabrics with turquoise marine trims and sun-bleached hair.',
      themeColor: '#f97316',
      glowColor: 0xf97316,
      badge: 'RARE',
      gemCost: 150,
    },
    // Rare 2
    {
      id: 'leo_midnight',
      championId: 'leo',
      name: 'Midnight Tide Leo',
      rarity: 'rare',
      tagline: 'Bioluminescent Abyss Diver',
      description: 'Deep oceanic navy robes accented with glowing neon sea-foam bioluminescence.',
      themeColor: '#06b6d4',
      glowColor: 0x06b6d4,
      badge: 'RARE',
      gemCost: 150,
    },
    // Epic 1
    {
      id: 'leo_volcanic',
      championId: 'leo',
      name: 'Volcanic Raider Leo',
      rarity: 'epic',
      tagline: 'Forged in Oceanic Magma',
      description: 'Obsidian volcanic armor with smoldering lava seams, charred shorts, and smoking ember fists.',
      themeColor: '#ef4444',
      glowColor: 0xef4444,
      badge: 'EPIC',
      gemCost: 400,
    },
    // Epic 2
    {
      id: 'leo_cyber',
      championId: 'leo',
      name: 'Cyber Surge Leo',
      rarity: 'epic',
      tagline: 'Neon Cyberpunk Edge Runner',
      description: 'High-tech neon reactive runner jacket, glowing holographic HUD visor, and carbon fiber knuckle boosters.',
      themeColor: '#38bdf8',
      glowColor: 0x38bdf8,
      badge: 'EPIC',
      gemCost: 400,
    },
    // Legendary
    {
      id: 'leo_poseidon',
      championId: 'leo',
      name: 'Poseidon God-King Leo',
      rarity: 'legendary',
      tagline: '👑 Mythic Sovereign of the Abyssal Ocean',
      description: 'Ascended oceanic deity. Possesses a floating golden sea crown, orbiting tidal pearls, embossed royal scale armor, and divine azure god-eyes!',
      themeColor: '#facc15',
      glowColor: 0x38bdf8,
      badge: 'LEGENDARY',
      gemCost: 950,
    },
  ],

  kai: [
    {
      id: 'kai_default',
      championId: 'kai',
      name: 'Classic Street Striker',
      rarity: 'default',
      tagline: 'Standard Urban Metropolis Gear',
      description: 'Matte black hoodie, cyan glow trims, spiky hair.',
      themeColor: '#00f5ff',
      glowColor: 0x00f5ff,
      badge: 'DEFAULT',
      gemCost: 0,
      unlockedByDefault: true,
    },
    // Rare 1
    {
      id: 'kai_acid',
      championId: 'kai',
      name: 'Acid Lime Kai',
      rarity: 'rare',
      tagline: 'Radioactive Street Graffiti',
      description: 'High-visibility neon lime and toxic yellow jacket with hazardous urban tag graphics.',
      themeColor: '#84cc16',
      glowColor: 0x84cc16,
      badge: 'RARE',
      gemCost: 150,
    },
    // Rare 2
    {
      id: 'kai_vapor',
      championId: 'kai',
      name: 'Vaporwave Kai',
      rarity: 'rare',
      tagline: 'Retro 80s Sunset Arcade',
      description: 'Pastel magenta and sunburst violet synthwave palette with retro neon arcade headphones.',
      themeColor: '#ec4899',
      glowColor: 0xec4899,
      badge: 'RARE',
      gemCost: 150,
    },
    // Epic 1
    {
      id: 'kai_mecha',
      championId: 'kai',
      name: 'Mecha Rebel Kai',
      rarity: 'epic',
      tagline: 'Hydraulic Titanium Street Exoskeleton',
      description: 'Armored industrial shoulder pistons, augmented targeting monocle, and hazard-stripe reinforced sneakers.',
      themeColor: '#eab308',
      glowColor: 0xeab308,
      badge: 'EPIC',
      gemCost: 400,
    },
    // Epic 2
    {
      id: 'kai_inferno',
      championId: 'kai',
      name: 'Inferno Street Kai',
      rarity: 'epic',
      tagline: 'Blazing Asphalt Demon',
      description: 'Charred streetwear jacket with burning fiery orange hair tips and molten magma sneaker treads.',
      themeColor: '#f97316',
      glowColor: 0xf97316,
      badge: 'EPIC',
      gemCost: 400,
    },
    // Legendary
    {
      id: 'kai_quantum',
      championId: 'kai',
      name: 'Quantum Overdrive Kai',
      rarity: 'legendary',
      tagline: '👑 Reality-Bending Tachyon God',
      description: 'Ascended cybernetic deity! Features floating holographic tachyon wing thrusters, a spinning quantum pulse halo, and chromatic refraction laser aura.',
      themeColor: '#00f5ff',
      glowColor: 0x00f5ff,
      badge: 'LEGENDARY',
      gemCost: 950,
    },
  ],

  nova: [
    {
      id: 'nova_default',
      championId: 'nova',
      name: 'Classic Valkyrie Boxer',
      rarity: 'default',
      tagline: 'Standard Grand Championship Kit',
      description: 'Crimson silks, high swinging ponytail, taped boxing wraps.',
      themeColor: '#f43f5e',
      glowColor: 0xf43f5e,
      badge: 'DEFAULT',
      gemCost: 0,
      unlockedByDefault: true,
    },
    // Rare 1
    {
      id: 'nova_amethyst',
      championId: 'nova',
      name: 'Amethyst Blitz Nova',
      rarity: 'rare',
      tagline: 'Royal Crystalline Duelist',
      description: 'Deep royal purple and iridescent crystal lavender kickboxing silks with violet gemstone wraps.',
      themeColor: '#a855f7',
      glowColor: 0xa855f7,
      badge: 'RARE',
      gemCost: 150,
    },
    // Rare 2
    {
      id: 'nova_arctic',
      championId: 'nova',
      name: 'Arctic Frost Nova',
      rarity: 'rare',
      tagline: 'Sub-Zero Glacier Fighter',
      description: 'Polar ice-blue silks with silver frosted ponytail and shimmering sub-zero ice crystals.',
      themeColor: '#38bdf8',
      glowColor: 0x38bdf8,
      badge: 'RARE',
      gemCost: 150,
    },
    // Epic 1
    {
      id: 'nova_crimson_valkyrie',
      championId: 'nova',
      name: 'Crimson Valkyrie Nova',
      rarity: 'epic',
      tagline: 'Mythic Asgardian War Maiden',
      description: 'Winged silver battle tiara, blood-ruby studded chestplate, runic embroidered boxing sashes, and golden fur greaves.',
      themeColor: '#e11d48',
      glowColor: 0xe11d48,
      badge: 'EPIC',
      gemCost: 400,
    },
    // Epic 2
    {
      id: 'nova_cyberpunk',
      championId: 'nova',
      name: 'Neon Cyberpunk Nova',
      rarity: 'epic',
      tagline: 'Synthetic Strike Prototype',
      description: 'Neon pink LED fiber hair streaks, polished chrome boxing gloves, and cybernetic leg shock-absorbers.',
      themeColor: '#ec4899',
      glowColor: 0xec4899,
      badge: 'EPIC',
      gemCost: 400,
    },
    // Legendary
    {
      id: 'nova_solar_eclipse',
      championId: 'nova',
      name: 'Solar Eclipse Goddess Nova',
      rarity: 'legendary',
      tagline: '👑 Cosmic Sovereign of Stellar Fury',
      description: 'Cosmic deity of celestial combat! Features twin floating radiant solar wing flares, a spinning coronal sun halo, and pulsing cosmic starfield armor.',
      themeColor: '#fbbf24',
      glowColor: 0xf59e0b,
      badge: 'LEGENDARY',
      gemCost: 950,
    },
  ],

  titan: [
    {
      id: 'titan_default',
      championId: 'titan',
      name: 'Classic Mountain Juggernaut',
      rarity: 'default',
      tagline: 'Standard Iron Peak Attire',
      description: 'Boulder shoulders, full beard, golden champion belt.',
      themeColor: '#f59e0b',
      glowColor: 0xf59e0b,
      badge: 'DEFAULT',
      gemCost: 0,
      unlockedByDefault: true,
    },
    // Rare 1
    {
      id: 'titan_granite',
      championId: 'titan',
      name: 'Granite Stone Gorr',
      rarity: 'rare',
      tagline: 'Living Mountain Quarry Rock',
      description: 'Weathered chiseled stone body with emerald moss veins and heavy carved boulder belt.',
      themeColor: '#64748b',
      glowColor: 0x64748b,
      badge: 'RARE',
      gemCost: 150,
    },
    // Rare 2
    {
      id: 'titan_crimson',
      championId: 'titan',
      name: 'Crimson Brawler Gorr',
      rarity: 'rare',
      tagline: 'Heavyweight Championship Ring Beast',
      description: 'Scarlet heavyweight singlet with braided golden powerlifting ropes and blood-red wrist cuffs.',
      themeColor: '#dc2626',
      glowColor: 0xdc2626,
      badge: 'RARE',
      gemCost: 150,
    },
    // Epic 1
    {
      id: 'titan_gladiator',
      championId: 'titan',
      name: 'Colosseum Gladiator Gorr',
      rarity: 'epic',
      tagline: 'Imperial Arena Champion',
      description: 'Imperial bronze lion-head pauldron, studded leather war skirt, crowned gladiator plume, and spiked knuckle guards.',
      themeColor: '#d97706',
      glowColor: 0xd97706,
      badge: 'EPIC',
      gemCost: 400,
    },
    // Epic 2
    {
      id: 'titan_yeti',
      championId: 'titan',
      name: 'Frost Yeti Gorr',
      rarity: 'epic',
      tagline: 'Berserker of the Alpine Blizzards',
      description: 'Thick snowy white fur mantle, frosted icicle beard, glacial rune armor plates, and sub-zero frost breath.',
      themeColor: '#0ea5e9',
      glowColor: 0x0ea5e9,
      badge: 'EPIC',
      gemCost: 400,
    },
    // Legendary
    {
      id: 'titan_magma_titan',
      championId: 'titan',
      name: 'Magma Titan Destroyer Gorr',
      rarity: 'legendary',
      tagline: '👑 Primordial Earthshaker of the Deep Earth',
      description: 'Primeval volcanic god! Features cracking molten core chest showing roaring interior magma, floating volcanic basalt boulders orbiting his shoulders, and fiery horned crown.',
      themeColor: '#f97316',
      glowColor: 0xff3b00,
      badge: 'LEGENDARY',
      gemCost: 950,
    },
  ],

  kage: [
    {
      id: 'kage_default',
      championId: 'kage',
      name: 'Classic Shadow Shinobi',
      rarity: 'default',
      tagline: 'Standard Night Shallows Uniform',
      description: 'Obsidian cowl, jade diagonal sash, metallic ninja visor.',
      themeColor: '#059669',
      glowColor: 0x059669,
      badge: 'DEFAULT',
      gemCost: 0,
      unlockedByDefault: true,
    },
    // Rare 1
    {
      id: 'kage_bloodline',
      championId: 'kage',
      name: 'Crimson Bloodline Kage',
      rarity: 'rare',
      tagline: 'Blood-Moon Assassin Creed',
      description: 'Deep crimson and obsidian robes with trailing scarlet headband ribbons and glowing ruby visor slit.',
      themeColor: '#b91c1c',
      glowColor: 0xb91c1c,
      badge: 'RARE',
      gemCost: 150,
    },
    // Rare 2
    {
      id: 'kage_white_lotus',
      championId: 'kage',
      name: 'White Lotus Kage',
      rarity: 'rare',
      tagline: 'Silent Monastic Master',
      description: 'Snow-white assassin garb with golden lotus embroidered trim, bamboo green visor, and platinum kunai sashes.',
      themeColor: '#10b981',
      glowColor: 0x10b981,
      badge: 'RARE',
      gemCost: 150,
    },
    // Epic 1
    {
      id: 'kage_cyber_ronin',
      championId: 'kage',
      name: 'Cyber Ronin Kage',
      rarity: 'epic',
      tagline: 'Nanotech Samurai Infiltrator',
      description: 'Segmented carbon nanotech armor, holographic samurai kabuto crest, glowing neon cyan visor with digital scan lines.',
      themeColor: '#06b6d4',
      glowColor: 0x06b6d4,
      badge: 'EPIC',
      gemCost: 400,
    },
    // Epic 2
    {
      id: 'kage_demon_oni',
      championId: 'kage',
      name: 'Demon Oni Kage',
      rarity: 'epic',
      tagline: 'Vengeful Japanese Folklore Phantom',
      description: 'Menacing crimson demon-horn oni mask, spectral spirit robes, braided sacred rope belt, and smoky phantom wisps.',
      themeColor: '#dc2626',
      glowColor: 0xdc2626,
      badge: 'EPIC',
      gemCost: 400,
    },
    // Legendary
    {
      id: 'kage_void_phantom',
      championId: 'kage',
      name: 'Void Phantom Kage',
      rarity: 'legendary',
      tagline: '👑 Eldritch Shinobi of the Cosmic Void',
      description: 'Ascended shadow entity from the abyss! Features dual floating spectral obsidian blade wings, cosmic void orbs, ethereal galaxy dust robes, and a horned demonic shadow crown.',
      themeColor: '#9333ea',
      glowColor: 0xa855f7,
      badge: 'LEGENDARY',
      gemCost: 950,
    },
  ],

  bolt: [
    {
      id: 'bolt_default',
      championId: 'bolt',
      name: 'Classic Street Sprinter',
      rarity: 'default',
      tagline: 'Standard High-Voltage Runners',
      description: 'Electric yellow windbreaker, speed goggles, parkour runners.',
      themeColor: '#eab308',
      glowColor: 0xeab308,
      badge: 'DEFAULT',
      gemCost: 0,
      unlockedByDefault: true,
    },
    // Rare 1
    {
      id: 'bolt_azure',
      championId: 'bolt',
      name: 'Neon Azure Axel',
      rarity: 'rare',
      tagline: 'Sonic Velocity Track Runner',
      description: 'Electric cerulean windbreaker with cobalt racing stripes and sonic cyan track goggles.',
      themeColor: '#0284c7',
      glowColor: 0x0284c7,
      badge: 'RARE',
      gemCost: 150,
    },
    // Rare 2
    {
      id: 'bolt_velocity',
      championId: 'bolt',
      name: 'Velocity Orange Axel',
      rarity: 'rare',
      tagline: 'Sunrise Apex Sprinter',
      description: 'Blazing sunrise orange and matte black parkour gear with checkered speed decals and sunset mirrored lenses.',
      themeColor: '#f97316',
      glowColor: 0xf97316,
      badge: 'RARE',
      gemCost: 150,
    },
    // Epic 1
    {
      id: 'bolt_cyber_racer',
      championId: 'bolt',
      name: 'Cyber Racer Axel',
      rarity: 'epic',
      tagline: 'Supersonic Tachyon Jet Suit',
      description: 'Aerodynamic shoulder cowls, digital speed readout chest HUD, turbo exhaust heel jets, and glowing tachyon visor.',
      themeColor: '#38bdf8',
      glowColor: 0x38bdf8,
      badge: 'EPIC',
      gemCost: 400,
    },
    // Epic 2
    {
      id: 'bolt_stealth_operative',
      championId: 'bolt',
      name: 'Stealth Operative Axel',
      rarity: 'epic',
      tagline: 'Covert Black-Ops Night Runner',
      description: 'Matte stealth-black ballistic vest, infrared night-vision goggles, shock-absorbing stealth soles, and utility tactical rig.',
      themeColor: '#10b981',
      glowColor: 0x10b981,
      badge: 'EPIC',
      gemCost: 400,
    },
    // Legendary
    {
      id: 'bolt_raijin',
      championId: 'bolt',
      name: 'Thunder God Raijin Axel',
      rarity: 'legendary',
      tagline: '👑 Mythic Deity of Sky-Splitting Lightning',
      description: 'Mythic lightning deity! Features floating electrified Raijin thunder-drums encircling his back, pulsing blue-white lightning arc tendrils, golden storm-cloud crown, and flashing electric yellow eyes!',
      themeColor: '#facc15',
      glowColor: 0xfde047,
      badge: 'LEGENDARY',
      gemCost: 950,
    },
  ],
};

// Flattened dictionary lookup
export const ALL_SKINS: Record<string, ChampionSkin> = {};
Object.values(CHAMPION_SKINS_DATA).forEach((skins) => {
  skins.forEach((skin) => {
    ALL_SKINS[skin.id] = skin;
  });
});

export function getChampionSkins(championId: ChampionId): ChampionSkin[] {
  return CHAMPION_SKINS_DATA[championId] || [];
}

export function getSkinInfo(skinId: string): ChampionSkin | undefined {
  return ALL_SKINS[skinId];
}

export function getEquippedSkin(championId: ChampionId): string {
  try {
    const saved = localStorage.getItem(`ringout_skin_${championId}`);
    if (saved && ALL_SKINS[saved]) return saved;
  } catch {}
  return `${championId}_default`;
}

export function setEquippedSkin(championId: ChampionId, skinId: string): void {
  try {
    localStorage.setItem(`ringout_skin_${championId}`, skinId);
  } catch {}
}

export function isSkinUnlocked(skinId: string): boolean {
  if (skinId.endsWith('_default')) return true;
  try {
    const saved = localStorage.getItem('ringout_unlocked_skins');
    if (saved) {
      const list: string[] = JSON.parse(saved);
      return list.includes(skinId);
    }
  } catch {}
  return false;
}

export function unlockSkin(skinId: string): void {
  try {
    const saved = localStorage.getItem('ringout_unlocked_skins');
    const list: string[] = saved ? JSON.parse(saved) : [];
    if (!list.includes(skinId)) {
      list.push(skinId);
      localStorage.setItem('ringout_unlocked_skins', JSON.stringify(list));
    }
  } catch {}
}
