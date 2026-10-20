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

export interface TrophyMilestone {
  trophies: number;
  rewardType: 'gold' | 'gems' | 'champion' | 'league_skin';
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
}

interface TrophyRoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  trophies: number;
  claimedMilestones: number[];
  onClaimMilestone: (milestone: TrophyMilestone) => void;
}

export const TROPHY_ROAD_DATA: TrophyMilestone[] = [
  // 1. UNRANKED ARENA (0 - 499 🏆)
  {
    trophies: 0,
    rewardType: 'gems',
    rewardLabel: 'Starter Bounty: 50 Gems',
    amount: 50,
    leagueName: 'Unranked Arena',
    arenaThemeName: 'Emerald Isles Starter Ring',
  },
  {
    trophies: 100,
    rewardType: 'gold',
    rewardLabel: '200 Gold Coins',
    amount: 200,
    leagueName: 'Unranked Arena',
  },
  {
    trophies: 250,
    rewardType: 'champion',
    rewardLabel: 'Unlock Kai (Urban Skater)',
    championId: 'kai',
    leagueName: 'Unranked Arena',
  },
  {
    trophies: 400,
    rewardType: 'gems',
    rewardLabel: '60 Green Gems',
    amount: 60,
    leagueName: 'Unranked Arena',
  },

  // 2. BRONZE LEAGUE GATE (500 🏆)
  {
    trophies: 500,
    rewardType: 'league_skin',
    rewardLabel: 'Bronze Gate • Sunset Reef Leo',
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
  },
  {
    trophies: 700,
    rewardType: 'gold',
    rewardLabel: '400 Gold Coins',
    amount: 400,
    leagueName: 'Bronze League',
  },
  {
    trophies: 850,
    rewardType: 'gems',
    rewardLabel: '80 Green Gems',
    amount: 80,
    leagueName: 'Bronze League',
  },

  // 3. SILVER LEAGUE GATE (1000 🏆)
  {
    trophies: 1000,
    rewardType: 'league_skin',
    rewardLabel: 'Silver Gate • Cyber Racer Axel',
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
  },
  {
    trophies: 1300,
    rewardType: 'champion',
    rewardLabel: 'Unlock Nova (Agile Kickboxer)',
    championId: 'nova',
    leagueName: 'Silver League',
  },
  {
    trophies: 1600,
    rewardType: 'gold',
    rewardLabel: '800 Gold Coins',
    amount: 800,
    leagueName: 'Silver League',
  },
  {
    trophies: 1800,
    rewardType: 'gems',
    rewardLabel: '120 Green Gems',
    amount: 120,
    leagueName: 'Silver League',
  },

  // 4. GOLD LEAGUE GATE (2000 🏆)
  {
    trophies: 2000,
    rewardType: 'league_skin',
    rewardLabel: 'Gold Gate • Colosseum Gladiator Gorr',
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
  },
  {
    trophies: 2300,
    rewardType: 'champion',
    rewardLabel: 'Unlock Titan Gorr (Mountain Juggernaut)',
    championId: 'titan',
    leagueName: 'Gold League',
  },
  {
    trophies: 2600,
    rewardType: 'gold',
    rewardLabel: '1,200 Gold Coins',
    amount: 1200,
    leagueName: 'Gold League',
  },
  {
    trophies: 2850,
    rewardType: 'gems',
    rewardLabel: '180 Green Gems',
    amount: 180,
    leagueName: 'Gold League',
  },

  // 5. DIAMOND LEAGUE GATE (3000 🏆)
  {
    trophies: 3000,
    rewardType: 'league_skin',
    rewardLabel: 'Diamond Gate • Cyber Ronin Kage',
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
  },
  {
    trophies: 3300,
    rewardType: 'champion',
    rewardLabel: 'Unlock Kage (Shadow Shinobi)',
    championId: 'kage',
    leagueName: 'Diamond League',
  },
  {
    trophies: 3600,
    rewardType: 'gold',
    rewardLabel: '2,000 Gold Coins',
    amount: 2000,
    leagueName: 'Diamond League',
  },
  {
    trophies: 3850,
    rewardType: 'gems',
    rewardLabel: '300 Green Gems',
    amount: 300,
    leagueName: 'Diamond League',
  },

  // 6. MASTER LEAGUE GATE (4000 🏆)
  {
    trophies: 4000,
    rewardType: 'league_skin',
    rewardLabel: 'Master Gate • Quantum Overdrive Kai',
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
  },
  {
    trophies: 4400,
    rewardType: 'champion',
    rewardLabel: 'Unlock Axel (Street Sprinter)',
    championId: 'bolt',
    leagueName: 'Master League',
  },
  {
    trophies: 4700,
    rewardType: 'gold',
    rewardLabel: '3,500 Gold Coins',
    amount: 3500,
    leagueName: 'Master League',
  },
  {
    trophies: 4900,
    rewardType: 'gems',
    rewardLabel: '500 Green Gems',
    amount: 500,
    leagueName: 'Master League',
  },

  // 7. GRANDMASTER APEX GATE (5000+ 🏆)
  {
    trophies: 5000,
    rewardType: 'league_skin',
    rewardLabel: 'Grandmaster Gate • Poseidon God-King Leo',
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

    // Warm studio stage lighting
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

    // Pedestal
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

    // Glowing Neon Ring
    const ringGeo = new THREE.TorusGeometry(1.42, 0.035, 16, 40);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: skin.glowColor });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = 0.01;
    pedestalGroup.add(ringMesh);

    scene.add(pedestalGroup);

    // Build 3D Champion Model with this skin
    const model = createChampionMesh(milestone.championId || skin.championId, skin.id);
    scene.add(model.group);

    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (!isDraggingRef.current) {
        currentRotationRef.current += 0.007;
      }
      model.group.rotation.y = currentRotationRef.current;

      // Animate floating group (wings, crowns, halos, drums)
      if (model.floatingGroup) {
        model.floatingGroup.rotation.y = elapsedTime * 0.7;
        model.floatingGroup.position.y = Math.sin(elapsedTime * 2.5) * 0.06;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Mouse / Touch drag to rotate
    const onStart = (clientX: number) => {
      isDraggingRef.current = true;
      lastMouseXRef.current = clientX;
    };
    const onMove = (clientX: number) => {
      if (!isDraggingRef.current) return;
      const dx = clientX - lastMouseXRef.current;
      lastMouseXRef.current = clientX;
      currentRotationRef.current += dx * 0.01;
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
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
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
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentStepRef = useRef<HTMLDivElement>(null);
  const [inspectingSkin, setInspectingSkin] = useState<{
    milestone: TrophyMilestone;
    skin: ChampionSkin;
  } | null>(null);

  // Auto-scroll towards player's current trophy position
  useEffect(() => {
    if (isOpen && currentStepRef.current) {
      setTimeout(() => {
        currentStepRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 250);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Determine current league
  const getCurrentLeague = (tr: number) => {
    if (tr >= 5000) return { name: 'Grandmaster League', color: '#ec4899', next: 5000, max: 5000, min: 4000 };
    if (tr >= 4000) return { name: 'Master League', color: '#a855f7', next: 5000, max: 5000, min: 4000 };
    if (tr >= 3000) return { name: 'Diamond League', color: '#06b6d4', next: 4000, max: 4000, min: 3000 };
    if (tr >= 2000) return { name: 'Gold League', color: '#eab308', next: 3000, max: 3000, min: 2000 };
    if (tr >= 1000) return { name: 'Silver League', color: '#94a3b8', next: 2000, max: 2000, min: 1000 };
    if (tr >= 500) return { name: 'Bronze League', color: '#cd7f32', next: 1000, max: 1000, min: 500 };
    return { name: 'Unranked Arena', color: '#38bdf8', next: 500, max: 500, min: 0 };
  };

  const currentLeague = getCurrentLeague(trophies);
  const leagueProgress = Math.min(100, Math.max(0, ((trophies - currentLeague.min) / (currentLeague.max - currentLeague.min)) * 100));

  const handleClaim = (m: TrophyMilestone) => {
    sounds.playVictory();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#facc15', '#38bdf8', '#22c55e', '#ec4899'],
    });
    onClaimMilestone(m);
  };

  const scrollToMyPosition = () => {
    sounds.playBump(0.6);
    currentStepRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#0284c7] via-[#0369a1] to-[#075985] border-4 border-[#38bdf8] rounded-[36px] pt-14 pb-4 px-3 sm:px-6 shadow-[0_25px_70px_rgba(0,0,0,0.9),inset_0_2px_10px_rgba(255,255,255,0.3)] flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        
        {/* Top 3D Ribbon Banner */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#d97706] border-2 border-[#fef08a] px-8 sm:px-14 py-1.5 rounded-2xl shadow-[0_5px_15px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.6)] whitespace-nowrap">
          <span className="text-lg sm:text-xl font-black tracking-widest text-[#78350f] uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] flex items-center gap-2">
            <Trophy className="w-5 h-5 fill-amber-700 text-[#78350f]" />
            TROPHY ROAD & LEAGUES
          </span>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playBump(0.6);
            onClose();
          }}
          className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-rose-500 hover:bg-rose-400 border-2 border-white flex items-center justify-center text-white transition-all cursor-pointer active:scale-90 shadow-lg shadow-rose-950/50"
          title="Close Trophy Road"
        >
          <X className="w-5 h-5 stroke-[3]" />
        </button>

        {/* Top Sticky Trophy Status & League Progress */}
        <div className="bg-black/55 border-2 border-white/20 rounded-2xl p-3 mb-3 shadow-inner flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl border-2 shadow-lg"
                style={{
                  backgroundColor: `${currentLeague.color}25`,
                  borderColor: currentLeague.color,
                  color: '#ffffff',
                }}
              >
                🏆
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-sky-200">
                  CURRENT RATING
                </div>
                <div className="text-xl sm:text-2xl font-black font-mono text-amber-300 drop-shadow flex items-center gap-1.5">
                  {trophies.toLocaleString()} <span className="text-xs text-amber-200 font-bold">TROPHIES</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span
                className="inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border mb-1 shadow-sm"
                style={{
                  backgroundColor: `${currentLeague.color}25`,
                  borderColor: currentLeague.color,
                  color: currentLeague.color,
                }}
              >
                {currentLeague.name}
              </span>
              <div className="text-xs font-black text-white">
                Next Gate: {currentLeague.next.toLocaleString()} 🏆
              </div>
            </div>
          </div>

          {/* League Progress Bar */}
          <div className="w-full bg-slate-900/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${leagueProgress}%`,
                backgroundColor: currentLeague.color,
                boxShadow: `0 0 10px ${currentLeague.color}`,
              }}
            />
          </div>
        </div>

        {/* CLASH ROYALE STYLE VERTICAL WINDING ROAD */}
        <div
          ref={scrollRef}
          className="relative flex-1 overflow-y-auto px-2 sm:px-4 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* Central Vertical Winding Grass & Road Line */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-b from-emerald-600 via-green-600 to-emerald-700 border-x-4 border-emerald-400 shadow-[0_0_15px_rgba(34,197,94,0.4)] rounded-full z-0 opacity-80" />
          
          {/* Stepping Path Stones */}
          <div className="relative z-10 space-y-6">
            {TROPHY_ROAD_DATA.map((milestone, idx) => {
              const isReached = trophies >= milestone.trophies;
              const isClaimed = claimedMilestones.includes(milestone.trophies);
              const isCurrentStep = !isClaimed && isReached;
              const isEven = idx % 2 === 0;

              // 1. LEAGUE GATE ARCHWAY (Bronze, Silver, Gold, Diamond, Master, Grandmaster)
              if (milestone.isLeagueGate) {
                const skin = milestone.skinId ? getSkinInfo(milestone.skinId) : undefined;

                return (
                  <div
                    key={milestone.trophies}
                    ref={isCurrentStep ? currentStepRef : null}
                    className="relative my-8 pt-5 pb-6 px-4 bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-slate-900/95 border-4 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.85)] text-center overflow-hidden"
                    style={{
                      borderColor: milestone.gateColor,
                      boxShadow: `0 0 25px ${milestone.gateGlow || 'rgba(0,0,0,0.5)'}`,
                    }}
                  >
                    {/* Archway League Title */}
                    <div
                      className="inline-block px-6 py-1.5 rounded-2xl border-2 font-black text-xs sm:text-sm uppercase tracking-widest text-white shadow-lg mb-2"
                      style={{
                        backgroundColor: `${milestone.gateColor}35`,
                        borderColor: milestone.gateColor,
                      }}
                    >
                      👑 {(milestone.leagueName || 'League').toUpperCase()} • {milestone.trophies} 🏆
                    </div>

                    <div className="text-xs text-amber-300 font-bold mb-3 flex items-center justify-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{milestone.arenaThemeName || 'Championship Arena'}</span>
                    </div>

                    {/* REAL LEAGUE SKIN REWARD CARD (With 3D Preview Inspector) */}
                    <div className="max-w-md mx-auto bg-black/70 border-2 rounded-2xl p-4 shadow-inner relative flex flex-col sm:flex-row items-center justify-between gap-4 border-amber-400/50">
                      <div className="flex items-center gap-3.5 text-left flex-1">
                        {/* Skin Icon Box */}
                        <div
                          className="w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl shadow-lg relative cursor-pointer group"
                          style={{
                            borderColor: milestone.gateColor,
                            backgroundColor: `${milestone.gateColor}25`,
                          }}
                          onClick={() => skin && setInspectingSkin({ milestone, skin })}
                          title="Click to Preview 3D Skin"
                        >
                          {skin?.rarity === 'legendary' ? '👑' : skin?.rarity === 'epic' ? '⚡' : '💎'}
                          <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="w-5 h-5 text-white drop-shadow" />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider">
                              {skin?.rarity === 'legendary' ? '👑 LEGENDARY REWARD' : skin?.rarity === 'epic' ? '⚡ EPIC REWARD' : '💎 RARE REWARD'}
                            </span>
                          </div>
                          <div className="text-sm font-black text-white flex items-center gap-1.5">
                            <span>{skin?.name || milestone.skinSlotName}</span>
                          </div>
                          <div className="text-[11px] text-sky-200 font-semibold mt-0.5 line-clamp-1">
                            +{milestone.goldBonus?.toLocaleString()}🪙 • +{milestone.gemBonus?.toLocaleString()}💎
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons: 3D Preview + Collect */}
                      <div className="flex items-center gap-2">
                        {skin && (
                          <button
                            onClick={() => setInspectingSkin({ milestone, skin })}
                            className="px-3 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/35 border border-sky-400/50 text-sky-200 text-xs font-black uppercase flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                            title="Inspect 3D Model"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>3D</span>
                          </button>
                        )}

                        {isClaimed ? (
                          <div className="px-4 py-2 rounded-xl bg-lime-500/20 border border-lime-400 text-lime-300 text-xs font-black uppercase flex items-center gap-1.5 shadow">
                            <Check className="w-4 h-4 stroke-[3]" /> CLAIMED
                          </div>
                        ) : isReached ? (
                          <button
                            onClick={() => handleClaim(milestone)}
                            className="px-4 py-2.5 bg-gradient-to-b from-[#84cc16] via-[#65a30d] to-[#4d7c0f] hover:from-[#a3e635] text-white font-black text-xs uppercase tracking-wider rounded-xl border-2 border-lime-200 shadow-[0_4px_0_#365314] active:translate-y-1 transition-all cursor-pointer animate-bounce"
                          >
                            COLLECT!
                          </button>
                        ) : (
                          <div className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-600 text-slate-400 text-xs font-bold flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5" /> LOCKED
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              // 2. STANDARD STEPPING ROAD MILESTONES (Left & Right alternating like Clash Royale)
              return (
                <div
                  key={milestone.trophies}
                  ref={isCurrentStep ? currentStepRef : null}
                  className={`relative flex items-center justify-between gap-3 ${
                    isEven ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  {/* Left/Right Reward Card */}
                  <div
                    className={`flex-1 max-w-[240px] sm:max-w-xs p-3.5 rounded-2xl border-2 shadow-xl transition-all duration-200 flex items-center justify-between gap-3 ${
                      isClaimed
                        ? 'bg-slate-900/60 border-white/10 opacity-70'
                        : isReached
                        ? 'bg-gradient-to-r from-[#02568f]/95 to-[#013f6b]/95 border-lime-300 shadow-[0_0_20px_rgba(132,204,22,0.4)] scale-105'
                        : 'bg-slate-900/75 border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Reward Icon */}
                      <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/20 flex items-center justify-center text-lg shadow">
                        {milestone.rewardType === 'gold' && '🪙'}
                        {milestone.rewardType === 'gems' && '💎'}
                        {milestone.rewardType === 'champion' && '🥊'}
                      </div>
                      <div className="text-left">
                        <div className="text-[10px] font-mono font-black text-amber-300">
                          {milestone.trophies} 🏆
                        </div>
                        <div className="text-xs font-black text-white leading-tight">
                          {milestone.rewardLabel}
                        </div>
                      </div>
                    </div>

                    {/* Claim Button / Status */}
                    <div>
                      {isClaimed ? (
                        <div className="w-7 h-7 rounded-full bg-lime-500/20 border border-lime-400 flex items-center justify-center text-lime-400">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : isReached ? (
                        <button
                          onClick={() => handleClaim(milestone)}
                          className="px-3.5 py-1.5 bg-gradient-to-b from-[#84cc16] to-[#4d7c0f] hover:from-[#a3e635] text-white font-black text-[11px] uppercase rounded-xl border border-lime-200 shadow-[0_3px_0_#365314] active:translate-y-1 transition-all cursor-pointer animate-pulse"
                        >
                          COLLECT
                        </button>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-500">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Center Road Island Block (Clash Royale Grass & Path Node) */}
                  <div className="relative flex flex-col items-center justify-center">
                    <div
                      className={`w-14 h-14 rounded-2xl border-4 flex flex-col items-center justify-center shadow-lg transition-transform ${
                        isReached
                          ? 'bg-gradient-to-b from-amber-400 to-yellow-500 border-amber-200 text-slate-950 scale-110 shadow-amber-500/40'
                          : 'bg-gradient-to-b from-slate-700 to-slate-800 border-slate-600 text-slate-400'
                      }`}
                    >
                      <Trophy className="w-5 h-5 fill-current" />
                      <span className="text-[9px] font-mono font-black mt-0.5">
                        {milestone.trophies}
                      </span>
                    </div>

                    {/* Floating Marker if user is right here */}
                    {isCurrentStep && (
                      <div className="absolute -top-3 px-2 py-0.5 rounded-full bg-lime-400 text-slate-950 text-[8px] font-black uppercase tracking-wider animate-bounce shadow">
                        YOU ARE HERE
                      </div>
                    )}
                  </div>

                  {/* Empty Spacer on other side */}
                  <div className="flex-1 max-w-[240px] sm:max-w-xs hidden sm:block" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Quick Jump Button */}
        <button
          onClick={scrollToMyPosition}
          className="absolute bottom-14 right-5 sm:right-8 px-3.5 py-2 rounded-2xl bg-[#0284c7]/90 hover:bg-[#0369a1] border-2 border-white/40 text-white font-black text-[11px] uppercase tracking-wider shadow-2xl backdrop-blur-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          title="Scroll to My Current Trophy Rank"
        >
          <Target className="w-3.5 h-3.5 text-amber-300" />
          <span>My Rank</span>
        </button>

        {/* Bottom Shortcut */}
        <div className="mt-2 text-center">
          <span className="text-[10px] text-sky-200 font-bold uppercase tracking-wider">
            Clash Royale Style Road • Win matches to claim 6 Exclusive League Gate Skins & Gems!
          </span>
        </div>

        {/* Interactive 3D Skin Inspector Modal */}
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
    </div>
  );
};
