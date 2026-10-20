import { type ChampionId } from './championModels';

export type LeaderboardCountry = 'global' | 'us' | 'in' | 'br' | 'jp' | 'eu';

export interface LeaderboardEntry {
  rank: number;
  name: string;
  flag: string;
  country: LeaderboardCountry;
  trophies: number;
  championId: ChampionId;
  previousRank?: number;
}

const COUNTRY_FLAGS: Record<LeaderboardCountry, string> = {
  global: '🌐',
  us: '🇺🇸',
  in: '🇮🇳',
  br: '🇧🇷',
  jp: '🇯🇵',
  eu: '🇪🇺',
};

const BASE_NAMES: { name: string; flag: string; country: LeaderboardCountry; championId: ChampionId }[] = [
  // Global & Elite Legends
  { name: 'ViperX_Pro', flag: '🇺🇸', country: 'us', championId: 'titan' },
  { name: 'ShadowStrike', flag: '🇮🇳', country: 'in', championId: 'kage' },
  { name: 'Tokyo_Ghost', flag: '🇯🇵', country: 'jp', championId: 'nova' },
  { name: 'AuraLord', flag: '🇪🇺', country: 'eu', championId: 'leo' },
  { name: 'Axel_Runner99', flag: '🇪🇺', country: 'eu', championId: 'bolt' },
  { name: 'Kaiser_Brawl', flag: '🇧🇷', country: 'br', championId: 'titan' },
  { name: 'NovaPrime_X', flag: '🇺🇸', country: 'us', championId: 'nova' },
  { name: 'Shinobi_Ronin', flag: '🇯🇵', country: 'jp', championId: 'kage' },
  { name: 'IronFist_Dave', flag: '🇺🇸', country: 'us', championId: 'leo' },
  { name: 'PixelBlaze', flag: '🇪🇺', country: 'eu', championId: 'bolt' },
  { name: 'Apex_Venom', flag: '🇺🇸', country: 'us', championId: 'titan' },
  { name: 'NightPhantom', flag: '🇮🇳', country: 'in', championId: 'kage' },
  { name: 'Solaris_God', flag: '🇪🇺', country: 'eu', championId: 'nova' },
  { name: 'Overcharge_Pro', flag: '🇪🇺', country: 'eu', championId: 'bolt' },
  { name: 'ThunderGorr', flag: '🇧🇷', country: 'br', championId: 'titan' },
  { name: 'Raptor_Strike', flag: '🇪🇺', country: 'eu', championId: 'leo' },
  { name: 'Silent_Kunai', flag: '🇯🇵', country: 'jp', championId: 'kage' },
  { name: 'Celestial_Sky', flag: '🇺🇸', country: 'us', championId: 'nova' },
  { name: 'Gorr_Crusher', flag: '🇺🇸', country: 'us', championId: 'titan' },
  { name: 'BrawlSensei', flag: '🇮🇳', country: 'in', championId: 'leo' },

  // India Regional Contenders
  { name: 'Vortex_Rishi', flag: '🇮🇳', country: 'in', championId: 'nova' },
  { name: 'Aryan_Titan', flag: '🇮🇳', country: 'in', championId: 'titan' },
  { name: 'Desi_Shinobi', flag: '🇮🇳', country: 'in', championId: 'kage' },
  { name: 'Kunal_Bolt', flag: '🇮🇳', country: 'in', championId: 'bolt' },
  { name: 'Kabir_Smash', flag: '🇮🇳', country: 'in', championId: 'titan' },
  { name: 'Rohan_Leo', flag: '🇮🇳', country: 'in', championId: 'leo' },
  { name: 'Simran_Nova', flag: '🇮🇳', country: 'in', championId: 'nova' },
  { name: 'Agni_Fury', flag: '🇮🇳', country: 'in', championId: 'titan' },
  { name: 'Veer_Kage', flag: '🇮🇳', country: 'in', championId: 'kage' },
  { name: 'Aarav_Apex', flag: '🇮🇳', country: 'in', championId: 'kai' },
  { name: 'Bharat_King', flag: '🇮🇳', country: 'in', championId: 'leo' },
  { name: 'Dev_Lightning', flag: '🇮🇳', country: 'in', championId: 'bolt' },

  // USA Contenders
  { name: 'GhostRider_US', flag: '🇺🇸', country: 'us', championId: 'kage' },
  { name: 'Blaze_Titan', flag: '🇺🇸', country: 'us', championId: 'titan' },
  { name: 'QuantumSpeed', flag: '🇺🇸', country: 'us', championId: 'bolt' },
  { name: 'FrostBite_99', flag: '🇺🇸', country: 'us', championId: 'kai' },
  { name: 'Valkyrie_Star', flag: '🇺🇸', country: 'us', championId: 'nova' },
  { name: 'RogueOne_GG', flag: '🇺🇸', country: 'us', championId: 'leo' },
  { name: 'HawkEye_US', flag: '🇺🇸', country: 'us', championId: 'kage' },
  { name: 'Colossus_Max', flag: '🇺🇸', country: 'us', championId: 'titan' },
  { name: 'CyberHawk', flag: '🇺🇸', country: 'us', championId: 'bolt' },
  { name: 'Maverick_Pro', flag: '🇺🇸', country: 'us', championId: 'kai' },

  // Brazil Contenders
  { name: 'Favela_King', flag: '🇧🇷', country: 'br', championId: 'leo' },
  { name: 'Samba_Striker', flag: '🇧🇷', country: 'br', championId: 'bolt' },
  { name: 'Capoeira_God', flag: '🇧🇷', country: 'br', championId: 'nova' },
  { name: 'Titan_Amazonas', flag: '🇧🇷', country: 'br', championId: 'titan' },
  { name: 'Rio_Phantom', flag: '🇧🇷', country: 'br', championId: 'kage' },
  { name: 'Fogo_Selvagem', flag: '🇧🇷', country: 'br', championId: 'kai' },
  { name: 'Carnaval_Fury', flag: '🇧🇷', country: 'br', championId: 'leo' },
  { name: 'Matador_BR', flag: '🇧🇷', country: 'br', championId: 'titan' },

  // Japan Contenders
  { name: 'Kenji_Katana', flag: '🇯🇵', country: 'jp', championId: 'kage' },
  { name: 'Sakura_Bloom', flag: '🇯🇵', country: 'jp', championId: 'nova' },
  { name: 'Fuji_Thunder', flag: '🇯🇵', country: 'jp', championId: 'titan' },
  { name: 'Shinkansen_Speed', flag: '🇯🇵', country: 'jp', championId: 'bolt' },
  { name: 'Akira_Drift', flag: '🇯🇵', country: 'jp', championId: 'kai' },
  { name: 'Kyoto_Master', flag: '🇯🇵', country: 'jp', championId: 'leo' },
  { name: 'Hanzo_Shadow', flag: '🇯🇵', country: 'jp', championId: 'kage' },
  { name: 'Tsunami_Raijin', flag: '🇯🇵', country: 'jp', championId: 'bolt' },

  // Europe Contenders
  { name: 'Nordic_Thor', flag: '🇪🇺', country: 'eu', championId: 'titan' },
  { name: 'Berlin_Wall', flag: '🇪🇺', country: 'eu', championId: 'titan' },
  { name: 'Paris_Phantom', flag: '🇪🇺', country: 'eu', championId: 'kage' },
  { name: 'Alpine_Blizzard', flag: '🇪🇺', country: 'eu', championId: 'kai' },
  { name: 'Monaco_Racer', flag: '🇪🇺', country: 'eu', championId: 'bolt' },
  { name: 'Roma_Gladiator', flag: '🇪🇺', country: 'eu', championId: 'leo' },
  { name: 'Viking_Berserk', flag: '🇪🇺', country: 'eu', championId: 'titan' },
  { name: 'London_Brawler', flag: '🇪🇺', country: 'eu', championId: 'nova' },
];

// Pool of extra names to generate 100 players per leaderboard and rotate in
const EXTRA_NAME_PARTS = [
  'Zero', 'Nova', 'Pulse', 'Blaze', 'Storm', 'Shadow', 'Apex', 'Titan', 'Viper', 'Frost',
  'Nexus', 'Echo', 'Drift', 'Rogue', 'Venom', 'Strike', 'Phantom', 'Slash', 'Volt', 'Zenith',
  'Cyber', 'Hyper', 'Omega', 'Alpha', 'Turbo', 'Matrix', 'Karma', 'Savage', 'Havoc', 'Rune'
];

const CHAMPION_ROSTER: ChampionId[] = ['leo', 'bolt', 'kage', 'titan', 'nova', 'kai'];

const ROTATION_CHALLENGERS: { name: string; flag: string; country: LeaderboardCountry; championId: ChampionId }[] = [
  { name: 'Valkyrie_Echo', flag: '🇺🇸', country: 'us', championId: 'nova' },
  { name: 'Desi_Thunder', flag: '🇮🇳', country: 'in', championId: 'bolt' },
  { name: 'Oni_Slayer', flag: '🇯🇵', country: 'jp', championId: 'kage' },
  { name: 'Amazon_Rumble', flag: '🇧🇷', country: 'br', championId: 'titan' },
  { name: 'Copenhagen_King', flag: '🇪🇺', country: 'eu', championId: 'leo' },
  { name: 'Raptor_Neo', flag: '🇺🇸', country: 'us', championId: 'kai' },
  { name: 'Punjab_Panther', flag: '🇮🇳', country: 'in', championId: 'titan' },
  { name: 'Samurai_Edge', flag: '🇯🇵', country: 'jp', championId: 'kage' },
  { name: 'Samba_Nitro', flag: '🇧🇷', country: 'br', championId: 'bolt' },
  { name: 'Iberian_Bull', flag: '🇪🇺', country: 'eu', championId: 'titan' },
];

/**
 * Generate full 100 entries for a leaderboard, starting from ~9,250 down to ~5,050
 * ALL players are strictly above 5,000 trophies, and always below 10,000 trophies!
 */
function generateLeaderboardSet(country: LeaderboardCountry): LeaderboardEntry[] {
  const result: LeaderboardEntry[] = [];
  const countryFlag = COUNTRY_FLAGS[country];

  // Pick candidates matching country or global
  const filtered = country === 'global'
    ? [...BASE_NAMES]
    : BASE_NAMES.filter((p) => p.country === country);

  // Fill up to 100 players
  let seedIndex = 0;
  while (filtered.length < 100) {
    const p1 = EXTRA_NAME_PARTS[seedIndex % EXTRA_NAME_PARTS.length];
    const p2 = EXTRA_NAME_PARTS[(seedIndex * 3 + 7) % EXTRA_NAME_PARTS.length];
    const num = ((seedIndex * 17) % 900) + 10;
    const champ = CHAMPION_ROSTER[seedIndex % CHAMPION_ROSTER.length];
    filtered.push({
      name: `${p1}${p2}_${num}`,
      flag: countryFlag,
      country,
      championId: champ,
    });
    seedIndex++;
  }

  // Trophies smoothly descending from 9,250 down to 5,050
  // Top 1: ~9,250
  // Rank 100: ~5,080
  const maxTrophies = 9250;
  const minTrophies = 5080;
  const range = maxTrophies - minTrophies;

  for (let i = 0; i < 100; i++) {
    const candidate = filtered[i];
    // Slightly randomized curve
    const progress = i / 99; // 0.0 to 1.0
    const curve = Math.pow(progress, 0.85); // slight curve
    const baseTrophies = Math.round(maxTrophies - curve * range);
    // Add small individual variation (+/- 25)
    const variation = ((i * 37) % 50) - 25;
    const finalTrophies = Math.min(9450, Math.max(5050, baseTrophies + variation));

    result.push({
      rank: i + 1,
      name: candidate.name,
      flag: candidate.flag,
      country: candidate.country,
      trophies: finalTrophies,
      championId: candidate.championId,
      previousRank: i + 1,
    });
  }

  // Ensure strict descending order
  result.sort((a, b) => b.trophies - a.trophies);
  result.forEach((p, idx) => {
    p.rank = idx + 1;
  });

  return result;
}

const STORAGE_KEY = 'ringout_leaderboard_v3';
const LAST_SIMULATION_KEY = 'ringout_leaderboard_last_sim';

interface StoredLeaderboardData {
  lastUpdated: number;
  boards: Record<LeaderboardCountry, LeaderboardEntry[]>;
}

export function getLeaderboardData(): Record<LeaderboardCountry, LeaderboardEntry[]> {
  if (typeof window === 'undefined') {
    return {
      global: generateLeaderboardSet('global'),
      us: generateLeaderboardSet('us'),
      in: generateLeaderboardSet('in'),
      br: generateLeaderboardSet('br'),
      jp: generateLeaderboardSet('jp'),
      eu: generateLeaderboardSet('eu'),
    };
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    let data: StoredLeaderboardData | null = saved ? JSON.parse(saved) : null;

    const now = Date.now();
    // Daily simulation interval: every 12 hours (43,200,000 ms)
    const SIM_INTERVAL = 12 * 60 * 60 * 1000;

    if (!data || !data.boards || !data.boards.global || data.boards.global.length < 50) {
      data = {
        lastUpdated: now,
        boards: {
          global: generateLeaderboardSet('global'),
          us: generateLeaderboardSet('us'),
          in: generateLeaderboardSet('in'),
          br: generateLeaderboardSet('br'),
          jp: generateLeaderboardSet('jp'),
          eu: generateLeaderboardSet('eu'),
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(LAST_SIMULATION_KEY, String(now));
      return data.boards;
    }

    // Check if enough time has elapsed to simulate daily trophy fluctuations & new challengers
    const lastSim = parseInt(localStorage.getItem(LAST_SIMULATION_KEY) || '0', 10);
    if (now - lastSim > SIM_INTERVAL) {
      // Simulate realistic daily changes across all country boards
      const countries: LeaderboardCountry[] = ['global', 'us', 'in', 'br', 'jp', 'eu'];

      countries.forEach((country) => {
        const board = data!.boards[country] || generateLeaderboardSet(country);

        // 1. Small balanced trophy delta for each player (-25 to +35)
        board.forEach((player) => {
          player.previousRank = player.rank;
          const randomFactor = Math.random();
          // Average delta is near +2, keeping the ladder stable without ballooning to 10k
          const delta = Math.floor(randomFactor * 60) - 28;
          player.trophies = Math.min(9450, Math.max(5050, player.trophies + delta));
        });

        // 2. Occasionally rotate in a new challenger
        if (Math.random() < 0.35) {
          const newChallenger = ROTATION_CHALLENGERS[Math.floor(Math.random() * ROTATION_CHALLENGERS.length)];
          const entryTrophies = Math.floor(5200 + Math.random() * 800); // 5,200 to 6,000 trophies
          // Replace rank 100
          if (board.length >= 100) {
            board[board.length - 1] = {
              rank: 100,
              name: newChallenger.name,
              flag: country === 'global' ? newChallenger.flag : COUNTRY_FLAGS[country],
              country: country === 'global' ? newChallenger.country : country,
              trophies: entryTrophies,
              championId: newChallenger.championId,
              previousRank: 100,
            };
          }
        }

        // 3. Re-sort descending by trophies
        board.sort((a, b) => b.trophies - a.trophies);
        board.forEach((p, idx) => {
          p.rank = idx + 1;
        });

        data!.boards[country] = board;
      });

      data.lastUpdated = now;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(LAST_SIMULATION_KEY, String(now));
    }

    return data.boards;
  } catch (err) {
    console.error('Error in leaderboard simulation:', err);
    return {
      global: generateLeaderboardSet('global'),
      us: generateLeaderboardSet('us'),
      in: generateLeaderboardSet('in'),
      br: generateLeaderboardSet('br'),
      jp: generateLeaderboardSet('jp'),
      eu: generateLeaderboardSet('eu'),
    };
  }
}
