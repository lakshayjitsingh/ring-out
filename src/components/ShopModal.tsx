import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Tv,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../audio/soundManager';
import { crazyGames } from '../game/crazyGamesSdk';
import { CHAMPIONS, type ChampionId } from '../game/championModels';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  gold: number;
  gems: number;
  onAddGems: (amount: number) => void;
  onAddGold: (amount: number) => void;
  unlockedChampions: ChampionId[];
  onUnlockChampion: (id: ChampionId, gemCost: number) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  gold,
  gems,
  onAddGems,
  onAddGold,
  unlockedChampions,
  onUnlockChampion,
}) => {
  const [activeCategory, setActiveCategory] = useState<'free' | 'gems' | 'champions'>('free');
  const [adLoading, setAdLoading] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerCelebration = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#38bdf8', '#facc15', '#a855f7', '#22c55e'],
    });
  };

  // 1. FREE REWARDED AD: +250 GEMS
  const handleWatchGemAd = () => {
    sounds.playBump(0.6);
    setAdLoading(true);
    setPurchaseStatus('Loading Ad...');

    crazyGames.requestRewardedAd({
      onStart: () => {
        sounds.playBump(0.5);
      },
      onReward: () => {
        onAddGems(250);
        sounds.playLevelUp?.();
        triggerCelebration();
        setPurchaseStatus('Claimed +250 Gems 💎!');
        setTimeout(() => setPurchaseStatus(null), 3000);
      },
      onFinish: () => {
        setAdLoading(false);
      },
      onError: () => {
        setAdLoading(false);
        setPurchaseStatus('Ad unavailable, please try again.');
        setTimeout(() => setPurchaseStatus(null), 2500);
      },
    });
  };

  // 2. FREE REWARDED AD: +500 GOLD
  const handleWatchGoldAd = () => {
    sounds.playBump(0.6);
    setAdLoading(true);
    setPurchaseStatus('Loading Ad...');

    crazyGames.requestRewardedAd({
      onStart: () => {
        sounds.playBump(0.5);
      },
      onReward: () => {
        onAddGold(500);
        sounds.playLevelUp?.();
        triggerCelebration();
        setPurchaseStatus('Claimed +500 Gold 🪙!');
        setTimeout(() => setPurchaseStatus(null), 3000);
      },
      onFinish: () => {
        setAdLoading(false);
      },
      onError: () => {
        setAdLoading(false);
        setPurchaseStatus('Ad unavailable, please try again.');
        setTimeout(() => setPurchaseStatus(null), 2500);
      },
    });
  };

  // 3. REAL-MONEY IN-APP PURCHASES (XSOLLA READY)
  const handleBuyGemPack = async (packName: string, gemAmount: number, price: string) => {
    sounds.playBump(0.6);
    setPurchaseStatus(`Connecting to Xsolla Checkout (${price})...`);

    const token = await crazyGames.getXsollaToken();
    if (token) {
      // Production CrazyGames Xsolla flow
      setPurchaseStatus(`Opening payment gateway...`);
    } else {
      // Sandbox / Test Mode: grant gems directly for demonstration
      setTimeout(() => {
        onAddGems(gemAmount);
        triggerCelebration();
        sounds.playLevelUp?.();
        setPurchaseStatus(`Purchased ${packName}! (+${gemAmount} Gems 💎)`);
        setTimeout(() => setPurchaseStatus(null), 3500);
      }, 700);
    }
  };

  // 4. BUY CHAMPION DIRECTLY WITH GEMS
  const handleChampionGemUnlock = (id: ChampionId, cost: number) => {
    if (unlockedChampions.includes(id)) return;
    if (gems < cost) {
      sounds.playBump(0.8);
      setPurchaseStatus('Not enough Gems! Watch an ad or buy gems.');
      setTimeout(() => setPurchaseStatus(null), 2500);
      return;
    }

    onUnlockChampion(id, cost);
    sounds.playLevelUp?.();
    triggerCelebration();
    setPurchaseStatus(`Unlocked ${CHAMPIONS[id].name}! 🎉`);
    setTimeout(() => setPurchaseStatus(null), 3000);
  };

  const championShopList: { id: ChampionId; cost: number; title: string; badge: string }[] = [
    { id: 'kage', cost: 500, title: 'Shadow Shinobi', badge: 'Fast Agility' },
    { id: 'nova', cost: 800, title: 'Solar Duelist', badge: 'High Reach' },
    { id: 'titan', cost: 1200, title: 'Iron Juggernaut', badge: 'Super Heavy' },
    { id: 'bolt', cost: 1500, title: 'Robo-Fox Prototype', badge: 'Ultra Burst' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#020617] border-4 border-[#38bdf8] rounded-[36px] pt-14 pb-5 px-4 sm:px-6 shadow-[0_25px_60px_rgba(0,0,0,0.9),inset_0_2px_10px_rgba(255,255,255,0.2)] animate-in zoom-in-95 duration-150">
        {/* Top 3D Ribbon Banner: "BRAWL SHOP" */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#d97706] border-2 border-[#fef08a] px-8 sm:px-12 py-1.5 rounded-2xl shadow-[0_5px_15px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.6)] whitespace-nowrap">
          <span className="text-xl sm:text-2xl font-black tracking-widest text-[#78350f] uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] flex items-center gap-2">
            <Sparkles className="w-5 h-5 fill-amber-700" />
            BRAWL SHOP
          </span>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playBump(0.6);
            onClose();
          }}
          className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-rose-500 hover:bg-rose-400 border-2 border-white flex items-center justify-center text-white transition-all cursor-pointer active:scale-90 shadow-lg shadow-rose-950/50"
          title="Close Shop"
        >
          <X className="w-5 h-5 stroke-[3]" />
        </button>

        {/* Top Currency Display inside Shop */}
        <div className="flex items-center justify-between bg-black/50 border border-white/10 rounded-2xl px-4 py-2.5 mb-4 shadow-inner">
          <div className="flex items-center gap-4">
            {/* Gems */}
            <div className="flex items-center gap-1.5 font-black text-sm">
              <span className="text-base">💎</span>
              <span className="text-cyan-300 font-mono">{gems.toLocaleString()}</span>
            </div>
            {/* Gold */}
            <div className="flex items-center gap-1.5 font-black text-sm">
              <span className="text-base">🪙</span>
              <span className="text-amber-300 font-mono">{gold.toLocaleString()}</span>
            </div>
          </div>
          <span className="text-[11px] font-bold text-sky-200 uppercase tracking-wider">
            Verified Store
          </span>
        </div>

        {/* Status Toast Notification */}
        {purchaseStatus && (
          <div className="mb-3 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 via-sky-500/30 to-blue-500/20 border border-sky-400/50 text-sky-200 text-xs font-bold text-center animate-in fade-in">
            {purchaseStatus}
          </div>
        )}

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            onClick={() => {
              sounds.playBump(0.4);
              setActiveCategory('free');
            }}
            className={`flex-1 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer border ${
              activeCategory === 'free'
                ? 'bg-gradient-to-b from-[#84cc16] to-[#4d7c0f] text-white border-[#bef264] shadow-md'
                : 'bg-slate-800/80 text-sky-200 border-white/10 hover:text-white'
            }`}
          >
            📺 Free Ads
          </button>
          <button
            onClick={() => {
              sounds.playBump(0.4);
              setActiveCategory('gems');
            }}
            className={`flex-1 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer border ${
              activeCategory === 'gems'
                ? 'bg-gradient-to-b from-[#38bdf8] to-[#0284c7] text-white border-sky-200 shadow-md'
                : 'bg-slate-800/80 text-sky-200 border-white/10 hover:text-white'
            }`}
          >
            💎 Buy Gems
          </button>
          <button
            onClick={() => {
              sounds.playBump(0.4);
              setActiveCategory('champions');
            }}
            className={`flex-1 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer border ${
              activeCategory === 'champions'
                ? 'bg-gradient-to-b from-[#a855f7] to-[#7c3aed] text-white border-purple-200 shadow-md'
                : 'bg-slate-800/80 text-sky-200 border-white/10 hover:text-white'
            }`}
          >
            🥊 Champions
          </button>
        </div>

        {/* TAB 1: FREE REWARDED ADS */}
        {activeCategory === 'free' && (
          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {/* Card 1: Free Gems */}
            <div className="bg-gradient-to-r from-cyan-950/60 to-slate-900/80 border-2 border-cyan-400/40 rounded-2xl p-3.5 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-2xl shadow-inner">
                  💎
                </div>
                <div>
                  <div className="text-sm font-black text-white flex items-center gap-1.5">
                    <span>Free Gem Drop</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 font-bold uppercase">
                      +250 Gems
                    </span>
                  </div>
                  <div className="text-[11px] text-sky-200 font-medium">
                    Watch a short sponsor video to claim
                  </div>
                </div>
              </div>

              <button
                disabled={adLoading}
                onClick={handleWatchGemAd}
                className="py-2.5 px-4 bg-gradient-to-b from-[#84cc16] via-[#65a30d] to-[#4d7c0f] hover:from-[#bef264] hover:to-[#65a30d] text-white font-black text-xs uppercase tracking-wider rounded-xl border border-lime-200 shadow-[0_3px_0_#365314] active:translate-y-0.5 active:shadow-[0_1px_0_#365314] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>CLAIM</span>
              </button>
            </div>

            {/* Card 2: Free Gold */}
            <div className="bg-gradient-to-r from-amber-950/60 to-slate-900/80 border-2 border-amber-400/40 rounded-2xl p-3.5 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-2xl shadow-inner">
                  🪙
                </div>
                <div>
                  <div className="text-sm font-black text-white flex items-center gap-1.5">
                    <span>Gold Rush Stash</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold uppercase">
                      +500 Gold
                    </span>
                  </div>
                  <div className="text-[11px] text-sky-200 font-medium">
                    Watch a short sponsor video to claim
                  </div>
                </div>
              </div>

              <button
                disabled={adLoading}
                onClick={handleWatchGoldAd}
                className="py-2.5 px-4 bg-gradient-to-b from-[#f59e0b] via-[#d97706] to-[#b45309] hover:from-[#fde047] hover:to-[#d97706] text-[#78350f] font-black text-xs uppercase tracking-wider rounded-xl border border-amber-200 shadow-[0_3px_0_#78350f] active:translate-y-0.5 active:shadow-[0_1px_0_#78350f] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>CLAIM</span>
              </button>
            </div>

            {/* VIP Info Banner */}
            <div className="bg-purple-950/40 border border-purple-400/30 rounded-2xl p-3 text-center">
              <span className="text-[11px] text-purple-200 font-semibold">
                ✨ Free ads reward players immediately and support future arena expansions!
              </span>
            </div>
          </div>
        )}

        {/* TAB 2: BUY GEMS (XSOLLA / REAL MONEY READY) */}
        {activeCategory === 'gems' && (
          <div className="grid grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
            {/* Pack 1 */}
            <div className="bg-slate-900/90 border-2 border-white/10 hover:border-cyan-400/60 rounded-2xl p-3 flex flex-col items-center text-center shadow-lg transition-all">
              <div className="text-2xl mb-1">💎</div>
              <div className="text-sm font-black text-white">Pouch of Gems</div>
              <div className="text-xs font-mono font-bold text-cyan-300 mb-2">500 GEMS</div>
              <button
                onClick={() => handleBuyGemPack('Pouch of Gems', 500, '$0.99')}
                className="w-full py-2 bg-gradient-to-b from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs rounded-xl border border-cyan-200 shadow-md active:translate-y-0.5 cursor-pointer"
              >
                $0.99
              </button>
            </div>

            {/* Pack 2 (Popular) */}
            <div className="relative bg-slate-900/90 border-2 border-amber-400/60 rounded-2xl p-3 flex flex-col items-center text-center shadow-lg transition-all">
              <div className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full bg-amber-400 text-[#78350f] text-[9px] font-black uppercase tracking-wider shadow-xs">
                HOT
              </div>
              <div className="text-2xl mb-1">💰</div>
              <div className="text-sm font-black text-white">Chest of Gems</div>
              <div className="text-xs font-mono font-bold text-amber-300 mb-2">2,500 GEMS</div>
              <button
                onClick={() => handleBuyGemPack('Chest of Gems', 2500, '$2.99')}
                className="w-full py-2 bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-[#78350f] font-black text-xs rounded-xl border border-amber-200 shadow-md active:translate-y-0.5 cursor-pointer"
              >
                $2.99
              </button>
            </div>

            {/* Pack 3 (Best Value) */}
            <div className="relative bg-slate-900/90 border-2 border-purple-400/60 rounded-2xl p-3 flex flex-col items-center text-center shadow-lg transition-all">
              <div className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full bg-purple-400 text-purple-950 text-[9px] font-black uppercase tracking-wider shadow-xs">
                BEST
              </div>
              <div className="text-2xl mb-1">👑</div>
              <div className="text-sm font-black text-white">Titan Treasury</div>
              <div className="text-xs font-mono font-bold text-purple-300 mb-2">6,000 GEMS</div>
              <button
                onClick={() => handleBuyGemPack('Titan Treasury', 6000, '$4.99')}
                className="w-full py-2 bg-gradient-to-b from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-xs rounded-xl border border-purple-200 shadow-md active:translate-y-0.5 cursor-pointer"
              >
                $4.99
              </button>
            </div>

            {/* Pack 4 (VIP Ad-Free) */}
            <div className="bg-slate-900/90 border-2 border-emerald-400/60 rounded-2xl p-3 flex flex-col items-center text-center shadow-lg transition-all">
              <div className="text-2xl mb-1">🛡️</div>
              <div className="text-sm font-black text-white">VIP No-Ads Pass</div>
              <div className="text-xs font-mono font-bold text-emerald-300 mb-2">REMOVE MID-ADS</div>
              <button
                onClick={() => handleBuyGemPack('VIP Pass', 1000, '$3.99')}
                className="w-full py-2 bg-gradient-to-b from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs rounded-xl border border-emerald-200 shadow-md active:translate-y-0.5 cursor-pointer"
              >
                $3.99
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: CHAMPIONS GEM UNLOCKS */}
        {activeCategory === 'champions' && (
          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
            {championShopList.map((c) => {
              const champ = CHAMPIONS[c.id];
              const isUnlocked = unlockedChampions.includes(c.id);

              return (
                <div
                  key={c.id}
                  className="bg-slate-900/80 border-2 border-white/10 rounded-2xl p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-800 border border-white/20 flex items-center justify-center font-black text-white text-base">
                      {champ.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-black text-white flex items-center gap-2">
                        <span>{champ.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                          {c.badge}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 font-medium">
                        {c.title} • Special Strike
                      </div>
                    </div>
                  </div>

                  {isUnlocked ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-black uppercase">
                      <Check className="w-3.5 h-3.5" />
                      <span>OWNED</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleChampionGemUnlock(c.id, c.cost)}
                      className="py-2 px-3 bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#0369a1] hover:from-[#7dd3fc] text-white font-black text-xs uppercase tracking-wider rounded-xl border border-sky-200 shadow-md active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>💎 {c.cost}</span>
                      <span>UNLOCK</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
