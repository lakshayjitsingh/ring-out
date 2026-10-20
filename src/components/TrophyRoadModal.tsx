import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import {
  Trophy,
  X,
  Check,
  Lock,
  Sparkles,
  Eye,
  Target,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../audio/soundManager';
import {
  type ChampionId,
  createChampionMesh,
} from '../game/championModels';
import {
  getSkinInfo,
  type ChampionSkin,
} from '../game/championSkins';
import { MegaBoxGraphic } from './MegaBoxGraphic';

export interface TrophyMilestone {
  trophies: number;
  rewardType: 'gold' | 'gems' | 'champion' | 'league_skin' | 'mega_box';
  rewardLabel: string;
  amount?: number;
  championId?: ChampionId;
  skinId?: string;
  goldBonus?: number;
  gemBonus?: number;
  leagueName?: string;
  arenaThemeName?: string;
  isLeagueGate?: boolean;
  skinSlotName?: string;
  gateBadge?: string;
  gateColor?: string;
  gateGlow?: string;
  seasonReward?: number;
}

interface TrophyRoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  trophies: number;
  claimedMilestones: number[];
  onClaimMilestone: (milestone: TrophyMilestone) => void;
  gold?: number;
  gems?: number;
}

// =========================================================================
// PRECISE TROPHY ROAD DATA:
// Every 100 trophies till 1,000 trophies, then after every 250 trophies!
// League Changes (500, 1000, 2000, 3000, 4000, 5000) award a MEGA BOX!
// =========================================================================
export const TROPHY_ROAD_DATA: TrophyMilestone[] = [
  // 1. UNRANKED ARENA (0 - 499 🏆)
  {
    trophies: 0,
    rewardType: 'gems',
    rewardLabel: 'Starter Bounty',
    amount: 100,
    leagueName: 'Unranked Arena',
    arenaThemeName: 'Emerald Isles Starter Ring',
    gateBadge: 'UNRANKED',
    gateColor: '#38bdf8',
    seasonReward: 100,
  },
  {
    trophies: 100,
    rewardType: 'gold',
    rewardLabel: '200 Coins',
    amount: 200,
    leagueName: 'Unranked Arena',
  },
  {
    trophies: 200,
    rewardType: 'gems',
    rewardLabel: '60 Gems',
    amount: 60,
    leagueName: 'Unranked Arena',
  },
  {
    trophies: 300,
    rewardType: 'champion',
    rewardLabel: 'Unlock Kai',
    championId: 'kai',
    leagueName: 'Unranked Arena',
  },
  {
    trophies: 400,
    rewardType: 'gold',
    rewardLabel: '400 Coins',
    amount: 400,
    leagueName: 'Unranked Arena',
  },

  // 2. BRONZE LEAGUE GATE (500 🏆) -> MEGA BOX REWARD!
  {
    trophies: 500,
    rewardType: 'mega_box',
    rewardLabel: 'Bronze Mega Box',
    skinId: 'leo_sunset',
    championId: 'leo',
    skinSlotName: 'Sunset Reef Leo (Rare)',
    goldBonus: 500,
    gemBonus: 50,
    leagueName: 'Bronze League',
    arenaThemeName: 'Bronze Gladiator Coliseum',
    isLeagueGate: true,
    gateBadge: 'BRONZE I',
    gateColor: '#cd7f32',
    gateGlow: 'rgba(205, 127, 50, 0.4)',
    seasonReward: 200,
  },
  {
    trophies: 600,
    rewardType: 'gems',
    rewardLabel: '80 Gems',
    amount: 80,
    leagueName: 'Bronze League',
  },
  {
    trophies: 700,
    rewardType: 'gold',
    rewardLabel: '600 Coins',
    amount: 600,
    leagueName: 'Bronze League',
  },
  {
    trophies: 800,
    rewardType: 'gems',
    rewardLabel: '100 Gems',
    amount: 100,
    leagueName: 'Bronze League',
  },
  {
    trophies: 900,
    rewardType: 'gold',
    rewardLabel: '800 Coins',
    amount: 800,
    leagueName: 'Bronze League',
  },

  // 3. SILVER LEAGUE GATE (1000 🏆) -> MEGA BOX REWARD!
  {
    trophies: 1000,
    rewardType: 'mega_box',
    rewardLabel: 'Silver Mega Box',
    skinId: 'bolt_cyber_racer',
    championId: 'bolt',
    skinSlotName: 'Cyber Racer Axel (Epic)',
    goldBonus: 1000,
    gemBonus: 100,
    leagueName: 'Silver League',
    arenaThemeName: 'Silver Cyber Docks',
    isLeagueGate: true,
    gateBadge: 'SILVER I',
    gateColor: '#94a3b8',
    gateGlow: 'rgba(148, 163, 184, 0.4)',
    seasonReward: 300,
  },

  // NOW AFTER 1,000 TROPHIES: EVERY 250 TROPHIES!
  {
    trophies: 1250,
    rewardType: 'champion',
    rewardLabel: 'Unlock Nova',
    championId: 'nova',
    leagueName: 'Silver League',
  },
  {
    trophies: 1500,
    rewardType: 'gold',
    rewardLabel: '1,000 Coins',
    amount: 1000,
    leagueName: 'Silver League',
  },
  {
    trophies: 1750,
    rewardType: 'gems',
    rewardLabel: '150 Gems',
    amount: 150,
    leagueName: 'Silver League',
  },

  // 4. GOLD LEAGUE GATE (2000 🏆) -> MEGA BOX REWARD!
  {
    trophies: 2000,
    rewardType: 'mega_box',
    rewardLabel: 'Gold Mega Box',
    skinId: 'titan_gladiator',
    championId: 'titan',
    skinSlotName: 'Colosseum Gladiator Gorr (Epic)',
    goldBonus: 1500,
    gemBonus: 150,
    leagueName: 'Gold League',
    arenaThemeName: 'Golden Summit Arena',
    isLeagueGate: true,
    gateBadge: 'GOLD I',
    gateColor: '#eab308',
    gateGlow: 'rgba(234, 179, 8, 0.4)',
    seasonReward: 400,
  },
  {
    trophies: 2250,
    rewardType: 'champion',
    rewardLabel: 'Unlock Titan Gorr',
    championId: 'titan',
    leagueName: 'Gold League',
  },
  {
    trophies: 2500,
    rewardType: 'gold',
    rewardLabel: '1,500 Coins',
    amount: 1500,
    leagueName: 'Gold League',
  },
  {
    trophies: 2750,
    rewardType: 'gems',
    rewardLabel: '200 Gems',
    amount: 200,
    leagueName: 'Gold League',
  },

  // 5. DIAMOND LEAGUE GATE (3000 🏆) -> MEGA BOX REWARD!
  {
    trophies: 3000,
    rewardType: 'mega_box',
    rewardLabel: 'Diamond Mega Box',
    skinId: 'kage_cyber_ronin',
    championId: 'kage',
    skinSlotName: 'Cyber Ronin Kage (Epic)',
    goldBonus: 2500,
    gemBonus: 250,
    leagueName: 'Diamond League',
    arenaThemeName: 'Diamond Ronin Sanctum',
    isLeagueGate: true,
    gateBadge: 'DIAMOND I',
    gateColor: '#06b6d4',
    gateGlow: 'rgba(6, 182, 212, 0.4)',
    seasonReward: 500,
  },
  {
    trophies: 3250,
    rewardType: 'champion',
    rewardLabel: 'Unlock Kage',
    championId: 'kage',
    leagueName: 'Diamond League',
  },
  {
    trophies: 3500,
    rewardType: 'gold',
    rewardLabel: '2,000 Coins',
    amount: 2000,
    leagueName: 'Diamond League',
  },
  {
    trophies: 3750,
    rewardType: 'gems',
    rewardLabel: '300 Gems',
    amount: 300,
    leagueName: 'Diamond League',
  },

  // 6. MASTER LEAGUE GATE (4000 🏆) -> MEGA BOX REWARD!
  {
    trophies: 4000,
    rewardType: 'mega_box',
    rewardLabel: 'Master Mega Box',
    skinId: 'kai_quantum',
    championId: 'kai',
    skinSlotName: 'Quantum Overdrive Kai (Legendary)',
    goldBonus: 4000,
    gemBonus: 400,
    leagueName: 'Master League',
    arenaThemeName: 'Master Quantum Rift',
    isLeagueGate: true,
    gateBadge: 'MASTER I',
    gateColor: '#a855f7',
    gateGlow: 'rgba(168, 85, 247, 0.4)',
    seasonReward: 700,
  },
  {
    trophies: 4250,
    rewardType: 'champion',
    rewardLabel: 'Unlock Axel',
    championId: 'bolt',
    leagueName: 'Master League',
  },
  {
    trophies: 4500,
    rewardType: 'gold',
    rewardLabel: '3,000 Coins',
    amount: 3000,
    leagueName: 'Master League',
  },
  {
    trophies: 4750,
    rewardType: 'gems',
    rewardLabel: '400 Gems',
    amount: 400,
    leagueName: 'Master League',
  },

  // 7. GRANDMASTER APEX GATE (5000+ 🏆) -> SUPER MEGA BOX!
  {
    trophies: 5000,
    rewardType: 'mega_box',
    rewardLabel: 'Apex Super Mega Box',
    skinId: 'leo_poseidon',
    championId: 'leo',
    skinSlotName: 'Poseidon God-King Leo (Legendary)',
    goldBonus: 10000,
    gemBonus: 1000,
    leagueName: 'Grandmaster League',
    arenaThemeName: 'Grandmaster Olympus Citadel',
    isLeagueGate: true,
    gateBadge: 'GRANDMASTER APEX',
    gateColor: '#ec4899',
    gateGlow: 'rgba(236, 72, 153, 0.5)',
    seasonReward: 1000,
  },
];

// Interactive 3D Skin Inspector Modal Component
const SkinInspectorModal: React.FC<{
  milestone: TrophyMilestone;
  skin: ChampionSkin;
  isReached: boolean;
  isClaimed: boolean;
  onClaim: () => void;
  onClose: () => void;
}> = ({ milestone, skin, isReached, isClaimed, onClaim, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentRotationRef = useRef<number>(Math.PI);
  const isDraggingRef = useRef<boolean>(false);
  const lastMouseXRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 50);
    camera.position.set(0, 1.45, 4.4);
    camera.lookAt(0, 1.05, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambient);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 1.0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.4);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(skin.glowColor, 2.0);
    rimLight.position.set(-3, 3, -3);
    scene.add(rimLight);

    const pedestalGroup = new THREE.Group();
    const baseGeo = new THREE.CylinderGeometry(1.4, 1.6, 0.2, 40);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.5,
      roughness: 0.3,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.1;
    baseMesh.receiveShadow = true;
    pedestalGroup.add(baseMesh);

    const ringGeo = new THREE.TorusGeometry(1.42, 0.035, 16, 40);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: skin.glowColor });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = 0.01;
    pedestalGroup.add(ringMesh);
    scene.add(pedestalGroup);

    const championModel = createChampionMesh(skin.championId, skin.id);
    championModel.group.position.set(0, 0, 0);
    championModel.group.scale.set(1.15, 1.15, 1.15);
    scene.add(championModel.group);

    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      if (!isDraggingRef.current) {
        currentRotationRef.current += delta * 0.45;
      }
      championModel.group.rotation.y = currentRotationRef.current;

      if (championModel.floatingGroup) {
        championModel.floatingGroup.rotation.y = elapsedTime * 0.7;
      }

      renderer.render(scene, camera);
    };
    animate();

    const onStart = (clientX: number) => {
      isDraggingRef.current = true;
      lastMouseXRef.current = clientX;
    };
    const onMove = (clientX: number) => {
      if (!isDraggingRef.current) return;
      const deltaX = clientX - lastMouseXRef.current;
      currentRotationRef.current += deltaX * 0.015;
      lastMouseXRef.current = clientX;
    };
    const onEnd = () => {
      isDraggingRef.current = false;
    };

    const handleMouseDown = (e: MouseEvent) => onStart(e.clientX);
    const handleMouseMove = (e: MouseEvent) => onMove(e.clientX);
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) onStart(e.touches[0].clientX);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) onMove(e.touches[0].clientX);
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', onEnd);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', onEnd);

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
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', onEnd);
      container.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', onEnd);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [milestone, skin]);

  const rarityGradients = {
    legendary: 'from-amber-400 via-yellow-500 to-amber-600 text-slate-950 border-amber-300',
    epic: 'from-purple-500 via-pink-500 to-rose-500 text-white border-purple-300',
    rare: 'from-cyan-400 via-sky-500 to-blue-600 text-white border-cyan-300',
    default: 'from-slate-600 to-slate-800 text-white border-slate-400',
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] border-4 border-amber-400/80 rounded-[32px] p-5 sm:p-6 shadow-[0_25px_70px_rgba(0,0,0,0.9),inset_0_2px_10px_rgba(255,255,255,0.2)] flex flex-col animate-in zoom-in-95 duration-150">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/15">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm bg-gradient-to-r ${rarityGradients[skin.rarity]}`}>
              {skin.rarity === 'legendary' ? '👑 LEGENDARY SKIN' : skin.rarity === 'epic' ? '⚡ EPIC SKIN' : '💎 RARE SKIN'}
            </span>
            <span className="text-xs font-mono font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30">
              {milestone.trophies} 🏆 REWARD
            </span>
          </div>

          <button
            onClick={() => {
              sounds.playBump(0.6);
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-rose-500 hover:bg-rose-400 border border-white flex items-center justify-center text-white transition-all cursor-pointer active:scale-90 shadow"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* 3D Model Showcase Window */}
        <div className="relative h-64 sm:h-72 w-full my-3 rounded-2xl bg-gradient-to-b from-sky-950/40 via-slate-900/60 to-black/80 border border-white/10 overflow-hidden shadow-inner flex items-center justify-center">
          <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />
          
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 border border-white/20 text-[10px] text-sky-200 font-bold uppercase tracking-wider backdrop-blur-sm pointer-events-none flex items-center gap-1.5 shadow">
            <Eye className="w-3.5 h-3.5 text-amber-300" />
            Drag to Rotate 360°
          </div>
        </div>

        {/* Skin Lore & Details */}
        <div className="space-y-2 text-left">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              {skin.name}
            </h2>
            <span className="text-xs font-black uppercase tracking-wider text-amber-300">
              {milestone.leagueName}
            </span>
          </div>

          <div className="text-xs font-black text-cyan-300 drop-shadow-sm">
            {skin.tagline}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-black/30 p-2.5 rounded-xl border border-white/10 shadow-inner">
            {skin.description}
          </p>

          {/* Bundled Bonuses Pill */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-mono text-xs font-black">
              🪙 +{milestone.goldBonus?.toLocaleString()} Gold
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-mono text-xs font-black">
              💎 +{milestone.gemBonus?.toLocaleString()} Gems
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-3 border-t border-white/15">
          {isClaimed ? (
            <div className="w-full py-3 rounded-2xl bg-lime-500/20 border border-lime-400 text-lime-300 text-sm font-black uppercase flex items-center justify-center gap-2 shadow">
              <Check className="w-5 h-5 stroke-[3]" /> SKIN UNLOCKED & CLAIMED!
            </div>
          ) : isReached ? (
            <button
              onClick={() => {
                onClaim();
                onClose();
              }}
              className="w-full py-3.5 bg-gradient-to-b from-[#84cc16] via-[#65a30d] to-[#4d7c0f] hover:from-[#a3e635] text-white font-black text-sm uppercase tracking-wider rounded-2xl border-2 border-lime-200 shadow-[0_5px_0_#365314,0_8px_20px_rgba(132,204,22,0.4)] active:translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-white" />
              <span>COLLECT & EQUIP SKIN NOW!</span>
            </button>
          ) : (
            <div className="w-full py-3 rounded-2xl bg-slate-800/80 border border-slate-600 text-slate-400 text-sm font-bold flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" />
              <span>REACH {milestone.trophies} TROPHIES TO UNLOCK</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const TrophyRoadModal: React.FC<TrophyRoadModalProps> = ({
  isOpen,
  onClose,
  trophies,
  claimedMilestones,
  onClaimMilestone,
  gold = 0,
  gems = 0,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentStepRef = useRef<HTMLDivElement>(null);
  const [inspectingSkin, setInspectingSkin] = useState<{
    milestone: TrophyMilestone;
    skin: ChampionSkin;
  } | null>(null);

  const isDraggingTrack = useRef<boolean>(false);
  const dragStartX = useRef<number>(0);
  const dragScrollLeft = useRef<number>(0);

  useEffect(() => {
    if (isOpen && currentStepRef.current && scrollRef.current) {
      setTimeout(() => {
        if (!currentStepRef.current || !scrollRef.current) return;
        const targetLeft = currentStepRef.current.offsetLeft - scrollRef.current.clientWidth / 2 + 100;
        scrollRef.current.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
      }, 250);
    }
  }, [isOpen]);

  const handleWheel = (e: React.WheelEvent) => {
    if (!scrollRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      scrollRef.current.scrollLeft += e.deltaY * 1.5;
    }
  };

  const handleTrackMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDraggingTrack.current = true;
    dragStartX.current = e.pageX - scrollRef.current.offsetLeft;
    dragScrollLeft.current = scrollRef.current.scrollLeft;
  };

  const handleTrackMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingTrack.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - dragStartX.current) * 1.5;
    scrollRef.current.scrollLeft = dragScrollLeft.current - walk;
  };

  const handleTrackMouseUp = () => {
    isDraggingTrack.current = false;
  };

  if (!isOpen) return null;

  const getCurrentLeague = (tr: number) => {
    if (tr >= 5000) return { name: 'Grandmaster Apex', color: '#ec4899', next: 5000, max: 5000, min: 4000 };
    if (tr >= 4000) return { name: 'Master League', color: '#a855f7', next: 5000, max: 5000, min: 4000 };
    if (tr >= 3000) return { name: 'Diamond League', color: '#06b6d4', next: 4000, max: 4000, min: 3000 };
    if (tr >= 2000) return { name: 'Gold League', color: '#eab308', next: 3000, max: 3000, min: 2000 };
    if (tr >= 1000) return { name: 'Silver League', color: '#94a3b8', next: 2000, max: 2000, min: 1000 };
    if (tr >= 500) return { name: 'Bronze League', color: '#cd7f32', next: 1000, max: 1000, min: 500 };
    return { name: 'Unranked Arena', color: '#38bdf8', next: 500, max: 500, min: 0 };
  };

  const currentLeague = getCurrentLeague(trophies);

  const handleClaim = (m: TrophyMilestone) => {
    sounds.playVictory();
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.5 },
      colors: ['#facc15', '#38bdf8', '#22c55e', '#ec4899'],
    });
    onClaimMilestone(m);
  };

  const scrollToMyPosition = () => {
    sounds.playBump(0.6);
    if (currentStepRef.current && scrollRef.current) {
      const targetLeft = currentStepRef.current.offsetLeft - scrollRef.current.clientWidth / 2 + 100;
      scrollRef.current.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
    }
  };

  const scrollByDelta = (delta: number) => {
    sounds.playBump(0.5);
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: delta, behavior: 'smooth' });
    }
  };

  const COLUMN_WIDTH = 210;
  const maxTrophies = 5000;
  const progressRatio = Math.min(1, Math.max(0, trophies / maxTrophies));

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen overflow-hidden flex flex-col bg-[#075985] animate-in fade-in duration-200 select-none">
      
      {/* 1. AUTHENTIC BRAWL STARS VIBRANT BLUE BACKDROP */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#0284c7_0%,#0369a1_45%,#075985_80%,#082f49_100%)]" />
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 2px, transparent 3px),
                              radial-gradient(circle at 75% 20%, rgba(255,255,255,0.4) 3px, transparent 4px),
                              radial-gradient(circle at 40% 70%, rgba(255,255,255,0.4) 2.5px, transparent 3.5px)`,
            backgroundSize: '160px 160px',
          }}
        />
      </div>

      {/* 2. TOP HEADER HUD */}
      <div className="relative z-30 px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between bg-slate-950/40 backdrop-blur-md border-b border-white/15 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-6 sm:px-10 py-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 border-2 border-yellow-200 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
            <Trophy className="w-5 h-5 text-yellow-200 fill-yellow-300 drop-shadow" />
            <h1 className="text-sm sm:text-lg font-black tracking-widest uppercase text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)]">
              TROPHY ROAD
            </h1>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-black/50 border border-white/20 rounded-2xl text-amber-300 font-mono font-black text-sm">
            <span>🏆</span>
            <span>{trophies.toLocaleString()}</span>
            <span className="text-[10px] text-sky-200 font-sans font-bold px-2 py-0.5 rounded-full bg-white/10 uppercase">
              {currentLeague.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 bg-black/45 border border-white/20 rounded-2xl px-3 py-1.5 shadow-inner">
            <div className="flex items-center gap-1 font-mono font-bold text-xs text-amber-300">
              <span>🪙</span>
              <span>{gold.toLocaleString()}</span>
            </div>
            <div className="w-px h-3.5 bg-white/20" />
            <div className="flex items-center gap-1 font-mono font-bold text-xs text-cyan-300">
              <span>💎</span>
              <span>{gems.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playBump(0.6);
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-rose-500 hover:bg-rose-400 border-2 border-white flex items-center justify-center text-white transition-all cursor-pointer active:scale-90 shadow-md"
            title="Close"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* 3. BRAWL STARS HORIZONTAL ROAD PROGRESSION */}
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        onMouseDown={handleTrackMouseDown}
        onMouseMove={handleTrackMouseMove}
        onMouseUp={handleTrackMouseUp}
        onMouseLeave={handleTrackMouseUp}
        className="relative z-20 flex-1 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing flex items-center"
      >
        <div
          className="relative flex items-center h-full px-16 sm:px-24"
          style={{ width: `${(TROPHY_ROAD_DATA.length + 1) * COLUMN_WIDTH + 300}px` }}
        >
          {/* Base Unreached Track */}
          <div
            className="absolute left-16 right-16 top-1/2 -translate-y-1/2 h-5 rounded-full bg-[#0a192f] border-2 border-[#1e3a8a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_4px_10px_rgba(0,0,0,0.5)] z-0"
          />

          {/* Filled Orange/Gold Progress Track */}
          <div
            className="absolute left-16 top-1/2 -translate-y-1/2 h-5 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 border-2 border-yellow-200 shadow-[0_0_15px_rgba(245,158,11,0.7),inset_0_1px_3px_rgba(255,255,255,0.6)] z-1 transition-all duration-300"
            style={{
              width: `${Math.max(
                30,
                progressRatio * (TROPHY_ROAD_DATA.length * COLUMN_WIDTH)
              )}px`,
            }}
          />

          {/* Player Trophy Pointer Marker (Matching Screenshot) */}
          <div
            ref={currentStepRef}
            className="absolute z-30 transition-all duration-300 flex flex-col items-center pointer-events-none"
            style={{
              left: `${Math.max(
                40,
                64 + progressRatio * (TROPHY_ROAD_DATA.length * COLUMN_WIDTH)
              )}px`,
              top: '50%',
              transform: 'translate(-50%, 14px)',
            }}
          >
            <div className="w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-amber-400 drop-shadow" />
            <div className="bg-gradient-to-b from-[#f59e0b] via-[#d97706] to-[#b45309] border-2 border-yellow-200 px-3.5 py-1 rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.6)] flex items-center gap-1.5 whitespace-nowrap">
              <Trophy className="w-4 h-4 text-yellow-200 fill-yellow-300" />
              <span className="font-mono font-black text-sm text-white drop-shadow">
                {trophies.toLocaleString()}
              </span>
            </div>
          </div>

          {/* MILESTONE NODES */}
          {TROPHY_ROAD_DATA.map((milestone) => {
            const isReached = trophies >= milestone.trophies;
            const isClaimed = claimedMilestones.includes(milestone.trophies);
            const skin = milestone.skinId ? getSkinInfo(milestone.skinId) : undefined;
            const isMegaBox = milestone.rewardType === 'mega_box';
            const isGate = milestone.isLeagueGate;

            return (
              <div
                key={milestone.trophies}
                className="relative flex flex-col items-center justify-center flex-shrink-0"
                style={{ width: `${COLUMN_WIDTH}px`, height: '100%' }}
              >
                {/* TOP HALF: REWARD CARD (Above Track) */}
                <div className="absolute bottom-[54%] flex flex-col items-center">
                  <div
                    className={`w-1.5 h-10 -mb-1 ${
                      isReached ? 'bg-amber-400' : 'bg-slate-700'
                    } rounded-full z-0`}
                  />

                  <div
                    className={`relative p-3 rounded-2xl border-3 transition-all duration-200 flex flex-col items-center text-center shadow-2xl ${
                      isGate
                        ? 'w-48 sm:w-52 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                        : isMegaBox
                        ? 'w-40 sm:w-44 bg-gradient-to-b from-[#1e1b4b] to-[#0f172a] border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                        : isClaimed
                        ? 'w-36 bg-[#0369a1]/85 border-white/20 opacity-85'
                        : isReached
                        ? 'w-36 bg-gradient-to-b from-[#0284c7] to-[#0369a1] border-yellow-300 shadow-[0_0_15px_rgba(253,224,71,0.5)] scale-105'
                        : 'w-36 bg-[#0c4a6e]/80 border-white/20'
                    }`}
                  >
                    {isGate && (
                      <div
                        className="absolute -top-3.5 px-3 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider border shadow"
                        style={{
                          backgroundColor: milestone.gateColor,
                          color: '#ffffff',
                          borderColor: '#ffffff',
                        }}
                      >
                        {milestone.gateBadge} LEAGUE GATE
                      </div>
                    )}

                    {/* ARTWORK (Real Mega Box SVG Graphic — NO STATIC PLAIN TEXT!) */}
                    <div className="my-1.5 flex items-center justify-center">
                      {isMegaBox ? (
                        <div
                          onClick={() => skin && setInspectingSkin({ milestone, skin })}
                          className="cursor-pointer group flex items-center justify-center"
                          title={skin ? `Click to inspect ${skin.name} 3D Model` : 'League Mega Box'}
                        >
                          <MegaBoxGraphic size={isGate ? 85 : 72} />
                        </div>
                      ) : milestone.rewardType === 'champion' ? (
                        <div className="w-14 h-14 rounded-2xl bg-black/50 border-2 border-emerald-400 flex items-center justify-center text-3xl shadow">
                          🥊
                        </div>
                      ) : milestone.rewardType === 'gold' ? (
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-2xl shadow">
                          🪙
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-2xl shadow">
                          💎
                        </div>
                      )}
                    </div>

                    {/* Reward Title */}
                    <div className="text-center w-full">
                      <div className="text-xs font-black text-white leading-tight truncate px-1">
                        {milestone.rewardLabel}
                      </div>

                      {isGate && (
                        <div className="text-[10px] text-amber-300 font-bold mt-0.5">
                          +{milestone.goldBonus?.toLocaleString()}🪙 • +{milestone.gemBonus}💎
                        </div>
                      )}

                      {skin && (
                        <button
                          onClick={() => setInspectingSkin({ milestone, skin })}
                          className="mt-1 text-[9px] font-black uppercase text-cyan-300 hover:text-white underline cursor-pointer"
                        >
                          Inspect 3D Skin
                        </button>
                      )}
                    </div>

                    {/* Status Action / Checkmark */}
                    <div className="mt-2 w-full flex items-center justify-center">
                      {isClaimed ? (
                        <div className="w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-md">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : isReached ? (
                        <button
                          onClick={() => handleClaim(milestone)}
                          className="w-full py-1.5 bg-gradient-to-b from-[#84cc16] via-[#65a30d] to-[#4d7c0f] hover:from-[#a3e635] text-white font-black text-[11px] uppercase tracking-wider rounded-xl border border-lime-200 shadow-[0_3px_0_#365314] active:translate-y-0.5 transition-all cursor-pointer animate-pulse"
                        >
                          COLLECT
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300 bg-black/40 px-2.5 py-1 rounded-full border border-white/10">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>{milestone.trophies} 🏆</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* CENTER TRACK NODE */}
                <div
                  className={`w-6 h-6 rounded-full border-3 z-10 shadow-lg flex items-center justify-center transition-transform ${
                    isReached
                      ? 'bg-amber-400 border-white scale-125 shadow-amber-400/60'
                      : 'bg-slate-800 border-slate-600'
                  }`}
                >
                  {isClaimed ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  ) : isReached ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-100 animate-ping" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  )}
                </div>

                {/* BOTTOM HALF: TROPHY REQUIREMENT & LEAGUE GATE SHIELDS */}
                <div className="absolute top-[54%] flex flex-col items-center">
                  <div
                    className={`w-1.5 h-6 -mt-1 ${
                      isReached ? 'bg-amber-400' : 'bg-slate-700'
                    } rounded-full z-0`}
                  />

                  <div
                    className={`font-mono font-black text-xs px-2.5 py-0.5 rounded-full border mb-2 shadow-sm ${
                      isReached
                        ? 'bg-amber-400/25 border-amber-300 text-amber-200'
                        : 'bg-black/40 border-white/10 text-slate-400'
                    }`}
                  >
                    {milestone.trophies} 🏆
                  </div>

                  {milestone.gateBadge && (
                    <div
                      className="p-3 rounded-2xl border-2 flex flex-col items-center text-center shadow-xl w-40"
                      style={{
                        backgroundColor: `${milestone.gateColor}20`,
                        borderColor: milestone.gateColor,
                        boxShadow: `0 8px 20px ${milestone.gateGlow || 'rgba(0,0,0,0.5)'}`,
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl border-2 flex items-center justify-center text-lg font-black text-white shadow-md mb-1"
                        style={{
                          backgroundColor: milestone.gateColor,
                          borderColor: '#ffffff',
                        }}
                      >
                        🛡️
                      </div>

                      <div className="text-xs font-black text-white uppercase tracking-wider">
                        {milestone.gateBadge}
                      </div>

                      <div className="text-[10px] font-bold text-sky-200 mt-0.5">
                        {milestone.leagueName}
                      </div>

                      {milestone.seasonReward && (
                        <div className="mt-1.5 px-2 py-0.5 rounded-md bg-black/50 border border-white/20 text-[9px] font-mono font-bold text-amber-300">
                          SEASON REWARD: 🪙 {milestone.seasonReward}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. BOTTOM CONTROLS */}
      <div className="relative z-30 px-4 sm:px-8 py-3 bg-slate-950/50 backdrop-blur-md border-t border-white/15 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollByDelta(-350)}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
            title="Scroll Left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scrollByDelta(350)}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
            title="Scroll Right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <span className="text-[11px] text-sky-200 font-bold hidden sm:inline ml-1">
            Drag track or scroll wheel to explore all milestones
          </span>
        </div>

        <button
          onClick={scrollToMyPosition}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 text-white font-black text-xs uppercase tracking-wider border-2 border-yellow-200 shadow-[0_4px_0_#9a3412,0_6px_15px_rgba(245,158,11,0.5)] active:translate-y-1 transition-all cursor-pointer"
        >
          <Target className="w-4 h-4 text-yellow-200" />
          <span>My Current Rank ({trophies} 🏆)</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-white/20 text-white">
          <Clock className="w-4 h-4 text-amber-300" />
          <div className="text-right">
            <div className="text-[8px] uppercase tracking-wider text-sky-300 font-bold">
              SEASON ENDS IN
            </div>
            <div className="text-xs font-mono font-black text-amber-300">
              12d 11h
            </div>
          </div>
        </div>
      </div>

      {/* 5. INTERACTIVE 3D SKIN INSPECTOR MODAL */}
      {inspectingSkin && (
        <SkinInspectorModal
          milestone={inspectingSkin.milestone}
          skin={inspectingSkin.skin}
          isReached={trophies >= inspectingSkin.milestone.trophies}
          isClaimed={claimedMilestones.includes(inspectingSkin.milestone.trophies)}
          onClaim={() => handleClaim(inspectingSkin.milestone)}
          onClose={() => setInspectingSkin(null)}
        />
      )}
    </div>
  );
};
