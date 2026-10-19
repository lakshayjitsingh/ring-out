import React, { useState } from 'react';
import { X, Trophy, Check, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../audio/soundManager';
import { type ChampionId } from '../game/championModels';

interface ArenaInfo {
  id: number;
  name: string;
  trophyRange: string;
  minTrophies: number;
  themeColor: string;
  bannerBg: string;
}

const ARENAS: ArenaInfo[] = [
  { id: 1, name: 'Emerald Isles', trophyRange: '0 - 400 🏆', minTrophies: 0, themeColor: 'from-emerald-600 to-teal-800', bannerBg: 'bg-emerald-950/80 border-emerald-400' },
  { id: 2, name: 'Volcanic Crucible', trophyRange: '400 - 900 🏆', minTrophies: 400, themeColor: 'from-amber-600 to-rose-900', bannerBg: 'bg-amber-950/80 border-amber-400' },
  { id: 3, name: 'Metro Rooftops', trophyRange: '900 - 1,600 🏆', minTrophies: 900, themeColor: 'from-cyan-600 to-blue-900', bannerBg: 'bg-cyan-950/80 border-cyan-400' },
  { id: 4, name: 'Solar Peaks', trophyRange: '1,600 - 2,400 🏆', minTrophies: 1600, themeColor: 'from-purple-600 to-indigo-950', bannerBg: 'bg-purple-950/80 border-purple-400' },
  { id: 5, name: 'Master Colosseum', trophyRange: '2,400+ 🏆', minTrophies: 2400, themeColor: 'from-amber-400 to-yellow-700', bannerBg: 'bg-yellow-950/80 border-yellow-300' },
];

interface RoadStep {
  trophies: number;
  arenaId: number;
  rewardType: 'gold' | 'gems' | 'champion' | 'chest';
  rewardLabel: string;
  amount?: number;
  championId?: ChampionId;
  icon: string;
}

const ROAD_STEPS: RoadStep[] = [
  { trophies: 50, arenaId: 1, rewardType: 'gold', rewardLabel: '100 Gold', amount: 100, icon: '🪙' },
  { trophies: 150, arenaId: 1, rewardType: 'gems', rewardLabel: '30 Gems', amount: 30, icon: '💎' },
  { trophies: 300, arenaId: 1, rewardType: 'chest', rewardLabel: 'Wood Brawl Box', amount: 50, icon: '📦' },
  { trophies: 400, arenaId: 2, rewardType: 'champion', rewardLabel: 'Kage (Shadow Shinobi)', championId: 'kage', icon: '🥷' },
  { trophies: 550, arenaId: 2, rewardType: 'gold', rewardLabel: '400 Gold', amount: 400, icon: '🪙' },
  { trophies: 700, arenaId: 2, rewardType: 'gems', rewardLabel: '75 Gems', amount: 75, icon: '💎' },
  { trophies: 900, arenaId: 3, rewardType: 'champion', rewardLabel: 'Titan Gorr', championId: 'titan', icon: '🦍' },
  { trophies: 1100, arenaId: 3, rewardType: 'chest', rewardLabel: 'Mega Brawl Chest', amount: 150, icon: '🎁' },
  { trophies: 1350, arenaId: 3, rewardType: 'gold', rewardLabel: '1,000 Gold', amount: 1000, icon: '🪙' },
  { trophies: 1600, arenaId: 4, rewardType: 'champion', rewardLabel: 'Nova (Valkyrie Boxer)', championId: 'nova', icon: '🥊' },
  { trophies: 1900, arenaId: 4, rewardType: 'gems', rewardLabel: '200 Gems', amount: 200, icon: '💎' },
  { trophies: 2200, arenaId: 4, rewardType: 'chest', rewardLabel: 'Royal Crown Vault', amount: 300, icon: '👑' },
  { trophies: 2500, arenaId: 5, rewardType: 'champion', rewardLabel: 'Axel (Lightning Parkourist)', championId: 'bolt', icon: '⚡' },
  { trophies: 3000, arenaId: 5, rewardType: 'chest', rewardLabel: 'Legendary Master Core', amount: 500, icon: '🌟' },
];

interface TrophyRoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerTrophies: number;
  onAddGold: (amount: number) => void;
  onAddGems: (amount: number) => void;
  onUnlockChampion: (id: ChampionId, cost: number) => void;
}

export const TrophyRoadModal: React.FC<TrophyRoadModalProps> = ({
  isOpen,
  onClose,
  playerTrophies,
  onAddGold,
  onAddGems,
  onUnlockChampion,
}) => {
  const [claimedSteps, setClaimedSteps] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('ringout_trophy_milestones_v2');
      return saved ? JSON.parse(saved) : [50, 150, 300];
    } catch {
      return [50, 150, 300];
    }
  });

  if (!isOpen) return null;

  const handleClaim = (step: RoadStep) => {
    if (playerTrophies < step.trophies || claimedSteps.includes(step.trophies)) return;

    sounds.playBump(0.8);
    sounds.playLevelUp?.();

    if (step.rewardType === 'gold' && step.amount) onAddGold(step.amount);
    if (step.rewardType === 'gems' && step.amount) onAddGems(step.amount);
    if (step.rewardType === 'chest') {
      onAddGems(step.amount || 100);
      onAddGold(300);
    }
    if (step.rewardType === 'champion' && step.championId) {
      onUnlockChampion(step.championId, 0);
    }

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#38bdf8', '#facc15', '#a855f7'],
    });

    setClaimedSteps((prev) => {
      const next = [...prev, step.trophies];
      try {
        localStorage.setItem('ringout_trophy_milestones_v2', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#020617] border-4 border-amber-400 rounded-[36px] pt-14 pb-5 px-3 sm:px-6 shadow-[0_25px_60px_rgba(0,0,0,0.9),inset_0_2px_10px_rgba(255,255,255,0.2)] flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-150">
        {/* Top 3D Ribbon Banner */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#d97706] border-2 border-[#fef08a] px-8 sm:px-12 py-1.5 rounded-2xl shadow-[0_5px_15px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.6)] whitespace-nowrap">
          <span className="text-xl sm:text-2xl font-black tracking-widest text-[#78350f] uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] flex items-center gap-2">
            <Trophy className="w-5 h-5 fill-amber-700" />
            TROPHY ROAD
          </span>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playBump(0.6);
            onClose();
          }}
          className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-rose-500 hover:bg-rose-400 border-2 border-white flex items-center justify-center text-white transition-all cursor-pointer active:scale-90 shadow-lg shadow-rose-950/50"
          title="Close Trophy Road"
        >
          <X className="w-5 h-5 stroke-[3]" />
        </button>

        {/* Current Player Rating Pill */}
        <div className="flex items-center justify-between bg-black/50 border border-white/10 rounded-2xl px-4 py-2.5 mb-3 shadow-inner">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-lg">
              🏆
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Current Trophies
              </div>
              <div className="text-base sm:text-lg font-black text-amber-300 font-mono">
                {playerTrophies.toLocaleString()} 🏆
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Arena
            </div>
            <div className="text-xs sm:text-sm font-black text-sky-300">
              {ARENAS.slice().reverse().find((a) => playerTrophies >= a.minTrophies)?.name || 'Emerald Isles'}
            </div>
          </div>
        </div>

        {/* Stepped Road Scrollable View (Clash Royale Style) */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 py-2">
          {ARENAS.map((arena) => {
            const stepsInArena = ROAD_STEPS.filter((s) => s.arenaId === arena.id);
            const isUnlockedArena = playerTrophies >= arena.minTrophies;

            return (
              <div key={arena.id} className="relative">
                {/* Arena Banner Header */}
                <div
                  className={`rounded-2xl p-3 mb-2.5 border-2 flex items-center justify-between shadow-lg ${
                    isUnlockedArena ? arena.bannerBg : 'bg-slate-900/60 border-slate-700 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-base font-black">
                      {arena.id}
                    </div>
                    <div>
                      <div className="text-sm font-black text-white uppercase tracking-wider">
                        {arena.name}
                      </div>
                      <div className="text-[10px] text-sky-200 font-semibold font-mono">
                        {arena.trophyRange}
                      </div>
                    </div>
                  </div>

                  {!isUnlockedArena && (
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded-full bg-black/40 border border-slate-600 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </div>

                {/* Stepped Path Steps in Arena */}
                <div className="space-y-2 pl-3 border-l-4 border-amber-400/40 ml-4">
                  {stepsInArena.map((step) => {
                    const isClaimed = claimedSteps.includes(step.trophies);
                    const isEligible = playerTrophies >= step.trophies;
                    const isNextMilestone = !isClaimed && isEligible;

                    return (
                      <div
                        key={step.trophies}
                        className={`relative rounded-2xl p-2.5 flex items-center justify-between border-2 transition-all ${
                          isClaimed
                            ? 'bg-slate-900/50 border-emerald-500/30 opacity-75'
                            : isNextMilestone
                            ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-slate-900/80 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-[1.01]'
                            : 'bg-slate-900/80 border-white/10'
                        }`}
                      >
                        {/* Step Marker Dot */}
                        <div
                          className={`absolute -left-[19px] w-3 h-3 rounded-full border-2 ${
                            isClaimed
                              ? 'bg-emerald-400 border-emerald-200'
                              : isEligible
                              ? 'bg-amber-400 border-white animate-pulse'
                              : 'bg-slate-800 border-slate-600'
                          }`}
                        />

                        {/* Left: Trophy Requirement & Icon */}
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-xl">
                            {step.icon}
                          </div>
                          <div>
                            <div className="text-xs font-black font-mono text-amber-400">
                              {step.trophies} 🏆
                            </div>
                            <div className="text-sm font-black text-white">
                              {step.rewardLabel}
                            </div>
                          </div>
                        </div>

                        {/* Right: Action / Status Button */}
                        <div>
                          {isClaimed ? (
                            <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-black uppercase">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>CLAIMED</span>
                            </div>
                          ) : isEligible ? (
                            <button
                              onClick={() => handleClaim(step)}
                              className="py-1.5 px-4 bg-gradient-to-b from-[#84cc16] via-[#65a30d] to-[#4d7c0f] hover:from-[#bef264] text-white font-black text-xs uppercase tracking-wider rounded-xl border border-lime-200 shadow-md cursor-pointer active:translate-y-0.5 animate-pulse"
                            >
                              CLAIM!
                            </button>
                          ) : (
                            <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 text-[10px] font-bold uppercase">
                              <Lock className="w-3 h-3" />
                              <span>LOCKED</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
