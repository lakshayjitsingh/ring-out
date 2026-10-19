import { useEffect, useRef, useState } from 'react';
import { GameEngine, type GameState, type CameraMode } from './game/GameEngine';
import { BattleHUD } from './components/BattleHUD';
import { ChampionShowcase } from './components/ChampionShowcase';
import { HomeScreen } from './components/HomeScreen';
import { ShopScreen } from './components/ShopScreen';
import { type ChampionId } from './game/championModels';

export function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [activeScreen, setActiveScreen] = useState<'home' | 'brawlers' | 'shop' | 'battle'>('home');
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

  // User Profile & Currencies (Persisted across entire App - Starts at 0 for beginners)
  const [trophies, setTrophies] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('ringout_trophies');
      if (saved !== null) {
        // If it was the old hardcoded 1250, reset to 0 for beginners as requested!
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

  // Track match completion to reward / deduct trophies once per game
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
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
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
          onStartCodeRoomMatch={handleStartCodeRoom}
          onStartPvPMatch={handleStartPvP}
        />
      )}

      {/* 3. 3D Champion Roster / Brawlers Showcase */}
      {activeScreen === 'brawlers' && (
        <ChampionShowcase
          selectedChampion={selectedChampion}
          trophies={trophies}
          gold={gold}
          onSelectChampion={handleSelectChampion}
          onBackToBattle={() => {
            setActiveScreen('home');
          }}
        />
      )}

      {/* 4. Dedicated Full-Page Brawl Shop (3 Divisions, 4K Tropical Backdrop, 2.5D Parallax) */}
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
    </div>
  );
}

export default App;
