import React, { useRef, useEffect } from 'react';
import {
  Trophy,
  X,
  Check,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../audio/soundManager';
import { type ChampionId } from '../game/championModels';

export interface TrophyMilestone {
  trophies: number;
  rewardType: 'gold' | 'gems' | 'champion' | 'league_skin';
  rewardLabel: string;
  amount?: number;
  championId?: ChampionId;
  leagueName?: string;
  isLeagueGate?: boolean;
  skinSlotName?: string;
  gateBadge?: string;
  gateColor?: string;
}

interface TrophyRoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  trophies: number;
  claimedMilestones: number[];
  onClaimMilestone: (milestone: TrophyMilestone) => void;
}

export const TROPHY_ROAD_DATA: TrophyMilestone[] = [
  // 1. UNRANKED ARENA (0 - 499 🏆)
  {
    trophies: 0,
    rewardType: 'gems',
    rewardLabel: 'Starter Bounty: 25 Gems',
    amount: 25,
    leagueName: 'Unranked Arena',
  },
  {
    trophies: 50,
    rewardType: 'gold',
    rewardLabel: '150 Gold Coins',
    amount: 150,
    leagueName: 'Unranked Arena',
  },
  {
    trophies: 150,
    rewardType: 'champion',
    rewardLabel: 'Unlock Kai (Urban Skater)',
    championId: 'kai',
    leagueName: 'Unranked Arena',
  },
  {
    trophies: 300,
    rewardType: 'gems',
    rewardLabel: '40 Green Gems',
    amount: 40,
    leagueName: 'Unranked Arena',
  },
  {
    trophies: 450,
    rewardType: 'gold',
    rewardLabel: '300 Gold Coins',
    amount: 300,
    leagueName: 'Unranked Arena',
  },

  // 2. BRONZE LEAGUE GATE (500 🏆)
  {
    trophies: 500,
    rewardType: 'league_skin',
    rewardLabel: 'Bronze League Gate',
    amount: 500,
    leagueName: 'Bronze League',
    isLeagueGate: true,
    skinSlotName: 'Bronze Brawler Skin Reward',
    gateBadge: 'BRONZE I',
    gateColor: '#cd7f32',
  },
  {
    trophies: 650,
    rewardType: 'gems',
    rewardLabel: '50 Green Gems',
    amount: 50,
    leagueName: 'Bronze League',
  },
  {
    trophies: 800,
    rewardType: 'champion',
    rewardLabel: 'Unlock Nova (Agile Kickboxer)',
    championId: 'nova',
    leagueName: 'Bronze League',
  },
  {
    trophies: 950,
    rewardType: 'gold',
    rewardLabel: '600 Gold Coins',
    amount: 600,
    leagueName: 'Bronze League',
  },

  // 3. SILVER LEAGUE GATE (1000 🏆)
  {
    trophies: 1000,
    rewardType: 'league_skin',
    rewardLabel: 'Silver League Gate',
    amount: 100,
    leagueName: 'Silver League',
    isLeagueGate: true,
    skinSlotName: 'Silver Cyber Skin Reward',
    gateBadge: 'SILVER I',
    gateColor: '#94a3b8',
  },
  {
    trophies: 1200,
    rewardType: 'gold',
    rewardLabel: '800 Gold Coins',
    amount: 800,
    leagueName: 'Silver League',
  },
  {
    trophies: 1350,
    rewardType: 'gems',
    rewardLabel: '80 Green Gems',
    amount: 80,
    leagueName: 'Silver League',
  },
  {
    trophies: 1500,
    rewardType: 'champion',
    rewardLabel: 'Unlock Titan Gorr (Mountain Juggernaut)',
    championId: 'titan',
    leagueName: 'Silver League',
  },
  {
    trophies: 1750,
    rewardType: 'gold',
    rewardLabel: '1,000 Gold Coins',
    amount: 1000,
    leagueName: 'Silver League',
  },

  // 4. GOLD LEAGUE GATE (2000 🏆)
  {
    trophies: 2000,
    rewardType: 'league_skin',
    rewardLabel: 'Gold League Gate',
    amount: 150,
    leagueName: 'Gold League',
    isLeagueGate: true,
    skinSlotName: 'Golden Champion Skin Reward',
    gateBadge: 'GOLD I',
    gateColor: '#eab308',
  },
  {
    trophies: 2300,
    rewardType: 'gold',
    rewardLabel: '1,500 Gold Coins',
    amount: 1500,
    leagueName: 'Gold League',
  },
  {
    trophies: 2600,
    rewardType: 'champion',
    rewardLabel: 'Unlock Kage (Shadow Shinobi)',
    championId: 'kage',
    leagueName: 'Gold League',
  },
  {
    trophies: 2800,
    rewardType: 'gems',
    rewardLabel: '200 Green Gems',
    amount: 200,
    leagueName: 'Gold League',
  },

  // 5. DIAMOND LEAGUE GATE (3000 🏆)
  {
    trophies: 3000,
    rewardType: 'league_skin',
    rewardLabel: 'Diamond League Gate',
    amount: 2000,
    leagueName: 'Diamond League',
    isLeagueGate: true,
    skinSlotName: 'Diamond Ronin Skin Reward',
    gateBadge: 'DIAMOND I',
    gateColor: '#06b6d4',
  },
  {
    trophies: 3300,
    rewardType: 'gems',
    rewardLabel: '250 Green Gems',
    amount: 250,
    leagueName: 'Diamond League',
  },
  {
    trophies: 3500,
    rewardType: 'champion',
    rewardLabel: 'Unlock Axel (Street Sprinter)',
    championId: 'bolt',
    leagueName: 'Diamond League',
  },
  {
    trophies: 3750,
    rewardType: 'gold',
    rewardLabel: '3,000 Gold Coins',
    amount: 3000,
    leagueName: 'Diamond League',
  },

  // 6. MASTER LEAGUE GATE (4000 🏆)
  {
    trophies: 4000,
    rewardType: 'league_skin',
    rewardLabel: 'Master League Gate',
    amount: 350,
    leagueName: 'Master League',
    isLeagueGate: true,
    skinSlotName: 'Master Void Skin Reward',
    gateBadge: 'MASTER I',
    gateColor: '#a855f7',
  },
  {
    trophies: 4300,
    rewardType: 'gold',
    rewardLabel: '4,000 Gold Coins',
    amount: 4000,
    leagueName: 'Master League',
  },
  {
    trophies: 4650,
    rewardType: 'gems',
    rewardLabel: '500 Green Gems',
    amount: 500,
    leagueName: 'Master League',
  },

  // 7. GRANDMASTER APEX GATE (5000+ 🏆)
  {
    trophies: 5000,
    rewardType: 'league_skin',
    rewardLabel: 'Grandmaster Apex Gate',
    amount: 1000,
    leagueName: 'Grandmaster League',
    isLeagueGate: true,
    skinSlotName: 'Grandmaster Crown Skin Reward',
    gateBadge: 'GRANDMASTER',
    gateColor: '#ec4899',
  },
];

export const TrophyRoadModal: React.FC<TrophyRoadModalProps> = ({
  isOpen,
  onClose,
  trophies,
  claimedMilestones,
  onClaimMilestone,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentStepRef = useRef<HTMLDivElement>(null);

  // Auto-scroll towards player's current trophy position
  useEffect(() => {
    if (isOpen && currentStepRef.current) {
      setTimeout(() => {
        currentStepRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 250);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Determine current league
  const getCurrentLeague = (tr: number) => {
    if (tr >= 5000) return { name: 'Grandmaster League', color: '#ec4899', next: 5000 };
    if (tr >= 4000) return { name: 'Master League', color: '#a855f7', next: 5000 };
    if (tr >= 3000) return { name: 'Diamond League', color: '#06b6d4', next: 4000 };
    if (tr >= 2000) return { name: 'Gold League', color: '#eab308', next: 3000 };
    if (tr >= 1000) return { name: 'Silver League', color: '#94a3b8', next: 2000 };
    if (tr >= 500) return { name: 'Bronze League', color: '#cd7f32', next: 1000 };
    return { name: 'Unranked Arena', color: '#38bdf8', next: 500 };
  };

  const currentLeague = getCurrentLeague(trophies);

  const handleClaim = (m: TrophyMilestone) => {
    sounds.playVictory();
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#facc15', '#38bdf8', '#22c55e', '#ec4899'],
    });
    onClaimMilestone(m);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#0284c7] via-[#0369a1] to-[#075985] border-4 border-[#38bdf8] rounded-[36px] pt-14 pb-4 px-3 sm:px-6 shadow-[0_25px_70px_rgba(0,0,0,0.9),inset_0_2px_10px_rgba(255,255,255,0.3)] flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        
        {/* Top 3D Ribbon Banner */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#d97706] border-2 border-[#fef08a] px-8 sm:px-14 py-1.5 rounded-2xl shadow-[0_5px_15px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.6)] whitespace-nowrap">
          <span className="text-lg sm:text-xl font-black tracking-widest text-[#78350f] uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] flex items-center gap-2">
            <Trophy className="w-5 h-5 fill-amber-700 text-[#78350f]" />
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

        {/* Top Sticky Trophy Status & League Progress */}
        <div className="bg-black/50 border-2 border-white/20 rounded-2xl p-3 mb-3 shadow-inner flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl border-2 shadow-lg"
              style={{
                backgroundColor: `${currentLeague.color}25`,
                borderColor: currentLeague.color,
                color: '#ffffff',
              }}
            >
              🏆
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-sky-200">
                CURRENT RATING
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-amber-300 drop-shadow flex items-center gap-1.5">
                {trophies.toLocaleString()} <span className="text-xs text-amber-200 font-bold">TROPHIES</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span
              className="inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border mb-1"
              style={{
                backgroundColor: `${currentLeague.color}25`,
                borderColor: currentLeague.color,
                color: currentLeague.color,
              }}
            >
              {currentLeague.name}
            </span>
            <div className="text-xs font-black text-white">
              Next Gate: {currentLeague.next.toLocaleString()} 🏆
            </div>
          </div>
        </div>

        {/* CLASH ROYALE STYLE VERTICAL WINDING ROAD */}
        <div
          ref={scrollRef}
          className="relative flex-1 overflow-y-auto px-2 sm:px-4 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* Central Vertical Winding Grass & Road Line */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-b from-emerald-600 via-green-600 to-emerald-700 border-x-4 border-emerald-400 shadow-[0_0_15px_rgba(34,197,94,0.4)] rounded-full z-0 opacity-80" />
          
          {/* Stepping Path Stones */}
          <div className="relative z-10 space-y-6">
            {TROPHY_ROAD_DATA.map((milestone, idx) => {
              const isReached = trophies >= milestone.trophies;
              const isClaimed = claimedMilestones.includes(milestone.trophies);
              const isCurrentStep = !isClaimed && isReached;
              const isEven = idx % 2 === 0;

              // 1. LEAGUE GATE ARCHWAY (Bronze, Silver, Gold, Diamond, Master, Grandmaster)
              if (milestone.isLeagueGate) {
                return (
                  <div
                    key={milestone.trophies}
                    ref={isCurrentStep ? currentStepRef : null}
                    className="relative my-8 pt-4 pb-6 px-4 bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-900/90 border-4 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] text-center overflow-hidden"
                    style={{ borderColor: milestone.gateColor }}
                  >
                    {/* Archway League Title */}
                    <div
                      className="inline-block px-6 py-1.5 rounded-2xl border-2 font-black text-xs sm:text-sm uppercase tracking-widest text-white shadow-lg mb-3"
                      style={{
                        backgroundColor: `${milestone.gateColor}35`,
                        borderColor: milestone.gateColor,
                      }}
                    >
                      👑 {(milestone.leagueName || 'League').toUpperCase()} • {milestone.trophies} 🏆
                    </div>

                    <div className="text-xs text-sky-200 font-semibold mb-4">
                      Conquer this milestone to unlock the league gate and claim exclusive rewards!
                    </div>

                    {/* EMPTY LEAGUE SKIN REWARD CARD (Placeholder as requested) */}
                    <div className="max-w-md mx-auto bg-black/60 border-2 border-dashed border-yellow-300/60 rounded-2xl p-4 shadow-inner relative flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3 text-left">
                        <div
                          className="w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl shadow-md"
                          style={{
                            borderColor: milestone.gateColor,
                            backgroundColor: `${milestone.gateColor}25`,
                          }}
                        >
                          🎨
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase text-amber-300 tracking-wider">
                            🌟 LEAGUE COMPLETION SKIN REWARD
                          </div>
                          <div className="text-sm font-black text-white">
                            {milestone.skinSlotName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            [EMPTY SLOT • RESERVED FOR UPCOMING CUSTOM SKIN]
                          </div>
                        </div>
                      </div>

                      {/* Claim or Status for Gate */}
                      <div>
                        {isClaimed ? (
                          <div className="px-4 py-2 rounded-xl bg-lime-500/20 border border-lime-400 text-lime-300 text-xs font-black uppercase flex items-center gap-1.5 shadow">
                            <Check className="w-4 h-4 stroke-[3]" /> CLAIMED
                          </div>
                        ) : isReached ? (
                          <button
                            onClick={() => handleClaim(milestone)}
                            className="px-5 py-2.5 bg-gradient-to-b from-[#84cc16] via-[#65a30d] to-[#4d7c0f] hover:from-[#a3e635] text-white font-black text-xs uppercase tracking-wider rounded-xl border-2 border-lime-200 shadow-[0_4px_0_#365314] active:translate-y-1 transition-all cursor-pointer animate-bounce"
                          >
                            COLLECT!
                          </button>
                        ) : (
                          <div className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-600 text-slate-400 text-xs font-bold flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5" /> LOCKED
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              // 2. STANDARD STEPPING ROAD MILESTONES (Left & Right alternating like Clash Royale)
              return (
                <div
                  key={milestone.trophies}
                  ref={isCurrentStep ? currentStepRef : null}
                  className={`relative flex items-center justify-between gap-3 ${
                    isEven ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  {/* Left/Right Reward Card */}
                  <div
                    className={`flex-1 max-w-[240px] sm:max-w-xs p-3.5 rounded-2xl border-2 shadow-xl transition-all duration-200 flex items-center justify-between gap-3 ${
                      isClaimed
                        ? 'bg-slate-900/60 border-white/10 opacity-70'
                        : isReached
                        ? 'bg-gradient-to-r from-[#02568f]/95 to-[#013f6b]/95 border-lime-300 shadow-[0_0_20px_rgba(132,204,22,0.4)] scale-105'
                        : 'bg-slate-900/75 border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Reward Icon */}
                      <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/20 flex items-center justify-center text-lg shadow">
                        {milestone.rewardType === 'gold' && '🪙'}
                        {milestone.rewardType === 'gems' && '💎'}
                        {milestone.rewardType === 'champion' && '🥊'}
                      </div>
                      <div className="text-left">
                        <div className="text-[10px] font-mono font-black text-amber-300">
                          {milestone.trophies} 🏆
                        </div>
                        <div className="text-xs font-black text-white leading-tight">
                          {milestone.rewardLabel}
                        </div>
                      </div>
                    </div>

                    {/* Claim Button / Status */}
                    <div>
                      {isClaimed ? (
                        <div className="w-7 h-7 rounded-full bg-lime-500/20 border border-lime-400 flex items-center justify-center text-lime-400">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : isReached ? (
                        <button
                          onClick={() => handleClaim(milestone)}
                          className="px-3.5 py-1.5 bg-gradient-to-b from-[#84cc16] to-[#4d7c0f] hover:from-[#a3e635] text-white font-black text-[11px] uppercase rounded-xl border border-lime-200 shadow-[0_3px_0_#365314] active:translate-y-1 transition-all cursor-pointer animate-pulse"
                        >
                          COLLECT
                        </button>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-500">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Center Road Island Block (Clash Royale Grass & Path Node) */}
                  <div className="relative flex flex-col items-center justify-center">
                    <div
                      className={`w-14 h-14 rounded-2xl border-4 flex flex-col items-center justify-center shadow-lg transition-transform ${
                        isReached
                          ? 'bg-gradient-to-b from-amber-400 to-yellow-500 border-amber-200 text-slate-950 scale-110 shadow-amber-500/40'
                          : 'bg-gradient-to-b from-slate-700 to-slate-800 border-slate-600 text-slate-400'
                      }`}
                    >
                      <Trophy className="w-5 h-5 fill-current" />
                      <span className="text-[9px] font-mono font-black mt-0.5">
                        {milestone.trophies}
                      </span>
                    </div>

                    {/* Floating Marker if user is right here */}
                    {isCurrentStep && (
                      <div className="absolute -top-3 px-2 py-0.5 rounded-full bg-lime-400 text-slate-950 text-[8px] font-black uppercase tracking-wider animate-bounce shadow">
                        YOU ARE HERE
                      </div>
                    )}
                  </div>

                  {/* Empty Spacer on other side */}
                  <div className="flex-1 max-w-[240px] sm:max-w-xs hidden sm:block" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Shortcut */}
        <div className="mt-2 text-center">
          <span className="text-[10px] text-sky-200 font-bold uppercase tracking-wider">
            Clash Royale Style Road • Win matches to climb from Unranked to Grandmaster!
          </span>
        </div>
      </div>
    </div>
  );
};
