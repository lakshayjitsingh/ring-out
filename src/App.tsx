import { useEffect, useRef, useState } from 'react';
import { GameEngine, type GameState, type CameraMode } from './game/GameEngine';
import { BattleHUD } from './components/BattleHUD';
import { ChampionShowcase } from './components/ChampionShowcase';
import { HomeScreen } from './components/HomeScreen';
import { type ChampionId } from './game/championModels';

export function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [activeScreen, setActiveScreen] = useState<'home' | 'brawlers' | 'battle'>('home');
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

  const [botChampion, setBotChampion] = useState<ChampionId>('kage');

  const handleStartStory = () => {
    engineRef.current?.resetMatch();
    engineRef.current?.setBotChampion('kage');
    setBotChampion('kage');
    setActiveScreen('battle');
  };

  const handleStartPvP = () => {
    engineRef.current?.resetMatch();
    const rivalChamps: ChampionId[] = ['titan', 'nova', 'bolt', 'kai', 'kage'];
    const filtered = rivalChamps.filter((c) => c !== selectedChampion);
    const rival = filtered[Math.floor(Math.random() * filtered.length)] || 'kage';
    engineRef.current?.setBotChampion(rival);
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
          onSelectChampion={handleSelectChampion}
          onOpenBrawlers={() => setActiveScreen('brawlers')}
          onStartStoryMatch={handleStartStory}
          onStartPvPMatch={handleStartPvP}
        />
      )}

      {/* 3. 3D Champion Roster / Brawlers Showcase */}
      {activeScreen === 'brawlers' && (
        <ChampionShowcase
          selectedChampion={selectedChampion}
          onSelectChampion={handleSelectChampion}
          onBackToBattle={() => {
            setActiveScreen('home');
          }}
        />
      )}
    </div>
  );
}

export default App;
