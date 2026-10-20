import { CHAMPIONS, type ChampionId } from './championModels';
import { getChampionSkins } from './championSkins';

export type BotPersonality =
  | 'aggressive'
  | 'defensive'
  | 'evasive_flanker'
  | 'tactical_baiter'
  | 'dash_rusher';

export interface BotProfile {
  name: string;
  championId: ChampionId;
  skinId: string;
  personality: BotPersonality;
  chargeThreshold: number; // 45 to 85%
  reactionDelay: number;   // 0.08 to 0.22s
  speedModifier: number;   // 0.95 to 1.12
}

const CLAN_PREFIXES = [
  '[VIP]', '[PRO]', '[ELITE]', '[APEX]', '[KONG]', '[SKULL]', '[NINJA]', '[STORM]',
  '[GOD]', '[MYTH]', '[CHAMP]', '[WAR]', '[RUSH]', '[TITAN]', '[NEO]', '[OMEGA]',
  'xX_', 'Dark_', 'Ghost_', 'Cyber_', 'Shadow_', 'Hyper_', 'Solar_', 'Void_',
  'Blaze_', 'Frost_', 'Viper_', 'Iron_', 'Toxic_', 'Rogue_', 'Turbo_', 'Master_',
  'Lord_', 'King_', 'Captain_', 'Agent_', 'Super_', 'Alpha_', 'Zenith_', 'Drift_'
];

const ROOTS = [
  'Striker', 'Phantom', 'Vortex', 'Samurai', 'Brawler', 'Knight', 'Dragon', 'Slayer',
  'Hunter', 'Sniper', 'Gladiator', 'Beast', 'Warrior', 'Reaper', 'Specter', 'Blaster',
  'Crusher', 'Racer', 'Juggernaut', 'Champion', 'Assassin', 'Falcon', 'Wolf', 'Tiger',
  'Cobra', 'Panther', 'Hawk', 'Raven', 'Titan', 'Phoenix', 'Thunder', 'Blaze',
  'Shadow', 'Frost', 'Surge', 'Pulse', 'Volt', 'Nitro', 'Venom', 'Rogue',
  'Ronin', 'Shinobi', 'Ninja', 'Drifter', 'Pilot', 'Destroyer', 'Overlord', 'Enforcer',
  'Ranger', 'Trooper', 'Scout', 'Vandal', 'Gunner', 'Marksman', 'Maverick', 'Challenger',
  'Apex', 'Gorr', 'Nova', 'Bolt', 'Kage', 'Kai', 'Leo'
];

const SUFFIXES = [
  '_GG', '_Pro', '_YT', '_X', '_99', '_77', '_007', '_Prime', '_Ultra', '_Max',
  '_King', '_God', '_FX', '_TTV', '_Live', '_Official', '_BR', '_US', '_IN', '_JP',
  '_EU', '_999', '_101', '_777', '_360', '_404', '_HD', '_FPS', '_OP', '_Boss',
  '_Zero', '_Apex', '_Nova', '_Storm', '_Core', '_Strike', '_Blaze', '_Rush', '_Fury',
  '_Slash', '_Pulse', '_Edge', '_Fang', '_Claw', '_Clash', '_Raid', '_Zone', '_Drift'
];

const PERSONALITIES: BotPersonality[] = [
  'aggressive',
  'defensive',
  'evasive_flanker',
  'tactical_baiter',
  'dash_rusher'
];

/**
 * Generates an authentic bot name chosen from over 100,000+ realistic combinations
 */
export function generateRandomBotName(): string {
  const roll = Math.random();
  const root = ROOTS[Math.floor(Math.random() * ROOTS.length)];
  const num = Math.floor(10 + Math.random() * 990);

  if (roll < 0.25) {
    // Prefix + Root + Number e.g. [PRO]Shadow_482
    const prefix = CLAN_PREFIXES[Math.floor(Math.random() * CLAN_PREFIXES.length)];
    return `${prefix}${root}_${num}`;
  } else if (roll < 0.5) {
    // Root + Suffix e.g. Phantom_Prime
    const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
    return `${root}${suffix}`;
  } else if (roll < 0.75) {
    // Prefix + Root + Suffix e.g. Dark_Striker_GG
    const prefix = CLAN_PREFIXES[Math.floor(Math.random() * CLAN_PREFIXES.length)];
    const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
    return `${prefix}${root}${suffix}`;
  } else {
    // Root + Root + Num e.g. ShadowVortex_99
    const root2 = ROOTS[Math.floor(Math.random() * ROOTS.length)];
    return `${root}${root2}_${num}`;
  }
}

/**
 * Generates a full Bot Profile with random name, random champion, random skin, and custom AI personality
 */
export function generateRandomBot(excludeChampion?: ChampionId): BotProfile {
  const availableChampions: ChampionId[] = (Object.keys(CHAMPIONS) as ChampionId[]).filter(
    (c) => c !== excludeChampion
  );
  const championId = availableChampions[Math.floor(Math.random() * availableChampions.length)] || 'kage';

  const skins = getChampionSkins(championId);
  const skin = skins[Math.floor(Math.random() * skins.length)];
  const skinId = skin ? skin.id : `${championId}_default`;

  const personality = PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];

  // Personality traits:
  let chargeThreshold = 60;
  let reactionDelay = 0.15;
  let speedModifier = 1.0;

  switch (personality) {
    case 'aggressive':
      chargeThreshold = 50 + Math.random() * 15;
      reactionDelay = 0.08 + Math.random() * 0.05;
      speedModifier = 1.08;
      break;
    case 'defensive':
      chargeThreshold = 80 + Math.random() * 15;
      reactionDelay = 0.14 + Math.random() * 0.06;
      speedModifier = 0.98;
      break;
    case 'evasive_flanker':
      chargeThreshold = 65 + Math.random() * 15;
      reactionDelay = 0.10 + Math.random() * 0.06;
      speedModifier = 1.05;
      break;
    case 'tactical_baiter':
      chargeThreshold = 70 + Math.random() * 15;
      reactionDelay = 0.12 + Math.random() * 0.06;
      speedModifier = 1.02;
      break;
    case 'dash_rusher':
      chargeThreshold = 45 + Math.random() * 12;
      reactionDelay = 0.09 + Math.random() * 0.04;
      speedModifier = 1.10;
      break;
  }

  return {
    name: generateRandomBotName(),
    championId,
    skinId,
    personality,
    chargeThreshold,
    reactionDelay,
    speedModifier,
  };
}
