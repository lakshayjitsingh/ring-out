import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  CHAMPIONS,
  type ChampionId,
  createChampionMesh,
  type CreatedChampion,
} from '../game/championModels';
import { getEquippedSkin } from '../game/championSkins';
import {
  Trophy,
  Swords,
  Users,
  Settings,
  Play,
  X,
  Volume2,
  Copy,
  Check,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { sounds } from '../audio/soundManager';
import { crazyGames } from '../game/crazyGamesSdk';
import { LeaderboardModal } from './LeaderboardModal';

interface HomeScreenProps {
  selectedChampion: ChampionId;
  trophies: number;
  setTrophies?: React.Dispatch<React.SetStateAction<number>>;
  gold: number;
  setGold: React.Dispatch<React.SetStateAction<number>>;
  gems: number;
  setGems: React.Dispatch<React.SetStateAction<number>>;
  onSelectChampion?: (id: ChampionId) => void;
  onOpenBrawlers: () => void;
  onOpenShop: () => void;
  onOpenTrophyRoad?: () => void;
  onStartCodeRoomMatch: (roomCode: string, isHost: boolean) => void;
  onStartPvPMatch: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  selectedChampion,
  trophies,
  gold,
  gems,
  onOpenBrawlers,
  onOpenShop,
  onStartCodeRoomMatch,
  onStartPvPMatch,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeChampion = CHAMPIONS[selectedChampion];

  // Dynamic Player Level based on real trophies (Starts at 1 for beginner)
  const playerLevel = Math.max(1, Math.floor(trophies / 250) + 1);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const [matchmakingCountdown, setMatchmakingCountdown] = useState(3);
  const [soundMuted, setSoundMuted] = useState(!sounds.enabled);

  // 1v1 Private Code Room Modal State
  const [isCodeRoomOpen, setIsCodeRoomOpen] = useState(false);
  const [codeRoomMode, setCodeRoomMode] = useState<'create' | 'join'>('create');
  const [roomCode, setRoomCode] = useState(() => 'RING-' + Math.floor(100 + Math.random() * 900));
  const [inputRoomCode, setInputRoomCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Interactive 2.5D Camera Parallax Offset
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const normX = ((e.clientX / window.innerWidth) - 0.5) * -18;
      const normY = ((e.clientY / window.innerHeight) - 0.5) * -12;
      setParallaxOffset({ x: normX, y: normY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // CrazyGames SDK Init
  useEffect(() => {
    crazyGames.init();
  }, []);

  // Three.js Turntable Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const modelHolderRef = useRef<THREE.Group | null>(null);
  const pedestalRef = useRef<THREE.Group | null>(null);
  const currentModelRef = useRef<CreatedChampion | null>(null);
  const isDraggingRef = useRef(false);
  const prevMouseXRef = useRef(0);
  const rotationVelocityRef = useRef(0);
  const currentRotationYRef = useRef(Math.PI);

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

    const created = createChampionMesh(id, getEquippedSkin(id));
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
    scene.background = null; // Ultra high-tech transparent canvas revealing 4K matte painting!
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

    // Radiant Sunny Daylight Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 1.35);
    scene.add(ambient);

    const hemiLight = new THREE.HemisphereLight(0x7dd3fc, 0x0284c7, 1.1);
    scene.add(hemiLight);

    // Warm Sun Directional Light (matching top-right sunburst in 4K backdrop)
    const sunLight = new THREE.DirectionalLight(0xfffbeb, 2.5);
    sunLight.position.set(3.5, 6.0, 3.5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    // Azure Sky Fill Light
    const skyFill = new THREE.DirectionalLight(0x7dd3fc, 1.5);
    skyFill.position.set(-3, 3, -3);
    scene.add(skyFill);

    // Golden Stage Spotlight
    const stageSpot = new THREE.SpotLight(0xfef08a, 2.0, 20, Math.PI / 4, 0.35, 1);
    stageSpot.position.set(0, 6, 2);
    scene.add(stageSpot);

    const accentFloorLight = new THREE.PointLight(activeChampion.glowColor, 3.5, 8);
    accentFloorLight.position.set(0, 0.3, 0);
    scene.add(accentFloorLight);

    // Championship Tournament Pedestal (Polished Cyan Platform + Gold Rim)
    const pedestalGroup = new THREE.Group();
    pedestalRef.current = pedestalGroup;

    // Platform Base
    const baseGeo = new THREE.CylinderGeometry(1.8, 2.0, 0.25, 48);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.3,
      roughness: 0.25,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.125;
    baseMesh.receiveShadow = true;
    pedestalGroup.add(baseMesh);

    // Polished Golden Beveled Rim
    const goldRimGeo = new THREE.TorusGeometry(1.85, 0.055, 16, 48);
    goldRimGeo.rotateX(Math.PI / 2);
    const goldRimMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.85,
      roughness: 0.2,
    });
    const goldRim = new THREE.Mesh(goldRimGeo, goldRimMat);
    goldRim.position.y = -0.01;
    pedestalGroup.add(goldRim);

    // Glowing Champion Neon Ring
    const rimGeo = new THREE.TorusGeometry(1.72, 0.035, 16, 48);
    rimGeo.rotateX(Math.PI / 2);
    const rimMat = new THREE.MeshBasicMaterial({ color: activeChampion.glowColor });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.position.y = 0.015;
    pedestalGroup.add(rimMesh);

    scene.add(pedestalGroup);

    // Rotating Model Holder
    const modelHolder = new THREE.Group();
    modelHolderRef.current = modelHolder;
    scene.add(modelHolder);

    // Multi-tier Sea Foam Ripple Rings around Pedestal (anchors the pedestal in the lagoon water)
    const surfRings: { mesh: THREE.Mesh; pulseSpeed: number }[] = [];
    [
      { r: 1.95, opacity: 0.55, speed: 2.2 },
      { r: 2.30, opacity: 0.38, speed: 1.8 },
      { r: 2.70, opacity: 0.22, speed: 1.4 },
    ].forEach((spec) => {
      const ringGeo = new THREE.RingGeometry(spec.r - 0.05, spec.r + 0.05, 48);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xe0f2fe,
        transparent: true,
        opacity: spec.opacity,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = -0.16;
      scene.add(ring);
      surfRings.push({ mesh: ring, pulseSpeed: spec.speed });
    });

    // 3D Volumetric Floating Tropical Petals & Golden Sunlight Embers
    const leafCount = 40;
    const leafGeo = new THREE.PlaneGeometry(0.14, 0.08);
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x86efac,
      side: THREE.DoubleSide,
      roughness: 0.5,
    });
    const petalMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      side: THREE.DoubleSide,
      roughness: 0.5,
    });
    const emberMat = new THREE.MeshBasicMaterial({
      color: 0xffedd5,
      side: THREE.DoubleSide,
    });
    const foliageList: { mesh: THREE.Mesh; rotSpeed: { x: number; y: number; z: number }; floatSpeed: number; swayAmp: number; seed: number }[] = [];
    const foliageGroup = new THREE.Group();
    for (let i = 0; i < leafCount; i++) {
      const mat = i % 3 === 0 ? leafMat : i % 3 === 1 ? petalMat : emberMat;
      const mesh = new THREE.Mesh(leafGeo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 12,
        Math.random() * 5 + 0.2,
        (Math.random() - 0.5) * 10
      );
      foliageGroup.add(mesh);
      foliageList.push({
        mesh,
        rotSpeed: { x: (Math.random() - 0.5) * 0.03, y: (Math.random() - 0.5) * 0.04, z: (Math.random() - 0.5) * 0.02 },
        floatSpeed: 0.007 + Math.random() * 0.010,
        swayAmp: 0.015 + Math.random() * 0.02,
        seed: Math.random() * Math.PI * 2,
      });
    }
    scene.add(foliageGroup);

    loadChampionModel(selectedChampion);

    let animationId = 0;
    const startTime = performance.now();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) * 0.001;

      // 1. Pulse Pedestal Foam Rings
      surfRings.forEach((sr) => {
        const s = 1.0 + Math.sin(elapsedTime * sr.pulseSpeed) * 0.04;
        sr.mesh.scale.set(s, s, 1);
      });

      // 2. Flutter 3D Tropical Petals & Sunlight Embers in the sea breeze
      foliageList.forEach((leaf) => {
        leaf.mesh.position.y -= leaf.floatSpeed;
        leaf.mesh.position.x += Math.sin(elapsedTime * 1.5 + leaf.seed) * leaf.swayAmp;
        leaf.mesh.rotation.x += leaf.rotSpeed.x;
        leaf.mesh.rotation.y += leaf.rotSpeed.y;
        leaf.mesh.rotation.z += leaf.rotSpeed.z;
        if (leaf.mesh.position.y < -0.2) {
          leaf.mesh.position.y = 5.2;
          leaf.mesh.position.x = (Math.random() - 0.5) * 12;
        }
      });

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
        const breathe = Math.sin(elapsedTime * 2.2) * 0.03;
        currentModelRef.current.group.position.y = breathe;

        if (currentModelRef.current.floatingGroup) {
          currentModelRef.current.floatingGroup.rotation.y = elapsedTime * 0.7;
          currentModelRef.current.floatingGroup.position.y = Math.sin(elapsedTime * 2.2) * 0.04;
        }
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


  const toggleSound = () => {
    const next = !sounds.enabled;
    sounds.enabled = next;
    setSoundMuted(!next);
    if (next) sounds.playBump(1.0);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-[#0284c7] via-[#38bdf8] to-[#7dd3fc] select-none text-white font-sans">
      {/* 0. HIGH-TECH 4K STYLIZED MATTE BACKDROP WITH INTERACTIVE 2.5D PARALLAX */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden transition-transform duration-300 ease-out z-0"
        style={{
          transform: `scale(1.06) translate3d(${parallaxOffset.x}px, ${parallaxOffset.y}px, 0)`,
        }}
      >
        <img
          src="/lobby_bg.jpg"
          alt="Emerald Island Lagoon"
          className="w-full h-full object-cover object-center filter brightness-105 contrast-[1.02]"
        />

        {/* Dynamic Sweeping Volumetric God Rays from Sunburst */}
        <div
          className="absolute -top-1/4 -right-1/4 w-[160%] h-[160%] pointer-events-none mix-blend-screen opacity-35 animate-pulse duration-[7000ms]"
          style={{
            background: 'conic-gradient(from 220deg at 78% 18%, rgba(254, 240, 138, 0.45) 0deg, transparent 22deg, rgba(253, 224, 71, 0.35) 48deg, transparent 70deg, rgba(254, 240, 138, 0.4) 95deg, transparent 125deg, rgba(254, 240, 138, 0.45) 155deg, transparent 195deg)',
          }}
        />

        {/* Shimmering Sun Caustics on the Turquoise Lagoon */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none opacity-25 mix-blend-overlay"
          style={{
            background: 'radial-gradient(ellipse at 50% 85%, rgba(224, 242, 254, 0.7) 0%, rgba(56, 189, 248, 0.3) 45%, transparent 75%)',
          }}
        />

        {/* Soft Vignette framing the UI cards */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_52%,rgba(2,132,199,0.18)_80%,rgba(1,63,107,0.42)_100%)]" />
      </div>

      {/* 1. 3D HERO TURNTABLE BACKGROUND STAGE (Transparent WebGL layer over the matte backdrop) */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-10" />

      {/* 2. TOP HEADER HUD (Profile & Trophy Road + Rankings at TOP-LEFT, Currencies & Settings at TOP-RIGHT) */}
      <div className="absolute top-0 left-0 right-0 p-3 sm:p-5 flex items-center justify-between z-30 pointer-events-none">
        
        {/* Top-Left: Player Profile Badge & Leaderboard Rankings Button */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Player Level Badge */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-slate-900/90 to-blue-950/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border-2 border-sky-400/50 shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-white flex items-center justify-center shadow">
              <span className="text-xs font-black text-amber-950">🥋</span>
              <span className="absolute -bottom-1 -right-1 bg-sky-500 border border-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow text-white">
                {playerLevel}
              </span>
            </div>
            <div className="text-left">
              <span className="text-[9px] text-sky-200 font-bold uppercase tracking-wider block">BRAWLER</span>
              <span className="text-xs font-black text-white">LEVEL {playerLevel}</span>
            </div>
          </div>

          {/* Rankings / Leaderboard Button Directly Next to Player Badge */}
          <button
            onClick={() => {
              sounds.playBump(0.8);
              setIsLeaderboardOpen(true);
            }}
            className="cursor-pointer group flex items-center gap-2 bg-gradient-to-r from-amber-500/90 via-orange-500/90 to-amber-600/90 hover:from-amber-400 hover:to-orange-500 backdrop-blur-md px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl border-2 border-yellow-200/80 shadow-[0_6px_20px_rgba(0,0,0,0.35),inset_0_1px_3px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all"
            title="Global Leaderboard & Rankings"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-950/40 border border-yellow-200/50 flex items-center justify-center shadow">
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-200 fill-yellow-300" />
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-[9px] font-bold text-amber-100 uppercase tracking-wider block">LEADERBOARD</span>
              <span className="text-xs font-black text-white drop-shadow">RANKINGS 👑</span>
            </div>
          </button>
        </div>

        {/* Right: Currencies & Settings Gear */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
          {/* Gold Pill (Clickable -> Opens Shop) */}
          <button
            onClick={() => {
              sounds.playBump(0.6);
              onOpenShop();
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
              onOpenShop();
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

      {/* 3. CENTER HERO BADGE & STATS (Interactive Card -> Opens Brawlers Showcase) */}
      <div className="absolute bottom-24 sm:bottom-22 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 pointer-events-auto text-center">
        <button
          onClick={() => {
            sounds.playBump(0.8);
            onOpenBrawlers();
          }}
          className="group bg-gradient-to-b from-[#0288d1]/90 via-[#01579b]/90 to-[#0284c7]/90 hover:from-[#0288d1] hover:to-[#0284c7] backdrop-blur-md px-6 py-2.5 rounded-3xl border-2 border-[#81d4fa]/80 shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_4px_rgba(255,255,255,0.4)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Click to view Brawler Stats & Roster"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-base sm:text-lg font-black tracking-widest uppercase text-white drop-shadow">
              {activeChampion.name}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black uppercase tracking-wider">
              VIEW STATS
            </span>
          </div>
          <div className="text-[10px] sm:text-xs font-bold text-sky-200 uppercase tracking-wider mt-0.5">
            {activeChampion.title} • {activeChampion.archetype}
          </div>

          {/* Real Champion Stats Badges */}
          <div className="flex items-center gap-2 mt-2 justify-center">
            <span className="px-2.5 py-0.5 rounded-full bg-black/40 border border-sky-300/40 text-[10px] font-black text-sky-200">
              ⚡ SPD {activeChampion.stats.speed}/5
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-black/40 border border-amber-400/40 text-[10px] font-black text-amber-300">
              💥 PWR {activeChampion.stats.power}/5
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-black/40 border border-emerald-400/40 text-[10px] font-black text-emerald-300">
              🛡️ WGT {activeChampion.stats.weight}/5
            </span>
          </div>
        </button>
      </div>

      {/* 4. LEFT WING: 1V1 CODE ROOM (DUEL A FRIEND WITH PRIVATE ROOM CODE) */}
      <div className="absolute left-3 sm:left-6 lg:left-10 top-1/2 -translate-y-1/2 w-60 sm:w-68 lg:w-76 z-20 pointer-events-auto">
        <div className="relative bg-gradient-to-b from-[#29b6f6]/90 via-[#0288d1]/90 to-[#01579b]/90 border-4 border-[#81d4fa] rounded-[32px] pt-12 sm:pt-14 px-4 sm:px-5 pb-5 shadow-[0_16px_50px_rgba(0,0,0,0.8),inset_0_2px_8px_rgba(255,255,255,0.4)] backdrop-blur-md text-center transition-transform hover:scale-[1.02]">
          {/* Top Glossy Golden-Amber Ribbon */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#d97706] border-2 border-[#fef08a] px-6 py-1 rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.5)] whitespace-nowrap">
            <span className="text-xs sm:text-sm font-black tracking-widest text-[#78350f] uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 stroke-[2.5]" /> 1v1 Code Room
            </span>
          </div>

          {/* Code Room Details Capsule */}
          <div className="bg-black/40 border border-white/15 rounded-2xl p-3 mb-3 shadow-inner text-left">
            <div className="flex items-center justify-between text-[10px] text-amber-300 font-black uppercase tracking-wider mb-1">
              <span>Private Duel</span>
              <span className="flex items-center gap-1 text-sky-200 font-mono">
                <KeyRound className="w-3 h-3 text-amber-300" /> Room Code
              </span>
            </div>
            <div className="text-sm font-black text-white drop-shadow">
              Play With Friend
            </div>
            <div className="text-[11px] text-sky-200 font-semibold mt-0.5 leading-tight">
              Create a custom code or enter friend's room
            </div>
          </div>

          {/* Action Buttons: Create Room & Join Room */}
          <div className="space-y-2">
            <button
              onClick={() => {
                sounds.playBump(0.8);
                setCodeRoomMode('create');
                setRoomCode('RING-' + Math.floor(100 + Math.random() * 900));
                setCopiedCode(false);
                setIsCodeRoomOpen(true);
              }}
              className="w-full py-2.5 bg-gradient-to-b from-[#a3e635] via-[#65a30d] to-[#4d7c0f] hover:from-[#bef264] hover:to-[#65a30d] text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl border-2 border-lime-200 shadow-[0_4px_0_#365314,0_6px_14px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-[0_2px_0_#365314] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-white" />
              <span>CREATE ROOM</span>
            </button>

            <button
              onClick={() => {
                sounds.playBump(0.8);
                setCodeRoomMode('join');
                setInputRoomCode('');
                setIsCodeRoomOpen(true);
              }}
              className="w-full py-2.5 bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#0369a1] hover:from-[#7dd3fc] hover:to-[#0284c7] text-white font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-sky-200 shadow-[0_3px_0_#075985,0_5px_12px_rgba(0,0,0,0.4)] active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>JOIN WITH CODE</span>
            </button>
          </div>
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
              <span className="text-emerald-300 font-bold uppercase tracking-wider text-[9px]">Competitive Duel</span>
            </div>
            <div className="text-sm font-black text-white drop-shadow flex items-center gap-1.5">
              <span>Emerald Ring Duel</span>
            </div>
            <div className="text-[11px] text-sky-200 font-semibold mt-0.5 leading-tight">
              Best of 5 rounds • Global Matchmaking
            </div>
          </div>

          {/* Quick Match Info Pills */}
          <div className="flex items-center justify-center gap-2 mb-3.5 text-[10px] font-black uppercase text-sky-100">
            <span className="px-3 py-1 rounded-full bg-black/40 border border-sky-300/30">
              ⚡ FAST PACED
            </span>
            <span className="px-3 py-1 rounded-full bg-black/40 border border-amber-300/30 text-amber-300">
              🏆 TROPHY LADDER
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

      {/* 6. BOTTOM NAVIGATION (Handled persistently by Global Dock matching Image 2) */}

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

      {/* 9. GLOBAL RANKINGS LEADERBOARD MODAL */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        playerTrophies={trophies}
      />

      {/* 10. 1V1 CODE ROOM MODAL (PLAY WITH FRIEND) */}
      {isCodeRoomOpen && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#29b6f6] via-[#0288d1] to-[#01579b] border-4 border-[#81d4fa] rounded-[36px] pt-14 px-6 pb-6 shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_2px_10px_rgba(255,255,255,0.4)] text-center animate-in zoom-in-95 duration-150">
            {/* Top Glossy Ribbon */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#d97706] border-2 border-[#fef08a] px-8 py-1.5 rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.5)] whitespace-nowrap">
              <span className="text-sm font-black tracking-widest text-[#78350f] uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] flex items-center gap-2">
                <Users className="w-4 h-4 stroke-[2.5]" /> 1V1 CODE ROOM
              </span>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsCodeRoomOpen(false)}
              className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-rose-500 hover:bg-rose-400 border-2 border-white flex items-center justify-center text-white transition-all cursor-pointer active:scale-90 shadow-lg shadow-rose-950/50"
              title="Close"
            >
              <X className="w-5 h-5 stroke-[3]" />
            </button>

            {/* Mode Switcher Tabs */}
            <div className="flex bg-[#013f6b]/80 p-1 rounded-2xl border border-sky-300/30 mb-5">
              <button
                onClick={() => {
                  sounds.playBump(0.6);
                  setCodeRoomMode('create');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  codeRoomMode === 'create'
                    ? 'bg-gradient-to-b from-[#84cc16] to-[#4d7c0f] text-white shadow border border-[#bef264]'
                    : 'text-sky-200 hover:text-white'
                }`}
              >
                Create Room
              </button>
              <button
                onClick={() => {
                  sounds.playBump(0.6);
                  setCodeRoomMode('join');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  codeRoomMode === 'join'
                    ? 'bg-gradient-to-b from-[#38bdf8] to-[#0284c7] text-white shadow border border-[#7dd3fc]'
                    : 'text-sky-200 hover:text-white'
                }`}
              >
                Join with Code
              </button>
            </div>

            {codeRoomMode === 'create' ? (
              <div className="space-y-4">
                <div className="bg-[#02568f]/80 border-2 border-[#81d4fa]/40 rounded-2xl p-4 shadow-inner">
                  <div className="text-[11px] font-black uppercase tracking-wider text-amber-300 mb-1">
                    Your Generated Room Code
                  </div>
                  <div className="text-3xl sm:text-4xl font-mono font-black tracking-widest text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] my-2">
                    {roomCode}
                  </div>
                  <div className="text-xs text-sky-200 font-semibold">
                    Share this code with your friend. When they enter it, you'll duel 1v1!
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      sounds.playBump(0.6);
                      navigator.clipboard?.writeText(roomCode);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="flex-1 py-2.5 bg-white/15 hover:bg-white/25 border-2 border-white/30 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-4 h-4 text-lime-400 stroke-[3]" />
                        <span className="text-lime-300 font-black">COPIED!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>COPY CODE</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      sounds.playBump(0.6);
                      setRoomCode('RING-' + Math.floor(100 + Math.random() * 900));
                    }}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border-2 border-white/20 text-sky-200 hover:text-white font-black text-xs uppercase rounded-2xl transition-all cursor-pointer"
                    title="Generate New Code"
                  >
                    🎲 NEW
                  </button>
                </div>

                <button
                  onClick={() => {
                    sounds.playFight();
                    setIsCodeRoomOpen(false);
                    onStartCodeRoomMatch(roomCode, true);
                  }}
                  className="w-full py-3.5 bg-gradient-to-b from-[#a3e635] via-[#65a30d] to-[#4d7c0f] hover:from-[#bef264] hover:to-[#65a30d] text-white font-black text-sm uppercase tracking-wider rounded-2xl border-2 border-lime-200 shadow-[0_5px_0_#365314,0_8px_16px_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-[0_1px_0_#365314] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>START PRIVATE DUEL</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-[#02568f]/80 border-2 border-[#81d4fa]/40 rounded-2xl p-4 shadow-inner text-left">
                  <label className="text-[11px] font-black uppercase tracking-wider text-amber-300 block mb-1.5">
                    Enter Friend's Room Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={inputRoomCode}
                      onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
                      placeholder="e.g. RING-482"
                      maxLength={12}
                      className="w-full bg-[#013f6b] text-white placeholder-sky-300/40 font-mono font-black text-center text-xl sm:text-2xl py-3 px-4 rounded-xl border-2 border-sky-300/50 focus:border-amber-400 focus:outline-none tracking-widest uppercase shadow-inner"
                    />
                  </div>
                  <div className="text-[11px] text-sky-200 font-semibold mt-2 text-center">
                    Ask your friend for their 6-digit room code to join their custom match!
                  </div>
                </div>

                {/* Quick Test Demo Codes */}
                <div className="flex items-center justify-center gap-2 text-xs">
                  <span className="text-sky-300 text-[10px] uppercase font-bold">Quick Sample:</span>
                  <button
                    onClick={() => setInputRoomCode('RING-777')}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-[11px] font-black border border-white/20 cursor-pointer"
                  >
                    RING-777
                  </button>
                  <button
                    onClick={() => setInputRoomCode('RING-999')}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-[11px] font-black border border-white/20 cursor-pointer"
                  >
                    RING-999
                  </button>
                </div>

                <button
                  onClick={() => {
                    const code = inputRoomCode.trim() || 'RING-777';
                    sounds.playFight();
                    setIsCodeRoomOpen(false);
                    onStartCodeRoomMatch(code, false);
                  }}
                  className="w-full py-3.5 bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#0369a1] hover:from-[#7dd3fc] hover:to-[#0284c7] text-white font-black text-sm uppercase tracking-wider rounded-2xl border-2 border-sky-200 shadow-[0_5px_0_#075985,0_8px_16px_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-[0_1px_0_#075985] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Swords className="w-4 h-4 stroke-[2.5]" />
                  <span>JOIN & ENTER ARENA</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
