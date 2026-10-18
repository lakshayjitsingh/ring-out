import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  CHAMPIONS,
  type ChampionId,
  createChampionMesh,
  type CreatedChampion,
  animateChampion,
} from '../game/championModels';
import {
  Trophy,
  Swords,
  Settings,
  RotateCcw,
  X,
  ChevronRight,
  Volume2,
  Gift,
  Globe,
  Users,
  Sparkles,
} from 'lucide-react';
import { sounds } from '../audio/soundManager';
import { crazyGames } from '../game/crazyGamesSdk';
import { ShopModal } from './ShopModal';
import { DailyRewardsModal } from './DailyRewardsModal';
import { TrophyRoadModal } from './TrophyRoadModal';
import { LeaderboardModal } from './LeaderboardModal';
import { TeamCodeModal } from './TeamCodeModal';

interface HomeScreenProps {
  selectedChampion: ChampionId;
  onSelectChampion?: (id: ChampionId) => void;
  onOpenBrawlers: () => void;
  onStartStoryMatch?: () => void;
  onStartPvPMatch: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  selectedChampion,
  onOpenBrawlers,
  onStartPvPMatch,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeChampion = CHAMPIONS[selectedChampion];

  // User Profile & Currencies (Persisted in localStorage)
  const [trophies, _setTrophies] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('ringout_trophies');
      return saved ? parseInt(saved, 10) : 1250;
    } catch {
      return 1250;
    }
  });

  const [gold, setGold] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('ringout_gold');
      return saved ? parseInt(saved, 10) : 840;
    } catch {
      return 840;
    }
  });

  const [gems, setGems] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('ringout_gems');
      return saved ? parseInt(saved, 10) : 150;
    } catch {
      return 150;
    }
  });

  const [playerLevel] = useState(5);
  const [unlockedChampions, setUnlockedChampions] = useState<ChampionId[]>(() => {
    try {
      const saved = localStorage.getItem('ringout_unlocked_champions');
      return saved ? JSON.parse(saved) : ['leo', 'bolt', 'kai'];
    } catch {
      return ['leo', 'bolt', 'kai'];
    }
  });

  // Modal State
  const [isTrophyRoadOpen, setIsTrophyRoadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isDailyRewardsOpen, setIsDailyRewardsOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isTeamCodeOpen, setIsTeamCodeOpen] = useState(false);

  // Matchmaking State
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const [matchmakingCountdown, setMatchmakingCountdown] = useState(3);
  const [soundMuted, setSoundMuted] = useState(!sounds.enabled);

  // Check if Daily Reward is claimable today
  const [hasDailyRewardReady, setHasDailyRewardReady] = useState(() => {
    try {
      const lastClaim = localStorage.getItem('ringout_daily_last_claim_date');
      const today = new Date().toISOString().slice(0, 10);
      return lastClaim !== today;
    } catch {
      return true;
    }
  });

  // CrazyGames SDK Init
  useEffect(() => {
    crazyGames.init();
  }, []);

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
    setHasDailyRewardReady(false);
  };

  const handleUnlockChampion = (id: ChampionId, cost: number) => {
    setGems((prev) => {
      const next = Math.max(0, prev - cost);
      try {
        localStorage.setItem('ringout_gems', String(next));
      } catch {}
      return next;
    });
    setUnlockedChampions((prev) => {
      const next = [...prev, id];
      try {
        localStorage.setItem('ringout_unlocked_champions', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Three.js Turntable Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const modelHolderRef = useRef<THREE.Group | null>(null);
  const pedestalRef = useRef<THREE.Group | null>(null);
  const currentModelRef = useRef<CreatedChampion | null>(null);
  const isDraggingRef = useRef(false);
  const prevMouseXRef = useRef(0);
  const rotationVelocityRef = useRef(0);
  const currentRotationYRef = useRef(Math.PI);

  // Helper to load champion model into Three.js scene
  const loadChampionModel = (id: ChampionId) => {
    if (currentModelRef.current) {
      if (modelHolderRef.current) {
        modelHolderRef.current.remove(currentModelRef.current.group);
      }
      currentModelRef.current.group.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh;
          m.geometry?.dispose();
          if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
          else m.material?.dispose();
        }
      });
      currentModelRef.current = null;
    }

    const created = createChampionMesh(id);
    currentModelRef.current = created;
    if (modelHolderRef.current) {
      modelHolderRef.current.add(created.group);
    }
  };

  // 3D Scene Initialization
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.035);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 1.45, 5.0);
    camera.lookAt(0, 1.05, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambient = new THREE.AmbientLight(0xdbeafe, 1.1);
    scene.add(ambient);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x0f172a, 1.0);
    scene.add(hemiLight);

    const frontKey = new THREE.DirectionalLight(0xffffff, 2.2);
    frontKey.position.set(1.5, 4.0, 5.0);
    frontKey.castShadow = true;
    scene.add(frontKey);

    const keySpot = new THREE.SpotLight(0xffffff, 2.5, 20, Math.PI / 4, 0.35, 1);
    keySpot.position.set(0, 6, 2);
    scene.add(keySpot);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    const accentFloorLight = new THREE.PointLight(activeChampion.glowColor, 3.0, 6);
    accentFloorLight.position.set(0, 0.3, 0);
    scene.add(accentFloorLight);

    // Turntable Pedestal
    const pedestalGroup = new THREE.Group();
    pedestalRef.current = pedestalGroup;

    const baseGeo = new THREE.CylinderGeometry(1.8, 2.0, 0.25, 48);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.9,
      roughness: 0.15,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.125;
    baseMesh.receiveShadow = true;
    pedestalGroup.add(baseMesh);

    const rimGeo = new THREE.TorusGeometry(1.8, 0.05, 16, 48);
    rimGeo.rotateX(Math.PI / 2);
    const rimMat = new THREE.MeshBasicMaterial({ color: activeChampion.glowColor });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.position.y = 0.01;
    pedestalGroup.add(rimMesh);

    scene.add(pedestalGroup);

    // Rotating Model Holder
    const modelHolder = new THREE.Group();
    modelHolderRef.current = modelHolder;
    scene.add(modelHolder);

    // Starfield Dust
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 200;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 20;
      starPos[i + 1] = Math.random() * 8;
      starPos[i + 2] = (Math.random() - 0.5) * 20;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starsMat = new THREE.PointsMaterial({
      color: 0x60a5fa,
      size: 0.06,
      transparent: true,
      opacity: 0.5,
    });
    const stars = new THREE.Points(starsGeo, starsMat);
    scene.add(stars);

    loadChampionModel(selectedChampion);

    let animationId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      clock.getDelta();

      if (!isDraggingRef.current) {
        currentRotationYRef.current += rotationVelocityRef.current;
        rotationVelocityRef.current = THREE.MathUtils.lerp(rotationVelocityRef.current, 0, 0.08);
      }

      if (modelHolderRef.current) {
        modelHolderRef.current.rotation.y = currentRotationYRef.current;
      }
      if (pedestalRef.current) {
        pedestalRef.current.rotation.y = currentRotationYRef.current * 0.4;
      }

      // Smooth sine-wave idle breathing & sway
      if (currentModelRef.current) {
        animateChampion(currentModelRef.current, clock.getElapsedTime(), false, false);
      }

      renderer.render(scene, camera);
    };
    animate();

    // Turntable Drag Interaction
    const handleStart = (clientX: number) => {
      isDraggingRef.current = true;
      prevMouseXRef.current = clientX;
    };

    const handleMove = (clientX: number) => {
      if (!isDraggingRef.current) return;
      const deltaX = clientX - prevMouseXRef.current;
      prevMouseXRef.current = clientX;
      const rotSpeed = 0.008;
      currentRotationYRef.current += deltaX * rotSpeed;
      rotationVelocityRef.current = deltaX * rotSpeed * 0.4;
    };

    const onPointerDown = (e: PointerEvent) => handleStart(e.clientX);
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) handleStart(e.touches[0].clientX);
    };

    const onPointerMove = (e: PointerEvent) => handleMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) handleMove(e.touches[0].clientX);
    };

    const onEnd = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener('pointerup', onEnd);
    window.addEventListener('touchend', onEnd);
    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);

      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update champion mesh when selectedChampion changes
  useEffect(() => {
    loadChampionModel(selectedChampion);
  }, [selectedChampion]);

  // Matchmaking Launch Sequence
  const handleLaunchBattle = () => {
    sounds.playBump(1.0);
    setIsMatchmaking(true);
    setMatchmakingCountdown(3);

    const interval = window.setInterval(() => {
      setMatchmakingCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsMatchmaking(false);
          sounds.playBump(1.8);
          onStartPvPMatch();
          return 0;
        }
        sounds.playWarning();
        return prev - 1;
      });
    }, 900);
  };

  const toggleSound = () => {
    const nextState = soundMuted;
    setSoundMuted(!nextState);
    sounds.enabled = nextState;
    if (nextState) sounds.playBump(0.8);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 1. 3D BACKGROUND TURNTABLE CANVAS */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-0"
      />

      {/* Atmospheric Vignette & Radial Horizon */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(6,9,19,0.7)_80%,rgba(6,9,19,0.98)_100%)] z-10" />

      {/* 2. TOP HEADER HUD (Profile, Trophy Road Bar, Currencies, Settings) */}
      <div className="absolute top-0 left-0 right-0 p-3 sm:p-5 flex items-center justify-between z-30 pointer-events-none">
        {/* Left: Player Profile Pill */}
        <div className="pointer-events-auto flex items-center gap-2.5 bg-gradient-to-r from-[#0288d1]/80 to-[#01579b]/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border-2 border-[#81d4fa]/60 shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_3px_rgba(255,255,255,0.4)]">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border-2 border-white flex items-center justify-center shadow-md">
            <span className="text-base sm:text-lg">⭐</span>
            <span className="absolute -bottom-1 -right-1 bg-sky-500 border border-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow">
              {playerLevel}
            </span>
          </div>
          <div>
            <div className="text-xs sm:text-sm font-black tracking-wide text-white drop-shadow">
              Player
            </div>
            <div className="text-[10px] text-sky-200 font-bold">
              Rank: Brawler
            </div>
          </div>
        </div>

        {/* Center: Trophy Road Progress Pill (Clickable -> Opens Clash Royale Trophy Road Modal) */}
        <div
          onClick={() => {
            sounds.playBump(0.8);
            setIsTrophyRoadOpen(true);
          }}
          className="pointer-events-auto cursor-pointer group flex items-center gap-2 bg-gradient-to-b from-[#29b6f6]/85 via-[#0288d1]/85 to-[#01579b]/85 backdrop-blur-md px-4 py-1.5 rounded-full border-2 border-[#81d4fa]/70 shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_3px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-b from-amber-400 to-yellow-600 border border-amber-200 flex items-center justify-center shadow">
            <Trophy className="w-4 h-4 text-white drop-shadow" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black text-amber-300 drop-shadow">
                {trophies.toLocaleString()}
              </span>
              <span className="text-[10px] text-sky-200 font-bold uppercase tracking-wider">
                Trophy Road
              </span>
            </div>
            {/* Stepped Progress Bar */}
            <div className="w-24 sm:w-32 h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/20 mt-0.5">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full"
                style={{ width: `${Math.min(100, (trophies / 3000) * 100)}%` }}
              />
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-sky-200 group-hover:translate-x-0.5 transition-transform" />
        </div>

        {/* Right: Currencies & Settings Gear */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
          {/* Gold Pill (Clickable -> Opens Shop) */}
          <button
            onClick={() => {
              sounds.playBump(0.6);
              setIsShopOpen(true);
            }}
            className="flex items-center gap-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-yellow-400/50 hover:border-yellow-300 shadow-inner cursor-pointer active:scale-95 transition-all group"
            title="Open Shop for Gold"
          >
            <span className="text-sm">🪙</span>
            <span className="text-xs sm:text-sm font-black text-yellow-300 font-mono">
              {gold.toLocaleString()}
            </span>
            <span className="w-4 h-4 rounded-full bg-yellow-400 text-yellow-950 text-[10px] font-black flex items-center justify-center ml-0.5 group-hover:scale-110">
              +
            </span>
          </button>

          {/* Gems Pill (Clickable -> Opens Shop) */}
          <button
            onClick={() => {
              sounds.playBump(0.6);
              setIsShopOpen(true);
            }}
            className="flex items-center gap-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-400/50 hover:border-emerald-300 shadow-inner cursor-pointer active:scale-95 transition-all group"
            title="Open Shop for Gems"
          >
            <span className="text-sm">💎</span>
            <span className="text-xs sm:text-sm font-black text-emerald-300 font-mono">
              {gems.toLocaleString()}
            </span>
            <span className="w-4 h-4 rounded-full bg-emerald-400 text-emerald-950 text-[10px] font-black flex items-center justify-center ml-0.5 group-hover:scale-110">
              +
            </span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => {
              sounds.playBump(0.6);
              setIsSettingsOpen(true);
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#0369a1] hover:from-[#7dd3fc] hover:to-[#0284c7] border-2 border-sky-200 shadow-[0_4px_0_#075985,0_6px_14px_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-[0_1px_0_#075985] flex items-center justify-center transition-all cursor-pointer"
            title="Settings"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>
        </div>
      </div>

      {/* 3. LEFT SIDE COLUMN: QUICK ACCESS (DAILY REWARDS & LEADERBOARD) */}
      <div className="absolute left-4 top-24 sm:top-28 flex flex-col gap-3 z-30 pointer-events-auto">
        {/* Daily Rewards Button */}
        <button
          onClick={() => {
            sounds.playBump(0.8);
            setIsDailyRewardsOpen(true);
          }}
          className="relative group flex items-center gap-2.5 bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-slate-900/90 hover:from-purple-800 hover:to-indigo-800 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border-2 border-purple-400/60 shadow-[0_6px_20px_rgba(0,0,0,0.6)] hover:scale-105 active:scale-95 transition-all text-left cursor-pointer"
        >
          {hasDailyRewardReady && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 border-2 border-white animate-bounce shadow-md" />
          )}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 border border-yellow-200 flex items-center justify-center shadow">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-[11px] font-black uppercase text-amber-300 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Daily Reward
            </div>
            <div className="text-[10px] text-purple-200 font-bold">
              7–14 Day Streak
            </div>
          </div>
        </button>

        {/* Global Leaderboard Button */}
        <button
          onClick={() => {
            sounds.playBump(0.8);
            setIsLeaderboardOpen(true);
          }}
          className="group flex items-center gap-2.5 bg-gradient-to-r from-amber-950/90 via-slate-900/90 to-slate-900/90 hover:from-amber-900 hover:to-slate-800 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border-2 border-amber-400/60 shadow-[0_6px_20px_rgba(0,0,0,0.6)] hover:scale-105 active:scale-95 transition-all text-left cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 border border-amber-200 flex items-center justify-center shadow">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-[11px] font-black uppercase text-yellow-300 tracking-wider">
              Leaderboard
            </div>
            <div className="text-[10px] text-amber-200 font-bold">
              Global Top 100
            </div>
          </div>
        </button>
      </div>

      {/* 4. CENTER HERO BADGE & CHANGE HERO BUTTON */}
      <div className="absolute bottom-40 sm:bottom-36 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 pointer-events-auto text-center">
        {/* Active Hero Pill */}
        <div className="bg-gradient-to-b from-[#0288d1]/80 to-[#01579b]/80 backdrop-blur-md px-6 py-2 rounded-full border-2 border-[#81d4fa]/70 shadow-[0_6px_20px_rgba(0,0,0,0.6),inset_0_1px_4px_rgba(255,255,255,0.4)]">
          <div className="text-base sm:text-lg font-black tracking-widest uppercase text-white drop-shadow">
            {activeChampion.name}
          </div>
          <div className="text-[10px] sm:text-xs font-bold text-sky-200 uppercase tracking-wider flex items-center gap-1.5 justify-center">
            <span>{activeChampion.skill.icon}</span>
            <span>{activeChampion.title}</span>
            <span>•</span>
            <span>{activeChampion.archetype}</span>
          </div>
        </div>

        {/* Change Hero Button */}
        <button
          onClick={() => {
            sounds.playBump(0.8);
            onOpenBrawlers();
          }}
          className="px-4 py-1.5 bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#d97706] hover:from-[#fef08a] hover:to-[#f59e0b] text-[#78350f] font-black text-[11px] uppercase tracking-wider rounded-full border-2 border-[#fef08a] shadow-[0_3px_0_#b45309,0_5px_12px_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-[0_1px_0_#b45309] transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 stroke-[3]" />
          <span>Change Champion</span>
        </button>
      </div>

      {/* 5. EXACTLY 2 BATTLE ACTION BUTTONS (BATTLE 1v1 & TEAM CODE) */}
      <div className="absolute bottom-20 sm:bottom-18 left-1/2 -translate-x-1/2 flex items-center gap-3 sm:gap-4 z-20 pointer-events-auto">
        {/* Button 1: Prominent BATTLE 1v1 */}
        <button
          onClick={handleLaunchBattle}
          className="group relative px-8 sm:px-12 py-3.5 sm:py-4 bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#d97706] hover:from-[#fef08a] hover:to-[#f59e0b] text-[#78350f] font-black text-base sm:text-lg uppercase tracking-wider rounded-3xl border-3 border-[#fef08a] shadow-[0_6px_0_#b45309,0_12px_24px_rgba(245,158,11,0.5)] active:translate-y-1 active:shadow-[0_2px_0_#b45309] transition-all flex items-center gap-3 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-900/30 border border-amber-950/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
            <Swords className="w-5 h-5 text-[#78350f] stroke-[2.8]" />
          </div>
          <div className="text-left">
            <div className="leading-tight drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
              BATTLE
            </div>
            <div className="text-[10px] text-amber-950/90 font-bold tracking-normal uppercase">
              1v1 Ranked Match (+30 🏆)
            </div>
          </div>
        </button>

        {/* Button 2: TEAM CODE (Play with friends) */}
        <button
          onClick={() => {
            sounds.playBump(0.8);
            setIsTeamCodeOpen(true);
          }}
          className="group relative px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#0369a1] hover:from-[#7dd3fc] hover:to-[#0284c7] text-white font-black text-sm sm:text-base uppercase tracking-wider rounded-3xl border-3 border-sky-200 shadow-[0_6px_0_#075985,0_12px_24px_rgba(2,132,199,0.5)] active:translate-y-1 active:shadow-[0_2px_0_#075985] transition-all flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-sky-950/40 border border-sky-200/40 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5 text-white stroke-[2.8]" />
          </div>
          <div className="text-left">
            <div className="leading-tight drop-shadow">
              TEAM CODE
            </div>
            <div className="text-[10px] text-sky-100 font-bold tracking-normal uppercase">
              Play With Friends
            </div>
          </div>
        </button>
      </div>

      {/* 6. BOTTOM NAVIGATION DOCK (EXACTLY 3 SECTIONS: HOME, CHARACTERS, SHOP) */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
        <div className="flex items-center gap-2 sm:gap-4 bg-gradient-to-b from-[#0288d1]/90 to-[#01579b]/90 backdrop-blur-md px-4 sm:px-6 py-2 rounded-full border-2 border-[#81d4fa]/60 shadow-[0_10px_30px_rgba(0,0,0,0.7),inset_0_1px_3px_rgba(255,255,255,0.4)]">
          {/* Section 1: Home */}
          <button
            className="px-4 sm:px-5 py-1.5 rounded-full flex items-center gap-1.5 font-black text-xs uppercase tracking-wider bg-gradient-to-b from-[#84cc16] to-[#4d7c0f] text-white shadow-md border border-[#bef264] cursor-pointer"
          >
            <span>HOME</span>
          </button>

          {/* Section 2: Characters */}
          <button
            onClick={() => {
              sounds.playBump(0.6);
              onOpenBrawlers();
            }}
            className="px-4 sm:px-5 py-1.5 rounded-full flex items-center gap-1.5 font-black text-xs uppercase tracking-wider text-sky-200 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <span>CHARACTERS</span>
          </button>

          {/* Section 3: Shop */}
          <button
            onClick={() => {
              sounds.playBump(0.6);
              setIsShopOpen(true);
            }}
            className="px-4 sm:px-5 py-1.5 rounded-full flex items-center gap-1.5 font-black text-xs uppercase tracking-wider text-amber-300 hover:text-white bg-gradient-to-r from-amber-500/25 to-yellow-500/25 border border-amber-300/50 hover:border-amber-200 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
          >
            <span>🛒 SHOP</span>
          </button>
        </div>
      </div>

      {/* 7. MATCHMAKING RADAR OVERLAY (1v1 RANKED) */}
      {isMatchmaking && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-gradient-to-b from-[#29b6f6] via-[#0288d1] to-[#01579b] border-4 border-[#81d4fa] rounded-[36px] pt-16 px-6 pb-6 shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_2px_10px_rgba(255,255,255,0.4)] text-center animate-in zoom-in-95 duration-150">
            {/* Top Glossy Ribbon */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#d97706] border-2 border-[#fef08a] px-8 py-1.5 rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.5)] whitespace-nowrap">
              <span className="text-sm font-black tracking-widest text-[#78350f] uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                MATCHMAKING
              </span>
            </div>

            {/* Radar Animation Rings */}
            <div className="relative w-28 h-28 mx-auto my-3 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping opacity-40" />
              <div className="absolute inset-3 rounded-full border-2 border-sky-300 animate-pulse opacity-60" />
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-600 to-sky-400 border-2 border-white flex items-center justify-center shadow-lg">
                <Swords className="w-8 h-8 text-white stroke-[2.5]" />
              </div>
            </div>

            <div className="text-lg font-black text-white drop-shadow mb-1">
              FINDING OPPONENT
            </div>
            <div className="text-xs text-sky-200 font-semibold mb-4">
              Estimated wait: {matchmakingCountdown}s • Arena: Emerald Isles
            </div>

            <button
              onClick={() => setIsMatchmaking(false)}
              className="px-6 py-2 bg-gradient-to-b from-[#f87171] via-[#ef4444] to-[#b91c1c] hover:from-[#fca5a5] hover:to-[#ef4444] text-white font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-rose-200 shadow-[0_4px_0_#7f1d1d,0_6px_14px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-[0_1px_0_#7f1d1d] transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 8. SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-gradient-to-b from-[#29b6f6] via-[#0288d1] to-[#01579b] border-4 border-[#81d4fa] rounded-[36px] pt-14 px-6 pb-6 shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_2px_10px_rgba(255,255,255,0.4)] text-center animate-in zoom-in-95 duration-150">
            {/* Top Glossy Ribbon */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#d97706] border-2 border-[#fef08a] px-8 py-1.5 rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.5)] whitespace-nowrap">
              <span className="text-base font-black tracking-widest text-[#78350f] uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                SETTINGS
              </span>
            </div>

            <button
              onClick={() => setIsSettingsOpen(false)}
              className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-rose-500 hover:bg-rose-400 border-2 border-white flex items-center justify-center text-white transition-all cursor-pointer active:scale-90 shadow-lg shadow-rose-950/50"
              title="Close"
            >
              <X className="w-5 h-5 stroke-[3]" />
            </button>

            <div className="space-y-3 my-2 text-left">
              {/* Sound Toggle */}
              <div className="bg-[#02568f]/80 border-2 border-[#81d4fa]/40 rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow">
                    <Volume2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-white block">Sound SFX</span>
                    <span className="text-[10px] text-sky-200">Combat & UI effects</span>
                  </div>
                </div>
                <button
                  onClick={toggleSound}
                  className="bg-[#013f6b] p-1 rounded-full border border-sky-300/40 flex items-center cursor-pointer shadow-inner"
                >
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      !soundMuted
                        ? 'bg-gradient-to-b from-[#84cc16] to-[#4d7c0f] text-white shadow border border-[#bef264]'
                        : 'text-sky-300 opacity-60'
                    }`}
                  >
                    ON
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      soundMuted
                        ? 'bg-gradient-to-b from-slate-400 to-slate-600 text-white shadow border border-slate-300'
                        : 'text-sky-300 opacity-60'
                    }`}
                  >
                    OFF
                  </span>
                </button>
              </div>

              {/* Version & Build Info */}
              <div className="bg-black/40 rounded-2xl p-3 text-center border border-white/10">
                <div className="text-xs font-black text-white">Ring Out 3D</div>
                <div className="text-[10px] text-sky-300 font-mono mt-0.5">CrazyGames Edition • Chapter 1: Emerald Isles</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. MODALS: CLASH ROYALE TROPHY ROAD, DAILY REWARDS, LEADERBOARD, TEAM CODE, SHOP */}
      <TrophyRoadModal
        isOpen={isTrophyRoadOpen}
        onClose={() => setIsTrophyRoadOpen(false)}
        playerTrophies={trophies}
        onAddGold={handleAddGold}
        onAddGems={handleAddGems}
        onUnlockChampion={handleUnlockChampion}
      />

      <DailyRewardsModal
        isOpen={isDailyRewardsOpen}
        onClose={() => setIsDailyRewardsOpen(false)}
        onAddGold={handleAddGold}
        onAddGems={handleAddGems}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        playerTrophies={trophies}
        playerChampion={selectedChampion}
      />

      <TeamCodeModal
        isOpen={isTeamCodeOpen}
        onClose={() => setIsTeamCodeOpen(false)}
        onStartMatch={() => onStartPvPMatch()}
      />

      <ShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        gold={gold}
        gems={gems}
        onAddGems={handleAddGems}
        onAddGold={handleAddGold}
        unlockedChampions={unlockedChampions}
        onUnlockChampion={handleUnlockChampion}
      />
    </div>
  );
};
