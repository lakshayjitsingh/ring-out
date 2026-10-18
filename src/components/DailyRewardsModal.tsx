import React, { useState } from 'react';
import { X, Calendar, Gift, Check, Clock, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../audio/soundManager';

interface DailyReward {
  day: number;
  label: string;
  type: 'gold' | 'gems' | 'chest';
  amount?: number;
  icon: string;
  description: string;
}

const WEEK_1_REWARDS: DailyReward[] = [
  { day: 1, label: '150 Gold', type: 'gold', amount: 150, icon: '🪙', description: 'Starter purse' },
  { day: 2, label: '35 Gems', type: 'gems', amount: 35, icon: '💎', description: 'Brawler gems' },
  { day: 3, label: '300 Gold', type: 'gold', amount: 300, icon: '🪙', description: 'Double purse' },
  { day: 4, label: '60 Gems', type: 'gems', amount: 60, icon: '💎', description: 'Shiny stash' },
  { day: 5, label: '600 Gold', type: 'gold', amount: 600, icon: '🪙', description: 'Hero gold pouch' },
  { day: 6, label: '120 Gems', type: 'gems', amount: 120, icon: '💎', description: 'Rare gem crate' },
  { day: 7, label: 'Epic Champion Chest', type: 'chest', amount: 500, icon: '👑', description: 'Guaranteed Rare Loot & 500 Gems!' },
];

const WEEK_2_REWARDS: DailyReward[] = [
  { day: 8, label: '800 Gold', type: 'gold', amount: 800, icon: '🪙', description: 'Elite contender gold' },
  { day: 9, label: '150 Gems', type: 'gems', amount: 150, icon: '💎', description: 'Crystal bag' },
  { day: 10, label: '1,200 Gold', type: 'gold', amount: 1200, icon: '🪙', description: 'Grand champion gold' },
  { day: 11, label: '250 Gems', type: 'gems', amount: 250, icon: '💎', description: 'Prestige crystal pouch' },
  { day: 12, label: '2,000 Gold', type: 'gold', amount: 2000, icon: '🪙', description: 'Treasure cache' },
  { day: 13, label: '400 Gems', type: 'gems', amount: 400, icon: '💎', description: 'Crown diamond crate' },
  { day: 14, label: 'Legendary Titan Vault', type: 'chest', amount: 1000, icon: '🌟', description: '1,000 Gems + VIP Golden Crest!' },
];

interface DailyRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGold: (amount: number) => void;
  onAddGems: (amount: number) => void;
}

export const DailyRewardsModal: React.FC<DailyRewardsModalProps> = ({
  isOpen,
  onClose,
  onAddGold,
  onAddGems,
}) => {
  const [claimedDay, setClaimedDay] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('ringout_daily_claimed_day');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [lastClaimDate, setLastClaimDate] = useState<string>(() => {
    try {
      return localStorage.getItem('ringout_daily_last_claim_date') || '';
    } catch {
      return '';
    }
  });

  const todayStr = new Date().toISOString().slice(0, 10);
  const canClaimToday = lastClaimDate !== todayStr;
  const nextDayToClaim = claimedDay + 1;

  // Determine active tier: Week 1 (days 1-7) or Week 2 (days 8-14)
  const isWeek2 = nextDayToClaim > 7;
  const currentWeekRewards = isWeek2 ? WEEK_2_REWARDS : WEEK_1_REWARDS;

  const handleClaim = (reward: DailyReward) => {
    if (!canClaimToday || reward.day !== nextDayToClaim) return;

    sounds.playBump(0.8);
    sounds.playLevelUp?.();

    if (reward.type === 'gold' && reward.amount) {
      onAddGold(reward.amount);
    } else if (reward.type === 'gems' && reward.amount) {
      onAddGems(reward.amount);
    } else if (reward.type === 'chest') {
      onAddGems(reward.amount || 500);
      onAddGold(1000);
    }

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#facc15', '#38bdf8', '#4ade80', '#ec4899'],
    });

    const newClaimedDay = reward.day;
    setClaimedDay(newClaimedDay);
    setLastClaimDate(todayStr);

    try {
      localStorage.setItem('ringout_daily_claimed_day', String(newClaimedDay));
      localStorage.setItem('ringout_daily_last_claim_date', todayStr);
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#020617] border-4 border-amber-400 rounded-[36px] pt-14 pb-6 px-4 sm:px-6 shadow-[0_25px_60px_rgba(0,0,0,0.9),inset_0_2px_10px_rgba(255,255,255,0.2)] animate-in zoom-in-95 duration-150">
        {/* Top 3D Ribbon Banner */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#d97706] border-2 border-[#fef08a] px-8 sm:px-12 py-1.5 rounded-2xl shadow-[0_5px_15px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.6)] whitespace-nowrap">
          <span className="text-xl sm:text-2xl font-black tracking-widest text-[#78350f] uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] flex items-center gap-2">
            <Gift className="w-5 h-5 fill-amber-700" />
            DAILY LOGIN REWARDS
          </span>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playBump(0.6);
            onClose();
          }}
          className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-rose-500 hover:bg-rose-400 border-2 border-white flex items-center justify-center text-white transition-all cursor-pointer active:scale-90 shadow-lg shadow-rose-950/50"
          title="Close Rewards"
        >
          <X className="w-5 h-5 stroke-[3]" />
        </button>

        {/* Tier Header */}
        <div className="flex items-center justify-between bg-black/50 border border-white/10 rounded-2xl px-4 py-2.5 mb-4 shadow-inner">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wide">
              {isWeek2 ? '🌟 ELITE CYCLE (DAYS 8 - 14)' : '🏆 ROOKIE STREAK (DAYS 1 - 7)'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-bold text-sky-200">
            {canClaimToday ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 animate-pulse font-black">
                READY TO CLAIM!
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3 h-3" /> Next in 24h
              </span>
            )}
          </div>
        </div>

        {/* 7-Day Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-3">
          {currentWeekRewards.slice(0, 6).map((item) => {
            const isClaimed = item.day <= claimedDay;
            const isCurrent = item.day === nextDayToClaim;

            return (
              <div
                key={item.day}
                className={`relative rounded-2xl p-2.5 flex flex-col items-center text-center transition-all border-2 ${
                  isClaimed
                    ? 'bg-slate-900/60 border-emerald-500/40 opacity-70'
                    : isCurrent && canClaimToday
                    ? 'bg-gradient-to-b from-amber-500/20 to-amber-950/40 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105'
                    : 'bg-slate-900/80 border-white/10'
                }`}
              >
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Day {item.day}
                </div>
                <div className="text-2xl my-1">{item.icon}</div>
                <div className="text-[11px] font-black text-white leading-tight font-mono">
                  {item.label}
                </div>

                {isClaimed ? (
                  <div className="mt-2 w-5 h-5 rounded-full bg-emerald-500/30 text-emerald-400 flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : isCurrent && canClaimToday ? (
                  <button
                    onClick={() => handleClaim(item)}
                    className="mt-2 w-full py-1 bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 text-[#78350f] font-black text-[10px] uppercase rounded-lg shadow-md cursor-pointer animate-pulse"
                  >
                    CLAIM
                  </button>
                ) : (
                  <div className="mt-2 text-[9px] font-bold text-slate-500 uppercase">
                    Locked
                  </div>
                )}
              </div>
            );
          })}

          {/* Grand Day 7 / 14 Card (Spans Remaining Space) */}
          {(() => {
            const bigItem = currentWeekRewards[6];
            const isClaimed = bigItem.day <= claimedDay;
            const isCurrent = bigItem.day === nextDayToClaim;

            return (
              <div
                className={`col-span-2 sm:col-span-1 rounded-2xl p-2.5 flex flex-col items-center text-center border-2 transition-all ${
                  isClaimed
                    ? 'bg-slate-900/60 border-emerald-500/40 opacity-70'
                    : isCurrent && canClaimToday
                    ? 'bg-gradient-to-b from-purple-500/30 to-indigo-950/50 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.5)] scale-105'
                    : 'bg-gradient-to-b from-purple-950/40 to-slate-900/80 border-purple-400/30'
                }`}
              >
                <div className="text-[10px] font-black uppercase tracking-wider text-purple-300 mb-0.5">
                  Day {bigItem.day} ★
                </div>
                <div className="text-3xl my-0.5">{bigItem.icon}</div>
                <div className="text-[10px] font-black text-amber-300 uppercase leading-tight">
                  {bigItem.label}
                </div>

                {isClaimed ? (
                  <div className="mt-1.5 w-5 h-5 rounded-full bg-emerald-500/30 text-emerald-400 flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : isCurrent && canClaimToday ? (
                  <button
                    onClick={() => handleClaim(bigItem)}
                    className="mt-1.5 w-full py-1 bg-gradient-to-b from-purple-400 to-indigo-600 hover:from-purple-300 text-white font-black text-[10px] uppercase rounded-lg shadow-md cursor-pointer animate-pulse"
                  >
                    OPEN!
                  </button>
                ) : (
                  <div className="mt-1.5 text-[9px] font-bold text-slate-500 uppercase">
                    GRAND
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Footer Streak Progress */}
        <div className="bg-black/40 border border-white/10 rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-300">
              Current Login Streak: <strong className="text-amber-300">{claimedDay} Days</strong>
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold">
            {claimedDay >= 7 ? 'Rolling in Elite Tier' : 'Grand Chest in Day 7'}
          </span>
        </div>
      </div>
    </div>
  );
};
