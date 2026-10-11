import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { GameState, CameraMode } from '../game/GameEngine';
import { sounds } from '../audio/soundManager';
import { CHAMPIONS, type ChampionId } from '../game/championModels';
import {
  Volume2,
  VolumeX,
  Music,
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
  Gamepad2,
  Check,
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
          <rect x="10" y="10" width="16" height="16" rx="3" fill="#b45309" stroke="#fbbf24" strokeWidth="1.5" />
          <rect x="13" y="14" width="10" height="3.5" rx="1" fill="#451a03" />
          <circle cx="15.5" cy="15.8" r="1" fill="#ef4444" />
          <circle cx="20.5" cy="15.8" r="1" fill="#ef4444" />
          <path d="M12 21H24" stroke="#fbbf24" strokeWidth="2" />
        </svg>
      );
    case 'kage':
      return (
        <svg viewBox="0 0 36 36" className="w-6 h-6" fill="none">
          <circle cx="18" cy="18" r="16" fill="#1e1035" stroke="#a855f7" strokeWidth="2" />
          <path d="M9 13C9 7 13 5 18 5C23 5 27 7 27 13V24C27 24 23 27 18 27C13 27 9 24 9 24V13Z" fill="#2e1065" />
          <ellipse cx="14" cy="17" rx="3" ry="1.8" fill="#c084fc" />
          <ellipse cx="22" cy="17" rx="3" ry="1.8" fill="#c084fc" />
          <circle cx="14" cy="17" r="1" fill="#ffffff" />
          <circle cx="22" cy="17" r="1" fill="#ffffff" />
          <path d="M15 22L18 20L21 22" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'bolt':
      return (
        <svg viewBox="0 0 36 36" className="w-6 h-6" fill="none">
          <circle cx="18" cy="18" r="16" fill="#451a03" stroke="#eab308" strokeWidth="2" />
          <path d="M11 9L15 15H9L11 9Z" fill="#ca8a04" />
          <path d="M25 9L21 15H27L25 9Z" fill="#ca8a04" />
          <circle cx="18" cy="19" r="7" fill="#eab308" />
          <circle cx="15" cy="18" r="1.5" fill="#451a03" />
          <circle cx="21" cy="18" r="1.5" fill="#451a03" />
          <ellipse cx="18" cy="22" rx="2" ry="1.2" fill="#78350f" />
        </svg>
      );
    default:
      return (
        <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center font-black text-cyan-400 text-xs">
          ★
        </div>
      );
  }
}

interface ControlPos {
  x: number;
  y: number;
}

interface ControlLayout {
  joystick: ControlPos;
  dash: ControlPos;
}

const getDefaultLayout = (): ControlLayout => {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1000;
  const h = typeof window !== 'undefined' ? window.innerHeight : 700;
  return {
    joystick: { x: 24, y: Math.max(140, h - 160) },
    dash: { x: Math.max(160, w - 144), y: Math.max(140, h - 160) },
  };
};

interface BattleHUDProps {
  state: GameState;
  selectedChampion?: ChampionId;
  onOpenShowcase?: () => void;
  onDash: (aimX?: number, aimZ?: number) => void;
  onAimChange: (isAiming: boolean, aimX?: number, aimZ?: number) => void;
  onJoystickMove: (x: number, z: number) => void;
  onCameraChange: (mode: CameraMode) => void;
  onTogglePause: () => void;
  onRestart: () => void;
}

export const BattleHUD: React.FC<BattleHUDProps> = ({
  state,
  selectedChampion,
  onOpenShowcase,
  onDash,
  onAimChange,
  onJoystickMove,
  onCameraChange,
  onTogglePause,
  onRestart,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(sounds.enabled);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [volumeLevel, setVolumeLevel] = useState(Math.round(sounds.volume * 100));
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // HUD Customization Mode
  const [isCustomizingHUD, setIsCustomizingHUD] = useState(false);
  const [controlsLayout, setControlsLayout] = useState<ControlLayout>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ringout_hud_controls_layout_v2');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.joystick && parsed.dash) {
            return parsed;
          }
        }
      } catch {}
    }
    return getDefaultLayout();
  });
  const [tempLayout, setTempLayout] = useState<ControlLayout>(controlsLayout);
  const [activeCustomDrag, setActiveCustomDrag] = useState<'joystick' | 'dash' | null>(null);
  const customDragOffsetRef = useRef<ControlPos>({ x: 0, y: 0 });

  // Joystick state
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [touchPos, setTouchPos] = useState<{ x: number; y: number } | null>(null);
  const [stickOffset, setStickOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  // Dash Button (Option C: Hold & Drag to Aim, Quick Tap to Dash)
  const dashTouchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isAimingRef = useRef(false);

  // Ensure controls stay within screen bounds on window resize
  useEffect(() => {
    const handleResize = () => {
      setControlsLayout((prev) => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const joyX = Math.max(16, Math.min(w - 148, prev.joystick.x));
        const joyY = Math.max(125, Math.min(h - 160, prev.joystick.y));
        const dashX = Math.max(16, Math.min(w - 140, prev.dash.x));
        const dashY = Math.max(125, Math.min(h - 160, prev.dash.y));
        return {
          joystick: { x: joyX, y: joyY },
          dash: { x: dashX, y: dashY },
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    sounds.enabled = next;
    setSoundEnabled(next);
    if (next) {
      sounds.playBump(1.0);
    }
  };

  const toggleMusic = () => {
    setMusicEnabled((prev) => !prev);
    if (soundEnabled) {
      sounds.playBump(0.6);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseInt(e.target.value, 10);
    setVolumeLevel(vol);
    sounds.volume = vol / 100;
  };

  const openSettings = () => {
    setIsSettingsOpen(true);
    if (!state.isPaused) {
      onTogglePause();
    }
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
    if (state.isPaused && !isCustomizingHUD) {
      onTogglePause();
    }
  };

  // Start Customization Mode
  const startCustomization = () => {
    setIsSettingsOpen(false);
    setTempLayout(controlsLayout);
    setIsCustomizingHUD(true);
    if (!state.isPaused) {
      onTogglePause();
    }
    sounds.playBump(0.8);
  };

  const handleSaveLayout = () => {
    setControlsLayout(tempLayout);
    try {
      localStorage.setItem('ringout_hud_controls_layout_v2', JSON.stringify(tempLayout));
    } catch {}
    setIsCustomizingHUD(false);
    sounds.playBump(1.2);
    if (state.isPaused) {
      onTogglePause();
    }
  };

  const handleResetLayout = () => {
    const def = getDefaultLayout();
    setTempLayout(def);
    sounds.playBump(0.8);
  };

  const handleCancelCustomizing = () => {
    setTempLayout(controlsLayout);
    setIsCustomizingHUD(false);
    if (state.isPaused) {
      onTogglePause();
    }
  };

  // Dragging handlers for Customization Mode
  const handleCustomPointerDown = (type: 'joystick' | 'dash', e: React.PointerEvent) => {
    if (!isCustomizingHUD) return;
    e.stopPropagation();
    e.preventDefault();
    setActiveCustomDrag(type);
    const cur = tempLayout[type];
    customDragOffsetRef.current = {
      x: e.clientX - cur.x,
      y: e.clientY - cur.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleCustomPointerMove = (e: React.PointerEvent) => {
    if (!isCustomizingHUD || !activeCustomDrag) return;
    e.stopPropagation();
    e.preventDefault();
    const w = window.innerWidth;
    const h = window.innerHeight;
    const rawX = e.clientX - customDragOffsetRef.current.x;
    const rawY = e.clientY - customDragOffsetRef.current.y;

    const isJoy = activeCustomDrag === 'joystick';
    const elemW = isJoy ? 128 : 112;
    const elemH = isJoy ? 128 : 112;

    // Strict boundary enforcement: Y >= 125px so it NEVER overlaps top player/opponent cards or timer!
    const clampedX = Math.max(16, Math.min(w - elemW - 16, rawX));
    const clampedY = Math.max(125, Math.min(h - elemH - 24, rawY));

    setTempLayout((prev) => ({
      ...prev,
      [activeCustomDrag]: { x: clampedX, y: clampedY },
    }));
  };

  const handleCustomPointerUp = (e: React.PointerEvent) => {
    if (activeCustomDrag) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setActiveCustomDrag(null);
    }
  };

  // Normal Gameplay Joystick touch handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isCustomizingHUD) return;
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
    if (isCustomizingHUD) return;
    isDraggingRef.current = false;
    setStickOffset({ x: 0, y: 0 });
    onJoystickMove(0, 0);
  }, [isCustomizingHUD, onJoystickMove]);

  // Normal Gameplay Dash Button handlers (Option C)
  const handleDashPointerDown = (e: React.PointerEvent) => {
    if (isCustomizingHUD) return;
    if (state.playerCharge < 10 || state.isGameOver || state.isPaused) return;
    dashTouchStartRef.current = { x: e.clientX, y: e.clientY };
    isAimingRef.current = false;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleDashPointerMove = (e: React.PointerEvent) => {
    if (isCustomizingHUD) return;
    if (!dashTouchStartRef.current) return;
    const dx = e.clientX - dashTouchStartRef.current.x;
    const dy = e.clientY - dashTouchStartRef.current.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 15) {
      isAimingRef.current = true;
      const angle = Math.atan2(dy, dx);
      onAimChange(true, Math.cos(angle), Math.sin(angle));
    }
  };

  const handleDashPointerUp = (e: React.PointerEvent) => {
    if (isCustomizingHUD) return;
    if (!dashTouchStartRef.current) return;

    if (isAimingRef.current) {
      const dx = e.clientX - dashTouchStartRef.current.x;
      const dy = e.clientY - dashTouchStartRef.current.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 15) {
        const angle = Math.atan2(dy, dx);
        onDash(Math.cos(angle), Math.sin(angle));
      }
    } else {
      onDash();
    }

    dashTouchStartRef.current = null;
    isAimingRef.current = false;
    onAimChange(false);
  };

  // Format time MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const charge = Math.min(100, Math.max(0, state.playerCharge));
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

  const activeLayout = isCustomizingHUD ? tempLayout : controlsLayout;

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
              {state.playerRoundWins === 2 || state.botRoundWins === 2
                ? '★ MATCH POINT'
                : 'Knock Opponent Off The Island!'}
            </p>
          </div>
        </div>
      )}

      {/* ROUND VICTORY / LOSS BANNER */}
      {state.roundBannerText && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40 bg-black/40 backdrop-blur-xs">
          <div className="text-center animate-in zoom-in-50 duration-200">
            <div
              className={`text-6xl md:text-8xl font-black italic tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] ${
                state.roundBannerType === 'player'
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-300 to-teal-400 drop-shadow-[0_0_35px_rgba(0,245,255,0.7)]'
                  : state.roundBannerType === 'bot'
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-red-400 to-orange-500 drop-shadow-[0_0_35px_rgba(244,63,94,0.7)]'
                  : 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400'
              }`}
            >
              {state.roundBannerText}
            </div>
            {state.roundBannerType && (
              <p className="text-sm md:text-base font-black tracking-widest uppercase text-white/90 mt-2">
                {state.roundBannerType === 'player'
                  ? 'ROUND CLAIMED! +1 POINT'
                  : state.roundBannerType === 'bot'
                  ? 'RING OUT! OPPONENT SCORED'
                  : 'TIME EXPIRED'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 1. TOP HEADER STATUS (LEVEL ALIGNMENT FOR BOTH PLAYER AND OPPONENT) */}
      <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 flex items-start justify-between pointer-events-auto z-50">
        {/* Left: Player Champion Card & Solid White Round Wins */}
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

              {/* Round Victory Diamonds - TURNS SOLID PURE WHITE ON WIN (SHADOW FIGHT STYLE) */}
              <div className="flex items-center gap-2 ml-1">
                {[0, 1, 2].map((i) => {
                  const isWon = i < state.playerRoundWins;
                  return (
                    <div
                      key={i}
                      className={`relative w-4 h-4 rotate-45 rounded-xs flex items-center justify-center transition-all duration-300 ${
                        isWon
                          ? 'bg-white border-2 border-white shadow-[0_0_14px_rgba(255,255,255,1)] scale-110'
                          : 'bg-black/70 border border-white/40 shadow-inner'
                      }`}
                      title={`Round Win ${i + 1} ${isWon ? '(Won)' : '(Needed)'}`}
                    >
                      {isWon && <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Center: Command Cluster (Locker, Timer & Pause/Settings all horizontally unified) */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            {/* Locker Button */}
            <button
              onClick={onOpenShowcase}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-amber-400/50 hover:border-amber-300 rounded-2xl shadow-xl transition-all cursor-pointer text-amber-300 active:scale-95 text-xs font-black uppercase tracking-wider"
              title="Open Champion Locker & 360 Showcase"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Locker</span>
            </button>

            {/* Central Arcade Timer */}
            <div
              className={`px-4 sm:px-5 py-2 rounded-2xl border backdrop-blur-md shadow-2xl flex items-center gap-2 transition-all duration-200 ${
                state.timeRemaining <= 15
                  ? 'bg-rose-950/85 border-rose-500/80 shadow-[0_0_25px_rgba(244,63,94,0.5)] animate-pulse'
                  : 'bg-slate-900/90 border-slate-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  state.timeRemaining <= 15 ? 'bg-rose-500/30 text-rose-300' : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                <Timer className={`w-4 h-4 ${state.timeRemaining <= 15 ? 'animate-spin' : ''}`} />
              </div>
              <span
                className={`text-xl md:text-2xl font-black tracking-widest font-mono ${
                  state.timeRemaining <= 15 ? 'text-rose-400' : 'text-amber-400'
                }`}
              >
                {formatTime(state.timeRemaining)}
              </span>
            </div>

            {/* Pause & Settings Button */}
            <button
              onClick={openSettings}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700/80 hover:border-cyan-400/60 rounded-2xl shadow-xl transition-all cursor-pointer text-slate-200 active:scale-95 text-xs font-black uppercase tracking-wider"
              title="Open Pause & Settings"
            >
              <Settings className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Pause</span>
            </button>
          </div>

          {/* Warning Text Banner when arena is collapsing or sudden death */}
          {state.warningText && (
            <div className="mt-2 px-3.5 py-1 bg-red-600/95 text-white font-black text-xs tracking-wider uppercase rounded-full shadow-[0_0_15px_rgba(239,68,68,0.7)] border border-red-300 animate-bounce">
              {state.warningText}
            </div>
          )}
        </div>

        {/* Right: Opponent Identity Card & Solid White Round Wins (EXACT SAME Y-LEVEL AS LEFT) */}
        {(() => {
          const botChamp = CHAMPIONS.kage;
          return (
            <div className="flex flex-col items-end gap-1.5">
              {/* Opponent Card */}
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

              {/* Round Victory Diamonds - TURNS SOLID PURE WHITE ON WIN (SHADOW FIGHT STYLE) */}
              <div className="flex items-center gap-2 mr-1 justify-end">
                {[0, 1, 2].map((i) => {
                  const isWon = i < state.botRoundWins;
                  return (
                    <div
                      key={i}
                      className={`relative w-4 h-4 rotate-45 rounded-xs flex items-center justify-center transition-all duration-300 ${
                        isWon
                          ? 'bg-white border-2 border-white shadow-[0_0_14px_rgba(255,255,255,1)] scale-110'
                          : 'bg-black/70 border border-white/40 shadow-inner'
                      }`}
                      title={`Bot Round Win ${i + 1} ${isWon ? '(Won)' : '(Needed)'}`}
                    >
                      {isWon && <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>

      {/* CUSTOMIZATION MODE OVERLAY & SAFE ZONE BOUNDARY */}
      {isCustomizingHUD && (
        <>
          {/* Top Safe Area Barrier (Prevents overlapping Player & Opponent cards) */}
          <div className="absolute top-[116px] left-4 right-4 pointer-events-none z-40 border-b-2 border-dashed border-rose-500/60 pb-1 flex items-center justify-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-300 bg-rose-950/90 px-3 py-1 rounded-full border border-rose-500/50 shadow-lg">
              🔒 Safe Boundary: Controls restricted below this line to protect Player Cards
            </span>
          </div>

          {/* Customization Action Bar */}
          <div className="absolute top-28 left-1/2 -translate-x-1/2 z-50 pointer-events-auto animate-in slide-in-from-top-4 duration-200">
            <div className="bg-slate-900/95 border-2 border-cyan-400 rounded-3xl p-3 sm:px-6 sm:py-3 shadow-[0_0_35px_rgba(0,245,255,0.4)] flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center gap-2 mr-2">
                <Gamepad2 className="w-5 h-5 text-cyan-400 animate-pulse" />
                <div className="text-left">
                  <div className="text-xs font-black uppercase tracking-wider text-cyan-300">
                    Customization Mode
                  </div>
                  <div className="text-[10px] text-slate-300 font-semibold hidden sm:block">
                    Drag controls anywhere below top banner
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetLayout}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
                >
                  Reset Default
                </button>
                <button
                  onClick={handleSaveLayout}
                  className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/30 cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save & Apply
                </button>
                <button
                  onClick={handleCancelCustomizing}
                  className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/50 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 2. REPOSITIONABLE TOUCH CONTROLS (JOYSTICK & DASH) */}
      {/* 2A. FLOATING VIRTUAL JOYSTICK */}
      <div
        style={{
          position: 'absolute',
          left: `${activeLayout.joystick.x}px`,
          top: `${activeLayout.joystick.y}px`,
        }}
        onPointerDown={(e) => isCustomizingHUD && handleCustomPointerDown('joystick', e)}
        onPointerMove={(e) => isCustomizingHUD && handleCustomPointerMove(e)}
        onPointerUp={(e) => isCustomizingHUD && handleCustomPointerUp(e)}
        className={`pointer-events-auto touch-none select-none transition-shadow ${
          isCustomizingHUD
            ? 'cursor-grab active:cursor-grabbing p-1 rounded-full border-2 border-dashed border-cyan-400 bg-cyan-500/15 shadow-[0_0_20px_rgba(0,245,255,0.4)]'
            : ''
        }`}
      >
        {isCustomizingHUD && (
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-black uppercase tracking-widest text-cyan-300 bg-slate-900/90 px-2 py-0.5 rounded-full border border-cyan-400/50">
            ✥ Drag Joystick
          </span>
        )}

        <div
          ref={joystickBaseRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onLostPointerCapture={handlePointerUp}
          className={`relative w-32 h-32 rounded-full bg-slate-900/70 backdrop-blur-md border-2 border-cyan-500/50 shadow-2xl flex items-center justify-center touch-none ${
            isCustomizingHUD ? 'pointer-events-none' : 'cursor-grab active:cursor-grabbing'
          }`}
        >
          <div
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-400 border border-white/60 shadow-lg flex items-center justify-center transition-transform duration-75"
            style={{
              transform: `translate(${stickOffset.x}px, ${stickOffset.y}px)`,
            }}
          >
            <div className="w-4 h-4 rounded-full bg-white/80" />
          </div>
          <span className="absolute -bottom-5 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            WASD / Move
          </span>
        </div>
      </div>

      {/* 2B. REPOSITIONABLE POWER DASH BUTTON */}
      <div
        style={{
          position: 'absolute',
          left: `${activeLayout.dash.x}px`,
          top: `${activeLayout.dash.y}px`,
        }}
        onPointerDown={(e) => isCustomizingHUD && handleCustomPointerDown('dash', e)}
        onPointerMove={(e) => isCustomizingHUD && handleCustomPointerMove(e)}
        onPointerUp={(e) => isCustomizingHUD && handleCustomPointerUp(e)}
        className={`pointer-events-auto touch-none select-none transition-shadow ${
          isCustomizingHUD
            ? 'cursor-grab active:cursor-grabbing p-1 rounded-3xl border-2 border-dashed border-amber-400 bg-amber-500/15 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
            : ''
        }`}
      >
        {isCustomizingHUD && (
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-black uppercase tracking-widest text-amber-300 bg-slate-900/90 px-2 py-0.5 rounded-full border border-amber-400/50">
            ✥ Drag Dash
          </span>
        )}

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
              disabled={!isReady || isCustomizingHUD}
              className={`w-20 h-20 rounded-full border-2 border-white/80 shadow-2xl flex flex-col items-center justify-center transition-all ${
                isCustomizingHUD
                  ? 'pointer-events-none opacity-80'
                  : isReady
                  ? `bg-gradient-to-tr ${buttonGradient} cursor-pointer active:scale-90`
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
      {state.isGameOver && !isCustomizingHUD && (
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
                    <div className="text-lg font-black text-yellow-300">+120 🟡</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Account XP</div>
                    <div className="text-lg font-black text-cyan-400">+150 ⭐</div>
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
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-base rounded-2xl shadow-lg shadow-cyan-500/30 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}

      {/* 4. HIGH-PRODUCTION MOBILE PAUSE & SETTINGS MODAL (INSPIRED BY SAMPLE POPUP) */}
      {(isSettingsOpen || (state.isPaused && !state.isGameOver && !isCustomizingHUD)) && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 pointer-events-auto z-50 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#29b6f6] via-[#0288d1] to-[#01579b] border-4 border-[#81d4fa] rounded-[36px] pt-9 p-6 pb-6 shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_2px_10px_rgba(255,255,255,0.4)] text-center animate-in zoom-in-95 duration-150">
            {/* Top Glossy Golden-Orange 3D Ribbon: "PAUSE" */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#d97706] border-2 border-[#fef08a] px-10 py-1.5 rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.5)]">
              <span className="text-xl md:text-2xl font-black tracking-widest text-[#78350f] uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                PAUSE
              </span>
            </div>

            {/* Close X Button in top right corner */}
            <button
              onClick={closeSettings}
              className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-rose-500 hover:bg-rose-400 border-2 border-white flex items-center justify-center text-white transition-all cursor-pointer active:scale-90 shadow-lg shadow-rose-950/50"
              title="Close Settings"
            >
              <X className="w-5 h-5 stroke-[3]" />
            </button>

            {/* Inner Content Area */}
            <div className="space-y-4 text-left mt-2">
              {/* Row 1: Sound Effects Toggle (3D Green Pill Slider Switch) */}
              <div className="bg-[#02568f]/80 border-2 border-[#81d4fa]/40 rounded-2xl p-3 flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-md">
                    {soundEnabled ? (
                      <Volume2 className="w-5 h-5 text-white drop-shadow" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-white/80" />
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-black text-white tracking-wide block">
                      Sound Effects
                    </span>
                    <span className="text-[10px] text-sky-200 font-semibold">
                      Collisions & action audio
                    </span>
                  </div>
                </div>

                {/* Tactile 3D ON / OFF Pill Toggle */}
                <button
                  onClick={toggleSound}
                  className="bg-[#013f6b] p-1 rounded-full border border-sky-300/40 flex items-center cursor-pointer shadow-inner transition-all"
                >
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                      soundEnabled
                        ? 'bg-gradient-to-b from-[#84cc16] to-[#4d7c0f] text-white shadow-[0_2px_4px_rgba(0,0,0,0.3)] border border-[#bef264]'
                        : 'text-sky-300 opacity-60'
                    }`}
                  >
                    ON
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                      !soundEnabled
                        ? 'bg-gradient-to-b from-slate-400 to-slate-600 text-white shadow-[0_2px_4px_rgba(0,0,0,0.3)] border border-slate-300'
                        : 'text-sky-300 opacity-60'
                    }`}
                  >
                    OFF
                  </span>
                </button>
              </div>

              {/* Row 2: Music / Ambience Toggle */}
              <div className="bg-[#02568f]/80 border-2 border-[#81d4fa]/40 rounded-2xl p-3 flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-md">
                    <Music className="w-5 h-5 text-white drop-shadow" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-white tracking-wide block">
                      Music & Atmosphere
                    </span>
                    <span className="text-[10px] text-sky-200 font-semibold">
                      Ocean waves & battle breeze
                    </span>
                  </div>
                </div>

                {/* Tactile 3D ON / OFF Pill Toggle */}
                <button
                  onClick={toggleMusic}
                  className="bg-[#013f6b] p-1 rounded-full border border-sky-300/40 flex items-center cursor-pointer shadow-inner transition-all"
                >
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                      musicEnabled
                        ? 'bg-gradient-to-b from-[#84cc16] to-[#4d7c0f] text-white shadow-[0_2px_4px_rgba(0,0,0,0.3)] border border-[#bef264]'
                        : 'text-sky-300 opacity-60'
                    }`}
                  >
                    ON
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                      !musicEnabled
                        ? 'bg-gradient-to-b from-slate-400 to-slate-600 text-white shadow-[0_2px_4px_rgba(0,0,0,0.3)] border border-slate-300'
                        : 'text-sky-300 opacity-60'
                    }`}
                  >
                    OFF
                  </span>
                </button>
              </div>

              {/* Row 3: Master Volume Slider (Candy Striped Green Bar from Image 4) */}
              <div className="bg-[#02568f]/80 border-2 border-[#81d4fa]/40 rounded-2xl p-3 shadow-inner">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-sky-200 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-white" /> Volume Level
                  </span>
                  <span className="text-xs font-black font-mono text-lime-300">
                    {volumeLevel}%
                  </span>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volumeLevel}
                    onChange={handleVolumeChange}
                    className="w-full h-3.5 bg-[#013f6b] rounded-full appearance-none cursor-pointer accent-lime-400 border border-sky-300/50 shadow-inner"
                  />
                </div>
              </div>

              {/* Row 4: Camera Mode Selector ("camer option which pop up and the gamer choose the camera he wants") */}
              <div className="bg-[#02568f]/80 border-2 border-[#81d4fa]/40 rounded-2xl p-3 shadow-inner">
                <div className="flex items-center gap-1.5 mb-2">
                  <Camera className="w-4 h-4 text-cyan-300" />
                  <span className="text-xs font-black uppercase tracking-wider text-sky-200">
                    Camera View Angle
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'third_person' as CameraMode, name: 'Action Cam', icon: <Eye className="w-3.5 h-3.5" /> },
                    { id: 'isometric' as CameraMode, name: 'Overhead', icon: <Camera className="w-3.5 h-3.5" /> },
                    { id: 'close_action' as CameraMode, name: 'Close Combat', icon: <Zap className="w-3.5 h-3.5" /> },
                  ].map((mode) => {
                    const isSelected = state.cameraMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => onCameraChange(mode.id)}
                        className={`py-2 px-2 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-b from-[#84cc16] to-[#4d7c0f] text-white font-black shadow-md border border-[#bef264] scale-105'
                            : 'bg-[#013f6b] text-sky-200 font-bold hover:bg-[#014e85] border border-sky-300/30'
                        }`}
                      >
                        <span className="text-xs">{mode.icon}</span>
                        <span className="text-[10px] leading-tight font-black">{mode.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 5: CUSTOMIZATION Mode Button ("add the change control option in which he could customize to put where he want the controls") */}
              <button
                onClick={startCustomization}
                className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 border-2 border-cyan-300 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 group"
              >
                <Gamepad2 className="w-4 h-4 text-cyan-300 group-hover:rotate-12 transition-transform" />
                <span>Customization (Change Controls Layout)</span>
              </button>

              {/* Bottom 3D Buttons (Sample Image 4 Style: Bubbly Green Play/Resume, Yellow Restart, Blue Locker) */}
              <div className="pt-2 grid grid-cols-3 gap-2">
                {/* 1. Play / Resume Button */}
                <button
                  onClick={closeSettings}
                  className="py-3 bg-gradient-to-b from-[#a3e635] via-[#65a30d] to-[#4d7c0f] hover:from-[#bef264] hover:to-[#65a30d] text-white font-black text-sm uppercase tracking-wider rounded-2xl border-2 border-lime-200 shadow-[0_5px_0_#365314,0_8px_16px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-[0_2px_0_#365314] transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Play</span>
                </button>

                {/* 2. Restart Match Button */}
                <button
                  onClick={() => {
                    closeSettings();
                    onRestart();
                  }}
                  className="py-3 bg-gradient-to-b from-[#facc15] via-[#eab308] to-[#ca8a04] hover:from-[#fde047] hover:to-[#eab308] text-[#78350f] font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-amber-200 shadow-[0_4px_0_#854d0e,0_6px_14px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-[0_2px_0_#854d0e] transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Restart</span>
                </button>

                {/* 3. Champions Locker Button */}
                <button
                  onClick={() => {
                    closeSettings();
                    onOpenShowcase?.();
                  }}
                  className="py-3 bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#0369a1] hover:from-[#7dd3fc] hover:to-[#0284c7] text-white font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-sky-200 shadow-[0_4px_0_#075985,0_6px_14px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-[0_2px_0_#075985] transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Locker</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
