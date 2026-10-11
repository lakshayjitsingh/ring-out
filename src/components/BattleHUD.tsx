import React, { useState, useRef, useCallback } from 'react';
import type { GameState, CameraMode } from '../game/GameEngine';
import { sounds } from '../audio/soundManager';
import { CHAMPIONS, type ChampionId } from '../game/championModels';
import {
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Trophy,
  Flame,
  Shield,
  Sparkles,
  Settings,
  X,
  Timer,
  Eye,
  Camera,
  Zap,
} from 'lucide-react';

function getChampionAvatar(champId: ChampionId) {
  switch (champId) {
    case 'leo':
      return (
        <svg viewBox="0 0 36 36" className="w-6 h-6" fill="none">
          <circle cx="18" cy="18" r="16" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
          <path d="M10 14C10 9 14 6 18 6C22 6 26 9 26 14C23 15 13 15 10 14Z" fill="#10b981" />
          <path d="M8 14H13V16H8Z" fill="#34d399" />
          <circle cx="18" cy="19" r="6" fill="#fde68a" />
          <circle cx="16" cy="19" r="1.2" fill="#1e293b" />
          <circle cx="20" cy="19" r="1.2" fill="#1e293b" />
          <path d="M16 22C17 23 19 23 20 22" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" />
        </svg>
      );
    case 'kai':
      return (
        <svg viewBox="0 0 36 36" className="w-6 h-6" fill="none">
          <circle cx="18" cy="18" r="16" fill="#083344" stroke="#00f5ff" strokeWidth="2" />
          <rect x="9" y="14" width="18" height="7" rx="3.5" fill="#00f5ff" />
          <rect x="11" y="16" width="14" height="3" rx="1.5" fill="#ffffff" />
          <rect x="6" y="13" width="3" height="9" rx="1.5" fill="#38bdf8" />
          <rect x="27" y="13" width="3" height="9" rx="1.5" fill="#38bdf8" />
          <path d="M7 14C7 8 11 6 18 6C25 6 29 8 29 14" stroke="#38bdf8" strokeWidth="2" />
        </svg>
      );
    case 'nova':
      return (
        <svg viewBox="0 0 36 36" className="w-6 h-6" fill="none">
          <circle cx="18" cy="18" r="16" fill="#4c0519" stroke="#f43f5e" strokeWidth="2" />
          <polygon points="18,10 26,17 22,24 18,22 14,24 10,17" fill="#f43f5e" />
          <polygon points="18,13 23,17 20,21 18,20 16,21 13,17" fill="#fda4af" />
          <line x1="12" y1="12" x2="6" y2="6" stroke="#fb7185" strokeWidth="2" strokeLinecap="round" />
          <line x1="24" y1="12" x2="30" y2="6" stroke="#fb7185" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'titan':
      return (
        <svg viewBox="0 0 36 36" className="w-6 h-6" fill="none">
          <circle cx="18" cy="18" r="16" fill="#451a03" stroke="#f59e0b" strokeWidth="2" />
          <rect x="10" y="10" width="16" height="16" rx="3" fill="#78350f" />
          <rect x="12" y="15" width="12" height="4" rx="1" fill="#fbbf24" />
          <line x1="10" y1="21" x2="26" y2="21" stroke="#f59e0b" strokeWidth="1.5" />
          <line x1="15" y1="21" x2="15" y2="26" stroke="#f59e0b" strokeWidth="1.5" />
          <line x1="21" y1="21" x2="21" y2="26" stroke="#f59e0b" strokeWidth="1.5" />
        </svg>
      );
    case 'kage':
      return (
        <svg viewBox="0 0 36 36" className="w-6 h-6" fill="none">
          <circle cx="18" cy="18" r="16" fill="#1e1035" stroke="#a855f7" strokeWidth="2" />
          <path d="M10 24C10 13 13 8 18 8C23 8 26 13 26 24C23 26 13 26 10 24Z" fill="#180e29" stroke="#9333ea" strokeWidth="1.5" />
          <line x1="13" y1="17" x2="16" y2="17" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="20" y1="17" x2="23" y2="17" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="14" y1="17" x2="15" y2="17" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="21" y1="17" x2="22" y2="17" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'bolt':
      return (
        <svg viewBox="0 0 36 36" className="w-6 h-6" fill="none">
          <circle cx="18" cy="18" r="16" fill="#422006" stroke="#eab308" strokeWidth="2" />
          <polygon points="10,14 13,6 17,13" fill="#ca8a04" />
          <polygon points="26,14 23,6 19,13" fill="#ca8a04" />
          <polygon points="12,14 24,14 18,24" fill="#eab308" />
          <polygon points="14,16 22,16 18,21" fill="#fef08a" />
        </svg>
      );
  }
}

interface BattleHUDProps {
  state: GameState;
  selectedChampion?: ChampionId;
  onOpenShowcase: () => void;
  onDash: (aimX?: number, aimZ?: number) => void;
  onAimChange: (isAiming: boolean, aimX?: number, aimZ?: number) => void;
  onJoystickMove: (x: number, z: number) => void;
  onCameraChange: (mode: CameraMode) => void;
  onTogglePause: () => void;
  onRestart: () => void;
}

export const BattleHUD: React.FC<BattleHUDProps> = ({
  state,
  selectedChampion = 'leo',
  onOpenShowcase,
  onDash,
  onAimChange,
  onJoystickMove,
  onCameraChange,
  onTogglePause,
  onRestart,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
    if (!soundEnabled) {
      sounds.playBump(1.0);
    }
  };

  const openSettings = () => {
    setIsSettingsOpen(true);
    if (!state.isPaused) {
      onTogglePause();
    }
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
    if (state.isPaused) {
      onTogglePause();
    }
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
      {/* 0. COUNTDOWN OVERLAY */}
      {state.countdown > 0 && !state.isGameOver && !state.roundBannerText && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40 bg-black/30 backdrop-blur-xs">
          <div className="text-center animate-in zoom-in-75 duration-150">
            <div className="text-8xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 drop-shadow-[0_10px_25px_rgba(245,158,11,0.6)]">
              {Math.ceil(state.countdown) > 1 ? `ROUND ${state.currentRound}` : 'FIGHT!'}
            </div>
            <p className="text-sm md:text-base font-black tracking-widest text-cyan-300 uppercase mt-2 drop-shadow-md">
              {isFinalRound ? '🔥 FINAL ROUND • SUDDEN DEATH' : isMatchPoint ? '⭐ MATCH POINT' : 'KNOCK OPPONENT OFF!'}
            </p>
          </div>
        </div>
      )}

      {/* 0. ROUND FINISH BANNER OVERLAY */}
      {state.roundBannerText && !state.isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 bg-black/55 backdrop-blur-xs">
          <div className="text-center animate-in zoom-in-90 duration-200">
            {state.roundBannerType === 'draw' || state.roundBannerText.includes('DRAW') ? (
              <div className="p-8 rounded-3xl bg-slate-900/90 border-2 border-white/80 shadow-[0_0_60px_rgba(255,255,255,0.45)]">
                <div className="text-5xl md:text-7xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 drop-shadow-[0_8px_30px_rgba(255,255,255,0.9)]">
                  {state.roundBannerText}
                </div>
                <p className="text-sm md:text-base font-bold text-slate-200 uppercase mt-3 tracking-widest flex items-center justify-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                  Both brawlers survived the collapse! Next round starting...
                </p>
              </div>
            ) : (
              <div>
                <div className="text-5xl md:text-7xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 drop-shadow-[0_8px_25px_rgba(245,158,11,0.8)]">
                  {state.roundBannerText}
                </div>
                <p className="text-base font-bold text-cyan-300 uppercase mt-3 tracking-widest">
                  Preparing next round...
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 1. TOP HEADER STATUS */}
      <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 flex items-start justify-between pointer-events-auto z-50">
        {/* Left: Player Champion Card & Round Wins */}
        {(() => {
          const champ = CHAMPIONS[selectedChampion || 'leo'] || CHAMPIONS.leo;
          return (
            <div className="flex flex-col items-start gap-1.5">
              {/* Player Identity Card */}
              <div className="flex items-center gap-2.5 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-cyan-500/40 shadow-xl shadow-cyan-950/30">
                <div
                  className="relative w-10 h-10 rounded-xl border-2 flex items-center justify-center shadow-md overflow-hidden"
                  style={{
                    backgroundColor: `${champ.color}25`,
                    borderColor: champ.color,
                  }}
                >
                  {getChampionAvatar(champ.id)}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-950 shadow-[0_0_6px_#10b981]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-white tracking-wide" style={{ color: champ.color }}>
                      {champ.name}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded-md border border-cyan-400/40">
                      YOU
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold leading-none mt-0.5">
                    {champ.archetype}
                  </div>
                </div>
              </div>

              {/* Round Victory Diamonds (Underneath Player Icon) */}
              <div className="flex items-center gap-2 ml-1">
                {[0, 1, 2].map((i) => {
                  const isWon = i < state.playerRoundWins;
                  return (
                    <div
                      key={i}
                      className={`relative w-4 h-4 rotate-45 rounded-xs flex items-center justify-center transition-all duration-300 ${
                        isWon
                          ? 'bg-gradient-to-tr from-cyan-400 to-emerald-400 border border-white shadow-[0_0_12px_#00f5ff] scale-110'
                          : 'bg-slate-900/90 border border-slate-700/80 shadow-inner'
                      }`}
                      title={`Round Win ${i + 1} ${isWon ? '(Won)' : '(Needed)'}`}
                    >
                      {isWon && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Center: Match Timer & Danger Warning (No 5-round track below!) */}
        <div className="flex flex-col items-center">
          <div className={`px-5 py-2 rounded-2xl border backdrop-blur-md shadow-2xl flex items-center gap-2.5 transition-all duration-200 ${
            state.timeRemaining <= 15
              ? 'bg-rose-950/85 border-rose-500/80 shadow-[0_0_25px_rgba(244,63,94,0.5)] animate-pulse'
              : 'bg-slate-900/90 border-slate-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
          }`}>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
              state.timeRemaining <= 15 ? 'bg-rose-500/30 text-rose-300' : 'bg-amber-500/20 text-amber-400'
            }`}>
              <Timer className={`w-4 h-4 ${state.timeRemaining <= 15 ? 'animate-spin' : ''}`} />
            </div>
            <span className={`text-xl md:text-2xl font-black tracking-widest font-mono ${
              state.timeRemaining <= 15 ? 'text-rose-400' : 'text-amber-400'
            }`}>
              {formatTime(state.timeRemaining)}
            </span>
          </div>

          {/* Warning Text Banner when arena is collapsing or sudden death */}
          {state.warningText && (
            <div className="mt-2 px-3.5 py-1 bg-red-600/95 text-white font-black text-xs tracking-wider uppercase rounded-full shadow-[0_0_15px_rgba(239,68,68,0.7)] border border-red-300 animate-bounce">
              {state.warningText}
            </div>
          )}
        </div>

        {/* Right: Opponent Card & Header Actions (Locker & Settings) */}
        <div className="flex flex-col items-end gap-1.5">
          {/* Mini Action Pills (Locker & Settings) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenShowcase}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-400/50 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer text-amber-300 text-xs font-black uppercase tracking-wider"
              title="Open Champion Locker & 360 Showcase"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Locker</span>
            </button>

            <button
              onClick={openSettings}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900/85 hover:bg-slate-800/90 backdrop-blur-md border border-slate-700/80 hover:border-cyan-500/50 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer text-slate-200 text-xs font-black uppercase tracking-wider"
              title="Open Battle Settings"
            >
              <Settings className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>

          {/* Opponent Card */}
          {(() => {
            const botChamp = CHAMPIONS.kage;
            return (
              <div className="flex flex-col items-end gap-1.5">
                <div className="flex items-center gap-2.5 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-purple-500/40 shadow-xl shadow-purple-950/30">
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-[9px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-md border border-purple-400/40">
                        RIVAL
                      </span>
                      <span className="text-sm font-black text-purple-300 tracking-wide">
                        ShadowNinja
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold leading-none mt-0.5">
                      {botChamp.archetype}
                    </div>
                  </div>
                  <div className="relative w-10 h-10 rounded-xl bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center shadow-md overflow-hidden">
                    {getChampionAvatar('kage')}
                    <span className="absolute bottom-0 left-0 w-2.5 h-2.5 rounded-full bg-rose-500 border border-slate-950 shadow-[0_0_6px_#f43f5e]" />
                  </div>
                </div>

                {/* Round Victory Diamonds (Underneath Opponent Icon) */}
                <div className="flex items-center gap-2 mr-1 justify-end">
                  {[0, 1, 2].map((i) => {
                    const isWon = i < state.botRoundWins;
                    return (
                      <div
                        key={i}
                        className={`relative w-4 h-4 rotate-45 rounded-xs flex items-center justify-center transition-all duration-300 ${
                          isWon
                            ? 'bg-gradient-to-tr from-purple-500 to-rose-400 border border-white shadow-[0_0_12px_#c084fc] scale-110'
                            : 'bg-slate-900/90 border border-slate-700/80 shadow-inner'
                        }`}
                        title={`Bot Round Win ${i + 1} ${isWon ? '(Won)' : '(Needed)'}`}
                      >
                        {isWon && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
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
          onLostPointerCapture={handlePointerUp}
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
              onLostPointerCapture={handleDashPointerUp}
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
            ) : state.winner === 'bot' ? (
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
            ) : (
              <>
                <div className="w-20 h-20 mx-auto rounded-full bg-slate-100/10 border-2 border-white/80 flex items-center justify-center mb-3 shadow-lg shadow-white/30 animate-pulse">
                  <Shield className="w-10 h-10 text-white drop-shadow-md" />
                </div>
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
                  MATCH DRAW!
                </h2>
                <p className="text-slate-300 text-sm mt-1">
                  STALEMATE — The match concluded without a victor ({state.playerRoundWins} - {state.botRoundWins})!
                </p>

                {/* Stalemate Split Rewards */}
                <div className="grid grid-cols-3 gap-2 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3 my-4">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Trophies</div>
                    <div className="text-lg font-black text-slate-200">+10 🏆</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Gold</div>
                    <div className="text-lg font-black text-yellow-300">+50 🟡</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Account XP</div>
                    <div className="text-lg font-black text-cyan-400">+60 ⭐</div>
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

      {/* 4. HIGH-END GAME SETTINGS MODAL */}
      {(isSettingsOpen || (state.isPaused && !state.isGameOver)) && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 pointer-events-auto z-50 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-700/90 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] text-left animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Settings className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-wider text-white uppercase">
                    Battle Settings
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold">
                    Audio, camera view & match controls
                  </p>
                </div>
              </div>
              <button
                onClick={closeSettings}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                title="Close Settings"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Section 1: Audio Settings */}
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                      soundEnabled
                        ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-400'
                        : 'bg-rose-500/20 border-rose-400/50 text-rose-400'
                    }`}>
                      {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Sound Effects & Audio</div>
                      <div className="text-xs text-slate-400">Dash impact, ring-outs & environment</div>
                    </div>
                  </div>

                  <button
                    onClick={toggleSound}
                    className={`px-4 py-2 rounded-xl font-black text-xs tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                      soundEnabled
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {soundEnabled ? 'Enabled' : 'Muted'}
                  </button>
                </div>
              </div>

              {/* Section 2: Camera View Selection */}
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-black tracking-wider text-slate-300 uppercase">
                    Camera View Angle
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      id: 'third_person' as CameraMode,
                      name: 'Action Cam',
                      desc: 'Over-the-shoulder chase view',
                      icon: <Eye className="w-4 h-4" />,
                    },
                    {
                      id: 'isometric' as CameraMode,
                      name: 'Overhead',
                      desc: 'Brawl Stars tactical ring view',
                      icon: <Camera className="w-4 h-4" />,
                    },
                    {
                      id: 'close_action' as CameraMode,
                      name: 'Close Combat',
                      desc: 'Tight cinematic brawler angle',
                      icon: <Zap className="w-4 h-4" />,
                    },
                  ].map((mode) => {
                    const isSelected = state.cameraMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => onCameraChange(mode.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-500/20'
                            : 'bg-slate-900/70 border-slate-700/70 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={isSelected ? 'text-cyan-400' : 'text-slate-400'}>
                            {mode.icon}
                          </span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f5ff]" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold">{mode.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{mode.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Controls Quick Guide */}
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
                <span className="text-xs font-black tracking-wider text-slate-300 uppercase block mb-2.5">
                  Controls Reference
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60">
                    <span className="text-slate-400 text-[10px] block font-bold uppercase mb-0.5">Move</span>
                    <span className="font-mono font-bold text-cyan-300">WASD / Stick</span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60">
                    <span className="text-slate-400 text-[10px] block font-bold uppercase mb-0.5">Dash</span>
                    <span className="font-mono font-bold text-amber-300">Space / Tap</span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60">
                    <span className="text-slate-400 text-[10px] block font-bold uppercase mb-0.5">Aim</span>
                    <span className="font-mono font-bold text-purple-300">Drag Button</span>
                  </div>
                </div>
              </div>

              {/* Section 4: Modal Actions */}
              <div className="pt-2 space-y-2.5">
                <button
                  onClick={closeSettings}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm tracking-wider uppercase rounded-2xl shadow-lg shadow-cyan-500/30 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Resume Battle
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      closeSettings();
                      onRestart();
                    }}
                    className="py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restart Match
                  </button>
                  <button
                    onClick={() => {
                      closeSettings();
                      onOpenShowcase();
                    }}
                    className="py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-400/50 text-amber-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Change Champion
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
