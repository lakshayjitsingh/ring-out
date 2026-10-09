import { useEffect, useRef, useState } from 'react';
import { GameEngine, type GameState, type CameraMode } from './game/GameEngine';
import { BattleHUD } from './components/BattleHUD';
import { ChampionShowcase } from './components/ChampionShowcase';
import { type ChampionId } from './game/championModels';

export function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [activeScreen, setActiveScreen] = useState<'showcase' | 'battle'>('showcase');
  const [selectedChampion, setSelectedChampion] = useState<ChampionId>('kai');

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
    engineRef.current?.resetMatch();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
      {/* 3D Battle Arena View */}
      <div
        className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
          activeScreen === 'battle' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div ref={containerRef} className="absolute inset-0 w-full h-full" />
        <BattleHUD
          state={gameState}
          selectedChampion={selectedChampion}
          onOpenShowcase={() => setActiveScreen('showcase')}
          onDash={handleDash}
          onAimChange={handleAimChange}
          onJoystickMove={handleJoystickMove}
          onCameraChange={handleCameraChange}
          onTogglePause={handleTogglePause}
          onRestart={handleRestart}
        />
      </div>

      {/* 3D Champion Showcase (Shop & 360° Inspection) */}
      {activeScreen === 'showcase' && (
        <ChampionShowcase
          selectedChampion={selectedChampion}
          onSelectChampion={handleSelectChampion}
          onBackToBattle={() => {
            setActiveScreen('battle');
            if (gameState.isGameOver) {
              handleRestart();
            }
          }}
        />
      )}
    </div>
  );
}

export default App;
