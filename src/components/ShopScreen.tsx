import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Tv,
  Check,
  Coins,
  Clock,
  Zap,
  Crown,
  Diamond,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../audio/soundManager';
import { crazyGames } from '../game/crazyGamesSdk';
import { CHAMPIONS, type ChampionId } from '../game/championModels';
import {
  ALL_SKINS,
  isSkinUnlocked,
  unlockSkin,
  type ChampionSkin,
  setEquippedSkin,
} from '../game/championSkins';
import { MegaBoxGraphic } from './MegaBoxGraphic';
import { BoxOpeningModal, type BoxReward } from './BoxOpeningModal';
import { getSkinPortrait } from '../game/skinThumbnails';

export type ShopCategory = 'brawlers' | 'skins' | 'gold' | 'gems';

interface ShopScreenProps {
  gold: number;
  gems: number;
  trophies: number;
  setGold: React.Dispatch<React.SetStateAction<number>>;
  setGems: React.Dispatch<React.SetStateAction<number>>;
  unlockedChampions: ChampionId[];
  onUnlockChampion: (id: ChampionId, gemCost: number) => void;
  onBackToHome?: () => void;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({
  gold,
  gems,
  trophies,
  setGold,
  setGems,
  unlockedChampions,
  onUnlockChampion,
}) => {
  const [activeTab, setActiveTab] = useState<ShopCategory>('gold');
  const [adLoading, setAdLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Daily Box Cooldown State (1 / Day)
  const [normalBoxTimeLeft, setNormalBoxTimeLeft] = useState<string | null>(null);
  const [isNormalBoxReady, setIsNormalBoxReady] = useState<boolean>(true);
  const [isOpeningNormal, setIsOpeningNormal] = useState<boolean>(false);
  const [isOpeningMega, setIsOpeningMega] = useState<boolean>(false);

  // Brawl Stars Step-by-Step Box Opening Reward State
  const [boxReward, setBoxReward] = useState<BoxReward | null>(null);

  // Check Daily Normal Box Cooldown
  const checkDailyBoxCooldown = () => {
    try {
      const lastOpened = localStorage.getItem('ringout_daily_box_last_opened');
      if (lastOpened) {
        const elapsed = Date.now() - parseInt(lastOpened, 10);
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
        if (elapsed < TWENTY_FOUR_HOURS) {
          const remaining = TWENTY_FOUR_HOURS - elapsed;
          const hours = Math.floor(remaining / (3600 * 1000));
          const minutes = Math.floor((remaining % (3600 * 1000)) / (60 * 1000));
          const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
          setNormalBoxTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
          setIsNormalBoxReady(false);
          return;
        }
      }
    } catch {}
    setIsNormalBoxReady(true);
    setNormalBoxTimeLeft(null);
  };

  useEffect(() => {
    checkDailyBoxCooldown();
    const timer = setInterval(checkDailyBoxCooldown, 1000);
    return () => clearInterval(timer);
  }, []);

  const triggerCelebration = () => {
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.55 },
      colors: ['#38bdf8', '#facc15', '#a855f7', '#22c55e', '#ec4899'],
    });
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

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

  // 1. OPEN NORMAL BOX (Free Daily Ad -> Rare/Epic Skin -> 50% Gems on Duplicate)
  const handleOpenNormalBox = () => {
    if (!isNormalBoxReady) {
      sounds.playBump(0.6);
      showToast(`Normal Box cooling down! Opens in: ${normalBoxTimeLeft}`);
      return;
    }

    sounds.playBump(0.7);
    setAdLoading(true);
    showToast('Loading sponsor ad to unlock Daily Normal Box...');

    crazyGames.requestRewardedAd({
      onStart: () => sounds.playBump(0.5),
      onReward: () => {
        setIsOpeningNormal(true);
        sounds.playFight?.();

        setTimeout(() => {
          setIsOpeningNormal(false);

          try {
            localStorage.setItem('ringout_daily_box_last_opened', Date.now().toString());
          } catch {}
          checkDailyBoxCooldown();

          // Pool of Rare and Epic skins
          const skinPool = Object.values(ALL_SKINS).filter(
            (s) => s.rarity === 'rare' || s.rarity === 'epic'
          );
          const pickedSkin = skinPool[Math.floor(Math.random() * skinPool.length)];
          const isDuplicate = isSkinUnlocked(pickedSkin.id);

          handleAddGold(300);
          const baseDailyGems = 35;
          handleAddGems(baseDailyGems);

          if (isDuplicate) {
            const gemRefund = Math.floor(pickedSkin.gemCost / 2);
            handleAddGems(gemRefund);
            setBoxReward({
              boxTitle: 'DAILY BRAWL BOX',
              isMegaBox: false,
              skin: pickedSkin,
              isDuplicate: true,
              duplicateGemRefund: gemRefund,
              coins: 300,
              gems: baseDailyGems + gemRefund,
            });
            showToast(`Duplicate skin converted to +${gemRefund} 💎 Gems!`);
          } else {
            unlockSkin(pickedSkin.id);
            setBoxReward({
              boxTitle: 'DAILY BRAWL BOX',
              isMegaBox: false,
              skin: pickedSkin,
              isDuplicate: false,
              coins: 300,
              gems: baseDailyGems,
            });
            showToast(`🎉 UNLOCKED NEW SKIN: ${pickedSkin.name}!`);
          }
        }, 1000);
      },
      onFinish: () => setAdLoading(false),
      onError: () => {
        setAdLoading(false);
        showToast('Granted bonus without ad!');
        setIsOpeningNormal(false);
      },
    });
  };

  // 2. OPEN MEGA BOX (High Chance of Rare/Epic AND Chance to have LEGENDARY skin too!)
  const handleOpenMegaBox = (costGems: number) => {
    if (gems < costGems) {
      sounds.playBump(0.8);
      showToast(`Need ${costGems} Gems to open Mega Box!`);
      return;
    }

    sounds.playBump(0.7);
    // Deduct gems
    setGems((prev) => {
      const next = prev - costGems;
      try {
        localStorage.setItem('ringout_gems', String(next));
      } catch {}
      return next;
    });

    setIsOpeningMega(true);
    sounds.playFight?.();

    setTimeout(() => {
      setIsOpeningMega(false);

      // 25% Chance for LEGENDARY skin, 75% for Rare/Epic skin!
      const roll = Math.random();
      let pickedSkin: ChampionSkin;

      if (roll < 0.25) {
        // Legendary Skin Pool!
        const legendarySkins = Object.values(ALL_SKINS).filter((s) => s.rarity === 'legendary');
        pickedSkin = legendarySkins[Math.floor(Math.random() * legendarySkins.length)];
      } else {
        // Rare / Epic Skin Pool
        const rareEpicSkins = Object.values(ALL_SKINS).filter(
          (s) => s.rarity === 'rare' || s.rarity === 'epic'
        );
        pickedSkin = rareEpicSkins[Math.floor(Math.random() * rareEpicSkins.length)];
      }

      const isDuplicate = isSkinUnlocked(pickedSkin.id);
      const bonusCoins = 1000;
      const bonusGems = 100;
      handleAddGold(bonusCoins);
      handleAddGems(bonusGems);

      if (isDuplicate) {
        const gemRefund = Math.floor(pickedSkin.gemCost / 2);
        handleAddGems(gemRefund);
        setBoxReward({
          boxTitle: 'ULTIMATE MEGA BOX',
          isMegaBox: true,
          skin: pickedSkin,
          isDuplicate: true,
          duplicateGemRefund: gemRefund,
          coins: bonusCoins,
          gems: bonusGems + gemRefund,
        });
        showToast(`Duplicate ${pickedSkin.name} converted to +${gemRefund} 💎 Gems!`);
      } else {
        unlockSkin(pickedSkin.id);
        setBoxReward({
          boxTitle: 'ULTIMATE MEGA BOX',
          isMegaBox: true,
          skin: pickedSkin,
          isDuplicate: false,
          coins: bonusCoins,
          gems: bonusGems,
        });
        showToast(`👑 UNLOCKED ${pickedSkin.rarity.toUpperCase()} SKIN: ${pickedSkin.name}!`);
      }
    }, 1200);
  };

  // 3. FREE REWARDS & ADS
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
        showToast('Granted fallback bonus (+100 Gems)!');
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

  // 4. GEM VAULT PURCHASES
  const handleBuyGemPack = (packName: string, amount: number, price: string) => {
    sounds.playBump(0.6);
    showToast(`Purchased ${packName} (${price})! (+${amount} Gems 💎)`);
    handleAddGems(amount);
    triggerCelebration();
    sounds.playVictory();
  };

  // 5. CURRENCY EXCHANGE (GEMS -> GOLD)
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
    showToast(`Exchanged ${gemCost} 💎 for +${coinsGained.toLocaleString()} 🪙 Coins!`);
  };

  // 6. BRAWLERS DIRECT GEM UNLOCK
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

  // 7. SKINS VAULT (12 Highlighted Skins with fixed keys)
  const featuredVaultSkins = [
    {
      skin: ALL_SKINS['leo_poseidon'],
      accessoryHighlight: '🔱 Floating Gold Sea Crown & Orbiting Pearls',
      avatarColor: 'from-amber-400 via-sky-500 to-blue-700',
      avatarEmoji: '👑',
      classTitle: 'COASTAL SOVEREIGN',
    },
    {
      skin: ALL_SKINS['kai_quantum'],
      accessoryHighlight: '⚡ Twin Hard-Light Tachyon Wings & Pulse Halo',
      avatarColor: 'from-cyan-400 via-sky-500 to-indigo-600',
      avatarEmoji: '⚡',
      classTitle: 'HARDLIGHT OVERDRIVE',
    },
    {
      skin: ALL_SKINS['nova_solar_eclipse'],
      accessoryHighlight: '☀️ Twin Solar Corona Wings & Sunburst Halo',
      avatarColor: 'from-amber-400 via-rose-500 to-orange-600',
      avatarEmoji: '☀️',
      classTitle: 'CORONAL DEITY',
    },
    {
      skin: ALL_SKINS['titan_magma_titan'],
      accessoryHighlight: '🌋 Molten Core Fissure & Orbiting Basalt Rocks',
      avatarColor: 'from-red-600 via-orange-600 to-amber-700',
      avatarEmoji: '🌋',
      classTitle: 'PRIMORDIAL TITAN',
    },
    {
      skin: ALL_SKINS['kage_void_phantom'],
      accessoryHighlight: '🗡️ 6 Floating Obsidian Blade Wings & Void Nimbus',
      avatarColor: 'from-purple-600 via-violet-800 to-slate-950',
      avatarEmoji: '🗡️',
      classTitle: 'SINGULARITY SHINOBI',
    },
    {
      skin: ALL_SKINS['bolt_raijin'],
      accessoryHighlight: '🥁 5-Drum Taiko Arch & Storm Cloud Crown',
      avatarColor: 'from-yellow-400 via-amber-500 to-slate-900',
      avatarEmoji: '🥁',
      classTitle: 'THUNDER DEITY',
    },
    {
      skin: ALL_SKINS['kage_demon_oni'],
      accessoryHighlight: '👹 Carved Blood Oni Mask & Braided Rope Belt',
      avatarColor: 'from-rose-600 to-red-950',
      avatarEmoji: '👹',
      classTitle: 'BLOOD ONI',
    },
    {
      skin: ALL_SKINS['titan_gladiator'],
      accessoryHighlight: '🪖 Bronze Helmet with Sweeping Horsehair Plume',
      avatarColor: 'from-amber-600 to-yellow-800',
      avatarEmoji: '🪖',
      classTitle: 'ROMAN COLOSSEUM',
    },
    {
      skin: ALL_SKINS['leo_cyber'],
      accessoryHighlight: '🥽 Cyan HUD Visor & Carbon Knuckle Boosters',
      avatarColor: 'from-cyan-400 to-blue-700',
      avatarEmoji: '🥽',
      classTitle: 'EDGE RUNNER',
    },
    {
      skin: ALL_SKINS['bolt_cyber_racer'],
      accessoryHighlight: '🚀 Aerodynamic Shoulder Cowls & Turbo Heel Jets',
      avatarColor: 'from-sky-400 to-indigo-600',
      avatarEmoji: '🚀',
      classTitle: 'SUPERSONIC JET',
    },
    {
      skin: ALL_SKINS['leo_sunset'],
      accessoryHighlight: '🤿 Coral Fabrics with Marine Turquoise Trims',
      avatarColor: 'from-orange-400 to-teal-600',
      avatarEmoji: '🤿',
      classTitle: 'REEF DIVER',
    },
    {
      skin: ALL_SKINS['titan_yeti'], // Correct skin key!
      accessoryHighlight: '❄️ Alpine White Fur Mantle & Frosted Rune Plates',
      avatarColor: 'from-sky-200 to-blue-600',
      avatarEmoji: '❄️',
      classTitle: 'ALPINE BERSERKER',
    },
  ].filter((item) => item.skin !== undefined);

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
    showToast(`Unlocked ${skinName} in Locker! 🎉`);
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#075985] flex flex-col overflow-hidden select-none animate-in fade-in duration-200 pb-20">
      
      {/* BACKGROUND VIBRANT BRAWL STARS STAGE */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#0284c7_0%,#0369a1_50%,#075985_85%,#082f49_100%)]" />
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 2px, transparent 3px),
                              radial-gradient(circle at 80% 25%, rgba(255,255,255,0.4) 3px, transparent 4px)`,
            backgroundSize: '140px 140px',
          }}
        />
      </div>

      {/* 1. TOP HEADER HUD (Currencies & Title - No redundant Home button!) */}
      <div className="relative z-30 px-4 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between border-b border-white/15 bg-slate-950/45 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-2 px-6 sm:px-8 py-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 border-2 border-yellow-200 rounded-2xl shadow-xl">
          <Sparkles className="w-4 h-4 text-yellow-200" />
          <h1 className="text-sm sm:text-base font-black tracking-widest uppercase text-white drop-shadow">
            BRAWL SHOP
          </h1>
        </div>

        {/* Currency Counters */}
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/20 shadow-inner">
          <div className="flex items-center gap-1 font-mono font-bold text-xs text-amber-300">
            <span>🏆</span>
            <span>{trophies.toLocaleString()}</span>
          </div>
          <div className="w-px h-3.5 bg-white/20" />
          <div className="flex items-center gap-1 font-mono font-bold text-xs text-cyan-300">
            <span>💎</span>
            <span>{gems.toLocaleString()}</span>
          </div>
          <div className="w-px h-3.5 bg-white/20" />
          <div className="flex items-center gap-1 font-mono font-bold text-xs text-amber-300">
            <span>🪙</span>
            <span>{gold.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-6 py-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 border-2 border-white text-white font-black text-xs uppercase tracking-wider shadow-2xl animate-in slide-in-from-top-4 duration-150">
          {notification}
        </div>
      )}

      {/* 2. BODY CONTAINER: LEFT VERTICAL SIDEBAR + RIGHT EXCLUSIVE VIEWPORT */}
      <div className="relative z-20 flex-1 flex overflow-hidden">
        
        {/* LEFT VERTICAL CATEGORY SIDEBAR */}
        <div className="w-36 sm:w-52 p-2.5 sm:p-4 bg-slate-950/65 backdrop-blur-xl border-r border-white/15 flex flex-col gap-2.5 z-20 flex-shrink-0 shadow-2xl overflow-y-auto">
          <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-sky-300 px-2 py-1 mb-1 border-b border-white/10 flex items-center justify-between">
            <span>CATEGORIES</span>
            <span className="font-mono bg-sky-500/20 px-1.5 py-0.2 rounded text-[10px]">4</span>
          </div>

          <button
            onClick={() => {
              sounds.playBump(0.6);
              setActiveTab('gold');
            }}
            className={`w-full p-2.5 sm:p-3 rounded-2xl border-2 flex items-center gap-2.5 sm:gap-3 transition-all cursor-pointer text-left ${
              activeTab === 'gold'
                ? 'bg-gradient-to-r from-yellow-500 to-amber-600 border-white text-slate-950 shadow-[0_4px_15px_rgba(245,158,11,0.5)] scale-102 font-black'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-black/40 flex items-center justify-center text-base">
              🪙
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black uppercase">Boxes & Gold</div>
              <div className="text-[9px] text-amber-900 font-bold hidden sm:block">Normal & Mega Box</div>
            </div>
          </button>

          <button
            onClick={() => {
              sounds.playBump(0.6);
              setActiveTab('skins');
            }}
            className={`w-full p-2.5 sm:p-3 rounded-2xl border-2 flex items-center gap-2.5 sm:gap-3 transition-all cursor-pointer text-left ${
              activeTab === 'skins'
                ? 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 border-white text-slate-950 shadow-[0_4px_15px_rgba(250,204,21,0.5)] scale-102 font-black'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-black/40 flex items-center justify-center text-base">
              👑
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black uppercase">Skins</div>
              <div className="text-[9px] text-amber-900 font-bold hidden sm:block">Visual Previews</div>
            </div>
          </button>

          <button
            onClick={() => {
              sounds.playBump(0.6);
              setActiveTab('brawlers');
            }}
            className={`w-full p-2.5 sm:p-3 rounded-2xl border-2 flex items-center gap-2.5 sm:gap-3 transition-all cursor-pointer text-left ${
              activeTab === 'brawlers'
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 border-white text-white shadow-[0_4px_15px_rgba(244,63,94,0.5)] scale-102 font-black'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-black/40 flex items-center justify-center text-base">
              🥊
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black uppercase">Brawlers</div>
              <div className="text-[9px] text-pink-200 font-semibold hidden sm:block">5 Champions</div>
            </div>
          </button>

          <button
            onClick={() => {
              sounds.playBump(0.6);
              setActiveTab('gems');
            }}
            className={`w-full p-2.5 sm:p-3 rounded-2xl border-2 flex items-center gap-2.5 sm:gap-3 transition-all cursor-pointer text-left ${
              activeTab === 'gems'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-600 border-white text-white shadow-[0_4px_15px_rgba(6,182,212,0.5)] scale-102 font-black'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-black/40 flex items-center justify-center text-base">
              💎
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black uppercase">Gems</div>
              <div className="text-[9px] text-cyan-200 font-semibold hidden sm:block">Diamonds & Packs</div>
            </div>
          </button>
        </div>

        {/* RIGHT EXCLUSIVE CATEGORY VIEWPORT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 [scrollbar-width:thin]">
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* ======================================================== */}
            {/* 1. BOXES & GOLD CATEGORY (NORMAL BOX + MEGA BOX WITH LEGENDARY CHANCE!) */}
            {/* ======================================================== */}
            {activeTab === 'gold' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-yellow-500/20 border border-yellow-400 flex items-center justify-center text-yellow-300 text-lg shadow">
                      🪙
                    </div>
                    <div>
                      <h2 className="text-base sm:text-xl font-black tracking-wider uppercase text-white drop-shadow">
                        Brawl Boxes & Gold Vaults
                      </h2>
                      <p className="text-xs text-sky-200 font-semibold">
                        Daily Normal Box and Ultimate Mega Box with Legendary Skin chances!
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-yellow-200 bg-yellow-500/20 px-3 py-1 rounded-full border border-yellow-400/30 hidden sm:block">
                    🪙 {gold.toLocaleString()} Current Gold
                  </span>
                </div>

                {/* TWO REAL BOXES IN SHOP: 1. NORMAL BOX + 2. MEGA BOX (WITH LEGENDARY CHANCE!) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  
                  {/* BOX 1: NORMAL BOX (DAILY WATCH AD) */}
                  <div className="bg-gradient-to-b from-slate-900 via-blue-950/70 to-slate-900 border-2 border-sky-400/60 rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/40">
                          DAILY BRAWL BOX
                        </span>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                          1 PER DAY
                        </span>
                      </div>

                      <div className="h-40 flex items-center justify-center my-2">
                        {/* Normal Blue Brawl Box */}
                        <div className={`transition-transform ${isOpeningNormal ? 'animate-bounce scale-110' : ''}`}>
                          <div className="w-28 h-24 rounded-3xl bg-gradient-to-b from-sky-400 via-blue-600 to-indigo-800 border-4 border-yellow-300 shadow-[0_12px_30px_rgba(2,132,199,0.5)] flex items-center justify-center text-4xl">
                            📦
                          </div>
                        </div>
                      </div>

                      <h3 className="text-lg font-black text-white text-center">Standard Brawl Box</h3>
                      <p className="text-xs text-sky-200 text-center mb-2">
                        Contains Gold Coins and a guaranteed Rare or Epic skin!
                      </p>
                      <div className="text-[10px] text-amber-300 bg-black/40 p-2 rounded-xl text-center border border-white/10 mb-4">
                        Duplicate skins converted into <span className="font-black">50% Gems</span>!
                      </div>
                    </div>

                    <div>
                      {isNormalBoxReady ? (
                        <button
                          onClick={handleOpenNormalBox}
                          disabled={adLoading || isOpeningNormal}
                          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 text-white font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-emerald-200 shadow-[0_4px_0_#065f46] active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Tv className="w-4 h-4" />
                          <span>{adLoading ? 'STREAMING...' : isOpeningNormal ? 'OPENING...' : 'WATCH AD TO OPEN (1/DAY)'}</span>
                        </button>
                      ) : (
                        <div className="w-full py-3 rounded-2xl bg-slate-800/80 border border-slate-600 text-slate-300 font-bold text-xs flex items-center justify-center gap-2">
                          <Clock className="w-4 h-4 text-amber-300" />
                          <span>OPENS IN: <span className="font-mono text-amber-300 font-black">{normalBoxTimeLeft}</span></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* BOX 2: MEGA BOX (WITH CHANCE OF LEGENDARY SKIN!) */}
                  <div className="bg-gradient-to-b from-slate-900 via-purple-950/70 to-slate-900 border-3 border-amber-400 rounded-3xl p-5 shadow-[0_15px_40px_rgba(245,158,11,0.3)] flex flex-col justify-between relative overflow-hidden">
                    <span className="absolute top-3 right-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow">
                      👑 LEGENDARY CHANCE
                    </span>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
                          PREMIUM MEGA BOX
                        </span>
                      </div>

                      <div className="h-40 flex items-center justify-center my-2">
                        <MegaBoxGraphic size={135} isOpening={isOpeningMega} />
                      </div>

                      <h3 className="text-lg font-black text-white text-center">Ultimate Mega Box</h3>
                      <p className="text-xs text-sky-200 text-center mb-2">
                        Massive bounty with a chance to draw <span className="text-amber-300 font-black">LEGENDARY MYTHIC SKINS</span>!
                      </p>
                      <div className="text-[10px] text-amber-300 bg-black/40 p-2 rounded-xl text-center border border-white/10 mb-4">
                        +1,000 🪙 Coins + 100 💎 Gems + 25% Legendary Skin Chance!
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenMegaBox(250)}
                      disabled={isOpeningMega}
                      className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 hover:from-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-yellow-200 shadow-[0_4px_0_#b45309,0_8px_20px_rgba(245,158,11,0.4)] active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{isOpeningMega ? 'OPENING MEGA BOX...' : 'OPEN MEGA BOX (250 💎 GEMS)'}</span>
                    </button>
                  </div>
                </div>

                {/* Free Daily Gold & Gem Exchanges */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="bg-slate-900/85 backdrop-blur-xl border-2 border-purple-400/50 rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/40">
                          INSTANT BOUNTY
                        </span>
                        <span className="text-2xl">🎁</span>
                      </div>
                      <h3 className="text-lg font-black text-white">Starter Bounty Pack</h3>
                      <p className="text-xs text-sky-200 font-semibold mb-3">
                        Instant arena bounty packed with battle coins and green diamonds.
                      </p>
                      <div className="text-xl font-black text-purple-300 font-mono mb-4">
                        +400 🪙 GOLD & +150 💎 GEMS
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        sounds.playVictory();
                        triggerCelebration();
                        handleAddGems(150);
                        handleAddGold(400);
                        showToast('Claimed Starter Bounty Pack (+150 💎, +400 🪙)!');
                      }}
                      className="w-full py-3 bg-gradient-to-b from-[#a855f7] via-[#7c3aed] to-[#6d28d9] hover:from-[#c084fc] text-white font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-purple-200 shadow-[0_4px_0_#4c1d95] active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      <span>CLAIM BOUNTY NOW</span>
                    </button>
                  </div>
                </div>

                {/* Gem-to-Gold Currency Exchange Counter */}
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
                        <div className="text-[10px] text-amber-200">+15% Bonus Coins</div>
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
                        <div className="text-[10px] text-purple-200">+35% Colossal Value</div>
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
            {/* 2. SKINS CATEGORY: RICH VISUAL CARDS (NO PLAIN TEXT!) */}
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
                        Visual previews with signature accessories, wings, halos, and armor!
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-200 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30 hidden sm:block">
                    {featuredVaultSkins.length} Custom Skins
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featuredVaultSkins.map(({ skin, accessoryHighlight, avatarColor, classTitle }) => {
                    const isOwned = isSkinUnlocked(skin.id);

                    return (
                      <div
                        key={skin.id}
                        className={`bg-slate-900/90 backdrop-blur-xl border-3 rounded-3xl p-5 flex flex-col justify-between shadow-2xl relative transition-all hover:scale-[1.01] ${
                          skin.rarity === 'legendary'
                            ? 'border-amber-400 shadow-[0_10px_30px_rgba(250,204,21,0.3)]'
                            : skin.rarity === 'epic'
                            ? 'border-purple-400 shadow-[0_10px_30px_rgba(168,85,247,0.25)]'
                            : 'border-cyan-400 shadow-[0_10px_25px_rgba(6,182,212,0.2)]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span
                              className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border shadow-md flex items-center gap-1.5 ${
                                skin.rarity === 'legendary'
                                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 border-yellow-200'
                                  : skin.rarity === 'epic'
                                  ? 'bg-gradient-to-r from-purple-500 to-rose-500 text-white border-purple-200'
                                  : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white border-cyan-200'
                              }`}
                            >
                              {skin.rarity === 'legendary' && <Crown className="w-3.5 h-3.5" />}
                              {skin.rarity === 'epic' && <Zap className="w-3.5 h-3.5" />}
                              {skin.rarity === 'rare' && <Diamond className="w-3.5 h-3.5" />}
                              <span>{skin.rarity.toUpperCase()}</span>
                            </span>

                            <div className="text-xs font-mono font-black text-amber-300 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                              💎 {skin.gemCost}
                            </div>
                          </div>

                          <div
                            className={`relative h-32 rounded-2xl bg-gradient-to-br ${avatarColor} p-3 mb-3 flex items-center justify-between overflow-hidden shadow-inner border border-white/20`}
                          >
                            <div className="relative z-10 flex items-center gap-3">
                              {/* Real 3D Skin Portrait Picture */}
                              <div className="w-20 h-20 rounded-2xl bg-black/50 border-2 border-white/40 overflow-hidden flex items-center justify-center shadow-xl backdrop-blur-sm flex-shrink-0">
                                <img
                                  src={getSkinPortrait(skin.championId, skin.id)}
                                  alt={skin.name}
                                  className="w-full h-full object-cover scale-110 drop-shadow"
                                />
                              </div>
                              <div>
                                <div className="text-[10px] font-black uppercase tracking-wider text-white/80">
                                  {classTitle}
                                </div>
                                <div className="text-base font-black text-white drop-shadow leading-tight">
                                  {skin.name}
                                </div>
                                <div className="text-xs font-bold text-amber-300 mt-0.5">
                                  {skin.tagline}
                                </div>
                              </div>
                            </div>
                            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/15 blur-xl pointer-events-none" />
                          </div>

                          <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-[11px] font-bold text-amber-300 mb-2.5 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-yellow-300 flex-shrink-0" />
                            <span className="truncate">{accessoryHighlight}</span>
                          </div>

                          <p className="text-[11px] text-slate-300 leading-relaxed mb-4">
                            {skin.description}
                          </p>
                        </div>

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
                                  : skin.rarity === 'epic'
                                  ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white border-purple-200 shadow-[0_4px_0_#6b21a8]'
                                  : 'bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-white border-cyan-200 shadow-[0_4px_0_#0369a1]'
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
            {/* 3. BRAWLERS CATEGORY ONLY */}
            {/* ======================================================== */}
            {activeTab === 'brawlers' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-400 flex items-center justify-center text-rose-400 text-lg shadow">
                      🥊
                    </div>
                    <div>
                      <h2 className="text-base sm:text-xl font-black tracking-wider uppercase text-white drop-shadow">
                        Champion Brawlers Roster
                      </h2>
                      <p className="text-xs text-sky-200 font-semibold">
                        Unlock champions directly with green diamonds or through the Trophy Road!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {championShopData.map((c) => {
                    const isUnlocked = unlockedChampions.includes(c.id);
                    const champion = CHAMPIONS[c.id];

                    return (
                      <div
                        key={c.id}
                        className="bg-slate-900/85 backdrop-blur-xl border-2 border-white/15 rounded-3xl p-5 flex flex-col justify-between shadow-2xl relative transition-all hover:scale-[1.01]"
                        style={{ borderColor: `${c.color}60` }}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span
                              className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border shadow-sm"
                              style={{
                                backgroundColor: `${c.color}25`,
                                borderColor: c.color,
                                color: c.color,
                              }}
                            >
                              {c.badge}
                            </span>
                            <div className="text-xs font-mono font-black text-cyan-300 bg-cyan-400/20 px-2 py-0.5 rounded-full border border-cyan-400/30">
                              💎 {c.cost}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mb-2.5">
                            {/* Real 3D Brawler Portrait */}
                            <div
                              className="w-16 h-16 rounded-2xl border-2 overflow-hidden flex items-center justify-center shadow-lg bg-black/60 flex-shrink-0"
                              style={{ borderColor: c.color }}
                            >
                              <img
                                src={getSkinPortrait(c.id)}
                                alt={champion.name}
                                className="w-full h-full object-cover scale-110 drop-shadow"
                              />
                            </div>
                            <div>
                              <h3 className="text-lg font-black text-white leading-tight">{champion.name}</h3>
                              <div className="text-xs text-sky-200 font-bold">{c.title}</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-1.5 bg-black/40 p-2 rounded-xl border border-white/10 mb-3 text-center">
                            <div>
                              <div className="text-[9px] text-slate-400 uppercase font-bold">⚡ Speed</div>
                              <div className="text-xs font-black text-white">{c.speed}/5</div>
                            </div>
                            <div>
                              <div className="text-[9px] text-slate-400 uppercase font-bold">💥 Power</div>
                              <div className="text-xs font-black text-white">{c.power}/5</div>
                            </div>
                            <div>
                              <div className="text-[9px] text-slate-400 uppercase font-bold">🛡️ Mass</div>
                              <div className="text-xs font-black text-white">{c.weight}/5</div>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-300 leading-relaxed mb-4">
                            {champion.description}
                          </p>
                        </div>

                        <div>
                          {isUnlocked ? (
                            <div className="w-full py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow">
                              <Check className="w-4 h-4 stroke-[3]" /> UNLOCKED & READY
                            </div>
                          ) : (
                            <button
                              onClick={() => handleDirectChampionUnlock(c.id, c.cost)}
                              className="w-full py-3 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 text-white font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-cyan-200 shadow-[0_4px_0_#0369a1] active:translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                              <span>💎</span>
                              <span>UNLOCK FOR {c.cost} GEMS</span>
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
            {/* 4. GEMS CATEGORY */}
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

                <div className="bg-gradient-to-r from-cyan-950/80 via-blue-950/80 to-slate-900/80 border-2 border-cyan-400/60 rounded-3xl p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-3xl shadow">
                      💎
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                        FREE DAILY SPONSOR
                      </span>
                      <h3 className="text-lg font-black text-white mt-1">Free Gem Drop Stream</h3>
                      <p className="text-xs text-sky-200 font-semibold">
                        Watch a short sponsor video to claim a generous stash of green diamonds.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleClaimFreeGems}
                    disabled={adLoading}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 text-white font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-emerald-200 shadow-[0_4px_0_#065f46] active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <Tv className="w-4 h-4" />
                    <span>{adLoading ? 'STREAMING...' : 'CLAIM FREE +250 💎'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-900/85 backdrop-blur-xl border border-white/15 rounded-3xl p-4 flex flex-col justify-between shadow-xl">
                    <div>
                      <div className="text-3xl mb-2">💎</div>
                      <h3 className="text-base font-black text-white">Pouch of Gems</h3>
                      <div className="text-xl font-black text-cyan-300 font-mono my-1">80 GEMS</div>
                      <p className="text-[11px] text-sky-200 leading-tight mb-4">
                        Quick top-up for minor unlocks.
                      </p>
                    </div>
                    <button
                      onClick={() => handleBuyGemPack('Pouch of Gems', 80, '$0.99')}
                      className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-black text-xs uppercase rounded-xl border border-cyan-200 shadow active:scale-95 transition-all cursor-pointer"
                    >
                      $0.99 USD
                    </button>
                  </div>

                  <div className="bg-slate-900/85 backdrop-blur-xl border-2 border-cyan-400/50 rounded-3xl p-4 flex flex-col justify-between shadow-xl relative">
                    <span className="absolute top-2 right-2 bg-cyan-400 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                      POPULAR
                    </span>
                    <div>
                      <div className="text-3xl mb-2">💎💎</div>
                      <h3 className="text-base font-black text-white">Chest of Gems</h3>
                      <div className="text-xl font-black text-cyan-300 font-mono my-1">500 GEMS</div>
                      <p className="text-[11px] text-sky-200 leading-tight mb-4">
                        +15% Bonus Crystals included.
                      </p>
                    </div>
                    <button
                      onClick={() => handleBuyGemPack('Chest of Gems', 500, '$4.99')}
                      className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 text-slate-950 font-black text-xs uppercase rounded-xl border border-cyan-200 shadow active:scale-95 transition-all cursor-pointer"
                    >
                      $4.99 USD
                    </button>
                  </div>

                  <div className="bg-slate-900/85 backdrop-blur-xl border-2 border-amber-400/60 rounded-3xl p-4 flex flex-col justify-between shadow-xl relative">
                    <span className="absolute top-2 right-2 bg-amber-400 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                      BEST VALUE
                    </span>
                    <div>
                      <div className="text-3xl mb-2">💎💎💎</div>
                      <h3 className="text-base font-black text-white">Mountain of Gems</h3>
                      <div className="text-xl font-black text-cyan-300 font-mono my-1">1,200 GEMS</div>
                      <p className="text-[11px] text-amber-200 leading-tight mb-4">
                        +30% Huge Value bonus.
                      </p>
                    </div>
                    <button
                      onClick={() => handleBuyGemPack('Mountain of Gems', 1200, '$9.99')}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 text-slate-950 font-black text-xs uppercase rounded-xl border border-yellow-200 shadow active:scale-95 transition-all cursor-pointer"
                    >
                      $9.99 USD
                    </button>
                  </div>

                  <div className="bg-slate-900/85 backdrop-blur-xl border-2 border-purple-400/60 rounded-3xl p-4 flex flex-col justify-between shadow-xl relative">
                    <span className="absolute top-2 right-2 bg-purple-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                      MYTHIC
                    </span>
                    <div>
                      <div className="text-3xl mb-2">💎👑</div>
                      <h3 className="text-base font-black text-white">Titan's Trove</h3>
                      <div className="text-xl font-black text-cyan-300 font-mono my-1">2,500 GEMS</div>
                      <p className="text-[11px] text-purple-200 leading-tight mb-4">
                        Ultimate vault for all skins.
                      </p>
                    </div>
                    <button
                      onClick={() => handleBuyGemPack("Titan's Trove", 2500, '$19.99')}
                      className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 text-white font-black text-xs uppercase rounded-xl border border-purple-200 shadow active:scale-95 transition-all cursor-pointer"
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

      {/* 5. INTERACTIVE BRAWL STARS STEP-BY-STEP BOX OPENING MODAL */}
      <BoxOpeningModal
        isOpen={!!boxReward}
        reward={boxReward}
        onClose={() => setBoxReward(null)}
        onEquipSkin={(skin) => {
          setEquippedSkin(skin.championId, skin.id);
          showToast(`Equipped ${skin.name}!`);
        }}
      />
    </div>
  );
};
