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
  User,
  Dices,
  Radio,
  Music,
  Wifi,
  Zap,
} from 'lucide-react';
import { sounds } from '../audio/soundManager';
import { music } from '../audio/musicManager';
import { crazyGames } from '../game/crazyGamesSdk';
import { LeaderboardModal } from './LeaderboardModal';
import { WelcomeNameModal } from './WelcomeNameModal';
import { generateRandomBot, generateRandomBotName, type BotProfile } from '../game/botGenerator';
import { getSkinPortrait } from '../game/skinThumbnails';

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
  onStartPvPMatch: (bot?: BotProfile) => void;
  playerName?: string;
  onUpdatePlayerName?: (name: string) => void;
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
  playerName = 'Brawler',
  onUpdatePlayerName,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeChampion = CHAMPIONS[selectedChampion];

  // Dynamic Player Level based on real trophies (Starts at 1 for beginner)
  const playerLevel = Math.max(1, Math.floor(trophies / 250) + 1);

  // Player Username & Welcome Modal
  const [username, setUsername] = useState<string>(() => {
    try {
      return localStorage.getItem('ringout_username') || playerName || '';
    } catch {
      return playerName || '';
    }
  });

  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('ringout_username');
    } catch {
      return false;
    }
  });

  const [settingsName, setSettingsName] = useState<string>(() => username || 'Brawler');
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  // Online PvP Matchmaking State (Random 10 to 20 seconds duration)
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(15);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [matchFoundBot, setMatchFoundBot] = useState<BotProfile | null>(null);
  const matchmakingIntervalRef = useRef<number | null>(null);

  const [matchTargetDuration, setMatchTargetDuration] = useState(15);
  const [soundMuted, setSoundMuted] = useState(!sounds.enabled);
  const [musicMuted, setMusicMuted] = useState(!music.enabled);
  const [sfxVolume, setSfxVolume] = useState(() => Math.round(sounds.volume * 100));
  const [musicVolume, setMusicVolume] = useState(() => Math.round(music.volume * 100));

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

  useEffect(() => {
    return () => {
      if (matchmakingIntervalRef.current) clearInterval(matchmakingIntervalRef.current);
    };
  }, []);

  // Handle Online PvP Matchmaking Flow (Random 10 to 20 seconds connection)
  const handleLaunchPvP = () => {
    sounds.playBump(1.0);
    setIsMatchmaking(true);
    setMatchFoundBot(null);

    // Random between 10 to 20 seconds!
    const target = Math.floor(10 + Math.random() * 11);
    setMatchTargetDuration(target);
    const estWait = Math.floor(10 + Math.random() * 11);
    setEstimatedTime(estWait);
    setElapsedSeconds(0);

    const generatedBot = generateRandomBot(selectedChampion);
    let currentElapsed = 0;

    if (matchmakingIntervalRef.current) {
      clearInterval(matchmakingIntervalRef.current);
    }

    sounds.playSonarPing();

    matchmakingIntervalRef.current = window.setInterval(() => {
      currentElapsed += 1;
      setElapsedSeconds(currentElapsed);

      if (currentElapsed >= target) {
        if (matchmakingIntervalRef.current) clearInterval(matchmakingIntervalRef.current);
        matchmakingIntervalRef.current = null;
        setMatchFoundBot(generatedBot);
        sounds.playMatchFound();

        // Reveal opponent card for 1.8s before battle arena
        setTimeout(() => {
          setIsMatchmaking(false);
          setMatchFoundBot(null);
          onStartPvPMatch(generatedBot);
        }, 1800);
      } else {
        if (currentElapsed % 2 === 0) {
          sounds.playSonarPing();
        }
      }
    }, 1000);
  };

  const handleCancelMatchmaking = () => {
    if (matchmakingIntervalRef.current) {
      clearInterval(matchmakingIntervalRef.current);
      matchmakingIntervalRef.current = null;
    }
    sounds.playBump(0.5);
    setIsMatchmaking(false);
    setMatchFoundBot(null);
    setElapsedSeconds(0);
  };

  const handleSaveSettingsName = () => {
    const trimmed = settingsName.trim() || 'Brawler';
    try {
      localStorage.setItem('ringout_username', trimmed);
    } catch {}
    setUsername(trimmed);
    onUpdatePlayerName?.(trimmed);
    sounds.playVictory?.();
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 2000);
  };

  const handleRandomizeSettingsName = () => {
    sounds.playBump(0.5);
    const newTag = generateRandomBotName().replace(/\[.*?\]/, '').replace(/^xX_/, '').replace(/_xX$/, '');
    setSettingsName(newTag);
  };

  const toggleSound = () => {
    const next = !sounds.enabled;
    sounds.setEnabled(next);
    setSoundMuted(!next);
    if (next) sounds.playBump(1.0);
  };

  const toggleMusic = () => {
    const next = !music.enabled;
    music.setEnabled(next);
    setMusicMuted(!next);
    if (sounds.enabled) sounds.playBump(0.6);
  };

  const handleSfxVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseInt(e.target.value, 10);
    setSfxVolume(vol);
    sounds.setVolume(vol / 100);
  };

  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseInt(e.target.value, 10);
    setMusicVolume(vol);
    music.setVolume(vol / 100);
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
          {/* Player Level Badge (Clickable -> Opens Settings/Profile) */}
          <div
            onClick={() => {
              sounds.playBump(0.6);
              setIsSettingsOpen(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-slate-900/90 to-blue-950/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border-2 border-sky-400/50 shadow-[0_4px_15px_rgba(0,0,0,0.3)] cursor-pointer hover:border-sky-300 hover:scale-102 transition-all active:scale-95"
            title="Edit Player Profile & Settings"
          >
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-white flex items-center justify-center shadow">
              <span className="text-xs font-black text-amber-950">🥋</span>
              <span className="absolute -bottom-1 -right-1 bg-sky-500 border border-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow text-white">
                {playerLevel}
              </span>
            </div>
            <div className="text-left">
              <span className="text-[9px] text-sky-200 font-bold uppercase tracking-wider block truncate max-w-[80px] sm:max-w-[120px]">
                {username || 'BRAWLER'}
              </span>
              <span className="text-xs font-black text-amber-300">LEVEL {playerLevel}</span>
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

      {/* 7. MATCHMAKING RADAR OVERLAY (ONLINE PVP - 10 TO 20 SECONDS) */}
      {isMatchmaking && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200 select-none">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-[#1e88e5] via-[#0277bd] to-[#01579b] border-4 border-[#81d4fa] rounded-[36px] pt-14 px-4 sm:px-6 pb-6 shadow-[0_25px_60px_rgba(0,0,0,0.85),inset_0_2px_10px_rgba(255,255,255,0.4)] text-center animate-in zoom-in-95 duration-150">
            {/* Top Glossy Ribbon */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#d97706] border-2 border-[#fef08a] px-6 sm:px-8 py-1.5 rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.5)] whitespace-nowrap">
              <span className="text-xs sm:text-sm font-black tracking-widest text-[#78350f] uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] flex items-center gap-1.5 sm:gap-2">
                {matchFoundBot ? (
                  <>
                    <Sparkles className="w-4 h-4 fill-amber-700" />
                    <span>MATCH FOUND!</span>
                    <Sparkles className="w-4 h-4 fill-amber-700" />
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-amber-700" />
                    <span>SEARCHING FOR MATCH</span>
                    <Zap className="w-4 h-4 fill-amber-700" />
                  </>
                )}
              </span>
            </div>

            {/* 1. Main VS Match Confrontation Grid */}
            <div className="grid grid-cols-11 items-center gap-2 my-2">
              {/* Left Side: PLAYER (YOU) */}
              <div className="col-span-4 bg-[#013f6b]/90 border-2 border-sky-300/50 rounded-2xl p-2 sm:p-2.5 shadow-inner flex flex-col items-center relative overflow-hidden">
                <div className="text-[9px] font-black uppercase tracking-wider text-sky-200 bg-sky-950/70 px-2 py-0.5 rounded-full mb-1">
                  YOU • LVL {playerLevel}
                </div>
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-md bg-slate-900 relative">
                  {getSkinPortrait(selectedChampion, getEquippedSkin(selectedChampion)) ? (
                    <img
                      src={getSkinPortrait(selectedChampion, getEquippedSkin(selectedChampion))!}
                      alt={playerName}
                      className="w-full h-full object-cover scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🥊</div>
                  )}
                </div>
                <div className="text-xs sm:text-sm font-black text-white truncate max-w-full drop-shadow mt-1">
                  {playerName}
                </div>
                <div className="text-[10px] font-bold text-amber-300 uppercase truncate max-w-full">
                  {CHAMPIONS[selectedChampion].name}
                </div>
                <div className="mt-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[9px] font-black uppercase animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  READY
                </div>
              </div>

              {/* Center: VS & Holographic Radar Scanner */}
              <div className="col-span-3 flex flex-col items-center justify-center relative py-1">
                <div className="text-xl sm:text-2xl font-black italic tracking-tighter text-amber-300 drop-shadow-[0_2px_8px_rgba(245,158,11,0.8)] animate-pulse mb-0.5">
                  VS
                </div>

                {/* Animated Holographic Circular Radar */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-cyan-400/60 bg-[#001e38] shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center overflow-hidden">
                  {/* Concentric grid lines */}
                  <div className="absolute inset-1.5 rounded-full border border-cyan-300/30" />
                  <div className="absolute inset-3.5 rounded-full border border-cyan-300/20" />
                  <div className="absolute inset-x-0 top-1/2 h-px bg-cyan-400/40" />
                  <div className="absolute inset-y-0 left-1/2 w-px bg-cyan-400/40" />

                  {/* 360° Rotating Radar Sweep Beam */}
                  <div className="absolute inset-0 rounded-full animate-spin [animation-duration:2.5s] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,rgba(34,211,238,0.5)_360deg)]" />

                  {/* Blinking ping blips */}
                  <div className="absolute top-2.5 left-3 w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  <div className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping [animation-delay:1s]" />

                  {/* Center Node */}
                  <div className="relative z-10 w-2 h-2 rounded-full bg-white shadow-[0_0_6px_#fff]" />
                </div>
              </div>

              {/* Right Side: CHALLENGER CARD (SEARCHING / OPPONENT) */}
              {!matchFoundBot ? (
                <div className="col-span-4 bg-[#013f6b]/60 border-2 border-dashed border-sky-300/40 rounded-2xl p-2 sm:p-2.5 shadow-inner flex flex-col items-center relative overflow-hidden">
                  <div className="text-[9px] font-black uppercase tracking-wider text-amber-200 bg-amber-950/60 px-2 py-0.5 rounded-full mb-1">
                    CHALLENGER
                  </div>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-sky-400/50 bg-gradient-to-b from-sky-900/60 to-slate-900/90 flex flex-col items-center justify-center shadow-md relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/15 to-transparent animate-pulse" />
                    <span className="text-2xl sm:text-3xl font-black text-sky-300 animate-bounce">?</span>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-sky-200 mt-1 animate-pulse">
                    MATCHING...
                  </div>
                  <div className="text-[9px] font-mono text-cyan-300 mt-0.5 flex items-center gap-1">
                    <Wifi className="w-2.5 h-2.5" /> 24ms • GLOBAL
                  </div>
                  <div className="mt-1 px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-400/50 text-sky-300 text-[9px] font-black uppercase flex items-center gap-1">
                    <Radio className="w-2.5 h-2.5 animate-spin" /> SCANNING
                  </div>
                </div>
              ) : (
                <div className="col-span-4 bg-[#013f6b]/95 border-2 border-amber-400 rounded-2xl p-2 sm:p-2.5 shadow-2xl flex flex-col items-center relative overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="text-[9px] font-black uppercase tracking-wider text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full mb-1 border border-amber-400/60">
                    OPPONENT
                  </div>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-xl bg-slate-900">
                    {getSkinPortrait(matchFoundBot.championId, matchFoundBot.skinId) ? (
                      <img
                        src={getSkinPortrait(matchFoundBot.championId, matchFoundBot.skinId)!}
                        alt={matchFoundBot.name}
                        className="w-full h-full object-cover scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">🥊</div>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm font-black text-amber-200 truncate max-w-full drop-shadow mt-1">
                    {matchFoundBot.name}
                  </div>
                  <div className="text-[10px] font-bold text-sky-300 uppercase truncate max-w-full">
                    {CHAMPIONS[matchFoundBot.championId].name}
                  </div>
                  <div className="mt-1 px-2 py-0.5 rounded-full bg-amber-500/30 border border-amber-400 text-amber-300 text-[9px] font-black uppercase animate-bounce">
                    LOCKED IN!
                  </div>
                </div>
              )}
            </div>

            {/* 2. Striped Connection Progress Bar */}
            <div className="w-full h-3 bg-black/50 rounded-full border border-sky-300/40 overflow-hidden relative p-0.5 my-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-lime-400 transition-all duration-300 shadow-[0_0_10px_rgba(34,211,238,0.7)]"
                style={{
                  width: `${Math.min(100, Math.round((elapsedSeconds / Math.max(1, matchTargetDuration)) * 100))}%`,
                }}
              />
            </div>

            {/* 3. Live Server Telemetry Capsule */}
            <div className="bg-[#012d4d]/80 border border-sky-300/30 rounded-2xl p-2.5 my-2 text-center shadow-inner">
              <div className="text-xs sm:text-sm text-cyan-200 font-mono font-bold flex items-center justify-center gap-2">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>
                  {elapsedSeconds < 4
                    ? 'Scanning regional server match nodes...'
                    : elapsedSeconds < 8
                    ? 'Filtering brawlers in your trophy league...'
                    : elapsedSeconds < 12
                    ? 'Synchronizing duel physics & arena sync...'
                    : 'Handshake confirmed! Finalizing ring drop...'}
                </span>
              </div>
              <div className="text-[11px] text-sky-200 font-bold mt-1 flex items-center justify-center gap-3">
                <span>⏱️ Estimated: ~{estimatedTime}s</span>
                <span>•</span>
                <span>⏳ Elapsed: {elapsedSeconds}s</span>
                <span>•</span>
                <span>🏆 League: Bronze III+</span>
              </div>
            </div>

            {/* 4. Tactical Gameplay Tip Ticker */}
            <div className="bg-black/30 border border-white/10 rounded-xl px-3 py-1.5 text-[11px] text-sky-200 italic my-2">
              {elapsedSeconds % 16 < 4
                ? '💡 Tip: Fully charged dashes knock enemies 2x further off the edge!'
                : elapsedSeconds % 16 < 8
                ? '💡 Tip: Circle around your enemy to dodge dashes and strike their back!'
                : elapsedSeconds % 16 < 12
                ? '💡 Tip: The island ring shrinks over time—keep control of the center!'
                : '💡 Tip: Win matches to unlock Mega Boxes and rare skins on the Trophy Road!'}
            </div>

            {/* 5. Action Buttons */}
            {!matchFoundBot ? (
              <button
                onClick={handleCancelMatchmaking}
                className="mt-1 px-8 py-2.5 bg-gradient-to-b from-[#f87171] via-[#ef4444] to-[#b91c1c] hover:from-[#fca5a5] hover:to-[#ef4444] text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl border-2 border-rose-200 shadow-[0_4px_0_#7f1d1d,0_6px_14px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-[0_1px_0_#7f1d1d] transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <X className="w-4 h-4 stroke-[3]" />
                <span>CANCEL MATCHMAKING</span>
              </button>
            ) : (
              <div className="mt-1 py-2.5 px-8 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-white shadow-xl animate-pulse inline-flex items-center gap-2">
                <Swords className="w-4 h-4 stroke-[2.5]" />
                <span>ENTERING ARENA...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. SETTINGS MODAL (PLAYER PROFILE & AUDIO CONTROLS) */}
      {isSettingsOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-gradient-to-b from-[#29b6f6] via-[#0288d1] to-[#01579b] border-4 border-[#81d4fa] rounded-[36px] pt-14 px-6 pb-6 shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_2px_10px_rgba(255,255,255,0.4)] text-center animate-in zoom-in-95 duration-150">
            {/* Top Glossy Ribbon */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#d97706] border-2 border-[#fef08a] px-10 py-1.5 rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.5)] whitespace-nowrap">
              <span className="text-base sm:text-lg font-black tracking-widest text-[#78350f] uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                SETTINGS & PROFILE
              </span>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-rose-500 hover:bg-rose-400 border-2 border-white flex items-center justify-center text-white transition-all cursor-pointer active:scale-90 shadow-lg shadow-rose-950/50"
              title="Close Settings"
            >
              <X className="w-5 h-5 stroke-[3]" />
            </button>

            <div className="space-y-3 my-2 text-left">
              {/* 1. USERNAME / PLAYER IDENTITY */}
              <div className="bg-[#02568f]/80 border-2 border-[#81d4fa]/40 rounded-2xl p-3 shadow-inner">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> BRAWLER USERNAME
                  </span>
                  <span className="text-[9px] font-mono text-sky-200">LVL {playerLevel}</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settingsName}
                    onChange={(e) => setSettingsName(e.target.value)}
                    maxLength={16}
                    placeholder="Enter Name"
                    className="flex-1 bg-[#013f6b] text-white placeholder-sky-300/40 font-black text-sm px-3 py-2 rounded-xl border border-sky-300/50 focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    onClick={handleRandomizeSettingsName}
                    className="px-2.5 bg-white/15 hover:bg-white/25 border border-white/30 text-yellow-300 rounded-xl cursor-pointer active:scale-90"
                    title="Roll Random Tag"
                  >
                    <Dices className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSaveSettingsName}
                    className="px-3.5 py-2 bg-gradient-to-b from-[#a3e635] to-[#4d7c0f] text-white font-black text-xs uppercase rounded-xl border border-lime-200 shadow cursor-pointer active:scale-95"
                  >
                    {settingsSavedToast ? 'SAVED!' : 'SAVE'}
                  </button>
                </div>
              </div>

              {/* 2. LOBBY & BATTLE MUSIC TOGGLE */}
              <div className="bg-[#02568f]/80 border-2 border-[#81d4fa]/40 rounded-2xl p-3 space-y-2 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shadow">
                      <Music className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-white block">Game Music</span>
                      <span className="text-[10px] text-sky-200">Lobby & Battle Tracks</span>
                    </div>
                  </div>
                  <button
                    onClick={toggleMusic}
                    className="bg-[#013f6b] p-1 rounded-full border border-sky-300/40 flex items-center cursor-pointer shadow-inner"
                  >
                    <span
                      className={`px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                        !musicMuted
                          ? 'bg-gradient-to-b from-[#84cc16] to-[#4d7c0f] text-white shadow border border-[#bef264]'
                          : 'text-sky-300 opacity-60'
                      }`}
                    >
                      ON
                    </span>
                    <span
                      className={`px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                        musicMuted
                          ? 'bg-gradient-to-b from-slate-400 to-slate-600 text-white shadow border border-slate-300'
                          : 'text-sky-300 opacity-60'
                      }`}
                    >
                      OFF
                    </span>
                  </button>
                </div>
                {!musicMuted && (
                  <div className="flex items-center gap-2 pt-1 border-t border-sky-300/20">
                    <span className="text-[10px] font-mono text-sky-200 min-w-8">{musicVolume}%</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={musicVolume}
                      onChange={handleMusicVolumeChange}
                      className="w-full accent-amber-400 h-1.5 bg-[#013f6b] rounded-lg cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* 3. AUDIO SFX TOGGLE */}
              <div className="bg-[#02568f]/80 border-2 border-[#81d4fa]/40 rounded-2xl p-3 space-y-2 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shadow">
                      <Volume2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-white block">Battle SFX</span>
                      <span className="text-[10px] text-sky-200">Sound effects & hits</span>
                    </div>
                  </div>
                  <button
                    onClick={toggleSound}
                    className="bg-[#013f6b] p-1 rounded-full border border-sky-300/40 flex items-center cursor-pointer shadow-inner"
                  >
                    <span
                      className={`px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                        !soundMuted
                          ? 'bg-gradient-to-b from-[#84cc16] to-[#4d7c0f] text-white shadow border border-[#bef264]'
                          : 'text-sky-300 opacity-60'
                      }`}
                    >
                      ON
                    </span>
                    <span
                      className={`px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                        soundMuted
                          ? 'bg-gradient-to-b from-slate-400 to-slate-600 text-white shadow border border-slate-300'
                          : 'text-sky-300 opacity-60'
                      }`}
                    >
                      OFF
                    </span>
                  </button>
                </div>
                {!soundMuted && (
                  <div className="flex items-center gap-2 pt-1 border-t border-sky-300/20">
                    <span className="text-[10px] font-mono text-sky-200 min-w-8">{sfxVolume}%</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sfxVolume}
                      onChange={handleSfxVolumeChange}
                      className="w-full accent-amber-400 h-1.5 bg-[#013f6b] rounded-lg cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* 4. VERSION & SERVER STATUS */}
              <div className="bg-black/40 rounded-2xl p-2.5 text-center border border-white/10">
                <div className="text-xs font-black text-white">Ring Out: Chapter 1</div>
                <div className="text-[10px] text-sky-300 font-mono mt-0.5">
                  Version 1.0.6 • Server: Online 🟢 • Audio Engine: Active 🎵
                </div>
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

      {/* 11. WELCOME NAME MODAL ON FIRST PLAY */}
      <WelcomeNameModal
        isOpen={isWelcomeModalOpen}
        onConfirm={(name) => {
          try {
            localStorage.setItem('ringout_username', name);
          } catch {}
          setUsername(name);
          setSettingsName(name);
          onUpdatePlayerName?.(name);
          setIsWelcomeModalOpen(false);
        }}
      />
    </div>
  );
};
