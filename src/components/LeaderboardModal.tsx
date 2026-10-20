import React, { useState, useEffect } from 'react';
import { X, Trophy, Globe, Sparkles } from 'lucide-react';
import { sounds } from '../audio/soundManager';
import { CHAMPIONS } from '../game/championModels';
import {
  getLeaderboardData,
  type LeaderboardCountry,
  type LeaderboardEntry,
} from '../game/leaderboardManager';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerTrophies?: number;
}

const COUNTRY_TABS: { id: LeaderboardCountry; label: string; flag: string }[] = [
  { id: 'global', label: 'Global', flag: '🌐' },
  { id: 'in', label: 'India', flag: '🇮🇳' },
  { id: 'us', label: 'USA', flag: '🇺🇸' },
  { id: 'br', label: 'Brazil', flag: '🇧🇷' },
  { id: 'jp', label: 'Japan', flag: '🇯🇵' },
  { id: 'eu', label: 'Europe', flag: '🇪🇺' },
];

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<LeaderboardCountry>('global');
  const [leaderboardData, setLeaderboardData] = useState<Record<LeaderboardCountry, LeaderboardEntry[]> | null>(null);

  useEffect(() => {
    if (isOpen) {
      const data = getLeaderboardData();
      setLeaderboardData(data);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentList = leaderboardData ? leaderboardData[selectedCountry] || [] : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#020617] border-4 border-amber-400 rounded-[36px] pt-14 pb-5 px-3 sm:px-6 shadow-[0_25px_60px_rgba(0,0,0,0.9),inset_0_2px_10px_rgba(255,255,255,0.2)] flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-150">
        
        {/* Top 3D Ribbon Banner */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#d97706] border-2 border-[#fef08a] px-8 sm:px-12 py-1.5 rounded-2xl shadow-[0_5px_15px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.6)] whitespace-nowrap">
          <span className="text-xl sm:text-2xl font-black tracking-widest text-[#78350f] uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] flex items-center gap-2">
            <Trophy className="w-5 h-5 fill-amber-700" />
            TOP 100 BRAWLERS
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

        {/* Subheader / Info Note */}
        <div className="flex items-center justify-between px-2 mb-2 text-xs font-bold text-sky-200">
          <span className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-amber-300" />
            <span className="uppercase tracking-wider">Top 100 Elite Rankers (&gt; 5,000 🏆)</span>
          </span>
          <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>DAILY LIVE LADDER</span>
          </span>
        </div>

        {/* Country & Regional Tabs */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mb-3 bg-slate-950/60 p-1.5 rounded-2xl border border-white/10">
          {COUNTRY_TABS.map((tab) => {
            const isActive = selectedCountry === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.playBump(0.4);
                  setSelectedCountry(tab.id);
                }}
                className={`py-1.5 px-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 border ${
                  isActive
                    ? 'bg-gradient-to-b from-[#38bdf8] to-[#0284c7] text-white border-sky-200 shadow-[0_2px_8px_rgba(56,189,248,0.5)] scale-102'
                    : 'bg-white/5 text-slate-300 border-transparent hover:bg-white/10'
                }`}
              >
                <span>{tab.flag}</span>
                <span className="text-[11px]">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Leaderboard Table (Top 100) */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 py-1 custom-scrollbar">
          {currentList.map((entry) => {
            let rankBadge: React.ReactNode = `#${entry.rank}`;
            let rankStyle = 'bg-slate-800 text-slate-300 border-slate-700';

            if (entry.rank === 1) {
              rankBadge = '🥇';
              rankStyle = 'bg-gradient-to-b from-amber-400 to-yellow-600 text-yellow-950 border-amber-200 font-black text-sm shadow-[0_0_12px_rgba(245,158,11,0.5)]';
            } else if (entry.rank === 2) {
              rankBadge = '🥈';
              rankStyle = 'bg-gradient-to-b from-slate-300 to-slate-500 text-slate-900 border-white font-black text-sm shadow-[0_0_10px_rgba(255,255,255,0.4)]';
            } else if (entry.rank === 3) {
              rankBadge = '🥉';
              rankStyle = 'bg-gradient-to-b from-amber-700 to-orange-900 text-amber-100 border-amber-600 font-black text-sm shadow-[0_0_10px_rgba(217,119,6,0.4)]';
            }

            const champ = CHAMPIONS[entry.championId] || CHAMPIONS.leo;

            return (
              <div
                key={`${entry.rank}-${entry.name}`}
                className="bg-slate-900/80 border border-white/10 hover:border-sky-400/50 rounded-2xl p-2.5 flex items-center justify-between transition-all"
              >
                {/* Left: Rank & Flag & Name */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black border ${rankStyle}`}
                  >
                    {rankBadge}
                  </div>
                  <span className="text-xl">{entry.flag}</span>
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
                <div className="flex items-center gap-1.5 bg-black/60 border border-amber-400/40 px-3.5 py-1.5 rounded-full font-mono font-black text-xs sm:text-sm text-amber-300 shadow">
                  <span>🏆</span>
                  <span>{entry.trophies.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Clean Footer Info Note (NO fake player position) */}
        <div className="mt-3 py-2 px-4 rounded-xl bg-slate-950/70 border border-white/10 text-center text-[11px] font-semibold text-slate-400 flex items-center justify-center gap-2">
          <span>🛡️</span>
          <span>Reach <strong className="text-amber-300">5,000+ Trophies</strong> in Ranked 1v1 to enter the Global Top 100 Ladder!</span>
        </div>
      </div>
    </div>
  );
};
