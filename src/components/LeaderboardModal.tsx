import React, { useState } from 'react';
import { X, Trophy, Globe, MapPin } from 'lucide-react';
import { sounds } from '../audio/soundManager';
import { CHAMPIONS, type ChampionId } from '../game/championModels';

interface LeaderboardEntry {
  rank: number;
  name: string;
  flag: string;
  trophies: number;
  championId: ChampionId;
  isPlayer?: boolean;
}

const GLOBAL_LEADERBOARD_DATA: LeaderboardEntry[] = [
  { rank: 1, name: 'ViperX_Pro', flag: '🇺🇸', trophies: 4890, championId: 'titan' },
  { rank: 2, name: 'ShadowStrike_IN', flag: '🇮🇳', trophies: 4760, championId: 'kage' },
  { rank: 3, name: 'Tokyo_Ghost', flag: '🇯🇵', trophies: 4620, championId: 'nova' },
  { rank: 4, name: 'AuraLord', flag: '🇬🇧', trophies: 4480, championId: 'leo' },
  { rank: 5, name: 'CyberFox_99', flag: '🇩🇪', trophies: 4350, championId: 'bolt' },
  { rank: 6, name: 'Kaiser_Brawl', flag: '🇧🇷', trophies: 4210, championId: 'titan' },
  { rank: 7, name: 'NovaPrime', flag: '🇨🇦', trophies: 4090, championId: 'nova' },
  { rank: 8, name: 'Shinobi_X', flag: '🇰🇷', trophies: 3950, championId: 'kage' },
  { rank: 9, name: 'IronFist_Dave', flag: '🇦🇺', trophies: 3820, championId: 'leo' },
  { rank: 10, name: 'PixelBlaze', flag: '🇫🇷', trophies: 3710, championId: 'bolt' },
  { rank: 11, name: 'Apex_Venom', flag: '🇺🇸', trophies: 3580, championId: 'titan' },
  { rank: 12, name: 'NightPhantom', flag: '🇮🇳', trophies: 3460, championId: 'kage' },
  { rank: 13, name: 'Solaris_God', flag: '🇸🇪', trophies: 3340, championId: 'nova' },
  { rank: 14, name: 'Overcharge_Pro', flag: '🇳🇱', trophies: 3210, championId: 'bolt' },
  { rank: 15, name: 'ThunderGorr', flag: '🇮🇹', trophies: 3100, championId: 'titan' },
  { rank: 16, name: 'Raptor_Strike', flag: '🇪🇸', trophies: 2980, championId: 'leo' },
  { rank: 17, name: 'Silent_Kunai', flag: '🇯🇵', trophies: 2850, championId: 'kage' },
  { rank: 18, name: 'Celestial_Sky', flag: '🇸🇬', trophies: 2720, championId: 'nova' },
  { rank: 19, name: 'Omega_Mech', flag: '🇺🇸', trophies: 2590, championId: 'bolt' },
  { rank: 20, name: 'BrawlSensei', flag: '🇮🇳', trophies: 2470, championId: 'leo' },
];

const LOCAL_LEADERBOARD_DATA: LeaderboardEntry[] = [
  { rank: 1, name: 'ShadowStrike_IN', flag: '🇮🇳', trophies: 4760, championId: 'kage' },
  { rank: 2, name: 'NightPhantom', flag: '🇮🇳', trophies: 3460, championId: 'kage' },
  { rank: 3, name: 'BrawlSensei', flag: '🇮🇳', trophies: 2470, championId: 'leo' },
  { rank: 4, name: 'Vortex_Rishi', flag: '🇮🇳', trophies: 2310, championId: 'nova' },
  { rank: 5, name: 'Aryan_Titan', flag: '🇮🇳', trophies: 2190, championId: 'titan' },
  { rank: 6, name: 'Desi_Shinobi', flag: '🇮🇳', trophies: 2080, championId: 'kage' },
  { rank: 7, name: 'Kunal_Bolt', flag: '🇮🇳', trophies: 1950, championId: 'bolt' },
  { rank: 8, name: 'Kabir_Smash', flag: '🇮🇳', trophies: 1820, championId: 'titan' },
  { rank: 9, name: 'Rohan_Leo', flag: '🇮🇳', trophies: 1690, championId: 'leo' },
  { rank: 10, name: 'Simran_Nova', flag: '🇮🇳', trophies: 1540, championId: 'nova' },
];

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerTrophies: number;
  playerChampion: ChampionId;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  playerTrophies,
  playerChampion,
}) => {
  const [tab, setTab] = useState<'global' | 'local'>('global');

  if (!isOpen) return null;

  const currentList = tab === 'global' ? GLOBAL_LEADERBOARD_DATA : LOCAL_LEADERBOARD_DATA;
  const playerRank = tab === 'global' ? 42 : 14;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#020617] border-4 border-amber-400 rounded-[36px] pt-14 pb-5 px-3 sm:px-6 shadow-[0_25px_60px_rgba(0,0,0,0.9),inset_0_2px_10px_rgba(255,255,255,0.2)] flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
        {/* Top 3D Ribbon Banner */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#d97706] border-2 border-[#fef08a] px-8 sm:px-12 py-1.5 rounded-2xl shadow-[0_5px_15px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.6)] whitespace-nowrap">
          <span className="text-xl sm:text-2xl font-black tracking-widest text-[#78350f] uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] flex items-center gap-2">
            <Trophy className="w-5 h-5 fill-amber-700" />
            TOP BRAWLERS
          </span>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playBump(0.6);
            onClose();
          }}
          className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-rose-500 hover:bg-rose-400 border-2 border-white flex items-center justify-center text-white transition-all cursor-pointer active:scale-90 shadow-lg shadow-rose-950/50"
          title="Close Leaderboard"
        >
          <X className="w-5 h-5 stroke-[3]" />
        </button>

        {/* Global vs Local Tabs */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <button
            onClick={() => {
              sounds.playBump(0.4);
              setTab('global');
            }}
            className={`flex-1 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
              tab === 'global'
                ? 'bg-gradient-to-b from-[#38bdf8] to-[#0284c7] text-white border-sky-200 shadow-md'
                : 'bg-slate-800/80 text-sky-200 border-white/10 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>GLOBAL</span>
          </button>

          <button
            onClick={() => {
              sounds.playBump(0.4);
              setTab('local');
            }}
            className={`flex-1 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
              tab === 'local'
                ? 'bg-gradient-to-b from-[#84cc16] to-[#4d7c0f] text-white border-[#bef264] shadow-md'
                : 'bg-slate-800/80 text-sky-200 border-white/10 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>REGIONAL (INDIA)</span>
          </button>
        </div>

        {/* Scrollable Leaderboard Table */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 py-1">
          {currentList.map((entry) => {
            let rankBadge = `${entry.rank}`;
            let rankStyle = 'bg-slate-800 text-slate-300 border-slate-700';

            if (entry.rank === 1) {
              rankBadge = '🥇';
              rankStyle = 'bg-gradient-to-b from-amber-400 to-yellow-600 text-yellow-950 border-amber-200 font-black';
            } else if (entry.rank === 2) {
              rankBadge = '🥈';
              rankStyle = 'bg-gradient-to-b from-slate-300 to-slate-500 text-slate-900 border-white font-black';
            } else if (entry.rank === 3) {
              rankBadge = '🥉';
              rankStyle = 'bg-gradient-to-b from-amber-700 to-orange-900 text-amber-100 border-amber-600 font-black';
            }

            const champ = CHAMPIONS[entry.championId] || CHAMPIONS.leo;

            return (
              <div
                key={entry.rank}
                className="bg-slate-900/80 border border-white/10 hover:border-sky-400/50 rounded-2xl p-2.5 flex items-center justify-between transition-all"
              >
                {/* Left: Rank & Flag & Name */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black border ${rankStyle}`}
                  >
                    {rankBadge}
                  </div>
                  <span className="text-base">{entry.flag}</span>
                  <div>
                    <div className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                      <span>{entry.name}</span>
                    </div>
                    <div className="text-[10px] text-sky-200 font-medium">
                      Main: <strong className="text-sky-300">{champ.name}</strong>
                    </div>
                  </div>
                </div>

                {/* Right: Trophies Pill */}
                <div className="flex items-center gap-1 bg-black/50 border border-amber-400/30 px-3 py-1 rounded-full font-mono font-black text-xs sm:text-sm text-amber-300">
                  <span>🏆</span>
                  <span>{entry.trophies.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fixed Player Highlight Rank Bar at Bottom */}
        <div className="mt-3 bg-gradient-to-r from-sky-950 via-cyan-950 to-blue-950 border-2 border-sky-400 rounded-2xl p-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-500 text-white font-black flex items-center justify-center text-xs shadow">
              #{playerRank}
            </div>
            <span className="text-base">🇮🇳</span>
            <div>
              <div className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                <span>Player (You)</span>
                <span className="px-2 py-0.2 rounded-full bg-sky-400/20 text-sky-300 text-[9px] font-black uppercase">
                  ACTIVE
                </span>
              </div>
              <div className="text-[10px] text-sky-200 font-medium">
                Main: {CHAMPIONS[playerChampion].name}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-black/60 border border-amber-400/50 px-3 py-1 rounded-full font-mono font-black text-xs sm:text-sm text-amber-300 shadow">
            <span>🏆</span>
            <span>{playerTrophies.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
