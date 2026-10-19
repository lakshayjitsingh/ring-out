import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  CHAMPIONS,
  type ChampionId,
  createChampionMesh,
  type CreatedChampion,
} from '../game/championModels';
import {
  Trophy,
  Swords,
  BookOpen,
  Settings,
  Play,
  RotateCcw,
  X,
  ChevronRight,
  Volume2,
  Lock,
  Star,
} from 'lucide-react';
import { sounds } from '../audio/soundManager';
import { crazyGames } from '../game/crazyGamesSdk';
import { ShopModal } from './ShopModal';

interface HomeScreenProps {
  selectedChampion: ChampionId;
  onSelectChampion?: (id: ChampionId) => void;
  onOpenBrawlers: () => void;
  onStartStoryMatch: () => void;
  onStartPvPMatch: () => void;
}

interface TrophyMilestone {
  trophies: number;
  rewardType: 'gold' | 'champion' | 'gems' | 'box';
  rewardLabel: string;
  amount?: number;
  championId?: ChampionId;
  claimed: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  selectedChampion,
  onOpenBrawlers,
  onStartStoryMatch,
  onStartPvPMatch,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeChampion = CHAMPIONS[selectedChampion];

  // User Profile & Currencies (Persisted)
  const [trophies, _setTrophies] = useState(1250);
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

  // Modals
  const [isTrophyRoadOpen, setIsTrophyRoadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const [matchmakingCountdown, setMatchmakingCountdown] = useState(3);
  const [soundMuted, setSoundMuted] = useState(!sounds.enabled);

  // Bottom Navigation Active Tab
  const [activeTab, setActiveTab] = useState<'home' | 'brawlers' | 'story' | 'trophy' | 'shop'>('home');

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

  // Trophy Road Milestones
  const milestones: TrophyMilestone[] = [
    { trophies: 50, rewardType: 'gold', rewardLabel: '50 Gold', amount: 50, claimed: true },
    { trophies: 150, rewardType: 'champion', rewardLabel: 'Kai Unlocked', championId: 'kai', claimed: true },
    { trophies: 300, rewardType: 'gems', rewardLabel: '20 Gems', amount: 20, claimed: true },
    { trophies: 500, rewardType: 'gold', rewardLabel: '200 Gold', amount: 200, claimed: true },
    { trophies: 800, rewardType: 'champion', rewardLabel: 'Nova Unlocked', championId: 'nova', claimed: true },
    { trophies: 1100, rewardType: 'box', rewardLabel: 'Big Brawl Box', claimed: true },
    { trophies: 1500, rewardType: 'champion', rewardLabel: 'Titan Gorr Unlocked', championId: 'titan', claimed: false },
    { trophies: 2000, rewardType: 'box', rewardLabel: 'Mega Brawl Box', claimed: false },
    { trophies: 2600, rewardType: 'champion', rewardLabel: 'Kage Unlocked', championId: 'kage', claimed: false },
    { trophies: 3500, rewardType: 'champion', rewardLabel: 'Bolt Robo-Fox', championId: 'bolt', claimed: false },
  ];

  // Helper to load champion into Three.js scene
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
    renderer.shadowMap.type = THREE.PCFShadowMap;
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

      if (currentModelRef.current) {
        const breathe = Math.sin(clock.getElapsedTime() * 2.2) * 0.03;
        currentModelRef.current.group.position.y = breathe;
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
    const handleUp = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', handleUp);

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', handleUp);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [selectedChampion]);

  // Handle Online PvP Matchmaking Flow
  const handleLaunchPvP = () => {
    sounds.playBump(1.0);
    setIsMatchmaking(true);
    setMatchmakingCountdown(3);

    const interval = setInterval(() => {
      setMatchmakingCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsMatchmaking(false);
          onStartPvPMatch();
          return 0;
        }
        sounds.playBump(0.6);
        return prev - 1;
      });
    }, 800);
  };

  const handleLaunchStory = () => {
    sounds.playBump(1.2);
    onStartStoryMatch();
  };

  const toggleSound = () => {
    const next = !sounds.enabled;
    sounds.enabled = next;
    setSoundMuted(!next);
    if (next) sounds.playBump(1.0);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#060913] select-none text-white font-sans">
      {/* 1. 3D HERO TURNTABLE BACKGROUND STAGE */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-0" />

      {/* Atmospheric Vignette & Radial Light */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(6,9,19,0.7)_85%,rgba(6,9,19,0.95)_100%)] z-10" />

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

        {/* Center: Trophy Road Progress Pill (Clickable) */}
        <div
          onClick={() => {
            sounds.playBump(0.8);
            setIsTrophyRoadOpen(true);
          }}
          className="pointer-events-auto cursor-pointer group flex items-center gap-2 bg-gradient-to-b from-[#29b6f6]/80 via-[#0288d1]/80 to-[#01579b]/80 backdrop-blur-md px-4 py-1.5 rounded-full border-2 border-[#81d4fa]/70 shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_3px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all"
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
            {/* Mini Progress Bar to 1500 */}
            <div className="w-24 sm:w-32 h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/20 mt-0.5">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full"
                style={{ width: `${Math.min(100, (trophies / 1500) * 100)}%` }}
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

      {/* 3. CENTER HERO BADGE & CHANGE HERO BUTTON */}
      <div className="absolute bottom-28 sm:bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 z-20 pointer-events-auto text-center">
        {/* Hero Identity Pill */}
        <div className="bg-gradient-to-b from-[#0288d1]/80 to-[#01579b]/80 backdrop-blur-md px-6 py-2 rounded-full border-2 border-[#81d4fa]/70 shadow-[0_6px_20px_rgba(0,0,0,0.6),inset_0_1px_4px_rgba(255,255,255,0.4)]">
          <div className="text-base sm:text-lg font-black tracking-widest uppercase text-white drop-shadow">
            {activeChampion.name}
          </div>
          <div className="text-[10px] sm:text-xs font-bold text-sky-200 uppercase tracking-wider">
            {activeChampion.title} • {activeChampion.archetype}
          </div>
        </div>

        {/* Change Hero Button */}
        <button
          onClick={() => {
            sounds.playBump(0.8);
            onOpenBrawlers();
          }}
          className="px-5 py-2 bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#d97706] hover:from-[#fef08a] hover:to-[#f59e0b] text-[#78350f] font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-[#fef08a] shadow-[0_4px_0_#b45309,0_6px_14px_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-[0_1px_0_#b45309] transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 stroke-[3]" />
          <span>Change Champion</span>
        </button>
      </div>

      {/* 4. LEFT WING: STORY MODE (NON-BOXY ARCADE FLOATING CARD) */}
      <div className="absolute left-3 sm:left-6 lg:left-10 top-1/2 -translate-y-1/2 w-60 sm:w-68 lg:w-76 z-20 pointer-events-auto">
        <div className="relative bg-gradient-to-b from-[#29b6f6]/90 via-[#0288d1]/90 to-[#01579b]/90 border-4 border-[#81d4fa] rounded-[32px] pt-12 sm:pt-14 px-4 sm:px-5 pb-5 shadow-[0_16px_50px_rgba(0,0,0,0.8),inset_0_2px_8px_rgba(255,255,255,0.4)] backdrop-blur-md text-center transition-transform hover:scale-[1.02]">
          {/* Top Glossy Golden-Amber Ribbon */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#d97706] border-2 border-[#fef08a] px-6 py-1 rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.5)] whitespace-nowrap">
            <span className="text-xs sm:text-sm font-black tracking-widest text-[#78350f] uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" /> Story Mode
            </span>
          </div>

          {/* Chapter Artwork Preview Capsule */}
          <div className="bg-black/40 border border-white/15 rounded-2xl p-3 mb-3 shadow-inner text-left">
            <div className="flex items-center justify-between text-[10px] text-emerald-300 font-black uppercase tracking-wider mb-1">
              <span>Chapter 1</span>
              <span className="flex items-center gap-0.5 text-amber-300">
                <Star className="w-3 h-3 fill-amber-300" />
                <Star className="w-3 h-3 fill-amber-300" />
                <Star className="w-3 h-3 text-slate-500" />
              </span>
            </div>
            <div className="text-sm font-black text-white drop-shadow">
              Emerald Isles
            </div>
            <div className="text-[11px] text-sky-200 font-semibold mt-0.5 leading-tight">
              Stage 1: Beach Scout Duel
            </div>
          </div>

          {/* Stage Info Pills */}
          <div className="flex items-center justify-center gap-2 mb-3.5 text-[10px] font-black uppercase text-sky-100">
            <span className="px-2.5 py-1 rounded-full bg-black/40 border border-sky-300/30">
              Reward: 120 🪙
            </span>
            <span className="px-2.5 py-1 rounded-full bg-black/40 border border-sky-300/30">
              3 Rounds
            </span>
          </div>

          {/* Play Story Mode 3D Action Button */}
          <button
            onClick={handleLaunchStory}
            className="w-full py-3 sm:py-3.5 bg-gradient-to-b from-[#a3e635] via-[#65a30d] to-[#4d7c0f] hover:from-[#bef264] hover:to-[#65a30d] text-white font-black text-sm uppercase tracking-wider rounded-2xl border-2 border-lime-200 shadow-[0_5px_0_#365314,0_8px_16px_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-[0_2px_0_#365314] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>PLAY STORY</span>
          </button>
        </div>
      </div>

      {/* 5. RIGHT WING: ONLINE PVP MODE (NON-BOXY ARCADE FLOATING CARD) */}
      <div className="absolute right-3 sm:right-6 lg:right-10 top-1/2 -translate-y-1/2 w-60 sm:w-68 lg:w-76 z-20 pointer-events-auto">
        <div className="relative bg-gradient-to-b from-[#29b6f6]/90 via-[#0288d1]/90 to-[#01579b]/90 border-4 border-[#81d4fa] rounded-[32px] pt-12 sm:pt-14 px-4 sm:px-5 pb-5 shadow-[0_16px_50px_rgba(0,0,0,0.8),inset_0_2px_8px_rgba(255,255,255,0.4)] backdrop-blur-md text-center transition-transform hover:scale-[1.02]">
          {/* Top Glossy Golden-Amber Ribbon */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#d97706] border-2 border-[#fef08a] px-6 py-1 rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.5)] whitespace-nowrap">
            <span className="text-xs sm:text-sm font-black tracking-widest text-[#78350f] uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5 stroke-[2.5]" /> Online PvP
            </span>
          </div>

          {/* Ranked Duel Preview Capsule */}
          <div className="bg-black/40 border border-white/15 rounded-2xl p-3 mb-3 shadow-inner text-left">
            <div className="flex items-center justify-between text-[10px] text-cyan-300 font-black uppercase tracking-wider mb-1">
              <span>Ranked 1v1</span>
              <span className="text-amber-300 font-mono font-black">+30 🏆</span>
            </div>
            <div className="text-sm font-black text-white drop-shadow flex items-center gap-1.5">
              <span>Emerald Ring Duel</span>
            </div>
            <div className="text-[11px] text-sky-200 font-semibold mt-0.5 leading-tight">
              Best of 5 rounds • Global Matchmaking
            </div>
          </div>

          {/* Stakes Info Pills */}
          <div className="flex items-center justify-center gap-2 mb-3.5 text-[10px] font-black uppercase text-sky-100">
            <span className="px-2.5 py-1 rounded-full bg-black/40 border border-sky-300/30">
              Win: +30 🏆
            </span>
            <span className="px-2.5 py-1 rounded-full bg-black/40 border border-rose-400/30 text-rose-300">
              Loss: -10 🏆
            </span>
          </div>

          {/* Find Match 3D Action Button */}
          <button
            onClick={handleLaunchPvP}
            className="w-full py-3 sm:py-3.5 bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#0369a1] hover:from-[#7dd3fc] hover:to-[#0284c7] text-white font-black text-sm uppercase tracking-wider rounded-2xl border-2 border-sky-200 shadow-[0_5px_0_#075985,0_8px_16px_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-[0_2px_0_#075985] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Swords className="w-4 h-4 stroke-[2.5]" />
            <span>FIND MATCH</span>
          </button>
        </div>
      </div>

      {/* 6. BOTTOM NAVIGATION DOCK (Home, Brawlers, Story, Trophy Road, Shop) */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
        <div className="flex items-center gap-1.5 sm:gap-3 bg-gradient-to-b from-[#0288d1]/90 to-[#01579b]/90 backdrop-blur-md px-3 sm:px-5 py-2 rounded-full border-2 border-[#81d4fa]/60 shadow-[0_10px_30px_rgba(0,0,0,0.7),inset_0_1px_3px_rgba(255,255,255,0.4)]">
          {/* Tab 1: Home */}
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3.5 sm:px-4 py-1.5 rounded-full flex items-center gap-1.5 font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'bg-gradient-to-b from-[#84cc16] to-[#4d7c0f] text-white shadow-md border border-[#bef264]'
                : 'text-sky-200 hover:text-white'
            }`}
          >
            <span>Home</span>
          </button>

          {/* Tab 2: Brawlers */}
          <button
            onClick={() => {
              sounds.playBump(0.6);
              onOpenBrawlers();
            }}
            className="px-3.5 sm:px-4 py-1.5 rounded-full flex items-center gap-1.5 font-black text-xs uppercase tracking-wider text-sky-200 hover:text-white transition-all cursor-pointer"
          >
            <span>Brawlers</span>
          </button>

          {/* Tab 3: Shop */}
          <button
            onClick={() => {
              sounds.playBump(0.6);
              setIsShopOpen(true);
            }}
            className="px-3.5 sm:px-4 py-1.5 rounded-full flex items-center gap-1.5 font-black text-xs uppercase tracking-wider text-amber-300 hover:text-white bg-gradient-to-r from-amber-500/25 to-yellow-500/25 border border-amber-300/50 hover:border-amber-200 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
          >
            <span>🛒 Shop</span>
          </button>

          {/* Tab 4: Trophy Road */}
          <button
            onClick={() => {
              sounds.playBump(0.6);
              setIsTrophyRoadOpen(true);
            }}
            className="px-3.5 sm:px-4 py-1.5 rounded-full flex items-center gap-1.5 font-black text-xs uppercase tracking-wider text-sky-200 hover:text-white transition-all cursor-pointer"
          >
            <span>Trophies</span>
          </button>

          {/* Tab 5: Settings */}
          <button
            onClick={() => {
              sounds.playBump(0.6);
              setIsSettingsOpen(true);
            }}
            className="px-3.5 sm:px-4 py-1.5 rounded-full flex items-center gap-1.5 font-black text-xs uppercase tracking-wider text-sky-200 hover:text-white transition-all cursor-pointer"
          >
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* 7. MATCHMAKING RADAR OVERLAY (ONLINE PVP) */}
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
              SEARCHING FOR BRAWLER
            </div>
            <div className="text-xs text-sky-200 font-semibold mb-4">
              Estimated wait: {matchmakingCountdown}s • Arena: Emerald Isles
            </div>

            <button
              onClick={() => setIsMatchmaking(false)}
              className="px-6 py-2 bg-gradient-to-b from-[#f87171] via-[#ef4444] to-[#b91c1c] hover:from-[#fca5a5] hover:to-[#ef4444] text-white font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-rose-200 shadow-[0_4px_0_#7f1d1d,0_6px_14px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-[0_1px_0_#7f1d1d] transition-all cursor-pointer"
            >
              Cancel Matchmaking
            </button>
          </div>
        </div>
      )}

      {/* 8. TROPHY ROAD MODAL (MATCHING THEME, NON-BOXY) */}
      {isTrophyRoadOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-gradient-to-b from-[#29b6f6] via-[#0288d1] to-[#01579b] border-4 border-[#81d4fa] rounded-[36px] pt-16 px-6 pb-6 shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_2px_10px_rgba(255,255,255,0.4)] text-center animate-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            {/* Top Glossy Ribbon */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#d97706] border-2 border-[#fef08a] px-10 py-1.5 rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.5)] whitespace-nowrap">
              <span className="text-lg font-black tracking-widest text-[#78350f] uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#78350f] fill-[#78350f]" /> TROPHY ROAD
              </span>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsTrophyRoadOpen(false)}
              className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-rose-500 hover:bg-rose-400 border-2 border-white flex items-center justify-center text-white transition-all cursor-pointer active:scale-90 shadow-lg shadow-rose-950/50"
              title="Close"
            >
              <X className="w-5 h-5 stroke-[3]" />
            </button>

            {/* Trophy Summary Header */}
            <div className="bg-black/30 border border-white/10 rounded-2xl p-3 mb-4 flex items-center justify-between">
              <div className="text-left">
                <div className="text-[10px] text-sky-200 font-bold uppercase tracking-wider">
                  Current Rating
                </div>
                <div className="text-xl font-black text-amber-300 drop-shadow flex items-center gap-1.5">
                  <Trophy className="w-5 h-5 fill-amber-300 text-amber-300" /> {trophies.toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-sky-200 font-bold uppercase tracking-wider">
                  Next Milestone
                </div>
                <div className="text-sm font-black text-white">
                  1,500 🏆 • Titan Gorr
                </div>
              </div>
            </div>

            {/* Scrollable Milestone Progression Track */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-left">
              {milestones.map((m, idx) => {
                const isReached = trophies >= m.trophies;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border-2 flex items-center justify-between transition-all ${
                      isReached
                        ? 'bg-gradient-to-r from-[#02568f]/90 to-[#013f6b]/90 border-lime-300/60 shadow-md'
                        : 'bg-[#013f6b]/60 border-sky-400/30 opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 font-black shadow ${
                          isReached
                            ? 'bg-gradient-to-b from-amber-400 to-yellow-500 border-amber-200 text-slate-950'
                            : 'bg-slate-800 border-slate-600 text-slate-400'
                        }`}
                      >
                        <Trophy className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs font-black uppercase tracking-wider text-amber-300 font-mono">
                          {m.trophies} 🏆
                        </div>
                        <div className="text-sm font-black text-white">
                          {m.rewardLabel}
                        </div>
                      </div>
                    </div>

                    <div>
                      {m.claimed ? (
                        <span className="px-3 py-1 rounded-full bg-lime-500/20 border border-lime-400 text-lime-300 text-xs font-black uppercase">
                          Claimed
                        </span>
                      ) : isReached ? (
                        <button
                          onClick={() => {
                            sounds.playBump(1.0);
                            m.claimed = true;
                            if (m.amount && m.rewardType === 'gold') setGold((g) => g + m.amount!);
                            if (m.amount && m.rewardType === 'gems') setGems((g) => g + m.amount!);
                          }}
                          className="px-4 py-1.5 bg-gradient-to-b from-[#a3e635] to-[#65a30d] text-white font-black text-xs uppercase rounded-xl border border-lime-200 shadow-md active:translate-y-0.5 cursor-pointer"
                        >
                          Claim
                        </button>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-600 text-slate-400 text-xs font-bold flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 9. SETTINGS MODAL (AUDIO & PRESETS) */}
      {isSettingsOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-gradient-to-b from-[#29b6f6] via-[#0288d1] to-[#01579b] border-4 border-[#81d4fa] rounded-[36px] pt-16 px-6 pb-6 shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_2px_10px_rgba(255,255,255,0.4)] text-center animate-in zoom-in-95 duration-150">
            {/* Top Glossy Ribbon */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#d97706] border-2 border-[#fef08a] px-10 py-1.5 rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.5)] whitespace-nowrap">
              <span className="text-lg font-black tracking-widest text-[#78350f] uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                SETTINGS
              </span>
            </div>

            {/* Close Button */}
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
                <div className="text-xs font-black text-white">Ring Out: Chapter 1</div>
                <div className="text-[10px] text-sky-300 font-mono mt-0.5">Version 1.0.4 • Emerald Isles</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. 3D ARCADE SHOP MODAL (GEMS, REWARDED ADS, XSOLLA PACKS, CHAMPIONS) */}
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
