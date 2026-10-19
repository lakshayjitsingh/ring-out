import React, { useState, useEffect } from 'react';
import {
  Home,
  Sparkles,
  Tv,
  Check,
  Zap,
  Coins,
  Crown,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../audio/soundManager';
import { crazyGames } from '../game/crazyGamesSdk';
import { CHAMPIONS, type ChampionId } from '../game/championModels';
import { isSkinUnlocked, unlockSkin } from '../game/championSkins';

interface ShopScreenProps {
  gold: number;
  gems: number;
  trophies: number;
  setGold: React.Dispatch<React.SetStateAction<number>>;
  setGems: React.Dispatch<React.SetStateAction<number>>;
  unlockedChampions: ChampionId[];
  onUnlockChampion: (id: ChampionId, gemCost: number) => void;
  onBackToHome: () => void;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({
  gold,
  gems,
  trophies,
  setGold,
  setGems,
  unlockedChampions,
  onUnlockChampion,
  onBackToHome,
}) => {
  const [activeTab, setActiveTab] = useState<'free' | 'gems' | 'champions'>('free');
  const [adLoading, setAdLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // 2.5D Parallax Mouse Tracking (Matching Home and Showcase standard)
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const normX = ((e.clientX / window.innerWidth) - 0.5) * -16;
      const normY = ((e.clientY / window.innerHeight) - 0.5) * -10;
      setParallaxOffset({ x: normX, y: normY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#38bdf8', '#facc15', '#a855f7', '#22c55e', '#ec4899'],
    });
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Helper currency additions with localStorage persistence
  const handleAddGems = (amount: number) => {
    setGems((prev) => {
      const next = prev + amount;
      try {
        localStorage.setItem('ringout_gems', String(next));
      } catch {}
      return next;
    });
  };

  const handleAddGold = (amount: number) => {
    setGold((prev) => {
      const next = prev + amount;
      try {
        localStorage.setItem('ringout_gold', String(next));
      } catch {}
      return next;
    });
  };

  // 1. FREE SPONSOR REWARDS (PART 1)
  const handleClaimFreeGems = () => {
    sounds.playBump(0.6);
    setAdLoading(true);
    showToast('Loading sponsor stream...');

    crazyGames.requestRewardedAd({
      onStart: () => sounds.playBump(0.5),
      onReward: () => {
        handleAddGems(250);
        sounds.playVictory?.();
        triggerCelebration();
        showToast('Claimed +250 Gems 💎!');
      },
      onFinish: () => setAdLoading(false),
      onError: () => {
        setAdLoading(false);
        showToast('Ad unavailable, granted free fallback bonus (+100 Gems)!');
        handleAddGems(100);
      },
    });
  };

  const handleClaimFreeGold = () => {
    sounds.playBump(0.6);
    setAdLoading(true);
    showToast('Loading sponsor stream...');

    crazyGames.requestRewardedAd({
      onStart: () => sounds.playBump(0.5),
      onReward: () => {
        handleAddGold(600);
        sounds.playVictory?.();
        triggerCelebration();
        showToast('Claimed +600 Gold 🪙!');
      },
      onFinish: () => setAdLoading(false),
      onError: () => {
        setAdLoading(false);
        showToast('Granted fallback bonus (+300 Gold)!');
        handleAddGold(300);
      },
    });
  };

  const handleClaimMegaDailyCrate = () => {
    sounds.playVictory();
    triggerCelebration();
    handleAddGems(150);
    handleAddGold(400);
    showToast('Unlocked Mega Brawl Crate! (+150 💎, +400 🪙)');
  };

  // 2. GEM VAULT & COIN EXCHANGE (PART 2)
  const handleBuyGemPack = async (packName: string, amount: number, price: string) => {
    sounds.playBump(0.6);
    showToast(`Purchased ${packName} (${price})! (+${amount} Gems 💎)`);
    handleAddGems(amount);
    triggerCelebration();
    sounds.playVictory();
  };

  const handleExchangeGemsForCoins = (gemCost: number, coinsGained: number) => {
    if (gems < gemCost) {
      sounds.playBump(0.8);
      showToast('Not enough Gems to exchange! Claim free sponsor gems first.');
      return;
    }
    sounds.playVictory();
    setGems((prev) => {
      const next = prev - gemCost;
      try {
        localStorage.setItem('ringout_gems', String(next));
      } catch {}
      return next;
    });
    handleAddGold(coinsGained);
    triggerCelebration();
    showToast(`Exchanged ${gemCost} 💎 for +${coinsGained} 🪙 Coins!`);
  };

  // 3. CHAMPIONS & SKINS VAULT (PART 3)
  const handleDirectChampionUnlock = (id: ChampionId, cost: number) => {
    if (unlockedChampions.includes(id)) return;
    if (gems < cost) {
      sounds.playBump(0.8);
      showToast(`Need ${cost} Gems to unlock ${CHAMPIONS[id].name}!`);
      return;
    }
    onUnlockChampion(id, cost);
    sounds.playVictory();
    triggerCelebration();
    showToast(`Unlocked ${CHAMPIONS[id].name} for battle! 🎉`);
  };

  const championShopData: { id: ChampionId; cost: number; title: string; badge: string; color: string }[] = [
    { id: 'kai', cost: 350, title: 'Urban Skater', badge: 'High Mobility', color: '#00f0ff' },
    { id: 'nova', cost: 700, title: 'Solar Duelist', badge: 'Ring Reach', color: '#ff2d55' },
    { id: 'titan', cost: 1100, title: 'Mountain Juggernaut', badge: 'Unmovable', color: '#f59e0b' },
    { id: 'kage', cost: 1500, title: 'Shadow Shinobi', badge: 'Stealth Dash', color: '#10b981' },
    { id: 'bolt', cost: 2000, title: 'Lightning Axel', badge: 'Hyper Speed', color: '#eab308' },
  ];

  const featuredVaultSkins = [
    {
      id: 'leo_poseidon',
      championId: 'leo' as ChampionId,
      name: 'Poseidon God-King Leo',
      rarity: 'legendary' as const,
      tagline: '👑 Mythic Sovereign of the Abyssal Ocean',
      description: 'Floating golden sea crown, orbiting tidal pearls, royal scale armor!',
      gemCost: 950,
      color: '#facc15',
      badge: 'LEGENDARY',
    },
    {
      id: 'kai_quantum',
      championId: 'kai' as ChampionId,
      name: 'Quantum Overdrive Kai',
      rarity: 'legendary' as const,
      tagline: '👑 Hard-Light Tachyon Overdrive',
      description: 'Twin floating holographic tachyon wings, spinning quantum pulse halo!',
      gemCost: 950,
      color: '#38bdf8',
      badge: 'LEGENDARY',
    },
    {
      id: 'nova_solar_eclipse',
      championId: 'nova' as ChampionId,
      name: 'Solar Eclipse Goddess Nova',
      rarity: 'legendary' as const,
      tagline: '👑 Coronal Flare Deity of the Sun',
      description: 'Massive twin solar flare wings, coronal sun halo, orbiting sun flare orbs!',
      gemCost: 950,
      color: '#f59e0b',
      badge: 'LEGENDARY',
    },
    {
      id: 'titan_magma_titan',
      championId: 'titan' as ChampionId,
      name: 'Magma Titan Destroyer Gorr',
      rarity: 'legendary' as const,
      tagline: '👑 Primordial Volcanic Colossus',
      description: 'Cracking molten magma core fissure, 3 orbiting basalt boulders, igneous horns!',
      gemCost: 950,
      color: '#ef4444',
      badge: 'LEGENDARY',
    },
    {
      id: 'kage_void_phantom',
      championId: 'kage' as ChampionId,
      name: 'Void Phantom Kage',
      rarity: 'legendary' as const,
      tagline: '👑 Spectral Singularity Shinobi',
      description: '6 floating spectral obsidian blade wings, void singularity halo, shadow crown!',
      gemCost: 950,
      color: '#a855f7',
      badge: 'LEGENDARY',
    },
    {
      id: 'bolt_raijin',
      championId: 'bolt' as ChampionId,
      name: 'Thunder God Raijin Axel',
      rarity: 'legendary' as const,
      tagline: '👑 Mythic Sovereign of Celestial Thunder',
      description: 'Ring of 6 floating Taiko thunder drums with golden lightning arcs, storm crown!',
      gemCost: 950,
      color: '#fde047',
      badge: 'LEGENDARY',
    },
    {
      id: 'kage_demon_oni',
      championId: 'kage' as ChampionId,
      name: 'Demon Oni Kage',
      rarity: 'epic' as const,
      tagline: 'Traditional Blood Oni Mask & Ivory Tusks',
      description: 'Carved crimson demon oni mask with fangs, braided sacred shimenawa rope belt.',
      gemCost: 400,
      color: '#e11d48',
      badge: 'EPIC SKIN',
    },
    {
      id: 'titan_gladiator',
      championId: 'titan' as ChampionId,
      name: 'Colosseum Gladiator Gorr',
      rarity: 'epic' as const,
      tagline: 'Roman Crest Plume & Spiked Lion Pauldron',
      description: 'Colossal bronze helmet with sweeping crimson horsehair crest plume.',
      gemCost: 400,
      color: '#d97706',
      badge: 'EPIC SKIN',
    },
  ];

  const handleDirectSkinUnlock = (skinId: string, gemCost: number, skinName: string) => {
    if (isSkinUnlocked(skinId)) {
      showToast(`${skinName} is already unlocked!`);
      return;
    }
    if (gems < gemCost) {
      sounds.playBump(0.8);
      showToast(`Need ${gemCost} Gems to unlock ${skinName}!`);
      return;
    }
    sounds.playVictory();
    setGems((prev) => {
      const next = prev - gemCost;
      try {
        localStorage.setItem('ringout_gems', String(next));
      } catch {}
      return next;
    });
    unlockSkin(skinId);
    triggerCelebration();
    showToast(`Unlocked ${skinName}! Equip it in Brawlers Locker. 🎉`);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-[#0284c7] via-[#38bdf8] to-[#7dd3fc] font-sans select-none text-white flex flex-col">
      {/* 0. HIGH-TECH 4K STYLIZED MATTE BACKDROP WITH 2.5D PARALLAX */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden transition-transform duration-300 ease-out z-0"
        style={{
          transform: `scale(1.06) translate3d(${parallaxOffset.x}px, ${parallaxOffset.y}px, 0)`,
        }}
      >
        <img
          src="/lobby_bg.jpg"
          alt="Emerald Island Lagoon"
          className="w-full h-full object-cover object-center filter brightness-105 contrast-[1.02]"
        />

        {/* Dynamic Sweeping Volumetric God Rays */}
        <div
          className="absolute -top-1/4 -right-1/4 w-[160%] h-[160%] pointer-events-none mix-blend-screen opacity-35 animate-pulse duration-[7000ms]"
          style={{
            background:
              'conic-gradient(from 220deg at 78% 18%, rgba(254, 240, 138, 0.45) 0deg, transparent 22deg, rgba(253, 224, 71, 0.35) 48deg, transparent 70deg, rgba(254, 240, 138, 0.4) 95deg, transparent 125deg, rgba(254, 240, 138, 0.45) 155deg, transparent 195deg)',
          }}
        />

        {/* Lagoon Caustics */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none opacity-25 mix-blend-overlay"
          style={{
            background:
              'radial-gradient(ellipse at 50% 85%, rgba(224, 242, 254, 0.7) 0%, rgba(56, 189, 248, 0.3) 45%, transparent 75%)',
          }}
        />

        {/* Dark Vignette for clean readability */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(2,132,199,0.25)_80%,rgba(1,63,107,0.55)_100%)]" />
      </div>

      {/* 1. TOP HEADER HUD */}
      <div className="relative z-30 p-3 sm:p-5 flex items-center justify-between border-b border-white/10 bg-slate-950/40 backdrop-blur-md">
        {/* Return to Home Lobby */}
        <button
          onClick={() => {
            sounds.playBump(0.7);
            onBackToHome();
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0284c7]/90 hover:bg-[#0369a1] text-white border-2 border-white/40 rounded-2xl backdrop-blur-md shadow-xl active:scale-95 cursor-pointer transition-all group"
        >
          <Home className="w-5 h-5 text-amber-300 group-hover:-translate-y-0.5 transition-transform" />
          <span className="text-xs sm:text-sm font-black tracking-wider uppercase drop-shadow-sm">
            Home Lobby
          </span>
        </button>

        {/* Title Ribbon */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-500/90 via-orange-500/90 to-amber-600/90 border-2 border-yellow-200 rounded-2xl shadow-xl">
            <Sparkles className="w-4 h-4 text-yellow-200" />
            <h1 className="text-sm sm:text-base font-black tracking-widest uppercase text-white drop-shadow">
              BRAWL SHOP
            </h1>
          </div>
          <span className="text-[10px] text-sky-100 font-bold mt-1 uppercase tracking-wider drop-shadow-sm">
            3 Special Store Divisions
          </span>
        </div>

        {/* Currency Counters */}
        <div className="flex items-center gap-2.5 bg-black/50 backdrop-blur-md px-4 py-2 rounded-2xl border-2 border-white/30 shadow-xl">
          <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm">
            <span className="text-amber-300">🏆</span>
            <span className="text-amber-300 font-mono drop-shadow">{trophies.toLocaleString()}</span>
          </div>
          <div className="w-px h-4 bg-white/30" />
          <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm">
            <span className="text-base">💎</span>
            <span className="text-cyan-300 font-mono drop-shadow">{gems.toLocaleString()}</span>
          </div>
          <div className="w-px h-4 bg-white/30" />
          <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm">
            <span className="text-base">🪙</span>
            <span className="text-amber-300 font-mono drop-shadow">{gold.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 border-2 border-white text-white font-black text-xs uppercase tracking-wider shadow-[0_10px_30px_rgba(0,0,0,0.6)] animate-in slide-in-from-top-4 duration-150">
          {notification}
        </div>
      )}

      {/* 2. THREE DIVISION QUICK TABS */}
      <div className="relative z-30 flex items-center justify-center gap-2 sm:gap-4 px-4 py-3 bg-slate-900/40 backdrop-blur-md border-b border-white/10">
        <button
          onClick={() => {
            sounds.playBump(0.4);
            setActiveTab('free');
          }}
          className={`px-5 py-2 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer border-2 flex items-center gap-2 ${
            activeTab === 'free'
              ? 'bg-gradient-to-b from-[#84cc16] to-[#4d7c0f] text-white border-[#bef264] shadow-[0_0_15px_rgba(132,204,22,0.6)] scale-105'
              : 'bg-black/30 text-sky-200 border-white/10 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Tv className="w-3.5 h-3.5" />
          <span>Part 1: Free Daily Drops</span>
        </button>

        <button
          onClick={() => {
            sounds.playBump(0.4);
            setActiveTab('gems');
          }}
          className={`px-5 py-2 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer border-2 flex items-center gap-2 ${
            activeTab === 'gems'
              ? 'bg-gradient-to-b from-[#38bdf8] to-[#0284c7] text-white border-sky-200 shadow-[0_0_15px_rgba(56,189,248,0.6)] scale-105'
              : 'bg-black/30 text-sky-200 border-white/10 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Part 2: Gem Vault & Coins</span>
        </button>

        <button
          onClick={() => {
            sounds.playBump(0.4);
            setActiveTab('champions');
          }}
          className={`px-5 py-2 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer border-2 flex items-center gap-2 ${
            activeTab === 'champions'
              ? 'bg-gradient-to-b from-[#a855f7] to-[#7c3aed] text-white border-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.6)] scale-105'
              : 'bg-black/30 text-sky-200 border-white/10 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Crown className="w-3.5 h-3.5" />
          <span>Part 3: Champions & Skins</span>
        </button>
      </div>

      {/* 3. MAIN SHOPPING CONTENT SCROLL AREA */}
      <div className="relative z-20 flex-1 overflow-y-auto px-4 sm:px-8 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="max-w-6xl mx-auto space-y-10">
          
          {/* ======================================================== */}
          {/* PART 1: FREE DAILY REWARDS & SPONSORS */}
          {/* ======================================================== */}
          {(activeTab === 'free' || true) && (
            <div id="part-free" className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-lime-500/20 border border-lime-400 flex items-center justify-center text-lime-300">
                  <Tv className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-white drop-shadow">
                    Part 1: Daily Free Rewards & Sponsor Drops
                  </h2>
                  <p className="text-xs text-sky-200 font-semibold">
                    Support the arena and claim free gems, gold, and crates instantly!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Offer 1: Free Gem Drop */}
                <div className="bg-slate-900/80 backdrop-blur-xl border-2 border-cyan-400/40 hover:border-cyan-400 rounded-3xl p-5 shadow-2xl flex flex-col justify-between transition-all hover:scale-[1.02]">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                        FREE DAILY
                      </span>
                      <span className="text-2xl">💎</span>
                    </div>
                    <h3 className="text-lg font-black text-white">Free Gem Drop</h3>
                    <p className="text-xs text-sky-200 font-semibold mb-4">
                      Watch a short sponsor video to claim a generous stash of green diamonds.
                    </p>
                    <div className="text-2xl font-black text-cyan-300 font-mono mb-4">
                      +250 GEMS
                    </div>
                  </div>

                  <button
                    onClick={handleClaimFreeGems}
                    disabled={adLoading}
                    className="w-full py-3 bg-gradient-to-b from-[#84cc16] via-[#65a30d] to-[#4d7c0f] hover:from-[#a3e635] text-white font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-lime-200 shadow-[0_4px_0_#365314] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Tv className="w-4 h-4" />
                    <span>{adLoading ? 'STREAMING...' : 'CLAIM REWARD'}</span>
                  </button>
                </div>

                {/* Offer 2: Gold Rush Stash */}
                <div className="bg-slate-900/80 backdrop-blur-xl border-2 border-amber-400/40 hover:border-amber-400 rounded-3xl p-5 shadow-2xl flex flex-col justify-between transition-all hover:scale-[1.02]">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
                        FREE DAILY
                      </span>
                      <span className="text-2xl">🪙</span>
                    </div>
                    <h3 className="text-lg font-black text-white">Gold Rush Stash</h3>
                    <p className="text-xs text-sky-200 font-semibold mb-4">
                      Fuel your champion training and arena upgrades with golden coins.
                    </p>
                    <div className="text-2xl font-black text-amber-300 font-mono mb-4">
                      +600 GOLD
                    </div>
                  </div>

                  <button
                    onClick={handleClaimFreeGold}
                    disabled={adLoading}
                    className="w-full py-3 bg-gradient-to-b from-[#f59e0b] via-[#d97706] to-[#b45309] hover:from-[#fbbf24] text-white font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-amber-200 shadow-[0_4px_0_#78350f] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Tv className="w-4 h-4" />
                    <span>{adLoading ? 'STREAMING...' : 'CLAIM REWARD'}</span>
                  </button>
                </div>

                {/* Offer 3: Daily Mega Crate */}
                <div className="bg-slate-900/80 backdrop-blur-xl border-2 border-purple-400/40 hover:border-purple-400 rounded-3xl p-5 shadow-2xl flex flex-col justify-between transition-all hover:scale-[1.02]">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/40">
                        INSTANT DROP
                      </span>
                      <span className="text-2xl">🎁</span>
                    </div>
                    <h3 className="text-lg font-black text-white">Daily Mega Crate</h3>
                    <p className="text-xs text-sky-200 font-semibold mb-4">
                      Direct arena bonus packed with both gems and gold coins!
                    </p>
                    <div className="text-xl font-black text-purple-300 font-mono mb-4">
                      +150 💎 & +400 🪙
                    </div>
                  </div>

                  <button
                    onClick={handleClaimMegaDailyCrate}
                    className="w-full py-3 bg-gradient-to-b from-[#a855f7] via-[#7c3aed] to-[#6d28d9] hover:from-[#c084fc] text-white font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-purple-200 shadow-[0_4px_0_#4c1d95] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span>OPEN CRATE</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PART 2: GEM VAULT & COIN EXCHANGE */}
          {/* ======================================================== */}
          {(activeTab === 'gems' || true) && (
            <div id="part-gems" className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
                  <Zap className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-white drop-shadow">
                    Part 2: Gem Vault & Currency Exchange
                  </h2>
                  <p className="text-xs text-sky-200 font-semibold">
                    Stock up on green gems or exchange gems directly into shiny gold coins.
                  </p>
                </div>
              </div>

              {/* Gem Stash Packs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/80 backdrop-blur-xl border-2 border-sky-400/40 rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
                  <div className="text-center">
                    <span className="text-4xl block mb-2">💎</span>
                    <h3 className="text-base font-black text-white">Pouch of Gems</h3>
                    <div className="text-2xl font-black text-cyan-300 font-mono my-2">80 GEMS</div>
                    <p className="text-xs text-sky-200 mb-4">Quick top-up for minor unlocks.</p>
                  </div>
                  <button
                    onClick={() => handleBuyGemPack('Pouch of Gems', 80, '$0.99')}
                    className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 text-white font-black text-xs uppercase tracking-wider rounded-xl border border-white/20 active:scale-95 transition-all cursor-pointer"
                  >
                    $0.99 USD
                  </button>
                </div>

                <div className="bg-slate-900/80 backdrop-blur-xl border-2 border-amber-400 rounded-3xl p-5 shadow-2xl flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                    POPULAR
                  </div>
                  <div className="text-center">
                    <span className="text-4xl block mb-2">💎💎</span>
                    <h3 className="text-base font-black text-white">Chest of Gems</h3>
                    <div className="text-2xl font-black text-amber-300 font-mono my-2">500 GEMS</div>
                    <p className="text-xs text-sky-200 mb-4">+15% Bonus Crystals included.</p>
                  </div>
                  <button
                    onClick={() => handleBuyGemPack('Chest of Gems', 500, '$4.99')}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl border border-white/30 active:scale-95 transition-all cursor-pointer"
                  >
                    $4.99 USD
                  </button>
                </div>

                <div className="bg-slate-900/80 backdrop-blur-xl border-2 border-purple-400/60 rounded-3xl p-5 shadow-2xl flex flex-col justify-between relative">
                  <div className="absolute top-2 right-2 bg-purple-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                    BEST VALUE
                  </div>
                  <div className="text-center">
                    <span className="text-4xl block mb-2">💎💎💎</span>
                    <h3 className="text-base font-black text-white">Mountain of Gems</h3>
                    <div className="text-2xl font-black text-purple-300 font-mono my-2">1,200 GEMS</div>
                    <p className="text-xs text-sky-200 mb-4">+30% Huge Value bonus.</p>
                  </div>
                  <button
                    onClick={() => handleBuyGemPack('Mountain of Gems', 1200, '$9.99')}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 text-white font-black text-xs uppercase tracking-wider rounded-xl border border-white/20 active:scale-95 transition-all cursor-pointer"
                  >
                    $9.99 USD
                  </button>
                </div>
              </div>

              {/* Instant Coin Exchange */}
              <div className="mt-4 bg-slate-950/60 border border-white/10 rounded-3xl p-5">
                <div className="text-xs font-black uppercase tracking-wider text-amber-300 mb-3 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>Gem-to-Gold Instant Exchange Counter</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleExchangeGemsForCoins(60, 1000)}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between cursor-pointer active:scale-95 transition-all"
                  >
                    <div className="text-left">
                      <div className="text-xs font-black text-white">+1,000 Gold 🪙</div>
                      <div className="text-[10px] text-sky-300">Basic coin bag</div>
                    </div>
                    <div className="px-2.5 py-1 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-xs font-mono font-black">
                      60 💎
                    </div>
                  </button>

                  <button
                    onClick={() => handleExchangeGemsForCoins(180, 3500)}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between cursor-pointer active:scale-95 transition-all"
                  >
                    <div className="text-left">
                      <div className="text-xs font-black text-white">+3,500 Gold 🪙</div>
                      <div className="text-[10px] text-sky-300">Popular bundle</div>
                    </div>
                    <div className="px-2.5 py-1 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-xs font-mono font-black">
                      180 💎
                    </div>
                  </button>

                  <button
                    onClick={() => handleExchangeGemsForCoins(450, 10000)}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between cursor-pointer active:scale-95 transition-all"
                  >
                    <div className="text-left">
                      <div className="text-xs font-black text-white">+10,000 Gold 🪙</div>
                      <div className="text-[10px] text-sky-300">Juggernaut vault</div>
                    </div>
                    <div className="px-2.5 py-1 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-xs font-mono font-black">
                      450 💎
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PART 3: CHAMPIONS & EXCLUSIVE SKINS VAULT */}
          {/* ======================================================== */}
          {(activeTab === 'champions' || true) && (
            <div id="part-champions" className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400 flex items-center justify-center text-purple-300">
                  <Crown className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-white drop-shadow">
                    Part 3: Champions & Exclusive Skins Vault
                  </h2>
                  <p className="text-xs text-sky-200 font-semibold">
                    Unlock all human brawlers directly or preview upcoming league skins!
                  </p>
                </div>
              </div>

              {/* Champion Direct Gem Unlocks */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {championShopData.map((champ) => {
                  const isOwned = unlockedChampions.includes(champ.id);
                  const info = CHAMPIONS[champ.id];

                  return (
                    <div
                      key={champ.id}
                      className="bg-slate-900/80 backdrop-blur-xl border-2 border-white/15 rounded-3xl p-4 flex flex-col justify-between text-center shadow-xl hover:border-white/40 transition-all"
                    >
                      <div>
                        {/* Avatar Initial with Ring */}
                        <div
                          className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center font-black text-2xl border-2 shadow-lg mb-2"
                          style={{
                            backgroundColor: `${champ.color}30`,
                            borderColor: champ.color,
                            color: '#ffffff',
                          }}
                        >
                          {info.name.charAt(0)}
                        </div>

                        <h4 className="text-sm font-black text-white drop-shadow">{info.name}</h4>
                        <div className="text-[10px] text-sky-200 font-bold uppercase tracking-wider mb-2">
                          {champ.title}
                        </div>
                        <span
                          className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full border"
                          style={{
                            color: champ.color,
                            borderColor: `${champ.color}60`,
                            backgroundColor: `${champ.color}15`,
                          }}
                        >
                          {champ.badge}
                        </span>
                      </div>

                      <div className="mt-4">
                        {isOwned ? (
                          <div className="py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-black text-[11px] uppercase flex items-center justify-center gap-1">
                            <Check className="w-3.5 h-3.5 stroke-[3]" /> UNLOCKED
                          </div>
                        ) : (
                          <button
                            onClick={() => handleDirectChampionUnlock(champ.id, champ.cost)}
                            className="w-full py-2 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500 hover:from-cyan-400 text-white font-black text-xs uppercase tracking-wider rounded-xl border border-sky-300 shadow active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
                          >
                            <span>💎</span>
                            <span>{champ.cost}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Featured Skins Vault Showcase */}
              <div className="mt-6 bg-slate-950/70 border-2 border-purple-500/40 rounded-3xl p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-purple-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      Featured Skins Vault (Legendary & Epic)
                    </h3>
                    <p className="text-xs text-slate-300">
                      Customize your champion with divine floating halos, wings, crowns, and mythic attire!
                    </p>
                  </div>
                  <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400 text-purple-200 text-[10px] font-black uppercase">
                    SKINS VAULT
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {featuredVaultSkins.map((skin) => {
                    const isOwned = isSkinUnlocked(skin.id);

                    return (
                      <div
                        key={skin.id}
                        className={`bg-black/40 border-2 rounded-2xl p-4 flex flex-col justify-between text-center relative group transition-all ${
                          skin.rarity === 'legendary'
                            ? 'border-amber-400/50 hover:border-amber-300 shadow-[0_0_15px_rgba(250,204,21,0.2)]'
                            : 'border-purple-500/40 hover:border-purple-400'
                        }`}
                      >
                        <div
                          className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-black border ${
                            skin.rarity === 'legendary'
                              ? 'bg-amber-500/30 text-amber-300 border-amber-400/60'
                              : 'bg-purple-500/25 text-purple-300 border-purple-400/50'
                          }`}
                        >
                          {skin.badge}
                        </div>

                        <div className="py-2">
                          <div
                            className="w-12 h-12 mx-auto rounded-2xl border-2 flex items-center justify-center text-xl shadow mb-2"
                            style={{
                              borderColor: skin.color,
                              backgroundColor: `${skin.color}25`,
                            }}
                          >
                            {skin.rarity === 'legendary' ? '👑' : '⚡'}
                          </div>
                          <h4 className="text-xs font-black text-white">{skin.name}</h4>
                          <div className="text-[10px] text-sky-200 font-medium mt-0.5 line-clamp-1">{skin.tagline}</div>
                          <div className="text-[9px] text-slate-400 mt-1 line-clamp-2">{skin.description}</div>
                        </div>

                        <div className="mt-2">
                          {isOwned ? (
                            <div className="py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-black text-[11px] uppercase flex items-center justify-center gap-1">
                              <Check className="w-3.5 h-3.5 stroke-[3]" /> UNLOCKED
                            </div>
                          ) : (
                            <button
                              onClick={() => handleDirectSkinUnlock(skin.id, skin.gemCost, skin.name)}
                              className="w-full py-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl border border-amber-200 shadow active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
                            >
                              <span>💎</span>
                              <span>{skin.gemCost}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
