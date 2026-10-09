import React, { useState, useRef, useCallback } from 'react';
import type { GameState, CameraMode } from '../game/GameEngine';
import { sounds } from '../audio/soundManager';
import { Volume2, VolumeX, Pause, Play, RotateCcw, Video, Trophy, Flame } from 'lucide-react';

interface BattleHUDProps {
  state: GameState;
  onDash: (aimX?: number, aimZ?: number) => void;
  onAimChange: (isAiming: boolean, aimX?: number, aimZ?: number) => void;
  onJoystickMove: (x: number, z: number) => void;
  onCameraChange: (mode: CameraMode) => void;
  onTogglePause: () => void;
  onRestart: () => void;
}

export const BattleHUD: React.FC<BattleHUDProps> = ({
  state,
  onDash,
  onAimChange,
  onJoystickMove,
  onCameraChange,
  onTogglePause,
  onRestart,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Joystick state
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [touchPos, setTouchPos] = useState<{ x: number; y: number } | null>(null);
  const [stickOffset, setStickOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  // Dash Button (Option C: Hold & Drag to Aim, Quick Tap to Dash)
  const dashTouchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isAimingRef = useRef(false);

  const toggleSound = () => {
    sounds.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  const cycleCamera = () => {
    const modes: CameraMode[] = ['third_person', 'isometric', 'close_action'];
    const nextIdx = (modes.indexOf(state.cameraMode) + 1) % modes.length;
    onCameraChange(modes[nextIdx]);
  };

  // Joystick touch handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setTouchPos({ x: centerX, y: centerY });
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current || !touchPos) return;
    const dx = e.clientX - touchPos.x;
    const dy = e.clientY - touchPos.y;
    const maxRadius = 45;
    const dist = Math.hypot(dx, dy);

    let normX = dx;
    let normY = dy;
    if (dist > maxRadius) {
      normX = (dx / dist) * maxRadius;
      normY = (dy / dist) * maxRadius;
    }

    setStickOffset({ x: normX, y: normY });
    onJoystickMove(normX / maxRadius, normY / maxRadius);
  }, [touchPos, onJoystickMove]);

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
    setStickOffset({ x: 0, y: 0 });
    onJoystickMove(0, 0);
  }, [onJoystickMove]);

  // Dash Button handlers (Option C)
  const handleDashPointerDown = (e: React.PointerEvent) => {
    if (state.playerCharge < 10 || state.isGameOver || state.isPaused) return;
    dashTouchStartRef.current = { x: e.clientX, y: e.clientY };
    isAimingRef.current = false;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleDashPointerMove = (e: React.PointerEvent) => {
    if (!dashTouchStartRef.current) return;
    const dx = e.clientX - dashTouchStartRef.current.x;
    const dy = e.clientY - dashTouchStartRef.current.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 15) {
      isAimingRef.current = true;
      // Normalizing screen drag to 3D arena coordinates (dx: right, dy: down)
      const aimX = dx / dist;
      const aimZ = dy / dist;
      onAimChange(true, aimX, aimZ);
    }
  };

  const handleDashPointerUp = (e: React.PointerEvent) => {
    if (!dashTouchStartRef.current) return;

    if (isAimingRef.current) {
      const dx = e.clientX - dashTouchStartRef.current.x;
      const dy = e.clientY - dashTouchStartRef.current.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 15) {
        onDash(dx / dist, dy / dist);
      } else {
        onDash();
      }
    } else {
      // Quick tap: dash in current movement direction!
      onDash();
    }

    dashTouchStartRef.current = null;
    isAimingRef.current = false;
    onAimChange(false);
  };

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const charge = Math.min(100, Math.max(0, Number.isFinite(state.playerCharge) ? state.playerCharge : 0));
  const isReady = charge >= 10;
  const isMax = charge >= 99;

  // Power Dash circular SVG circumference
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = Number.isFinite(charge)
    ? circumference - (charge / 100) * circumference
    : circumference;

  // Tier color styling
  let ringColor = '#00f5ff';
  let badgeColor = 'text-cyan-400';
  let buttonGradient = 'from-cyan-600 to-blue-500 shadow-cyan-500/40';

  if (charge >= 99) {
    ringColor = '#ff0055';
    badgeColor = 'text-rose-400';
    buttonGradient = 'from-rose-500 via-amber-500 to-yellow-400 shadow-rose-500/60 animate-pulse';
  } else if (charge >= 70) {
    ringColor = '#f59e0b';
    badgeColor = 'text-amber-400';
    buttonGradient = 'from-amber-600 to-orange-500 shadow-amber-500/40';
  } else if (charge >= 40) {
    ringColor = '#8b5cf6';
    badgeColor = 'text-purple-400';
    buttonGradient = 'from-purple-600 to-indigo-500 shadow-purple-500/40';
  }

  // Round status subtitle
  const isMatchPoint = state.playerRoundWins === 2 || state.botRoundWins === 2;
  const isFinalRound = state.playerRoundWins === 2 && state.botRoundWins === 2;

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden font-sans text-white">
      {/* 0. COUNTDOWN OVERLAY (3... 2... 1... FIGHT!) */}
      {state.countdown > 0 && !state.isGameOver && !state.roundBannerText && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40 bg-black/25">
          <div className="text-center animate-in zoom-in-75 duration-150">
            <div className="text-8xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 drop-shadow-[0_10px_25px_rgba(245,158,11,0.6)]">
              {Math.ceil(state.countdown) > 1 ? Math.ceil(state.countdown) - 1 : 'FIGHT!'}
            </div>
            <p className="text-sm font-bold tracking-widest text-cyan-300 uppercase mt-2">
              Round {state.currentRound} of 5 — Knock opponent off!
            </p>
          </div>
        </div>
      )}

      {/* 0. ROUND FINISH BANNER OVERLAY */}
      {state.roundBannerText && !state.isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 bg-black/45 backdrop-blur-xs">
          <div className="text-center animate-in zoom-in-90 duration-200">
            <div className="text-5xl md:text-7xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 drop-shadow-[0_8px_25px_rgba(245,158,11,0.8)]">
              {state.roundBannerText}
            </div>
            <p className="text-base font-bold text-cyan-300 uppercase mt-3 tracking-widest">
              Preparing next round...
            </p>
          </div>
        </div>
      )}

      {/* 1. TOP HEADER STATUS */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between pointer-events-auto">
        {/* Left: Player Stocks & Round Wins */}
        <div className="flex items-center gap-3 bg-slate-900/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-cyan-500/30 shadow-lg">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center font-bold text-cyan-300">
            K
          </div>
          <div>
            <div className="text-xs font-bold text-cyan-300">Kai (You)</div>
            {/* Round Win Pips (First to 3) */}
            <div className="flex items-center gap-1.5 mt-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full border transition-all ${
                    i < state.playerRoundWins
                      ? 'bg-cyan-400 border-cyan-300 shadow-[0_0_8px_#00f5ff]'
                      : 'bg-slate-800 border-slate-600'
                  }`}
                  title={`Round Win ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Center: Match Timer & Best-of-5 Round Indicator */}
        <div className="flex flex-col items-center">
          <div className="bg-slate-900/90 backdrop-blur-md px-6 py-2 rounded-2xl border border-slate-700/60 shadow-xl flex items-center gap-2">
            <span className="text-xl md:text-2xl font-black tracking-wider text-amber-400 font-mono">
              {formatTime(state.timeRemaining)}
            </span>
          </div>

          <div className="mt-1 px-3 py-0.5 bg-slate-800/80 border border-slate-700 rounded-full flex items-center gap-1.5">
            <span className="text-[10px] font-black tracking-widest uppercase text-slate-300">
              Round {state.currentRound}/5
            </span>
            {isFinalRound ? (
              <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest animate-pulse">
                • FINAL ROUND!
              </span>
            ) : isMatchPoint ? (
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                • MATCH POINT
              </span>
            ) : null}
          </div>

          {state.warningText && (
            <div className="mt-1.5 px-3 py-1 bg-red-600/90 text-white font-bold text-xs rounded-full shadow-lg border border-red-400 animate-bounce">
              {state.warningText}
            </div>
          )}
        </div>

        {/* Right: Bot Opponent & Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={cycleCamera}
            className="p-2.5 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-700/60 rounded-xl transition-all shadow-md active:scale-95"
            title="Cycle Camera Angle"
          >
            <Video className="w-4 h-4 text-cyan-400" />
          </button>
          <button
            onClick={toggleSound}
            className="p-2.5 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-700/60 rounded-xl transition-all shadow-md active:scale-95"
            title="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          </button>
          <button
            onClick={onTogglePause}
            className="p-2.5 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-700/60 rounded-xl transition-all shadow-md active:scale-95"
            title="Pause Match"
          >
            {state.isPaused ? <Play className="w-4 h-4 text-amber-400" /> : <Pause className="w-4 h-4 text-slate-300" />}
          </button>

          <div className="hidden sm:flex items-center gap-3 bg-slate-900/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-purple-500/30 shadow-lg">
            <div className="text-right">
              <div className="text-xs font-bold text-purple-300">ShadowNinja</div>
              <div className="flex items-center gap-1.5 mt-1 justify-end">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full border transition-all ${
                      i < state.botRoundWins
                        ? 'bg-purple-400 border-purple-300 shadow-[0_0_8px_#a855f7]'
                        : 'bg-slate-800 border-slate-600'
                    }`}
                    title={`Bot Round Win ${i + 1}`}
                  />
                ))}
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400 flex items-center justify-center font-bold text-purple-300">
              N
            </div>
          </div>
        </div>
      </div>

      {/* 2. BOTTOM CONTROLS (TWO-THUMB MOBILE LAYOUT) */}
      <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between pointer-events-auto">
        {/* Left: Floating Touch Virtual Joystick */}
        <div
          ref={joystickBaseRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative w-32 h-32 rounded-full bg-slate-900/60 backdrop-blur-md border-2 border-cyan-500/40 shadow-2xl flex items-center justify-center touch-none cursor-grab active:cursor-grabbing"
        >
          <div
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-400 border border-white/60 shadow-lg flex items-center justify-center transition-transform duration-75"
            style={{
              transform: `translate(${stickOffset.x}px, ${stickOffset.y}px)`,
            }}
          >
            <div className="w-4 h-4 rounded-full bg-white/80"></div>
          </div>
          <span className="absolute -bottom-6 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            WASD / Move
          </span>
        </div>

        {/* Right: Tactile 0-100% Power Dash Button (Option C: Tap to move-dash, Drag to aim) */}
        <div className="flex flex-col items-center">
          <div className="relative w-28 h-28 flex items-center justify-center touch-none">
            {/* SVG Circular Progress Meter (0% to 100%) */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
              <circle
                cx="56"
                cy="56"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="56"
                cy="56"
                r={radius}
                stroke={ringColor}
                strokeWidth="6"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.05s linear, stroke 0.2s ease' }}
              />
            </svg>

            {/* Inner Interactive Button */}
            <button
              onPointerDown={handleDashPointerDown}
              onPointerMove={handleDashPointerMove}
              onPointerUp={handleDashPointerUp}
              onPointerCancel={handleDashPointerUp}
              disabled={!isReady}
              className={`w-20 h-20 rounded-full border-2 border-white/80 shadow-2xl flex flex-col items-center justify-center transition-all active:scale-90 ${
                isReady
                  ? `bg-gradient-to-tr ${buttonGradient} cursor-pointer`
                  : 'bg-slate-800/80 border-slate-600 cursor-not-allowed opacity-60'
              }`}
            >
              <Flame className="w-6 h-6 text-white drop-shadow-md" />
              <span className="text-[11px] font-mono font-black text-white tracking-wider">
                {isMax ? 'MAX' : `${Math.floor(charge)}%`}
              </span>
            </button>
          </div>

          <div className="flex flex-col items-center mt-1 text-center">
            <span className={`text-[10px] font-black uppercase tracking-wider ${badgeColor}`}>
              {charge < 10 ? 'Recharging...' : state.isAiming ? 'Aiming...' : 'Tap or Drag Aim'}
            </span>
            <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
              Spacebar / Dash
            </span>
          </div>
        </div>
      </div>

      {/* 3. FINAL MATCH VICTORY / DEFEAT MODAL (FIRST TO 3 ROUND WINS) */}
      {state.isGameOver && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 pointer-events-auto z-50">
          <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-center animate-in zoom-in-95 duration-200">
            {state.winner === 'player' ? (
              <>
                <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/30 animate-pulse">
                  <Trophy className="w-10 h-10 text-amber-400" />
                </div>
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500">
                  MATCH VICTORY!
                </h2>
                <p className="text-slate-300 text-sm mt-1">
                  You conquered the arena {state.playerRoundWins} - {state.botRoundWins}!
                </p>

                {/* Match Rewards */}
                <div className="grid grid-cols-3 gap-2 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3 my-4">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Trophies</div>
                    <div className="text-lg font-black text-amber-400">+35 🏆</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Gold</div>
                    <div className="text-lg font-black text-yellow-300">+90 🟡</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Account XP</div>
                    <div className="text-lg font-black text-cyan-400">+100 ⭐</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 mx-auto rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center mb-3 shadow-lg shadow-rose-500/30">
                  <span className="text-3xl">💥</span>
                </div>
                <h2 className="text-3xl font-black text-rose-400">MATCH DEFEAT</h2>
                <p className="text-slate-300 text-sm mt-1">
                  ShadowNinja won {state.botRoundWins} - {state.playerRoundWins}!
                </p>

                {/* Consolation Rewards */}
                <div className="grid grid-cols-3 gap-2 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3 my-4">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Trophies</div>
                    <div className="text-lg font-black text-rose-400">-10 🏆</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Gold</div>
                    <div className="text-lg font-black text-yellow-300">+25 🟡</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Account XP</div>
                    <div className="text-lg font-black text-cyan-400">+40 ⭐</div>
                  </div>
                </div>
              </>
            )}

            <button
              onClick={onRestart}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-base rounded-2xl shadow-lg shadow-cyan-500/30 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <RotateCcw className="w-5 h-5" />
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}

      {/* 4. PAUSE MODAL */}
      {state.isPaused && !state.isGameOver && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 pointer-events-auto z-50">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-center">
            <h3 className="text-2xl font-black text-white mb-4">MATCH PAUSED</h3>
            <div className="space-y-3">
              <button
                onClick={onTogglePause}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg active:scale-95"
              >
                Resume Match
              </button>
              <button
                onClick={onRestart}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl active:scale-95"
              >
                Restart Match
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
