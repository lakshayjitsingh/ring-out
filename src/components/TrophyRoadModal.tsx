import React, { useRef, useEffect, useState } from 'react';
import {
  Trophy,
  X,
  Check,
  Lock,
  Target,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../audio/soundManager';
import { MegaBoxGraphic } from './MegaBoxGraphic';
import { BoxOpeningModal, type BoxReward } from './BoxOpeningModal';
import { ALL_SKINS, isSkinUnlocked, unlockSkin } from '../game/championSkins';

export interface TrophyMilestone {
  trophies: number;
  rewardType: 'gold' | 'gems' | 'mega_box';
  rewardLabel: string;
  amount?: number;
  goldBonus?: number;
  gemBonus?: number;
  leagueName?: string;
  isLeagueGate?: boolean;
  gateBadge?: string;
  gateColor?: string;
  gateGlow?: string;
  seasonReward?: number;
}

interface TrophyRoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  trophies: number;
  claimedMilestones: number[];
  onClaimMilestone: (milestone: TrophyMilestone) => void;
  gold?: number;
  gems?: number;
}

// =========================================================================
// PURE TROPHY ROAD MILESTONES:
// NO CHARACTER UNLOCKS! ONLY COINS, GEMS, AND MEGA BOXES!
// Rewards every 100 trophies till 1,000 trophies, then after every 250 trophies!
// League Changes (500, 1000, 2000, 3000, 4000, 5000) award a MEGA BOX!
// =========================================================================
export const TROPHY_ROAD_DATA: TrophyMilestone[] = [
  // 1. UNRANKED ARENA (0 - 499 🏆)
  {
    trophies: 0,
    rewardType: 'gems',
    rewardLabel: '100 Gems',
    amount: 100,
    leagueName: 'Unranked Arena',
    gateBadge: 'UNRANKED',
    gateColor: '#38bdf8',
    seasonReward: 100,
  },
  {
    trophies: 100,
    rewardType: 'gold',
    rewardLabel: '250 Coins',
    amount: 250,
    leagueName: 'Unranked Arena',
  },
  {
    trophies: 200,
    rewardType: 'gems',
    rewardLabel: '50 Gems',
    amount: 50,
    leagueName: 'Unranked Arena',
  },
  {
    trophies: 300,
    rewardType: 'gold',
    rewardLabel: '400 Coins',
    amount: 400,
    leagueName: 'Unranked Arena',
  },
  {
    trophies: 400,
    rewardType: 'gems',
    rewardLabel: '75 Gems',
    amount: 75,
    leagueName: 'Unranked Arena',
  },

  // 2. BRONZE LEAGUE GATE (500 🏆) -> MEGA BOX REWARD!
  {
    trophies: 500,
    rewardType: 'mega_box',
    rewardLabel: 'Bronze Mega Box',
    goldBonus: 500,
    gemBonus: 100,
    leagueName: 'Bronze League',
    isLeagueGate: true,
    gateBadge: 'BRONZE I',
    gateColor: '#cd7f32',
    gateGlow: 'rgba(205, 127, 50, 0.4)',
    seasonReward: 200,
  },
  {
    trophies: 600,
    rewardType: 'gold',
    rewardLabel: '600 Coins',
    amount: 600,
    leagueName: 'Bronze League',
  },
  {
    trophies: 700,
    rewardType: 'gems',
    rewardLabel: '100 Gems',
    amount: 100,
    leagueName: 'Bronze League',
  },
  {
    trophies: 800,
    rewardType: 'gold',
    rewardLabel: '800 Coins',
    amount: 800,
    leagueName: 'Bronze League',
  },
  {
    trophies: 900,
    rewardType: 'gems',
    rewardLabel: '125 Gems',
    amount: 125,
    leagueName: 'Bronze League',
  },

  // 3. SILVER LEAGUE GATE (1000 🏆) -> MEGA BOX REWARD!
  {
    trophies: 1000,
    rewardType: 'mega_box',
    rewardLabel: 'Silver Mega Box',
    goldBonus: 1000,
    gemBonus: 150,
    leagueName: 'Silver League',
    isLeagueGate: true,
    gateBadge: 'SILVER I',
    gateColor: '#94a3b8',
    gateGlow: 'rgba(148, 163, 184, 0.4)',
    seasonReward: 300,
  },

  // AFTER 1,000 TROPHIES: EVERY 250 TROPHIES!
  {
    trophies: 1250,
    rewardType: 'gems',
    rewardLabel: '150 Gems',
    amount: 150,
    leagueName: 'Silver League',
  },
  {
    trophies: 1500,
    rewardType: 'gold',
    rewardLabel: '1,500 Coins',
    amount: 1500,
    leagueName: 'Silver League',
  },
  {
    trophies: 1750,
    rewardType: 'gems',
    rewardLabel: '200 Gems',
    amount: 200,
    leagueName: 'Silver League',
  },

  // 4. GOLD LEAGUE GATE (2000 🏆) -> MEGA BOX REWARD!
  {
    trophies: 2000,
    rewardType: 'mega_box',
    rewardLabel: 'Gold Mega Box',
    goldBonus: 2000,
    gemBonus: 250,
    leagueName: 'Gold League',
    isLeagueGate: true,
    gateBadge: 'GOLD I',
    gateColor: '#eab308',
    gateGlow: 'rgba(234, 179, 8, 0.4)',
    seasonReward: 400,
  },
  {
    trophies: 2250,
    rewardType: 'gems',
    rewardLabel: '250 Gems',
    amount: 250,
    leagueName: 'Gold League',
  },
  {
    trophies: 2500,
    rewardType: 'gold',
    rewardLabel: '2,500 Coins',
    amount: 2500,
    leagueName: 'Gold League',
  },
  {
    trophies: 2750,
    rewardType: 'gems',
    rewardLabel: '300 Gems',
    amount: 300,
    leagueName: 'Gold League',
  },

  // 5. DIAMOND LEAGUE GATE (3000 🏆) -> MEGA BOX REWARD!
  {
    trophies: 3000,
    rewardType: 'mega_box',
    rewardLabel: 'Diamond Mega Box',
    goldBonus: 3500,
    gemBonus: 350,
    leagueName: 'Diamond League',
    isLeagueGate: true,
    gateBadge: 'DIAMOND I',
    gateColor: '#06b6d4',
    gateGlow: 'rgba(6, 182, 212, 0.4)',
    seasonReward: 500,
  },
  {
    trophies: 3250,
    rewardType: 'gems',
    rewardLabel: '350 Gems',
    amount: 350,
    leagueName: 'Diamond League',
  },
  {
    trophies: 3500,
    rewardType: 'gold',
    rewardLabel: '3,500 Coins',
    amount: 3500,
    leagueName: 'Diamond League',
  },
  {
    trophies: 3750,
    rewardType: 'gems',
    rewardLabel: '400 Gems',
    amount: 400,
    leagueName: 'Diamond League',
  },

  // 6. MASTER LEAGUE GATE (4000 🏆) -> MEGA BOX REWARD!
  {
    trophies: 4000,
    rewardType: 'mega_box',
    rewardLabel: 'Master Mega Box',
    goldBonus: 5000,
    gemBonus: 500,
    leagueName: 'Master League',
    isLeagueGate: true,
    gateBadge: 'MASTER I',
    gateColor: '#a855f7',
    gateGlow: 'rgba(168, 85, 247, 0.4)',
    seasonReward: 700,
  },
  {
    trophies: 4250,
    rewardType: 'gems',
    rewardLabel: '500 Gems',
    amount: 500,
    leagueName: 'Master League',
  },
  {
    trophies: 4500,
    rewardType: 'gold',
    rewardLabel: '6,000 Coins',
    amount: 6000,
    leagueName: 'Master League',
  },
  {
    trophies: 4750,
    rewardType: 'gems',
    rewardLabel: '750 Gems',
    amount: 750,
    leagueName: 'Master League',
  },

  // 7. GRANDMASTER APEX GATE (5000+ 🏆) -> APEX ULTRA MEGA BOX!
  {
    trophies: 5000,
    rewardType: 'mega_box',
    rewardLabel: 'Apex Ultra Mega Box',
    goldBonus: 10000,
    gemBonus: 1000,
    leagueName: 'Grandmaster League',
    isLeagueGate: true,
    gateBadge: 'GRANDMASTER APEX',
    gateColor: '#ec4899',
    gateGlow: 'rgba(236, 72, 153, 0.5)',
    seasonReward: 1000,
  },
];

export const TrophyRoadModal: React.FC<TrophyRoadModalProps> = ({
  isOpen,
  onClose,
  trophies,
  claimedMilestones,
  onClaimMilestone,
  gold = 0,
  gems = 0,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentStepRef = useRef<HTMLDivElement>(null);

  const isDraggingTrack = useRef<boolean>(false);
  const dragStartX = useRef<number>(0);
  const dragScrollLeft = useRef<number>(0);

  // Interactive Brawl Stars Step-by-Step Box Opening Reward State
  const [boxReward, setBoxReward] = useState<BoxReward | null>(null);

  useEffect(() => {
    if (isOpen && currentStepRef.current && scrollRef.current) {
      setTimeout(() => {
        if (!currentStepRef.current || !scrollRef.current) return;
        const targetLeft = currentStepRef.current.offsetLeft - scrollRef.current.clientWidth / 2 + 100;
        scrollRef.current.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
      }, 250);
    }
  }, [isOpen]);

  const handleWheel = (e: React.WheelEvent) => {
    if (!scrollRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      scrollRef.current.scrollLeft += e.deltaY * 1.5;
    }
  };

  const handleTrackMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDraggingTrack.current = true;
    dragStartX.current = e.pageX - scrollRef.current.offsetLeft;
    dragScrollLeft.current = scrollRef.current.scrollLeft;
  };

  const handleTrackMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingTrack.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - dragStartX.current) * 1.5;
    scrollRef.current.scrollLeft = dragScrollLeft.current - walk;
  };

  const handleTrackMouseUp = () => {
    isDraggingTrack.current = false;
  };

  if (!isOpen) return null;

  const getCurrentLeague = (tr: number) => {
    if (tr >= 5000) return { name: 'Grandmaster Apex', color: '#ec4899', next: 5000, max: 5000, min: 4000 };
    if (tr >= 4000) return { name: 'Master League', color: '#a855f7', next: 5000, max: 5000, min: 4000 };
    if (tr >= 3000) return { name: 'Diamond League', color: '#06b6d4', next: 4000, max: 4000, min: 3000 };
    if (tr >= 2000) return { name: 'Gold League', color: '#eab308', next: 3000, max: 3000, min: 2000 };
    if (tr >= 1000) return { name: 'Silver League', color: '#94a3b8', next: 2000, max: 2000, min: 1000 };
    if (tr >= 500) return { name: 'Bronze League', color: '#cd7f32', next: 1000, max: 1000, min: 500 };
    return { name: 'Unranked Arena', color: '#38bdf8', next: 500, max: 500, min: 0 };
  };

  const currentLeague = getCurrentLeague(trophies);

  const handleClaim = (m: TrophyMilestone) => {
    sounds.playVictory();
    onClaimMilestone(m);

    if (m.rewardType === 'mega_box') {
      const skinPool = Object.values(ALL_SKINS).filter(
        (s) => s.rarity === 'legendary' || s.rarity === 'epic' || s.rarity === 'rare'
      );
      const pickedSkin = skinPool[Math.floor(Math.random() * skinPool.length)];
      const isDuplicate = isSkinUnlocked(pickedSkin.id);

      if (!isDuplicate) {
        unlockSkin(pickedSkin.id);
      }

      setBoxReward({
        boxTitle: m.rewardLabel,
        isMegaBox: true,
        skin: pickedSkin,
        isDuplicate,
        coins: m.goldBonus || 1000,
        gems: m.gemBonus || 150,
        duplicateGemRefund: Math.floor(pickedSkin.gemCost / 2),
      });
    } else {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.5 },
        colors: ['#facc15', '#38bdf8', '#22c55e', '#ec4899'],
      });
    }
  };

  const scrollToMyPosition = () => {
    sounds.playBump(0.6);
    if (currentStepRef.current && scrollRef.current) {
      const targetLeft = currentStepRef.current.offsetLeft - scrollRef.current.clientWidth / 2 + 100;
      scrollRef.current.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
    }
  };

  const scrollByDelta = (delta: number) => {
    sounds.playBump(0.5);
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: delta, behavior: 'smooth' });
    }
  };

  const COLUMN_WIDTH = 195;
  const maxTrophies = 5000;
  const progressRatio = Math.min(1, Math.max(0, trophies / maxTrophies));

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen overflow-hidden flex flex-col bg-[#075985] animate-in fade-in duration-200 select-none">
      
      {/* 1. AUTHENTIC BRAWL STARS VIBRANT BLUE BACKDROP */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#0284c7_0%,#0369a1_45%,#075985_80%,#082f49_100%)]" />
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 2px, transparent 3px),
                              radial-gradient(circle at 75% 20%, rgba(255,255,255,0.4) 3px, transparent 4px),
                              radial-gradient(circle at 40% 70%, rgba(255,255,255,0.4) 2.5px, transparent 3.5px)`,
            backgroundSize: '160px 160px',
          }}
        />
      </div>

      {/* 2. TOP HEADER HUD */}
      <div className="relative z-30 px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between bg-slate-950/40 backdrop-blur-md border-b border-white/15 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-6 sm:px-10 py-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 border-2 border-yellow-200 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
            <Trophy className="w-5 h-5 text-yellow-200 fill-yellow-300 drop-shadow" />
            <h1 className="text-sm sm:text-lg font-black tracking-widest uppercase text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)]">
              TROPHY ROAD
            </h1>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-black/50 border border-white/20 rounded-2xl text-amber-300 font-mono font-black text-sm">
            <span>🏆</span>
            <span>{trophies.toLocaleString()}</span>
            <span className="text-[10px] text-sky-200 font-sans font-bold px-2 py-0.5 rounded-full bg-white/10 uppercase">
              {currentLeague.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 bg-black/45 border border-white/20 rounded-2xl px-3 py-1.5 shadow-inner">
            <div className="flex items-center gap-1 font-mono font-bold text-xs text-amber-300">
              <span>🪙</span>
              <span>{gold.toLocaleString()}</span>
            </div>
            <div className="w-px h-3.5 bg-white/20" />
            <div className="flex items-center gap-1 font-mono font-bold text-xs text-cyan-300">
              <span>💎</span>
              <span>{gems.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playBump(0.6);
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-rose-500 hover:bg-rose-400 border-2 border-white flex items-center justify-center text-white transition-all cursor-pointer active:scale-90 shadow-md"
            title="Close"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* 3. BRAWL STARS HORIZONTAL ROAD PROGRESSION */}
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        onMouseDown={handleTrackMouseDown}
        onMouseMove={handleTrackMouseMove}
        onMouseUp={handleTrackMouseUp}
        onMouseLeave={handleTrackMouseUp}
        className="relative z-20 flex-1 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing flex items-center"
      >
        <div
          className="relative flex items-center h-full px-16 sm:px-24"
          style={{ width: `${(TROPHY_ROAD_DATA.length + 1) * COLUMN_WIDTH + 300}px` }}
        >
          {/* Base Track */}
          <div
            className="absolute left-16 right-16 top-1/2 -translate-y-1/2 h-5 rounded-full bg-[#0a192f] border-2 border-[#1e3a8a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_4px_10px_rgba(0,0,0,0.5)] z-0"
          />

          {/* Filled Orange Progress Track */}
          <div
            className="absolute left-16 top-1/2 -translate-y-1/2 h-5 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 border-2 border-yellow-200 shadow-[0_0_15px_rgba(245,158,11,0.7),inset_0_1px_3px_rgba(255,255,255,0.6)] z-1 transition-all duration-300"
            style={{
              width: `${Math.max(
                30,
                progressRatio * (TROPHY_ROAD_DATA.length * COLUMN_WIDTH)
              )}px`,
            }}
          />

          {/* Player Trophy Pointer Marker */}
          <div
            ref={currentStepRef}
            className="absolute z-30 transition-all duration-300 flex flex-col items-center pointer-events-none"
            style={{
              left: `${Math.max(
                40,
                64 + progressRatio * (TROPHY_ROAD_DATA.length * COLUMN_WIDTH)
              )}px`,
              top: '50%',
              transform: 'translate(-50%, 14px)',
            }}
          >
            <div className="w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-amber-400 drop-shadow" />
            <div className="bg-gradient-to-b from-[#f59e0b] via-[#d97706] to-[#b45309] border-2 border-yellow-200 px-3.5 py-1 rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.6)] flex items-center gap-1.5 whitespace-nowrap">
              <Trophy className="w-4 h-4 text-yellow-200 fill-yellow-300" />
              <span className="font-mono font-black text-sm text-white drop-shadow">
                {trophies.toLocaleString()}
              </span>
            </div>
          </div>

          {/* MILESTONE NODES (Columns along the horizontal road) */}
          {TROPHY_ROAD_DATA.map((milestone) => {
            const isReached = trophies >= milestone.trophies;
            const isClaimed = claimedMilestones.includes(milestone.trophies);
            const isMegaBox = milestone.rewardType === 'mega_box';
            const isGate = milestone.isLeagueGate;

            return (
              <div
                key={milestone.trophies}
                className="relative flex flex-col items-center justify-center flex-shrink-0"
                style={{ width: `${COLUMN_WIDTH}px`, height: '100%' }}
              >
                {/* TOP HALF: REWARD CARD (Above Track) */}
                <div className="absolute bottom-[54%] flex flex-col items-center">
                  <div
                    className={`w-1.5 h-10 -mb-1 ${
                      isReached ? 'bg-amber-400' : 'bg-slate-700'
                    } rounded-full z-0`}
                  />

                  {/* Clean Milestone Card */}
                  <div
                    className={`relative p-2.5 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center text-center shadow-xl ${
                      isGate
                        ? 'w-44 bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-slate-900/95 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                        : isMegaBox
                        ? 'w-36 bg-gradient-to-b from-[#1e1b4b]/95 to-[#0f172a]/95 border-cyan-400'
                        : isClaimed
                        ? 'w-32 bg-[#0369a1]/85 border-white/20 opacity-80'
                        : isReached
                        ? 'w-32 bg-gradient-to-b from-[#0284c7] to-[#0369a1] border-yellow-300 shadow-[0_0_15px_rgba(253,224,71,0.5)] scale-105'
                        : 'w-32 bg-[#0c4a6e]/80 border-white/20'
                    }`}
                  >
                    {isGate && (
                      <div
                        className="absolute -top-3 px-2.5 py-0.5 rounded-full font-black text-[8px] uppercase tracking-wider border shadow"
                        style={{
                          backgroundColor: milestone.gateColor,
                          color: '#ffffff',
                          borderColor: '#ffffff',
                        }}
                      >
                        {milestone.gateBadge} GATE
                      </div>
                    )}

                    {/* ARTWORK (Clean Authentic Mega Box or Currency Coin/Gem) */}
                    <div className="my-1 flex items-center justify-center">
                      {isMegaBox ? (
                        <div
                          onClick={() => isReached && !isClaimed && handleClaim(milestone)}
                          className="cursor-pointer transition-transform hover:scale-105"
                        >
                          <MegaBoxGraphic size={isGate ? 80 : 66} />
                        </div>
                      ) : milestone.rewardType === 'gold' ? (
                        <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-2xl shadow">
                          🪙
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-2xl shadow">
                          💎
                        </div>
                      )}
                    </div>

                    {/* Reward Title */}
                    <div className="text-center w-full">
                      <div className="text-xs font-black text-white leading-tight truncate px-1">
                        {milestone.rewardLabel}
                      </div>

                      {isGate && (
                        <div className="text-[10px] text-amber-300 font-bold mt-0.5">
                          +{milestone.goldBonus?.toLocaleString()}🪙 • +{milestone.gemBonus}💎
                        </div>
                      )}
                    </div>

                    {/* Status Action / Checkmark */}
                    <div className="mt-1.5 w-full flex items-center justify-center">
                      {isClaimed ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-md">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : isReached ? (
                        <button
                          onClick={() => handleClaim(milestone)}
                          className="w-full py-1 bg-gradient-to-b from-[#84cc16] via-[#65a30d] to-[#4d7c0f] hover:from-[#a3e635] text-white font-black text-[10px] uppercase tracking-wider rounded-xl border border-lime-200 shadow-[0_2px_0_#365314] active:translate-y-0.5 transition-all cursor-pointer animate-pulse"
                        >
                          COLLECT
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 text-[9px] font-bold text-slate-300 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
                          <Lock className="w-2.5 h-2.5 text-slate-400" />
                          <span>{milestone.trophies} 🏆</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* CENTER TRACK NODE */}
                <div
                  className={`w-5 h-5 rounded-full border-2 z-10 shadow-lg flex items-center justify-center transition-transform ${
                    isReached
                      ? 'bg-amber-400 border-white scale-125 shadow-amber-400/60'
                      : 'bg-slate-800 border-slate-600'
                  }`}
                >
                  {isClaimed ? (
                    <div className="w-2 h-2 rounded-full bg-emerald-600" />
                  ) : isReached ? (
                    <div className="w-2 h-2 rounded-full bg-yellow-100 animate-ping" />
                  ) : (
                    <div className="w-1 h-1 rounded-full bg-slate-500" />
                  )}
                </div>

                {/* BOTTOM HALF: TROPHY REQUIREMENT & LEAGUE GATE SHIELDS */}
                <div className="absolute top-[54%] flex flex-col items-center">
                  <div
                    className={`w-1.5 h-6 -mt-1 ${
                      isReached ? 'bg-amber-400' : 'bg-slate-700'
                    } rounded-full z-0`}
                  />

                  <div
                    className={`font-mono font-black text-xs px-2.5 py-0.5 rounded-full border mb-1.5 shadow-sm ${
                      isReached
                        ? 'bg-amber-400/25 border-amber-300 text-amber-200'
                        : 'bg-black/40 border-white/10 text-slate-400'
                    }`}
                  >
                    {milestone.trophies} 🏆
                  </div>

                  {milestone.gateBadge && (
                    <div
                      className="p-2.5 rounded-2xl border-2 flex flex-col items-center text-center shadow-xl w-36"
                      style={{
                        backgroundColor: `${milestone.gateColor}20`,
                        borderColor: milestone.gateColor,
                        boxShadow: `0 8px 20px ${milestone.gateGlow || 'rgba(0,0,0,0.5)'}`,
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl border-2 flex items-center justify-center text-base font-black text-white shadow-md mb-1"
                        style={{
                          backgroundColor: milestone.gateColor,
                          borderColor: '#ffffff',
                        }}
                      >
                        🛡️
                      </div>

                      <div className="text-[11px] font-black text-white uppercase tracking-wider">
                        {milestone.gateBadge}
                      </div>

                      <div className="text-[9px] font-bold text-sky-200 mt-0.5">
                        {milestone.leagueName}
                      </div>

                      {milestone.seasonReward && (
                        <div className="mt-1 px-2 py-0.5 rounded-md bg-black/50 border border-white/20 text-[8px] font-mono font-bold text-amber-300">
                          SEASON: 🪙 {milestone.seasonReward}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. BOTTOM CONTROLS */}
      <div className="relative z-30 px-4 sm:px-8 py-3 bg-slate-950/50 backdrop-blur-md border-t border-white/15 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollByDelta(-350)}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
            title="Scroll Left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scrollByDelta(350)}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
            title="Scroll Right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <span className="text-[11px] text-sky-200 font-bold hidden sm:inline ml-1">
            Drag track or scroll wheel to explore all milestones
          </span>
        </div>

        <button
          onClick={scrollToMyPosition}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 text-white font-black text-xs uppercase tracking-wider border-2 border-yellow-200 shadow-[0_4px_0_#9a3412,0_6px_15px_rgba(245,158,11,0.5)] active:translate-y-1 transition-all cursor-pointer"
        >
          <Target className="w-4 h-4 text-yellow-200" />
          <span>My Rank ({trophies} 🏆)</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-white/20 text-white">
          <Clock className="w-4 h-4 text-amber-300" />
          <div className="text-right">
            <div className="text-[8px] uppercase tracking-wider text-sky-300 font-bold">
              SEASON ENDS IN
            </div>
            <div className="text-xs font-mono font-black text-amber-300">
              12d 11h
            </div>
          </div>
        </div>
      </div>

      {/* 5. INTERACTIVE BRAWL STARS STEP-BY-STEP BOX OPENING MODAL */}
      <BoxOpeningModal
        isOpen={!!boxReward}
        reward={boxReward}
        onClose={() => setBoxReward(null)}
      />
    </div>
  );
};
