import { useEffect, useRef, useState } from 'react';
import { GameEngine, type GameState, type CameraMode } from './game/GameEngine';
import { BattleHUD } from './components/BattleHUD';
import { ChampionShowcase } from './components/ChampionShowcase';
import { HomeScreen } from './components/HomeScreen';
import { ShopScreen } from './components/ShopScreen';
import { TrophyRoadModal, type TrophyMilestone } from './components/TrophyRoadModal';
import { type ChampionId } from './game/championModels';
import { sounds } from './audio/soundManager';

export function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [activeScreen, setActiveScreen] = useState<'home' | 'brawlers' | 'shop' | 'battle'>('home');
  const [isTrophyRoadOpen, setIsTrophyRoadOpen] = useState(false);
  const [selectedChampion, setSelectedChampion] = useState<ChampionId>('leo');

  const [gameState, setGameState] = useState<GameState>({
    timeRemaining: 60,
    arenaRadius: 13,
    initialRadius: 13,
    playerRoundWins: 0,
    botRoundWins: 0,
    currentRound: 1,
    roundHistory: [],
    roundBannerText: null,
    roundBannerType: null,
    playerCharge: 0,
    isAiming: false,
    aimAngle: 0,
    countdown: 3,
    isPaused: false,
    isGameOver: false,
    winner: null,
    cameraMode: 'third_person',
    warningText: null,
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new GameEngine(containerRef.current, (newState) => {
      setGameState(newState);
    });
    engineRef.current = engine;
    engine.setPlayerChampion(selectedChampion);
    (window as unknown as { __gameEngine: GameEngine }).__gameEngine = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  const handleSelectChampion = (id: ChampionId) => {
    setSelectedChampion(id);
    engineRef.current?.setPlayerChampion(id);
  };

  const handleDash = (aimX?: number, aimZ?: number) => {
    engineRef.current?.triggerDash(aimX, aimZ);
  };

  const handleAimChange = (isAiming: boolean, aimX?: number, aimZ?: number) => {
    engineRef.current?.setAim(isAiming, aimX, aimZ);
  };

  const handleJoystickMove = (x: number, z: number) => {
    engineRef.current?.setTouchJoystick(x, z);
  };

  const handleCameraChange = (mode: CameraMode) => {
    engineRef.current?.setCameraMode(mode);
  };

  const handleTogglePause = () => {
    engineRef.current?.togglePause();
  };

  const handleRestart = () => {
    hasProcessedGameOverRef.current = false;
    engineRef.current?.resetMatch();
  };

  // User Profile & Currencies
  const [trophies, setTrophies] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('ringout_trophies');
      if (saved !== null) {
        if (saved === '1250') {
          localStorage.setItem('ringout_trophies', '0');
          return 0;
        }
        const val = parseInt(saved, 10);
        return isNaN(val) ? 0 : val;
      }
    } catch {}
    return 0;
  });

  const [gold, setGold] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('ringout_gold');
      return saved ? parseInt(saved, 10) : 100;
    } catch {
      return 100;
    }
  });

  const [gems, setGems] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('ringout_gems');
      return saved ? parseInt(saved, 10) : 50;
    } catch {
      return 50;
    }
  });

  const [unlockedChampions, setUnlockedChampions] = useState<ChampionId[]>(() => {
    try {
      const saved = localStorage.getItem('ringout_unlocked_champions');
      return saved ? JSON.parse(saved) : ['leo', 'bolt', 'kai'];
    } catch {
      return ['leo', 'bolt', 'kai'];
    }
  });

  const [claimedMilestones, setClaimedMilestones] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('ringout_claimed_milestones');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleUnlockChampion = (id: ChampionId, cost: number) => {
    setGems((prev) => {
      const next = Math.max(0, prev - cost);
      try {
        localStorage.setItem('ringout_gems', String(next));
      } catch {}
      return next;
    });
    setUnlockedChampions((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem('ringout_unlocked_champions', JSON.stringify(next));
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

  const handleAddGems = (amount: number) => {
    setGems((prev) => {
      const next = prev + amount;
      try {
        localStorage.setItem('ringout_gems', String(next));
      } catch {}
      return next;
    });
  };

  const handleClaimMilestone = (milestone: TrophyMilestone) => {
    setClaimedMilestones((prev) => {
      const next = [...prev, milestone.trophies];
      try {
        localStorage.setItem('ringout_claimed_milestones', JSON.stringify(next));
      } catch {}
      return next;
    });

    if (milestone.amount && milestone.rewardType === 'gold') handleAddGold(milestone.amount);
    if (milestone.amount && milestone.rewardType === 'gems') handleAddGems(milestone.amount);
    if (milestone.rewardType === 'mega_box') {
      if (milestone.goldBonus) handleAddGold(milestone.goldBonus);
      if (milestone.gemBonus) handleAddGems(milestone.gemBonus);
    }
  };

  // Track match completion
  const hasProcessedGameOverRef = useRef(false);

  useEffect(() => {
    if (gameState.isGameOver) {
      if (!hasProcessedGameOverRef.current) {
        hasProcessedGameOverRef.current = true;
        if (gameState.winner === 'player') {
          const deltaTrophies = 30;
          const deltaGold = 120;
          setTrophies((prev) => {
            const next = prev + deltaTrophies;
            try {
              localStorage.setItem('ringout_trophies', String(next));
            } catch {}
            return next;
          });
          setGold((prev) => {
            const next = prev + deltaGold;
            try {
              localStorage.setItem('ringout_gold', String(next));
            } catch {}
            return next;
          });
        } else if (gameState.winner === 'bot') {
          const deltaTrophies = 10;
          const deltaGold = 25;
          setTrophies((prev) => {
            const next = Math.max(0, prev - deltaTrophies);
            try {
              localStorage.setItem('ringout_trophies', String(next));
            } catch {}
            return next;
          });
          setGold((prev) => {
            const next = prev + deltaGold;
            try {
              localStorage.setItem('ringout_gold', String(next));
            } catch {}
            return next;
          });
        }
      }
    } else {
      hasProcessedGameOverRef.current = false;
    }
  }, [gameState.isGameOver, gameState.winner]);

  const [botChampion, setBotChampion] = useState<ChampionId>('kage');

  // 1v1 Private Code Room Match Flow
  const handleStartCodeRoom = (_roomCode: string, _isHost: boolean) => {
    hasProcessedGameOverRef.current = false;
    engineRef.current?.setPlayerChampion(selectedChampion);
    const rivalChamps: ChampionId[] = ['kage', 'titan', 'nova', 'bolt', 'kai'];
    const filtered = rivalChamps.filter((c) => c !== selectedChampion);
    const rival = filtered[Math.floor(Math.random() * filtered.length)] || 'kage';
    engineRef.current?.setBotChampion(rival);
    engineRef.current?.resetMatch();
    setBotChampion(rival);
    setActiveScreen('battle');
  };

  const handleStartPvP = () => {
    hasProcessedGameOverRef.current = false;
    engineRef.current?.setPlayerChampion(selectedChampion);
    const rivalChamps: ChampionId[] = ['titan', 'nova', 'bolt', 'kai', 'kage'];
    const filtered = rivalChamps.filter((c) => c !== selectedChampion);
    const rival = filtered[Math.floor(Math.random() * filtered.length)] || 'kage';
    engineRef.current?.setBotChampion(rival);
    engineRef.current?.resetMatch();
    setBotChampion(rival);
    setActiveScreen('battle');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 1. 3D Battle Arena View */}
      <div
        className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
          activeScreen === 'battle' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div ref={containerRef} className="absolute inset-0 w-full h-full" />
        <BattleHUD
          state={gameState}
          selectedChampion={selectedChampion}
          botChampion={botChampion}
          trophies={trophies}
          onOpenShowcase={() => setActiveScreen('home')}
          onDash={handleDash}
          onAimChange={handleAimChange}
          onJoystickMove={handleJoystickMove}
          onCameraChange={handleCameraChange}
          onTogglePause={handleTogglePause}
          onRestart={handleRestart}
        />
      </div>

      {/* 2. Central Arcade Home Page Hub */}
      {activeScreen === 'home' && (
        <HomeScreen
          selectedChampion={selectedChampion}
          trophies={trophies}
          setTrophies={setTrophies}
          gold={gold}
          setGold={setGold}
          gems={gems}
          setGems={setGems}
          onSelectChampion={handleSelectChampion}
          onOpenBrawlers={() => setActiveScreen('brawlers')}
          onOpenShop={() => setActiveScreen('shop')}
          onOpenTrophyRoad={() => setIsTrophyRoadOpen(true)}
          onStartCodeRoomMatch={handleStartCodeRoom}
          onStartPvPMatch={handleStartPvP}
        />
      )}

      {/* 3. 3D Champion Roster / Brawlers Showcase (Matching Image 2) */}
      {activeScreen === 'brawlers' && (
        <ChampionShowcase
          selectedChampion={selectedChampion}
          trophies={trophies}
          gold={gold}
          gems={gems}
          setGems={setGems}
          onSelectChampion={handleSelectChampion}
          onBackToBattle={() => setActiveScreen('home')}
        />
      )}

      {/* 4. Dedicated Full-Page Brawl Shop */}
      {activeScreen === 'shop' && (
        <ShopScreen
          gold={gold}
          gems={gems}
          trophies={trophies}
          setGold={setGold}
          setGems={setGems}
          unlockedChampions={unlockedChampions}
          onUnlockChampion={handleUnlockChampion}
          onBackToHome={() => setActiveScreen('home')}
        />
      )}

      {/* 5. FULLSCREEN BRAWL STARS HORIZONTAL TROPHY ROAD MODAL */}
      <TrophyRoadModal
        isOpen={isTrophyRoadOpen}
        onClose={() => setIsTrophyRoadOpen(false)}
        trophies={trophies}
        claimedMilestones={claimedMilestones}
        gold={gold}
        gems={gems}
        onClaimMilestone={handleClaimMilestone}
      />

      {/* ========================================================================= */}
      {/* 6. PERSISTENT GLOBAL BOTTOM NAVIGATION BAR (Matching Image 2!) */}
      {/* ========================================================================= */}
      {activeScreen !== 'battle' && (
        <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-18 bg-[#0f172a]/95 backdrop-blur-xl border-t border-white/15 px-2 sm:px-6 flex items-center justify-around z-40 shadow-[0_-8px_25px_rgba(0,0,0,0.5)]">
          {/* Tab 1: HOME */}
          <button
            onClick={() => {
              sounds.playBump(0.6);
              setIsTrophyRoadOpen(false);
              setActiveScreen('home');
            }}
            className={`flex-1 max-w-[140px] py-2 sm:py-2.5 rounded-2xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeScreen === 'home' && !isTrophyRoadOpen
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black border-2 border-yellow-200 shadow-[0_4px_15px_rgba(249,115,22,0.5)] scale-102'
                : 'text-slate-400 hover:text-white hover:bg-white/5 font-bold'
            }`}
          >
            <span className="text-base sm:text-lg">🏠</span>
            <span className="text-xs sm:text-sm uppercase tracking-wider">Home</span>
          </button>

          {/* Tab 2: BRAWLERS */}
          <button
            onClick={() => {
              sounds.playBump(0.6);
              setIsTrophyRoadOpen(false);
              setActiveScreen('brawlers');
            }}
            className={`flex-1 max-w-[140px] py-2 sm:py-2.5 rounded-2xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeScreen === 'brawlers' && !isTrophyRoadOpen
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black border-2 border-yellow-200 shadow-[0_4px_15px_rgba(249,115,22,0.5)] scale-102'
                : 'text-slate-400 hover:text-white hover:bg-white/5 font-bold'
            }`}
          >
            <span className="text-base sm:text-lg">🥊</span>
            <span className="text-xs sm:text-sm uppercase tracking-wider">Brawlers</span>
          </button>

          {/* Tab 3: TROPHY ROAD */}
          <button
            onClick={() => {
              sounds.playBump(0.6);
              setIsTrophyRoadOpen(true);
            }}
            className={`flex-1 max-w-[140px] py-2 sm:py-2.5 rounded-2xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isTrophyRoadOpen
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black border-2 border-yellow-200 shadow-[0_4px_15px_rgba(249,115,22,0.5)] scale-102'
                : 'text-slate-400 hover:text-white hover:bg-white/5 font-bold'
            }`}
          >
            <span className="text-base sm:text-lg">🏆</span>
            <span className="text-xs sm:text-sm uppercase tracking-wider">Trophies</span>
          </button>

          {/* Tab 4: SHOP */}
          <button
            onClick={() => {
              sounds.playBump(0.6);
              setIsTrophyRoadOpen(false);
              setActiveScreen('shop');
            }}
            className={`flex-1 max-w-[140px] py-2 sm:py-2.5 rounded-2xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeScreen === 'shop' && !isTrophyRoadOpen
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black border-2 border-yellow-200 shadow-[0_4px_15px_rgba(249,115,22,0.5)] scale-102'
                : 'text-slate-400 hover:text-white hover:bg-white/5 font-bold'
            }`}
          >
            <span className="text-base sm:text-lg">🛒</span>
            <span className="text-xs sm:text-sm uppercase tracking-wider">Shop</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
