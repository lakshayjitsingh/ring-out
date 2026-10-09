import { useEffect, useRef, useState } from 'react';
import { GameEngine, type GameState, type CameraMode } from './game/GameEngine';
import { BattleHUD } from './components/BattleHUD';

export function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    timeRemaining: 180,
    arenaRadius: 13,
    initialRadius: 13,
    playerRoundWins: 0,
    botRoundWins: 0,
    currentRound: 1,
    roundBannerText: null,
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
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Interactive Mobile Battle HUD */}
      <BattleHUD
        state={gameState}
        onDash={handleDash}
        onAimChange={handleAimChange}
        onJoystickMove={handleJoystickMove}
        onCameraChange={handleCameraChange}
        onTogglePause={handleTogglePause}
        onRestart={handleRestart}
      />
    </div>
  );
}

export default App;
