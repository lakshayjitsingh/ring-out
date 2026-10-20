import React, { useState, useEffect } from 'react';
import {
  Home,
  Sparkles,
  Tv,
  Check,
  Coins,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../audio/soundManager';
import { crazyGames } from '../game/crazyGamesSdk';
import { CHAMPIONS, type ChampionId } from '../game/championModels';
import { isSkinUnlocked, unlockSkin } from '../game/championSkins';

export type ShopCategory = 'brawlers' | 'skins' | 'gold' | 'gems';

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
  const [activeTab, setActiveTab] = useState<ShopCategory>('brawlers');
  const [adLoading, setAdLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // 2.5D Parallax Mouse Tracking
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth - 0.5) * -16;
      const normY = (e.clientY / window.innerHeight - 0.5) * -10;
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

  // 1. FREE REWARDS & ADS
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

  // 2. GEM VAULT
  const handleBuyGemPack = (packName: string, amount: number, price: string) => {
    sounds.playBump(0.6);
    showToast(`Purchased ${packName} (${price})! (+${amount} Gems 💎)`);
    handleAddGems(amount);
    triggerCelebration();
    sounds.playVictory();
  };

  // 3. CURRENCY EXCHANGE (GEMS -> GOLD)
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

  // 4. BRAWLERS DIRECT GEM UNLOCK
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

  const championShopData: {
    id: ChampionId;
    cost: number;
    title: string;
    badge: string;
    color: string;
    speed: number;
    power: number;
    weight: number;
  }[] = [
    { id: 'kai', cost: 350, title: 'Urban Skater', badge: 'High Mobility', color: '#00f0ff', speed: 4, power: 3, weight: 3 },
    { id: 'nova', cost: 700, title: 'Solar Kickboxer', badge: 'Flurry Reach', color: '#f43f5e', speed: 3, power: 4, weight: 3 },
    { id: 'titan', cost: 1100, title: 'Mountain Juggernaut', badge: 'Colossal Mass', color: '#f59e0b', speed: 2, power: 5, weight: 5 },
    { id: 'kage', cost: 1500, title: 'Shadow Shinobi', badge: 'Stealth Dash', color: '#a855f7', speed: 4, power: 3, weight: 2 },
    { id: 'bolt', cost: 2000, title: 'Lightning Sprinter', badge: 'Max Velocity', color: '#eab308', speed: 5, power: 2, weight: 2 },
  ];

  // 5. SKINS VAULT DATA (Legendary, Epic, Rare)
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
      description: 'Crescent of 5 sculpted Taiko thunder drums, golden storm lightning crown!',
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
    {
      id: 'leo_cyber',
      championId: 'leo' as ChampionId,
      name: 'Cyber Surge Leo',
      rarity: 'epic' as const,
      tagline: 'Neon Cyberpunk Edge Runner',
      description: 'Holographic cyan HUD scan visor, glowing reactor jacket, carbon fiber boots.',
      gemCost: 400,
      color: '#00f5ff',
      badge: 'EPIC SKIN',
    },
    {
      id: 'bolt_cyber_racer',
      championId: 'bolt' as ChampionId,
      name: 'Cyber Racer Axel',
      rarity: 'epic' as const,
      tagline: 'Supersonic Tachyon Jet Suit',
      description: 'Aerodynamic shoulder cowls, chest HUD speed readout, turbo exhaust heel jets.',
      gemCost: 400,
      color: '#38bdf8',
      badge: 'EPIC SKIN',
    },
    {
      id: 'leo_sunset',
      championId: 'leo' as ChampionId,
      name: 'Sunset Reef Leo',
      rarity: 'rare' as const,
      tagline: 'Tropical Coral & Golden Hour Diver',
      description: 'Sun-kissed coral fabrics with turquoise marine trims and bleached hair.',
      gemCost: 150,
      color: '#f97316',
      badge: 'RARE SKIN',
    },
    {
      id: 'titan_frost_yeti',
      championId: 'titan' as ChampionId,
      name: 'Frost Yeti Gorr',
      rarity: 'epic' as const,
      tagline: 'Berserker of the Alpine Blizzards',
      description: 'Thick snowy white fur mantle, frosted icicle beard, and glacial rune armor plates.',
      gemCost: 400,
      color: '#38bdf8',
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

        {/* Dark Vignette for clean readability */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(2,132,199,0.25)_80%,rgba(1,63,107,0.55)_100%)]" />
      </div>

      {/* 1. TOP HEADER HUD */}
      <div className="relative z-30 p-3 sm:p-4 flex items-center justify-between border-b border-white/10 bg-slate-950/45 backdrop-blur-md">
        {/* Return to Home Lobby */}
        <button
          onClick={() => {
            sounds.playBump(0.7);
            onBackToHome();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#0284c7]/90 hover:bg-[#0369a1] text-white border-2 border-white/40 rounded-2xl backdrop-blur-md shadow-xl active:scale-95 cursor-pointer transition-all group"
        >
          <Home className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 group-hover:-translate-y-0.5 transition-transform" />
          <span className="text-xs sm:text-sm font-black tracking-wider uppercase drop-shadow-sm">
            Home Lobby
          </span>
        </button>

        {/* Title Ribbon */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 px-6 py-1.5 bg-gradient-to-r from-amber-500/90 via-orange-500/90 to-amber-600/90 border-2 border-yellow-200 rounded-2xl shadow-xl">
            <Sparkles className="w-4 h-4 text-yellow-200" />
            <h1 className="text-sm sm:text-base font-black tracking-widest uppercase text-white drop-shadow">
              BRAWL SHOP
            </h1>
          </div>
          <span className="text-[10px] text-sky-100 font-bold mt-0.5 uppercase tracking-wider drop-shadow-sm">
            4 Dedicated Divisions
          </span>
        </div>

        {/* Currency Counters */}
        <div className="flex items-center gap-2 sm:gap-2.5 bg-black/50 backdrop-blur-md px-3 sm:px-4 py-1.5 rounded-2xl border-2 border-white/30 shadow-xl">
          <div className="flex items-center gap-1 font-black text-xs sm:text-sm">
            <span className="text-amber-300">🏆</span>
            <span className="text-amber-300 font-mono drop-shadow">{trophies.toLocaleString()}</span>
          </div>
          <div className="w-px h-4 bg-white/30" />
          <div className="flex items-center gap-1 font-black text-xs sm:text-sm">
            <span className="text-base">💎</span>
            <span className="text-cyan-300 font-mono drop-shadow">{gems.toLocaleString()}</span>
          </div>
          <div className="w-px h-4 bg-white/30" />
          <div className="flex items-center gap-1 font-black text-xs sm:text-sm">
            <span className="text-base">🪙</span>
            <span className="text-amber-300 font-mono drop-shadow">{gold.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 border-2 border-white text-white font-black text-xs uppercase tracking-wider shadow-[0_10px_30px_rgba(0,0,0,0.6)] animate-in slide-in-from-top-4 duration-150">
          {notification}
        </div>
      )}

      {/* 2. BODY CONTAINER: LEFT VERTICAL SIDEBAR + RIGHT EXCLUSIVE CONTENT */}
      <div className="relative z-20 flex-1 flex overflow-hidden">
        
        {/* LEFT VERTICAL CATEGORY SIDEBAR (BRAWLERS, SKINS, GOLD, GEMS) */}
        <div className="w-36 sm:w-52 p-2.5 sm:p-4 bg-slate-950/65 backdrop-blur-xl border-r border-white/15 flex flex-col gap-2.5 z-20 flex-shrink-0 shadow-2xl overflow-y-auto">
          <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-sky-300 px-2 py-1 mb-1 border-b border-white/10 flex items-center justify-between">
            <span>CATEGORIES</span>
            <span className="text-amber-300 font-mono font-bold">4</span>
          </div>

          {/* Option 1: BRAWLERS */}
          <button
            onClick={() => {
              sounds.playBump(0.6);
              setActiveTab('brawlers');
            }}
            className={`w-full p-2.5 sm:p-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2.5 sm:gap-3 border-2 ${
              activeTab === 'brawlers'
                ? 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white border-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.6)] scale-[1.02]'
                : 'bg-slate-900/70 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-base shadow ${
                activeTab === 'brawlers' ? 'bg-black/30' : 'bg-white/10'
              }`}
            >
              🥊
            </div>
            <div className="text-left">
              <span className="block leading-tight">Brawlers</span>
              <span className="text-[9px] text-cyan-200 font-bold hidden sm:block">5 Champions</span>
            </div>
          </button>

          {/* Option 2: SKINS */}
          <button
            onClick={() => {
              sounds.playBump(0.6);
              setActiveTab('skins');
            }}
            className={`w-full p-2.5 sm:p-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2.5 sm:gap-3 border-2 ${
              activeTab === 'skins'
                ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 border-yellow-200 shadow-[0_0_20px_rgba(250,204,21,0.6)] scale-[1.02]'
                : 'bg-slate-900/70 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-base shadow ${
                activeTab === 'skins' ? 'bg-black/30' : 'bg-white/10'
              }`}
            >
              👑
            </div>
            <div className="text-left">
              <span className="block leading-tight">Skins</span>
              <span className="text-[9px] font-bold text-amber-900 hidden sm:block">Vault & Mythics</span>
            </div>
          </button>

          {/* Option 3: GOLD */}
          <button
            onClick={() => {
              sounds.playBump(0.6);
              setActiveTab('gold');
            }}
            className={`w-full p-2.5 sm:p-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2.5 sm:gap-3 border-2 ${
              activeTab === 'gold'
                ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white border-yellow-200 shadow-[0_0_20px_rgba(245,158,11,0.6)] scale-[1.02]'
                : 'bg-slate-900/70 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-base shadow ${
                activeTab === 'gold' ? 'bg-black/30' : 'bg-white/10'
              }`}
            >
              🪙
            </div>
            <div className="text-left">
              <span className="block leading-tight">Gold</span>
              <span className="text-[9px] font-bold text-yellow-200 hidden sm:block">Free & Bundles</span>
            </div>
          </button>

          {/* Option 4: GEMS */}
          <button
            onClick={() => {
              sounds.playBump(0.6);
              setActiveTab('gems');
            }}
            className={`w-full p-2.5 sm:p-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2.5 sm:gap-3 border-2 ${
              activeTab === 'gems'
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white border-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.6)] scale-[1.02]'
                : 'bg-slate-900/70 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-base shadow ${
                activeTab === 'gems' ? 'bg-black/30' : 'bg-white/10'
              }`}
            >
              💎
            </div>
            <div className="text-left">
              <span className="block leading-tight">Gems</span>
              <span className="text-[9px] font-bold text-emerald-200 hidden sm:block">Diamonds & Packs</span>
            </div>
          </button>
        </div>

        {/* RIGHT MAIN VIEWPORT: SHOWS ONLY ITEMS OF THE SELECTED CATEGORY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 [scrollbar-width:thin] animate-in fade-in duration-150">
          <div className="max-w-5xl mx-auto">
            
            {/* ======================================================== */}
            {/* 1. BRAWLERS CATEGORY ONLY */}
            {/* ======================================================== */}
            {activeTab === 'brawlers' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 text-lg shadow">
                      🥊
                    </div>
                    <div>
                      <h2 className="text-base sm:text-xl font-black tracking-wider uppercase text-white drop-shadow">
                        Champion Brawlers Roster
                      </h2>
                      <p className="text-xs text-sky-200 font-semibold">
                        Unlock human champions directly with green diamonds or through the Trophy Road!
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-cyan-200 bg-cyan-500/20 px-3 py-1 rounded-full border border-cyan-400/30 hidden sm:block">
                    5 Champions Available
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {championShopData.map((champ) => {
                    const isOwned = unlockedChampions.includes(champ.id);
                    const info = CHAMPIONS[champ.id];

                    return (
                      <div
                        key={champ.id}
                        className="bg-slate-900/85 backdrop-blur-xl border-2 rounded-3xl p-5 flex flex-col justify-between shadow-2xl transition-all hover:scale-[1.01]"
                        style={{
                          borderColor: `${champ.color}50`,
                          boxShadow: `0 8px 30px rgba(0,0,0,0.5), inset 0 1px 3px rgba(255,255,255,0.15)`,
                        }}
                      >
                        <div>
                          {/* Champion Header Pill */}
                          <div className="flex items-center justify-between mb-3">
                            <span
                              className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border shadow-sm"
                              style={{
                                color: champ.color,
                                borderColor: `${champ.color}70`,
                                backgroundColor: `${champ.color}20`,
                              }}
                            >
                              {champ.badge}
                            </span>
                            <div className="text-xs font-mono font-black text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                              💎 {champ.cost}
                            </div>
                          </div>

                          {/* Hero Icon & Title */}
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl border-2 shadow-lg"
                              style={{
                                backgroundColor: `${champ.color}25`,
                                borderColor: champ.color,
                                color: '#ffffff',
                              }}
                            >
                              {info.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="text-lg font-black text-white leading-tight">{info.name}</h3>
                              <div className="text-xs font-bold text-sky-200">{champ.title}</div>
                            </div>
                          </div>

                          {/* Stat Bars */}
                          <div className="space-y-1.5 bg-black/40 p-3 rounded-2xl border border-white/10 mb-4">
                            <div className="flex justify-between items-center text-[10px] font-bold text-sky-200">
                              <span className="flex items-center gap-1">⚡ Speed</span>
                              <span className="font-mono text-cyan-300">{champ.speed}/5</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${(champ.speed / 5) * 100}%` }} />
                            </div>

                            <div className="flex justify-between items-center text-[10px] font-bold text-sky-200 pt-1">
                              <span className="flex items-center gap-1">💥 Power</span>
                              <span className="font-mono text-rose-300">{champ.power}/5</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-rose-400 rounded-full" style={{ width: `${(champ.power / 5) * 100}%` }} />
                            </div>

                            <div className="flex justify-between items-center text-[10px] font-bold text-sky-200 pt-1">
                              <span className="flex items-center gap-1">🛡️ Mass</span>
                              <span className="font-mono text-amber-300">{champ.weight}/5</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(champ.weight / 5) * 100}%` }} />
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mb-4">
                            {info.description}
                          </p>
                        </div>

                        {/* Action Unlock Button */}
                        <div>
                          {isOwned ? (
                            <div className="w-full py-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow">
                              <Check className="w-4 h-4 stroke-[3]" /> UNLOCKED & READY
                            </div>
                          ) : (
                            <button
                              onClick={() => handleDirectChampionUnlock(champ.id, champ.cost)}
                              className="w-full py-3 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-yellow-200 shadow-[0_4px_0_#b45309] active:translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                              <span>💎</span>
                              <span>UNLOCK FOR {champ.cost} GEMS</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 2. SKINS CATEGORY ONLY */}
            {/* ======================================================== */}
            {activeTab === 'skins' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 text-lg shadow">
                      👑
                    </div>
                    <div>
                      <h2 className="text-base sm:text-xl font-black tracking-wider uppercase text-white drop-shadow">
                        Champions & Skins Vault
                      </h2>
                      <p className="text-xs text-sky-200 font-semibold">
                        Mythic floating accessories, crowns, wings, and legendary armor!
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-200 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30 hidden sm:block">
                    {featuredVaultSkins.length} Custom Skins
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featuredVaultSkins.map((skin) => {
                    const isOwned = isSkinUnlocked(skin.id);

                    return (
                      <div
                        key={skin.id}
                        className={`bg-slate-900/85 backdrop-blur-xl border-2 rounded-3xl p-5 flex flex-col justify-between shadow-2xl relative transition-all hover:scale-[1.01] ${
                          skin.rarity === 'legendary'
                            ? 'border-amber-400/60 shadow-[0_8px_30px_rgba(250,204,21,0.25)]'
                            : skin.rarity === 'epic'
                            ? 'border-purple-400/50 shadow-[0_8px_30px_rgba(168,85,247,0.2)]'
                            : 'border-cyan-400/40'
                        }`}
                      >
                        <div>
                          {/* Rarity & Price Ribbon */}
                          <div className="flex items-center justify-between mb-3">
                            <span
                              className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                                skin.rarity === 'legendary'
                                  ? 'bg-amber-500/30 text-amber-300 border-amber-400'
                                  : skin.rarity === 'epic'
                                  ? 'bg-purple-500/30 text-purple-300 border-purple-400'
                                  : 'bg-cyan-500/30 text-cyan-300 border-cyan-400'
                              }`}
                            >
                              {skin.badge}
                            </span>
                            <div className="text-xs font-mono font-black text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                              💎 {skin.gemCost}
                            </div>
                          </div>

                          {/* Icon Box & Name */}
                          <div className="flex items-center gap-3 mb-2.5">
                            <div
                              className="w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-2xl shadow"
                              style={{
                                borderColor: skin.color,
                                backgroundColor: `${skin.color}25`,
                              }}
                            >
                              {skin.rarity === 'legendary' ? '👑' : skin.rarity === 'epic' ? '⚡' : '💎'}
                            </div>
                            <div>
                              <h3 className="text-base font-black text-white leading-tight">{skin.name}</h3>
                              <div className="text-[11px] text-cyan-300 font-bold drop-shadow-sm">{skin.tagline}</div>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-300 bg-black/40 p-2.5 rounded-xl border border-white/10 leading-relaxed mb-4">
                            {skin.description}
                          </p>
                        </div>

                        {/* Action Unlock Button */}
                        <div>
                          {isOwned ? (
                            <div className="w-full py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow">
                              <Check className="w-4 h-4 stroke-[3]" /> UNLOCKED IN LOCKER
                            </div>
                          ) : (
                            <button
                              onClick={() => handleDirectSkinUnlock(skin.id, skin.gemCost, skin.name)}
                              className={`w-full py-3 font-black text-xs uppercase tracking-wider rounded-2xl border-2 shadow active:translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                                skin.rarity === 'legendary'
                                  ? 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-slate-950 border-yellow-200 shadow-[0_4px_0_#b45309]'
                                  : 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white border-purple-200 shadow-[0_4px_0_#6b21a8]'
                              }`}
                            >
                              <span>💎</span>
                              <span>UNLOCK FOR {skin.gemCost} GEMS</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 3. GOLD CATEGORY ONLY */}
            {/* ======================================================== */}
            {activeTab === 'gold' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-yellow-500/20 border border-yellow-400 flex items-center justify-center text-yellow-300 text-lg shadow">
                      🪙
                    </div>
                    <div>
                      <h2 className="text-base sm:text-xl font-black tracking-wider uppercase text-white drop-shadow">
                        Gold Currency & Free Drops
                      </h2>
                      <p className="text-xs text-sky-200 font-semibold">
                        Claim free daily coin bundles or exchange your green diamonds for massive gold vaults!
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-yellow-200 bg-yellow-500/20 px-3 py-1 rounded-full border border-yellow-400/30 hidden sm:block">
                    🪙 {gold.toLocaleString()} Current Gold
                  </span>
                </div>

                {/* Free Gold Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Daily Free Gold */}
                  <div className="bg-slate-900/85 backdrop-blur-xl border-2 border-amber-400/50 rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
                          FREE DAILY SPONSOR
                        </span>
                        <span className="text-2xl">🪙</span>
                      </div>
                      <h3 className="text-lg font-black text-white">Gold Rush Stash</h3>
                      <p className="text-xs text-sky-200 font-semibold mb-3">
                        Watch a quick sponsor clip to claim a fresh injection of battle coins.
                      </p>
                      <div className="text-2xl font-black text-amber-300 font-mono mb-4">
                        +600 GOLD COINS
                      </div>
                    </div>

                    <button
                      onClick={handleClaimFreeGold}
                      disabled={adLoading}
                      className="w-full py-3 bg-gradient-to-b from-[#f59e0b] via-[#d97706] to-[#b45309] hover:from-[#fbbf24] text-white font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-amber-200 shadow-[0_4px_0_#78350f] active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Tv className="w-4 h-4" />
                      <span>{adLoading ? 'STREAMING...' : 'CLAIM FREE +600 GOLD'}</span>
                    </button>
                  </div>

                  {/* Mega Daily Crate */}
                  <div className="bg-slate-900/85 backdrop-blur-xl border-2 border-purple-400/50 rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/40">
                          DAILY MEGA DROP
                        </span>
                        <span className="text-2xl">🎁</span>
                      </div>
                      <h3 className="text-lg font-black text-white">Daily Mega Crate</h3>
                      <p className="text-xs text-sky-200 font-semibold mb-3">
                        Instant arena bounty packed with both gold coins and diamonds.
                      </p>
                      <div className="text-xl font-black text-purple-300 font-mono mb-4">
                        +400 🪙 GOLD & +150 💎 GEMS
                      </div>
                    </div>

                    <button
                      onClick={handleClaimMegaDailyCrate}
                      className="w-full py-3 bg-gradient-to-b from-[#a855f7] via-[#7c3aed] to-[#6d28d9] hover:from-[#c084fc] text-white font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-purple-200 shadow-[0_4px_0_#4c1d95] active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      <span>OPEN CRATE NOW</span>
                    </button>
                  </div>
                </div>

                {/* Instant Coin Exchange */}
                <div className="bg-slate-950/70 border-2 border-amber-400/30 rounded-3xl p-5 shadow-xl">
                  <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300 mb-3 flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>Gem-to-Gold Currency Exchange Counter</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between gap-3">
                      <div>
                        <span className="text-2xl block mb-1">💰</span>
                        <div className="text-sm font-black text-white">+1,000 Gold Coins</div>
                        <div className="text-[10px] text-sky-200">Basic coin bag</div>
                      </div>
                      <button
                        onClick={() => handleExchangeGemsForCoins(60, 1000)}
                        className="w-full py-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 text-slate-950 font-black text-xs uppercase rounded-xl border border-yellow-200 shadow active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>EXCHANGE</span>
                        <span className="font-mono bg-black/20 px-2 py-0.5 rounded-md text-slate-900">60 💎</span>
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-amber-400/40 flex flex-col justify-between gap-3 relative">
                      <span className="absolute top-2 right-2 bg-amber-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                        POPULAR
                      </span>
                      <div>
                        <span className="text-2xl block mb-1">💰💰</span>
                        <div className="text-sm font-black text-white">+3,500 Gold Coins</div>
                        <div className="text-[10px] text-amber-200">Most popular brawler pack</div>
                      </div>
                      <button
                        onClick={() => handleExchangeGemsForCoins(180, 3500)}
                        className="w-full py-2 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 text-slate-950 font-black text-xs uppercase rounded-xl border border-yellow-200 shadow active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>EXCHANGE</span>
                        <span className="font-mono bg-black/20 px-2 py-0.5 rounded-md text-slate-900">180 💎</span>
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-purple-400/40 flex flex-col justify-between gap-3">
                      <div>
                        <span className="text-2xl block mb-1">🏦</span>
                        <div className="text-sm font-black text-white">+10,000 Gold Coins</div>
                        <div className="text-[10px] text-purple-200">Colossal champion vault</div>
                      </div>
                      <button
                        onClick={() => handleExchangeGemsForCoins(450, 10000)}
                        className="w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 text-white font-black text-xs uppercase rounded-xl border border-purple-200 shadow active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>EXCHANGE</span>
                        <span className="font-mono bg-black/20 px-2 py-0.5 rounded-md text-white">450 💎</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 4. GEMS CATEGORY ONLY */}
            {/* ======================================================== */}
            {activeTab === 'gems' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 text-lg shadow">
                      💎
                    </div>
                    <div>
                      <h2 className="text-base sm:text-xl font-black tracking-wider uppercase text-white drop-shadow">
                        Gem Vault & Crystal Packs
                      </h2>
                      <p className="text-xs text-sky-200 font-semibold">
                        Get green diamonds to unlock mythic skins, custom champions, and instant gold vaults!
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-cyan-200 bg-cyan-500/20 px-3 py-1 rounded-full border border-cyan-400/30 hidden sm:block">
                    💎 {gems.toLocaleString()} Current Gems
                  </span>
                </div>

                {/* Free Sponsor Gem Drop */}
                <div className="bg-slate-900/85 backdrop-blur-xl border-2 border-cyan-400/60 rounded-3xl p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                        FREE DAILY SPONSOR
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-white">Free Gem Drop Stream</h3>
                    <p className="text-xs text-sky-200 font-semibold mt-0.5">
                      Watch a short sponsor video to claim a generous stash of green diamonds.
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-black text-cyan-300 font-mono">+250 💎</div>
                    <button
                      onClick={handleClaimFreeGems}
                      disabled={adLoading}
                      className="px-6 py-3 bg-gradient-to-b from-[#84cc16] via-[#65a30d] to-[#4d7c0f] hover:from-[#a3e635] text-white font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-lime-200 shadow-[0_4px_0_#365314] active:translate-y-1 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Tv className="w-4 h-4" />
                      <span>{adLoading ? 'STREAMING...' : 'CLAIM REWARD'}</span>
                    </button>
                  </div>
                </div>

                {/* Gem Stash Packs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-900/85 backdrop-blur-xl border-2 border-sky-400/40 rounded-3xl p-5 shadow-2xl flex flex-col justify-between text-center">
                    <div>
                      <span className="text-4xl block mb-2">💎</span>
                      <h3 className="text-base font-black text-white">Pouch of Gems</h3>
                      <div className="text-2xl font-black text-cyan-300 font-mono my-2">80 GEMS</div>
                      <p className="text-[11px] text-sky-200 mb-4">Quick top-up for minor unlocks.</p>
                    </div>
                    <button
                      onClick={() => handleBuyGemPack('Pouch of Gems', 80, '$0.99')}
                      className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 text-white font-black text-xs uppercase tracking-wider rounded-xl border border-white/20 active:scale-95 transition-all cursor-pointer"
                    >
                      $0.99 USD
                    </button>
                  </div>

                  <div className="bg-slate-900/85 backdrop-blur-xl border-2 border-amber-400 rounded-3xl p-5 shadow-2xl flex flex-col justify-between text-center relative overflow-hidden">
                    <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                      POPULAR
                    </div>
                    <div>
                      <span className="text-4xl block mb-2">💎💎</span>
                      <h3 className="text-base font-black text-white">Chest of Gems</h3>
                      <div className="text-2xl font-black text-amber-300 font-mono my-2">500 GEMS</div>
                      <p className="text-[11px] text-sky-200 mb-4">+15% Bonus Crystals included.</p>
                    </div>
                    <button
                      onClick={() => handleBuyGemPack('Chest of Gems', 500, '$4.99')}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl border border-white/30 active:scale-95 transition-all cursor-pointer"
                    >
                      $4.99 USD
                    </button>
                  </div>

                  <div className="bg-slate-900/85 backdrop-blur-xl border-2 border-purple-400/60 rounded-3xl p-5 shadow-2xl flex flex-col justify-between text-center relative">
                    <div className="absolute top-2 right-2 bg-purple-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                      BEST VALUE
                    </div>
                    <div>
                      <span className="text-4xl block mb-2">💎💎💎</span>
                      <h3 className="text-base font-black text-white">Mountain of Gems</h3>
                      <div className="text-2xl font-black text-purple-300 font-mono my-2">1,200 GEMS</div>
                      <p className="text-[11px] text-sky-200 mb-4">+30% Huge Value bonus.</p>
                    </div>
                    <button
                      onClick={() => handleBuyGemPack('Mountain of Gems', 1200, '$9.99')}
                      className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 text-white font-black text-xs uppercase tracking-wider rounded-xl border border-white/20 active:scale-95 transition-all cursor-pointer"
                    >
                      $9.99 USD
                    </button>
                  </div>

                  <div className="bg-slate-900/85 backdrop-blur-xl border-2 border-rose-400/60 rounded-3xl p-5 shadow-2xl flex flex-col justify-between text-center relative">
                    <div className="absolute top-2 right-2 bg-rose-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                      MYTHIC
                    </div>
                    <div>
                      <span className="text-4xl block mb-2">💎👑</span>
                      <h3 className="text-base font-black text-white">Titan's Trove</h3>
                      <div className="text-2xl font-black text-rose-300 font-mono my-2">2,500 GEMS</div>
                      <p className="text-[11px] text-sky-200 mb-4">Ultimate vault for all skins.</p>
                    </div>
                    <button
                      onClick={() => handleBuyGemPack("Titan's Trove", 2500, '$19.99')}
                      className="w-full py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 text-white font-black text-xs uppercase tracking-wider rounded-xl border border-white/20 active:scale-95 transition-all cursor-pointer"
                    >
                      $19.99 USD
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
