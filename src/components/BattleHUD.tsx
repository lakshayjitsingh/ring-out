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
  X,
  Eye,
  Camera,
  Zap,
  Gamepad2,
  Check,
  Move,
  Pause,
  LogOut,
  Home,
  Tv,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { crazyGames } from '../game/crazyGamesSdk';



interface ControlSettings {
  x: number;
  y: number;
  scale?: number;     // 0.7 to 1.5 (70% - 150%)
  opacity?: number;   // 0.3 to 1.0 (30% - 100%)
}

interface ControlLayout {
  joystick: ControlSettings;
  dash: ControlSettings;
}

const getDefaultLayout = (): ControlLayout => {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1000;
  const h = typeof window !== 'undefined' ? window.innerHeight : 700;
  return {
    joystick: { x: 24, y: Math.max(16, h - 160), scale: 1.0, opacity: 1.0 },
    dash: { x: Math.max(160, w - 144), y: Math.max(16, h - 160), scale: 1.0, opacity: 1.0 },
  };
};

interface BattleHUDProps {
  state: GameState;
  selectedChampion?: ChampionId;
  botChampion?: ChampionId;
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
  botChampion,
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

  // 5-Button Pause Menu navigation: 'menu' (5 buttons) | 'sound' (sub-popup) | 'control' (sub-popup)
  const [pauseModalTab, setPauseModalTab] = useState<'menu' | 'sound' | 'control'>('menu');

  // HUD Customization Mode
  const [isCustomizingHUD, setIsCustomizingHUD] = useState(false);
  const [selectedCustomControl, setSelectedCustomControl] = useState<'joystick' | 'dash' | null>(null);
  const [controlsLayout, setControlsLayout] = useState<ControlLayout>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved =
          localStorage.getItem('ringout_hud_controls_layout_v3') ||
          localStorage.getItem('ringout_hud_controls_layout_v2');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.joystick && parsed.dash) {
            return {
              joystick: {
                x: parsed.joystick.x ?? 24,
                y: parsed.joystick.y ?? 400,
                scale: parsed.joystick.scale ?? 1.0,
                opacity: parsed.joystick.opacity ?? 1.0,
              },
              dash: {
                x: parsed.dash.x ?? 700,
                y: parsed.dash.y ?? 400,
                scale: parsed.dash.scale ?? 1.0,
                opacity: parsed.dash.opacity ?? 1.0,
              },
            };
          }
        }
      } catch {}
    }
    return getDefaultLayout();
  });
  const [tempLayout, setTempLayout] = useState<ControlLayout>(controlsLayout);
  const [activeCustomDrag, setActiveCustomDrag] = useState<'joystick' | 'dash' | null>(null);
  const customDragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

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
        const joyY = Math.max(16, Math.min(h - 160, prev.joystick.y));
        const dashX = Math.max(16, Math.min(w - 140, prev.dash.x));
        const dashY = Math.max(16, Math.min(h - 160, prev.dash.y));
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
    setPauseModalTab('menu');
    setIsSettingsOpen(true);
    if (!state.isPaused) {
      onTogglePause();
    }
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
    setPauseModalTab('menu');
    if (state.isPaused && !isCustomizingHUD) {
      onTogglePause();
    }
  };

  // CrazyGames Ad and Reward Integration
  const [hasClaimed2X, setHasClaimed2X] = useState(false);
  const [adInProgress, setAdInProgress] = useState(false);

  useEffect(() => {
    if (!state.isGameOver && state.countdown <= 0) {
      crazyGames.gameplayStart();
    }
  }, [state.countdown, state.isGameOver]);

  useEffect(() => {
    if (state.isGameOver) {
      crazyGames.gameplayStop();
      if (state.winner === 'player') {
        crazyGames.happyTime();
      }
    } else {
      setHasClaimed2X(false);
    }
  }, [state.isGameOver, state.winner]);

  const handleHomeWithAd = () => {
    sounds.playBump(0.6);
    crazyGames.requestMidgameAd({
      onFinish: () => {
        onOpenShowcase?.();
      },
    });
  };

  const handleRestartWithAd = () => {
    sounds.playBump(0.6);
    crazyGames.requestMidgameAd({
      onFinish: () => {
        onRestart();
      },
    });
  };

  const handleClaim2XReward = () => {
    if (hasClaimed2X || adInProgress) return;
    setAdInProgress(true);
    sounds.playBump(0.6);

    crazyGames.requestRewardedAd({
      onStart: () => {},
      onReward: () => {
        try {
          const curGems = parseInt(localStorage.getItem('ringout_gems') || '150', 10);
          localStorage.setItem('ringout_gems', String(curGems + 200));
        } catch {}
        sounds.playLevelUp?.();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#facc15', '#38bdf8', '#22c55e'],
        });
        setHasClaimed2X(true);
      },
      onFinish: () => {
        setAdInProgress(false);
      },
      onError: () => {
        setAdInProgress(false);
      },
    });
  };

  // Start Customization Mode
  const startCustomization = () => {
    setIsSettingsOpen(false);
    setPauseModalTab('menu');
    setTempLayout(controlsLayout);
    setSelectedCustomControl(null);
    setIsCustomizingHUD(true);
    if (!state.isPaused) {
      onTogglePause();
    }
    sounds.playBump(0.8);
  };

  // Save & Apply: Return to Settings/Pause modal instead of resuming play immediately
  const handleSaveLayout = () => {
    setControlsLayout(tempLayout);
    try {
      localStorage.setItem('ringout_hud_controls_layout_v3', JSON.stringify(tempLayout));
    } catch {}
    setIsCustomizingHUD(false);
    setIsSettingsOpen(true);
    setPauseModalTab('menu');
    sounds.playBump(1.2);
  };

  const handleResetLayout = () => {
    const def = getDefaultLayout();
    setTempLayout(def);
    sounds.playBump(0.8);
  };

  // Cancel: Return to Settings/Pause modal
  const handleCancelCustomizing = () => {
    setTempLayout(controlsLayout);
    setIsCustomizingHUD(false);
    setIsSettingsOpen(true);
    setPauseModalTab('menu');
  };

  // Dragging handlers for Customization Mode
  const handleCustomPointerDown = (type: 'joystick' | 'dash', e: React.PointerEvent) => {
    if (!isCustomizingHUD) return;
    e.stopPropagation();
    e.preventDefault();
    setSelectedCustomControl(type);
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

    // Full freedom to move controls anywhere across the screen (top, bottom, sides)
    const clampedX = Math.max(16, Math.min(w - elemW - 16, rawX));
    const clampedY = Math.max(16, Math.min(h - elemH - 16, rawY));

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

  // Raw seconds for fight timer (No "00:", just the number like Shadow Fight 4!)
  const remainingSeconds = Math.max(0, Math.ceil(state.timeRemaining));

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
  let buttonGradient = 'from-cyan-600 to-blue-500 shadow-cyan-500/40';

  if (charge >= 99) {
    ringColor = '#ff0055';
    buttonGradient = 'from-rose-500 via-amber-500 to-yellow-400 shadow-rose-500/60 animate-pulse';
  } else if (charge >= 70) {
    ringColor = '#f59e0b';
    buttonGradient = 'from-amber-600 to-orange-500 shadow-amber-500/40';
  } else if (charge >= 40) {
    ringColor = '#8b5cf6';
    buttonGradient = 'from-purple-600 to-indigo-500 shadow-purple-500/40';
  }

  const activeLayout = isCustomizingHUD ? tempLayout : controlsLayout;

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden font-sans text-white">
      {/* 0. COUNTDOWN OVERLAY */}
      {state.countdown > 0 && !state.isGameOver && !state.roundBannerText && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40 bg-black/30 backdrop-blur-xs">
          <div className="text-center animate-in zoom-in-75 duration-150">
            <div className="text-8xl md:text-9xl font-black italic tracking-normal px-8 py-2 inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 drop-shadow-[0_10px_25px_rgba(245,158,11,0.6)]">
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
              className={`text-6xl md:text-8xl font-black italic tracking-normal px-8 py-2 inline-block drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] ${
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

      {/* 1. TOP HEADER STATUS (SHADOW FIGHT 4 STYLE: NO BOXES, PURE WHITE NAMES) */}
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-5 flex items-start justify-between pointer-events-auto z-50">
        {/* Left: Player Name (NO BOX, PURE WHITE NAME + WHITE ROUND DIAMONDS) */}
        {(() => {
          const champ = CHAMPIONS[selectedChampion || 'leo'] || CHAMPIONS.leo;
          return (
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-widest text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  {champ.name}
                </span>
              </div>

              {/* Round Victory Diamonds - TURNS SOLID PURE WHITE ON WIN */}
              <div className="flex items-center gap-2 ml-0.5">
                {[0, 1, 2].map((i) => {
                  const isWon = i < state.playerRoundWins;
                  return (
                    <div
                      key={i}
                      className={`relative w-3.5 h-3.5 rotate-45 rounded-xs flex items-center justify-center transition-all duration-300 ${
                        isWon
                          ? 'bg-white border-2 border-white shadow-[0_0_14px_rgba(255,255,255,1)] scale-110'
                          : 'bg-black/70 border border-white/40 shadow-inner'
                      }`}
                      title={`Round Win ${i + 1} ${isWon ? '(Won)' : '(Needed)'}`}
                    >
                      {isWon && <div className="w-1 h-1 rounded-full bg-slate-900" />}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Right: Opponent Name (NO BOX, PURE WHITE NAME + WHITE ROUND DIAMONDS) */}
        {(() => {
          const botChamp = CHAMPIONS[botChampion || 'kage'] || CHAMPIONS.kage;
          return (
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-widest text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  {botChamp.name}
                </span>
              </div>

              {/* Round Victory Diamonds - TURNS SOLID PURE WHITE ON WIN */}
              <div className="flex items-center gap-2 mr-0.5 justify-end">
            {[0, 1, 2].map((i) => {
              const isWon = i < state.botRoundWins;
              return (
                <div
                  key={i}
                  className={`relative w-3.5 h-3.5 rotate-45 rounded-xs flex items-center justify-center transition-all duration-300 ${
                    isWon
                      ? 'bg-white border-2 border-white shadow-[0_0_14px_rgba(255,255,255,1)] scale-110'
                      : 'bg-black/70 border border-white/40 shadow-inner'
                  }`}
                  title={`Bot Round Win ${i + 1} ${isWon ? '(Won)' : '(Needed)'}`}
                >
                  {isWon && <div className="w-1 h-1 rounded-full bg-slate-900" />}
                </div>
              );
            })}
              </div>
            </div>
          );
        })()}
      </div>

      {/* TOP CENTER: EXACT DEAD CENTER (50% OF SCREEN) TIMER NUMBER & PAUSE BUTTON */}
      <div className="absolute top-4 sm:top-5 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto z-50">
        <div className="relative flex items-center justify-center">
          {/* Timer Number: Exactly in the dead center */}
          <span
            className={`text-3xl sm:text-4xl font-black font-mono tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] ${
              remainingSeconds <= 15
                ? 'text-rose-400 animate-pulse'
                : 'text-white'
            }`}
          >
            {remainingSeconds}
          </span>

          {/* Pause Button: Floats right next to timer without pulling timer off-center */}
          <button
            onClick={openSettings}
            className="absolute left-full ml-2 p-1.5 hover:bg-white/10 rounded-xl transition-all cursor-pointer text-white active:scale-95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            title="Pause Battle"
          >
            <Pause className="w-5 h-5 text-cyan-300" />
          </button>
        </div>

        {/* Warning Text Banner when arena is collapsing or sudden death */}
        {state.warningText && (
          <div className="mt-1 px-3 py-0.5 bg-red-600/95 text-white font-black text-[10px] tracking-wider uppercase rounded-full shadow-[0_0_15px_rgba(239,68,68,0.7)] border border-red-300 animate-bounce whitespace-nowrap">
            {state.warningText}
          </div>
        )}
      </div>

      {/* CUSTOMIZATION MODE ACTION BAR (NO BOXY THEME: SLEEK FLOATING GAME BUTTONS) */}
      {isCustomizingHUD && (
        <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto animate-in slide-in-from-top-3 duration-200 flex flex-col items-center gap-2">
          {/* Pure White Shadow-Fight Title with Glow (No Box) */}
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              CUSTOMIZE CONTROLS
            </span>
          </div>

          {/* Floating Action Buttons (No Enclosing Box, Pure 3D Game Buttons) */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Reset Button */}
            <button
              onClick={handleResetLayout}
              className="px-4 py-2 bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#0369a1] hover:from-[#7dd3fc] hover:to-[#0284c7] text-white font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-sky-200 shadow-[0_4px_0_#075985,0_6px_14px_rgba(0,0,0,0.5)] active:translate-y-0.5 active:shadow-[0_2px_0_#075985] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Reset</span>
            </button>

            {/* Save & Apply Button */}
            <button
              onClick={handleSaveLayout}
              className="px-5 py-2.5 bg-gradient-to-b from-[#a3e635] via-[#65a30d] to-[#4d7c0f] hover:from-[#bef264] hover:to-[#65a30d] text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl border-2 border-lime-200 shadow-[0_4px_0_#365314,0_8px_18px_rgba(0,0,0,0.5)] active:translate-y-0.5 active:shadow-[0_2px_0_#365314] transition-all flex items-center gap-2 cursor-pointer scale-105"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Save & Apply</span>
            </button>

            {/* Cancel Button */}
            <button
              onClick={handleCancelCustomizing}
              className="px-4 py-2 bg-gradient-to-b from-[#f87171] via-[#ef4444] to-[#b91c1c] hover:from-[#fca5a5] hover:to-[#ef4444] text-white font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-rose-200 shadow-[0_4px_0_#7f1d1d,0_6px_14px_rgba(0,0,0,0.5)] active:translate-y-0.5 active:shadow-[0_2px_0_#7f1d1d] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Cancel</span>
            </button>
          </div>

          {/* Sliders for Selected Control: Size & Visibility (Appears ONLY when a control is tapped, NO header text) */}
          {selectedCustomControl && (
            <div className="flex flex-col items-center gap-1.5 mt-2 animate-in fade-in duration-150">
              {/* Size Slider */}
              <div className="flex items-center gap-2.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-white whitespace-nowrap w-24 text-right">
                  Size:{' '}
                  <span
                    className={`font-mono font-black ${
                      selectedCustomControl === 'joystick' ? 'text-cyan-300' : 'text-amber-300'
                    }`}
                  >
                    {Math.round((tempLayout[selectedCustomControl]?.scale ?? 1.0) * 100)}%
                  </span>
                </span>
                <input
                  type="range"
                  min="70"
                  max="150"
                  step="5"
                  value={Math.round((tempLayout[selectedCustomControl]?.scale ?? 1.0) * 100)}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) / 100;
                    setTempLayout((prev) => ({
                      ...prev,
                      [selectedCustomControl]: {
                        ...prev[selectedCustomControl],
                        scale: val,
                      },
                    }));
                  }}
                  className={`w-36 sm:w-44 h-2 bg-slate-900/80 rounded-full appearance-none cursor-pointer border border-white/30 shadow-inner ${
                    selectedCustomControl === 'joystick' ? 'accent-cyan-400' : 'accent-amber-400'
                  }`}
                />
              </div>

              {/* Visibility / Opacity Slider (0% to 100%) */}
              <div className="flex items-center gap-2.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-white whitespace-nowrap w-24 text-right">
                  Visibility:{' '}
                  <span
                    className={`font-mono font-black ${
                      selectedCustomControl === 'joystick' ? 'text-cyan-300' : 'text-amber-300'
                    }`}
                  >
                    {Math.round((tempLayout[selectedCustomControl]?.opacity ?? 1.0) * 100)}%
                  </span>
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={Math.round((tempLayout[selectedCustomControl]?.opacity ?? 1.0) * 100)}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) / 100;
                    setTempLayout((prev) => ({
                      ...prev,
                      [selectedCustomControl]: {
                        ...prev[selectedCustomControl],
                        opacity: val,
                      },
                    }));
                  }}
                  className={`w-36 sm:w-44 h-2 bg-slate-900/80 rounded-full appearance-none cursor-pointer border border-white/30 shadow-inner ${
                    selectedCustomControl === 'joystick' ? 'accent-cyan-400' : 'accent-amber-400'
                  }`}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. REPOSITIONABLE TOUCH CONTROLS (JOYSTICK & DASH) - CRISP HIGH-CONTRAST GRAPHICS */}
      {/* 2A. FLOATING VIRTUAL JOYSTICK */}
      <div
        style={{
          position: 'absolute',
          left: `${activeLayout.joystick.x}px`,
          top: `${activeLayout.joystick.y}px`,
          transform: `scale(${activeLayout.joystick.scale ?? 1.0})`,
          transformOrigin: 'center center',
          opacity: activeLayout.joystick.opacity ?? 1.0,
        }}
        onClick={() => isCustomizingHUD && setSelectedCustomControl('joystick')}
        onPointerDown={(e) => isCustomizingHUD && handleCustomPointerDown('joystick', e)}
        onPointerMove={(e) => isCustomizingHUD && handleCustomPointerMove(e)}
        onPointerUp={(e) => isCustomizingHUD && handleCustomPointerUp(e)}
        className={`pointer-events-auto touch-none select-none transition-shadow z-45 ${
          isCustomizingHUD
            ? `z-50 cursor-grab active:cursor-grabbing p-1.5 rounded-full border-2 border-dashed ${
                selectedCustomControl === 'joystick'
                  ? 'border-cyan-300 bg-cyan-500/25 shadow-[0_0_30px_rgba(0,245,255,0.8)] ring-2 ring-cyan-400'
                  : 'border-cyan-400/60 bg-cyan-500/10'
              }`
            : ''
        }`}
      >
        {isCustomizingHUD && (
          <span
            className={`absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-lg ${
              selectedCustomControl === 'joystick'
                ? 'bg-cyan-950 border border-cyan-400 text-cyan-200 shadow-cyan-500/50 scale-105'
                : 'bg-slate-900 border border-slate-600 text-slate-400'
            }`}
          >
            ✥ {selectedCustomControl === 'joystick' ? 'Selected: Joystick' : 'Joystick'}
          </span>
        )}

        <div
          ref={joystickBaseRef}
          style={{
            opacity: activeLayout.joystick.opacity ?? 1.0,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onLostPointerCapture={handlePointerUp}
          className={`relative w-32 h-32 rounded-full bg-slate-950/80 border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5),inset_0_0_15px_rgba(6,182,212,0.25)] flex items-center justify-center touch-none ${
            isCustomizingHUD ? 'pointer-events-none' : 'cursor-grab active:cursor-grabbing'
          }`}
        >
          {/* 4 Directional Arrows */}
          <span className="absolute top-1 text-[11px] font-black text-cyan-400/90 leading-none select-none">▲</span>
          <span className="absolute bottom-1 text-[11px] font-black text-cyan-400/90 leading-none select-none">▼</span>
          <span className="absolute left-1.5 text-[11px] font-black text-cyan-400/90 leading-none select-none">◀</span>
          <span className="absolute right-1.5 text-[11px] font-black text-cyan-400/90 leading-none select-none">▶</span>

          {/* Inner concentric guide ring */}
          <div className="absolute w-20 h-20 rounded-full border border-cyan-400/30 pointer-events-none" />

          {/* High-Visibility 3D Metallic Thumbstick Knob */}
          <div
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#0284c7] via-[#38bdf8] to-[#e0f2fe] border-2 border-white shadow-[0_4px_16px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.9)] flex items-center justify-center transition-transform duration-75"
            style={{
              transform: `translate(${stickOffset.x}px, ${stickOffset.y}px)`,
            }}
          >
            <Move className="w-6 h-6 text-slate-950 stroke-[3]" />
          </div>
          <span className="absolute -bottom-6 px-2.5 py-0.5 rounded-full bg-black/80 border border-cyan-500/50 text-[10px] text-cyan-300 uppercase tracking-widest font-black drop-shadow">
            MOVE
          </span>
        </div>
      </div>

      {/* 2B. REPOSITIONABLE POWER DASH BUTTON */}
      <div
        style={{
          position: 'absolute',
          left: `${activeLayout.dash.x}px`,
          top: `${activeLayout.dash.y}px`,
          transform: `scale(${activeLayout.dash.scale ?? 1.0})`,
          transformOrigin: 'center center',
          opacity: activeLayout.dash.opacity ?? 1.0,
        }}
        onClick={() => isCustomizingHUD && setSelectedCustomControl('dash')}
        onPointerDown={(e) => isCustomizingHUD && handleCustomPointerDown('dash', e)}
        onPointerMove={(e) => isCustomizingHUD && handleCustomPointerMove(e)}
        onPointerUp={(e) => isCustomizingHUD && handleCustomPointerUp(e)}
        className={`pointer-events-auto touch-none select-none transition-shadow z-45 ${
          isCustomizingHUD
            ? `z-50 cursor-grab active:cursor-grabbing p-1.5 rounded-full border-2 border-dashed ${
                selectedCustomControl === 'dash'
                  ? 'border-amber-300 bg-amber-500/25 shadow-[0_0_30px_rgba(245,158,11,0.8)] ring-2 ring-amber-400'
                  : 'border-amber-400/60 bg-amber-500/10'
              }`
            : ''
        }`}
      >
        {isCustomizingHUD && (
          <span
            className={`absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-lg ${
              selectedCustomControl === 'dash'
                ? 'bg-amber-950 border border-amber-400 text-amber-200 shadow-amber-500/50 scale-105'
                : 'bg-slate-900 border border-slate-600 text-slate-400'
            }`}
          >
            ✥ {selectedCustomControl === 'dash' ? 'Selected: Dash' : 'Dash'}
          </span>
        )}

        <div
          style={{
            opacity: activeLayout.dash.opacity ?? 1.0,
          }}
          className="flex flex-col items-center"
        >
          <div className="relative w-28 h-28 flex items-center justify-center touch-none">
            {/* SVG Circular Progress Meter (0% to 100%) */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
              <circle
                cx="56"
                cy="56"
                r={radius}
                className="stroke-slate-950/80"
                strokeWidth="7"
                fill="none"
              />
              <circle
                cx="56"
                cy="56"
                r={radius}
                stroke={ringColor}
                strokeWidth="7"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.05s linear, stroke 0.2s ease' }}
              />
            </svg>

            {/* Inner Interactive Button - High-Visibility Crisp Colors */}
            <button
              onPointerDown={handleDashPointerDown}
              onPointerMove={handleDashPointerMove}
              onPointerUp={handleDashPointerUp}
              onPointerCancel={handleDashPointerUp}
              onLostPointerCapture={handleDashPointerUp}
              disabled={!isReady || isCustomizingHUD}
              className={`w-20 h-20 rounded-full border-2 border-white shadow-[0_4px_20px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.6)] flex flex-col items-center justify-center transition-all ${
                isCustomizingHUD
                  ? 'bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 pointer-events-none'
                  : isReady
                  ? `bg-gradient-to-tr ${buttonGradient} cursor-pointer active:scale-90`
                  : 'bg-slate-800 border-amber-400/60 cursor-not-allowed opacity-75'
              }`}
            >
              <Flame className="w-8 h-8 text-white fill-white/80 filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] stroke-[2]" />
              <span className="text-[11px] font-mono font-black text-white tracking-wider drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                {isMax ? 'MAX' : `${Math.floor(charge)}%`}
              </span>
            </button>
          </div>

          <div className="flex flex-col items-center mt-1 text-center">
            <span className="px-2.5 py-0.5 rounded-full bg-black/80 border border-amber-500/50 text-[10px] text-amber-300 uppercase tracking-widest font-black drop-shadow mt-1">
              DASH
            </span>
          </div>
        </div>
      </div>

      {/* 3. FINAL MATCH VICTORY / DEFEAT MODAL (FIRST TO 3 ROUND WINS) */}
      {state.isGameOver && !isCustomizingHUD && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 pointer-events-auto z-50 animate-in fade-in duration-200">
          <div
            className={`relative w-full max-w-[340px] sm:max-w-sm rounded-[36px] pt-14 sm:pt-16 px-6 pb-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.85),inset_0_2px_10px_rgba(255,255,255,0.25)] animate-in zoom-in-95 duration-150 ${
              state.winner === 'player'
                ? 'bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#020617] border-4 border-[#fde047]'
                : state.winner === 'bot'
                ? 'bg-gradient-to-b from-[#450a0a] via-[#1c1917] to-[#0c0a09] border-4 border-[#f87171]'
                : 'bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#020617] border-4 border-[#cbd5e1]'
            }`}
          >
            {/* Top Glossy 3D Ribbon Banner */}
            <div
              className={`absolute -top-6 left-1/2 -translate-x-1/2 px-8 sm:px-10 py-1.5 rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.5)] whitespace-nowrap border-2 ${
                state.winner === 'player'
                  ? 'bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#d97706] border-[#fef08a]'
                  : state.winner === 'bot'
                  ? 'bg-gradient-to-b from-[#f87171] via-[#dc2626] to-[#991b1b] border-[#fecaca]'
                  : 'bg-gradient-to-b from-[#e2e8f0] via-[#94a3b8] to-[#64748b] border-white'
              }`}
            >
              <span
                className={`text-xl sm:text-2xl font-black tracking-widest uppercase ${
                  state.winner === 'player'
                    ? 'text-[#78350f] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]'
                    : state.winner === 'bot'
                    ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                    : 'text-[#0f172a] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]'
                }`}
              >
                {state.winner === 'player'
                  ? 'MATCH VICTORY'
                  : state.winner === 'bot'
                  ? 'MATCH DEFEAT'
                  : 'MATCH DRAW'}
              </span>
            </div>

            {state.winner === 'player' ? (
              <>
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-b from-amber-400/20 to-yellow-600/30 border-2 border-amber-300 flex items-center justify-center mb-2 shadow-[0_0_25px_rgba(245,158,11,0.4)] animate-pulse">
                  <Trophy className="w-10 h-10 text-amber-300 drop-shadow-[0_2px_8px_rgba(245,158,11,0.8)]" />
                </div>
                <p className="text-slate-300 text-sm font-semibold mt-1">
                  You conquered the arena {state.playerRoundWins} - {state.botRoundWins}
                </p>

                {/* Match Rewards */}
                <div className="grid grid-cols-3 gap-2 bg-black/40 border border-white/10 rounded-2xl p-3 my-4 shadow-inner">
                  <div>
                    <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Trophies</div>
                    <div className="text-base sm:text-lg font-black text-amber-400 drop-shadow">+35 🏆</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Gold</div>
                    <div className="text-base sm:text-lg font-black text-yellow-300 drop-shadow">+120 🪙</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Account XP</div>
                    <div className="text-base sm:text-lg font-black text-cyan-400 drop-shadow">+150 ⭐</div>
                  </div>
                </div>

                {/* 2X Rewarded Ad Button on Victory */}
                <button
                  disabled={hasClaimed2X || adInProgress}
                  onClick={handleClaim2XReward}
                  className={`w-full py-3 mb-2 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
                    hasClaimed2X
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 opacity-80 cursor-default'
                      : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-yellow-950 border-amber-200 shadow-[0_4px_0_#78350f,0_6px_15px_rgba(245,158,11,0.4)] active:translate-y-1 active:shadow-[0_1px_0_#78350f] animate-pulse'
                  }`}
                >
                  <Tv className="w-4 h-4" />
                  <span>{hasClaimed2X ? '✓ CLAIMED +200 GEMS!' : '📺 2X REWARD: CLAIM +200 GEMS'}</span>
                </button>

                <div className="flex items-center gap-2.5 mt-2">
                  <button
                    onClick={handleHomeWithAd}
                    className="flex-1 py-3 bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#0369a1] hover:from-[#7dd3fc] hover:to-[#0284c7] text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl border-2 border-sky-200 shadow-[0_4px_0_#075985,0_6px_14px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-[0_2px_0_#075985] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Home className="w-4 h-4 stroke-[2.5]" />
                    <span>HOME</span>
                  </button>
                  <button
                    onClick={handleRestartWithAd}
                    className="flex-1 py-3 bg-gradient-to-b from-[#a3e635] via-[#65a30d] to-[#4d7c0f] hover:from-[#bef264] hover:to-[#65a30d] text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl border-2 border-lime-200 shadow-[0_4px_0_#365314,0_6px_14px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-[0_2px_0_#365314] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                    <span>PLAY AGAIN</span>
                  </button>
                </div>
              </>
            ) : state.winner === 'bot' ? (
              <>
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-b from-rose-500/20 to-red-950/40 border-2 border-rose-400 flex items-center justify-center mb-2 shadow-[0_0_25px_rgba(244,63,94,0.4)]">
                  <span className="text-4xl filter drop-shadow-[0_2px_6px_rgba(244,63,94,0.8)]">💥</span>
                </div>
                <p className="text-slate-300 text-sm font-semibold mt-1">
                  {(CHAMPIONS[botChampion || 'kage'] || CHAMPIONS.kage).name} won {state.botRoundWins} - {state.playerRoundWins}
                </p>

                {/* Consolation Rewards */}
                <div className="grid grid-cols-3 gap-2 bg-black/40 border border-white/10 rounded-2xl p-3 my-4 shadow-inner">
                  <div>
                    <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Trophies</div>
                    <div className="text-base sm:text-lg font-black text-rose-400 drop-shadow">-10 🏆</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Gold</div>
                    <div className="text-base sm:text-lg font-black text-yellow-300 drop-shadow">+25 🪙</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Account XP</div>
                    <div className="text-base sm:text-lg font-black text-cyan-400 drop-shadow">+40 ⭐</div>
                  </div>
                </div>

                {/* Consolation Rewarded Ad */}
                <button
                  disabled={hasClaimed2X || adInProgress}
                  onClick={handleClaim2XReward}
                  className={`w-full py-3 mb-2 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
                    hasClaimed2X
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 opacity-80 cursor-default'
                      : 'bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 hover:from-sky-400 hover:to-blue-400 text-white border-sky-200 shadow-[0_4px_0_#1e3a8a,0_6px_15px_rgba(14,165,233,0.4)] active:translate-y-1 active:shadow-[0_1px_0_#1e3a8a]'
                  }`}
                >
                  <Tv className="w-4 h-4" />
                  <span>{hasClaimed2X ? '✓ CLAIMED +200 GEMS!' : '📺 REVENGE CRATE: GET +200 GEMS'}</span>
                </button>

                <div className="flex items-center gap-2.5 mt-2">
                  <button
                    onClick={handleHomeWithAd}
                    className="flex-1 py-3 bg-gradient-to-b from-[#f87171] via-[#ef4444] to-[#b91c1c] hover:from-[#fca5a5] hover:to-[#ef4444] text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl border-2 border-rose-200 shadow-[0_4px_0_#7f1d1d,0_6px_14px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-[0_2px_0_#7f1d1d] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Home className="w-4 h-4 stroke-[2.5]" />
                    <span>HOME</span>
                  </button>
                  <button
                    onClick={handleRestartWithAd}
                    className="flex-1 py-3 bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#0369a1] hover:from-[#7dd3fc] hover:to-[#0284c7] text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl border-2 border-sky-200 shadow-[0_4px_0_#075985,0_6px_14px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-[0_2px_0_#075985] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                    <span>PLAY AGAIN</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 mx-auto rounded-full bg-slate-500/20 border-2 border-slate-300 flex items-center justify-center mb-2 shadow-lg shadow-slate-500/30 animate-pulse">
                  <Shield className="w-10 h-10 text-slate-200 drop-shadow-md" />
                </div>
                <p className="text-slate-300 text-sm font-semibold mt-1">
                  STALEMATE — The match concluded without a victor ({state.playerRoundWins} - {state.botRoundWins})
                </p>

                {/* Stalemate Split Rewards */}
                <div className="grid grid-cols-3 gap-2 bg-black/40 border border-white/10 rounded-2xl p-3 my-4 shadow-inner">
                  <div>
                    <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Trophies</div>
                    <div className="text-base sm:text-lg font-black text-slate-200 drop-shadow">+10 🏆</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Gold</div>
                    <div className="text-base sm:text-lg font-black text-yellow-300 drop-shadow">+50 🪙</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Account XP</div>
                    <div className="text-base sm:text-lg font-black text-cyan-400 drop-shadow">+60 ⭐</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 mt-2">
                  <button
                    onClick={handleHomeWithAd}
                    className="flex-1 py-3 bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800 hover:from-slate-500 hover:to-slate-700 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl border-2 border-slate-400 shadow-[0_4px_0_#1e293b,0_6px_14px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-[0_2px_0_#1e293b] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Home className="w-4 h-4 stroke-[2.5]" />
                    <span>HOME</span>
                  </button>
                  <button
                    onClick={handleRestartWithAd}
                    className="flex-1 py-3 bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#0369a1] hover:from-[#7dd3fc] hover:to-[#0284c7] text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl border-2 border-sky-200 shadow-[0_4px_0_#075985,0_6px_14px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-[0_2px_0_#075985] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                    <span>PLAY AGAIN</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 4. MODULAR PAUSE MENU & SUB-POPUPS (USER REQUEST: 5 BUTTONS + SOUND & CONTROL SUB-POPUPS) */}
      {(isSettingsOpen || (state.isPaused && !state.isGameOver && !isCustomizingHUD)) && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 pointer-events-auto z-50 animate-in fade-in duration-200">
          
          {/* TAB 1: MAIN 5-BUTTON PAUSE MENU */}
          {pauseModalTab === 'menu' && (
            <div className="relative w-full max-w-[340px] sm:max-w-sm bg-gradient-to-b from-[#29b6f6] via-[#0288d1] to-[#01579b] border-4 border-[#81d4fa] rounded-[36px] pt-16 sm:pt-20 px-6 pb-6 shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_2px_10px_rgba(255,255,255,0.4)] text-center animate-in zoom-in-95 duration-150">
              {/* Top Glossy Golden-Orange 3D Ribbon: "PAUSE" */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#d97706] border-2 border-[#fef08a] px-10 py-1.5 rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.5)]">
                <span className="text-xl sm:text-2xl font-black tracking-widest text-[#78350f] uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                  PAUSE
                </span>
              </div>

              {/* Close X Button in top right corner */}
              <button
                onClick={closeSettings}
                className="absolute -top-3 -right-3 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-rose-500 hover:bg-rose-400 border-2 border-white flex items-center justify-center text-white transition-all cursor-pointer active:scale-90 shadow-lg shadow-rose-950/50"
                title="Resume Match"
              >
                <X className="w-5 h-5 stroke-[3]" />
              </button>

              {/* 5 Distinct Buttons Requested By User */}
              <div className="flex flex-col gap-3 mt-2">
                {/* 1. RESUME */}
                <button
                  onClick={closeSettings}
                  className="w-full py-3.5 bg-gradient-to-b from-[#a3e635] via-[#65a30d] to-[#4d7c0f] hover:from-[#bef264] hover:to-[#65a30d] text-white font-black text-base uppercase tracking-wider rounded-2xl border-2 border-lime-200 shadow-[0_5px_0_#365314,0_8px_16px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-[0_2px_0_#365314] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>Resume</span>
                </button>

                {/* 2. SOUND */}
                <button
                  onClick={() => setPauseModalTab('sound')}
                  className="w-full py-3.5 bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#0369a1] hover:from-[#7dd3fc] hover:to-[#0284c7] text-white font-black text-sm uppercase tracking-wider rounded-2xl border-2 border-sky-200 shadow-[0_4px_0_#075985,0_6px_14px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-[0_2px_0_#075985] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Volume2 className="w-5 h-5 text-white" />
                  <span>Sound</span>
                </button>

                {/* 3. CONTROL */}
                <button
                  onClick={() => setPauseModalTab('control')}
                  className="w-full py-3.5 bg-gradient-to-b from-[#a78bfa] via-[#7c3aed] to-[#5b21b6] hover:from-[#c4b5fd] hover:to-[#7c3aed] text-white font-black text-sm uppercase tracking-wider rounded-2xl border-2 border-purple-200 shadow-[0_4px_0_#4c1d95,0_6px_14px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-[0_2px_0_#4c1d95] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Gamepad2 className="w-5 h-5 text-white" />
                  <span>Control</span>
                </button>

                {/* 4. CUSTOMIZATION */}
                <button
                  onClick={startCustomization}
                  className="w-full py-3.5 bg-gradient-to-b from-[#facc15] via-[#eab308] to-[#ca8a04] hover:from-[#fde047] hover:to-[#eab308] text-[#78350f] font-black text-sm uppercase tracking-wider rounded-2xl border-2 border-amber-200 shadow-[0_4px_0_#854d0e,0_6px_14px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-[0_2px_0_#854d0e] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Move className="w-5 h-5 stroke-[2.5]" />
                  <span>Customization</span>
                </button>

                {/* 5. QUIT */}
                <button
                  onClick={() => {
                    closeSettings();
                    onOpenShowcase?.();
                  }}
                  className="w-full py-3.5 bg-gradient-to-b from-[#f87171] via-[#ef4444] to-[#b91c1c] hover:from-[#fca5a5] hover:to-[#ef4444] text-white font-black text-sm uppercase tracking-wider rounded-2xl border-2 border-rose-200 shadow-[0_4px_0_#7f1d1d,0_6px_14px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-[0_2px_0_#7f1d1d] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <LogOut className="w-5 h-5 stroke-[2.5]" />
                  <span>Quit Match</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SOUND SUB-POPUP (SOUND & VOL WITH CROSS ICON - NO OVERLAP, NO DONE BUTTON) */}
          {pauseModalTab === 'sound' && (
            <div className="relative w-full max-w-[340px] sm:max-w-sm bg-gradient-to-b from-[#29b6f6] via-[#0288d1] to-[#01579b] border-4 border-[#81d4fa] rounded-[36px] pt-16 sm:pt-20 px-6 pb-6 shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_2px_10px_rgba(255,255,255,0.4)] text-center animate-in zoom-in-95 duration-150">
              {/* Top Glossy Golden-Orange 3D Ribbon: "SOUND" */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#d97706] border-2 border-[#fef08a] px-10 py-1.5 rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.5)]">
                <span className="text-xl sm:text-2xl font-black tracking-widest text-[#78350f] uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                  SOUND
                </span>
              </div>

              {/* Close X Button in top right corner to return to main pause menu */}
              <button
                onClick={() => setPauseModalTab('menu')}
                className="absolute -top-3 -right-3 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-rose-500 hover:bg-rose-400 border-2 border-white flex items-center justify-center text-white transition-all cursor-pointer active:scale-90 shadow-lg shadow-rose-950/50"
                title="Back to Pause Menu"
              >
                <X className="w-5 h-5 stroke-[3]" />
              </button>

              <div className="space-y-3.5 text-left mt-2">
                {/* Row 1: Sound Effects Toggle */}
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
                        Hits & Ring-outs
                      </span>
                    </div>
                  </div>

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

                {/* Row 2: Music & Atmosphere Toggle */}
                <div className="bg-[#02568f]/80 border-2 border-[#81d4fa]/40 rounded-2xl p-3 flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-md">
                      <Music className="w-5 h-5 text-white drop-shadow" />
                    </div>
                    <div>
                      <span className="text-sm font-black text-white tracking-wide block">
                        Atmosphere
                      </span>
                      <span className="text-[10px] text-sky-200 font-semibold">
                        Ocean breeze
                      </span>
                    </div>
                  </div>

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

                {/* Row 3: Master Volume Slider */}
                <div className="bg-[#02568f]/80 border-2 border-[#81d4fa]/40 rounded-2xl p-3 shadow-inner">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-sky-200 flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-white" /> Volume Level
                    </span>
                    <span className="text-xs font-black font-mono text-lime-300">
                      {volumeLevel}%
                    </span>
                  </div>
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
            </div>
          )}

          {/* TAB 3: CONTROL SUB-POPUP (CAMERA MODES IN STRAIGHT VERTICAL LINE - NO OVERLAP, NO CONTROLS REF, NO CUSTOMIZATION BTN, NO DONE BTN) */}
          {pauseModalTab === 'control' && (
            <div className="relative w-full max-w-[340px] sm:max-w-sm bg-gradient-to-b from-[#29b6f6] via-[#0288d1] to-[#01579b] border-4 border-[#81d4fa] rounded-[36px] pt-16 sm:pt-20 px-6 pb-6 shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_2px_10px_rgba(255,255,255,0.4)] text-center animate-in zoom-in-95 duration-150">
              {/* Top Glossy Golden-Orange 3D Ribbon: "CONTROL" */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#d97706] border-2 border-[#fef08a] px-10 py-1.5 rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.5)]">
                <span className="text-xl sm:text-2xl font-black tracking-widest text-[#78350f] uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                  CONTROL
                </span>
              </div>

              {/* Close X Button in top right corner to return to main pause menu */}
              <button
                onClick={() => setPauseModalTab('menu')}
                className="absolute -top-3 -right-3 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-rose-500 hover:bg-rose-400 border-2 border-white flex items-center justify-center text-white transition-all cursor-pointer active:scale-90 shadow-lg shadow-rose-950/50"
                title="Back to Pause Menu"
              >
                <X className="w-5 h-5 stroke-[3]" />
              </button>

              {/* Straight Vertical Line of Camera Modes (User Request: "action and all in straing vertical line") */}
              <div className="space-y-3 mt-2 text-left">
                {[
                  {
                    id: 'third_person' as CameraMode,
                    name: 'Action Cam',
                    desc: 'Dynamic chase view',
                    icon: <Eye className="w-5 h-5" />,
                  },
                  {
                    id: 'isometric' as CameraMode,
                    name: 'Overhead Cam',
                    desc: 'Tactical arena view',
                    icon: <Camera className="w-5 h-5" />,
                  },
                  {
                    id: 'close_action' as CameraMode,
                    name: 'Close Combat',
                    desc: 'Cinematic tight view',
                    icon: <Zap className="w-5 h-5" />,
                  },
                ].map((mode) => {
                  const isSelected = state.cameraMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => onCameraChange(mode.id)}
                      className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border-2 ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#84cc16] via-[#65a30d] to-[#4d7c0f] text-white border-lime-200 shadow-[0_4px_12px_rgba(77,124,15,0.4),inset_0_1px_3px_rgba(255,255,255,0.5)] scale-[1.02]'
                          : 'bg-[#02568f]/80 hover:bg-[#026cb5] text-sky-100 border-[#81d4fa]/40 hover:border-sky-300 shadow-inner'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-all ${
                            isSelected
                              ? 'bg-white/25 text-white'
                              : 'bg-white/10 text-sky-200'
                          }`}
                        >
                          {mode.icon}
                        </div>
                        <div>
                          <div className="text-sm font-black uppercase tracking-wider drop-shadow-xs">
                            {mode.name}
                          </div>
                          <div
                            className={`text-[11px] font-semibold ${
                              isSelected ? 'text-lime-100' : 'text-sky-200'
                            }`}
                          >
                            {mode.desc}
                          </div>
                        </div>
                      </div>

                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-white text-emerald-700 flex items-center justify-center shadow-md">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-sky-300/40" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
