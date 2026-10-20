import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  CHAMPIONS,
  type ChampionId,
  createChampionMesh,
  type CreatedChampion,
} from '../game/championModels';
import {
  getChampionSkins,
  getEquippedSkin,
  setEquippedSkin,
  isSkinUnlocked,
  unlockSkin,
  type ChampionSkin,
} from '../game/championSkins';
import {
  Check,
  Rotate3d,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Crown,
  Zap,
  Diamond,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../audio/soundManager';

interface ChampionShowcaseProps {
  selectedChampion: ChampionId;
  trophies?: number;
  gold?: number;
  gems?: number;
  setGems?: React.Dispatch<React.SetStateAction<number>>;
  onSelectChampion: (id: ChampionId) => void;
  onBackToBattle: () => void;
}

export const ChampionShowcase: React.FC<ChampionShowcaseProps> = ({
  selectedChampion,
  trophies = 0,
  gold = 100,
  gems = 50,
  setGems,
  onSelectChampion,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<ChampionId>(selectedChampion);
  const activeChampion = CHAMPIONS[activeId];

  // Skin Locker State
  const [equippedSkinId, setEquippedSkinState] = useState<string>(() => getEquippedSkin(selectedChampion));
  const [previewSkinId, setPreviewSkinId] = useState<string>(() => getEquippedSkin(selectedChampion));
  const [, setSkinsVersion] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 2800);
  };

  // Three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const modelHolderRef = useRef<THREE.Group | null>(null);
  const pedestalRef = useRef<THREE.Group | null>(null);
  const currentModelRef = useRef<CreatedChampion | null>(null);

  // 360 Drag rotation state
  const isDraggingRef = useRef(false);
  const prevMouseXRef = useRef(0);
  const rotationVelocityRef = useRef(0);
  const currentRotationYRef = useRef(Math.PI);

  // Switch between champions via Arrow buttons
  const CHAMPION_IDS: ChampionId[] = ['leo', 'kai', 'nova', 'titan', 'kage', 'bolt'];
  const currentIndex = CHAMPION_IDS.indexOf(activeId);

  const handlePrevChampion = () => {
    sounds.playBump(0.6);
    const prevIdx = (currentIndex - 1 + CHAMPION_IDS.length) % CHAMPION_IDS.length;
    const newId = CHAMPION_IDS[prevIdx];
    setActiveId(newId);
    const skin = getEquippedSkin(newId);
    setEquippedSkinState(skin);
    setPreviewSkinId(skin);
  };

  const handleNextChampion = () => {
    sounds.playBump(0.6);
    const nextIdx = (currentIndex + 1) % CHAMPION_IDS.length;
    const newId = CHAMPION_IDS[nextIdx];
    setActiveId(newId);
    const skin = getEquippedSkin(newId);
    setEquippedSkinState(skin);
    setPreviewSkinId(skin);
  };

  // 3D Turntable Initialization
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 1.35, 4.2);
    camera.lookAt(0, 1.0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambient);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0284c7, 1.1);
    scene.add(hemiLight);

    const frontKey = new THREE.DirectionalLight(0xfffbeb, 2.4);
    frontKey.position.set(1.5, 5.0, 5.0);
    frontKey.castShadow = true;
    scene.add(frontKey);

    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 1.8);
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    // Pedestal Turntable
    const pedestalGroup = new THREE.Group();
    pedestalRef.current = pedestalGroup;

    const baseGeo = new THREE.CylinderGeometry(1.8, 2.0, 0.25, 48);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.5,
      roughness: 0.25,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.125;
    baseMesh.receiveShadow = true;
    pedestalGroup.add(baseMesh);

    const ringGeo = new THREE.TorusGeometry(1.85, 0.04, 16, 48);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = 0.01;
    pedestalGroup.add(ringMesh);

    scene.add(pedestalGroup);

    const modelHolder = new THREE.Group();
    modelHolderRef.current = modelHolder;
    scene.add(modelHolder);

    // Animation Loop
    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      if (!isDraggingRef.current) {
        currentRotationYRef.current += rotationVelocityRef.current;
        rotationVelocityRef.current *= 0.94;
        if (Math.abs(rotationVelocityRef.current) < 0.001) {
          currentRotationYRef.current += delta * 0.35;
        }
      }

      modelHolder.rotation.y = currentRotationYRef.current;
      pedestalGroup.rotation.y = currentRotationYRef.current * 0.25;

      if (currentModelRef.current?.floatingGroup) {
        currentModelRef.current.floatingGroup.rotation.y = elapsedTime * 0.7;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Drag to rotate controls
    const onStart = (clientX: number) => {
      isDraggingRef.current = true;
      prevMouseXRef.current = clientX;
      rotationVelocityRef.current = 0;
    };

    const onMove = (clientX: number) => {
      if (!isDraggingRef.current) return;
      const deltaX = clientX - prevMouseXRef.current;
      currentRotationYRef.current += deltaX * 0.015;
      rotationVelocityRef.current = deltaX * 0.005;
      prevMouseXRef.current = clientX;
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
  }, []);

  // Update 3D Character Model when Champion or Skin Changes
  useEffect(() => {
    if (!modelHolderRef.current) return;
    const holder = modelHolderRef.current;

    while (holder.children.length > 0) {
      holder.remove(holder.children[0]);
    }

    const skinToLoad = previewSkinId || `${activeId}_default`;
    const createdModel = createChampionMesh(activeId, skinToLoad);
    currentModelRef.current = createdModel;

    createdModel.group.position.set(0, 0, 0);
    holder.add(createdModel.group);
  }, [activeId, previewSkinId]);

  const skins = getChampionSkins(activeId);
  const activeSkin = skins.find((s) => s.id === previewSkinId) || skins[0];
  const isPreviewSkinUnlocked = isSkinUnlocked(previewSkinId);
  const isEquipped = activeId === selectedChampion && equippedSkinId === previewSkinId;

  const handleSelectSkin = (skin: ChampionSkin) => {
    sounds.playBump(0.7);
    setPreviewSkinId(skin.id);
  };

  const handleEquip = () => {
    sounds.playVictory?.();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#38bdf8', '#facc15', '#a855f7', '#22c55e'],
    });
    setEquippedSkin(activeId, previewSkinId);
    setEquippedSkinState(previewSkinId);
    onSelectChampion(activeId);
    showToast(`Equipped ${activeSkin.name}!`);
  };

  const handleUnlockSkin = (skin: ChampionSkin) => {
    if (gems < skin.gemCost) {
      sounds.playBump(0.8);
      showToast(`Need ${skin.gemCost} Gems to unlock!`);
      return;
    }

    sounds.playVictory?.();
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
    });

    if (setGems) {
      setGems((prev) => {
        const next = prev - skin.gemCost;
        try {
          localStorage.setItem('ringout_gems', String(next));
        } catch {}
        return next;
      });
    }

    unlockSkin(skin.id);
    setEquippedSkin(activeId, skin.id);
    setEquippedSkinState(skin.id);
    setPreviewSkinId(skin.id);
    onSelectChampion(activeId);
    setSkinsVersion((v) => v + 1);
    showToast(`Unlocked & equipped ${skin.name}! 🎉`);
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#075985] flex flex-col select-none overflow-hidden animate-in fade-in duration-200">
      
      {/* 0. 4K STYLIZED MATTE BACKDROP */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#0284c7_0%,#0369a1_50%,#075985_85%,#082f49_100%)]" />
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 2px, transparent 3px),
                              radial-gradient(circle at 80% 25%, rgba(255,255,255,0.4) 3px, transparent 4px)`,
            backgroundSize: '140px 140px',
          }}
        />
      </div>

      {/* 1. TOP HEADER HUD (Currencies & Trophies - Matching Image 2) */}
      <div className="relative z-30 px-4 sm:px-6 py-3 flex items-center justify-between pointer-events-none">
        {/* Currencies */}
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/20 shadow-xl pointer-events-auto">
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

        {/* Player Trophies */}
        <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/20 shadow-xl pointer-events-auto">
          <span className="text-amber-300 text-sm">🏆</span>
          <span className="font-mono font-black text-xs text-amber-300">{trophies.toLocaleString()}</span>
        </div>
      </div>

      {/* TOAST MESSAGE */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-6 py-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 border-2 border-white text-white font-black text-xs uppercase tracking-wider shadow-2xl animate-in slide-in-from-top-4 duration-150">
          {toastMessage}
        </div>
      )}

      {/* 2. 3D TURNTABLE STAGE */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-10" />

      {/* 3. LARGE FLOATING NAVIGATION ARROWS (Matching Image 2!) */}
      <button
        onClick={handlePrevChampion}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-14 sm:w-14 sm:h-16 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border-2 border-white/30 text-white flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-2xl backdrop-blur-md group"
        title="Previous Champion"
      >
        <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8 group-hover:-translate-x-0.5 transition-transform" />
      </button>

      <button
        onClick={handleNextChampion}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-14 sm:w-14 sm:h-16 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border-2 border-white/30 text-white flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-2xl backdrop-blur-md group"
        title="Next Champion"
      >
        <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8 group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* 360 Hint */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/15 text-[10px] text-sky-200 font-bold uppercase tracking-wider backdrop-blur-md pointer-events-none shadow">
        <Rotate3d className="w-3.5 h-3.5 text-amber-300" />
        <span>Drag to rotate 360°</span>
      </div>

      {/* 4. BOTTOM CHARACTER CARD & SKINS CAROUSEL (Matching Image 2!) */}
      <div className="absolute bottom-20 left-0 right-0 z-30 px-3 sm:px-6 pointer-events-auto">
        <div className="max-w-2xl mx-auto bg-slate-950/85 backdrop-blur-xl border-2 border-white/20 rounded-3xl p-3.5 sm:p-4 shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex flex-col gap-3">
          
          {/* Character & Skin Lore Title Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black uppercase text-white tracking-wide">
                  {activeChampion.name}
                </h2>
                <span
                  className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border shadow-sm"
                  style={{
                    backgroundColor: `${activeChampion.color}25`,
                    borderColor: activeChampion.color,
                    color: activeChampion.color,
                  }}
                >
                  {activeChampion.archetype}
                </span>
              </div>
              <div className="text-xs font-bold text-amber-300 mt-0.5">
                {activeSkin.name} • <span className="text-sky-200">{activeSkin.tagline}</span>
              </div>
            </div>

            {/* Trait Pill */}
            <div className="hidden sm:block text-right">
              <div className="text-[9px] uppercase font-bold text-slate-400">Signature Trait</div>
              <div className="text-xs font-black text-amber-200">{activeChampion.stats.trait}</div>
            </div>
          </div>

          {/* HORIZONTAL SKINS STRIP (Click displays skin on 3D character in real time!) */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {skins.map((skin) => {
              const isSelected = skin.id === previewSkinId;
              const isUnlocked = isSkinUnlocked(skin.id);
              const isSkinEquipped = activeId === selectedChampion && equippedSkinId === skin.id;

              return (
                <div
                  key={skin.id}
                  onClick={() => handleSelectSkin(skin)}
                  className={`relative flex-shrink-0 w-24 sm:w-28 p-2 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center ${
                    isSelected
                      ? 'bg-gradient-to-b from-sky-900/90 to-slate-900/95 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-105'
                      : 'bg-slate-900/60 hover:bg-slate-900/80 border-white/15'
                  }`}
                >
                  {/* Rarity Pill */}
                  <span
                    className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full border mb-1 flex items-center gap-0.5 ${
                      skin.rarity === 'legendary'
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400'
                        : skin.rarity === 'epic'
                        ? 'bg-purple-400/20 text-purple-300 border-purple-400'
                        : skin.rarity === 'rare'
                        ? 'bg-cyan-400/20 text-cyan-300 border-cyan-400'
                        : 'bg-white/10 text-slate-300 border-white/20'
                    }`}
                  >
                    {skin.rarity === 'legendary' && <Crown className="w-2.5 h-2.5" />}
                    {skin.rarity === 'epic' && <Zap className="w-2.5 h-2.5" />}
                    {skin.rarity === 'rare' && <Diamond className="w-2.5 h-2.5" />}
                    <span>{skin.rarity.toUpperCase()}</span>
                  </span>

                  {/* Skin Icon Artwork */}
                  <div
                    className="w-10 h-10 rounded-xl border flex items-center justify-center text-lg shadow mb-1"
                    style={{
                      backgroundColor: `${skin.themeColor}35`,
                      borderColor: skin.themeColor,
                    }}
                  >
                    {skin.rarity === 'legendary' ? '👑' : skin.rarity === 'epic' ? '⚡' : skin.rarity === 'rare' ? '💎' : '🥊'}
                  </div>

                  <div className="text-[10px] font-black text-white truncate w-full leading-tight">
                    {skin.name}
                  </div>

                  {/* Status Badge */}
                  <div className="mt-1">
                    {isSkinEquipped ? (
                      <span className="text-[8px] font-black text-emerald-400 uppercase bg-emerald-500/20 px-1.5 py-0.2 rounded-full border border-emerald-400/40">
                        EQUIPPED
                      </span>
                    ) : isUnlocked ? (
                      <span className="text-[8px] font-bold text-sky-300 uppercase">
                        OWNED
                      </span>
                    ) : (
                      <span className="text-[8px] font-mono font-bold text-amber-300">
                        💎 {skin.gemCost}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* FULL-WIDTH ACTION BUTTON (Matching Image 2: "EQUIP" / "UNLOCK") */}
          <div>
            {isEquipped ? (
              <div className="w-full py-3 bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 font-black text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-inner">
                <Check className="w-4 h-4 stroke-[3]" /> EQUIPPED FOR COMBAT
              </div>
            ) : isPreviewSkinUnlocked ? (
              <button
                onClick={handleEquip}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 text-white font-black text-sm uppercase tracking-wider rounded-2xl border-2 border-cyan-200 shadow-[0_4px_0_#0284c7,0_6px_15px_rgba(6,182,212,0.4)] active:translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>EQUIP</span>
              </button>
            ) : (
              <button
                onClick={() => handleUnlockSkin(activeSkin)}
                className={`w-full py-3.5 font-black text-sm uppercase tracking-wider rounded-2xl border-2 shadow active:translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeSkin.rarity === 'legendary'
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-slate-950 border-yellow-200 shadow-[0_4px_0_#b45309]'
                    : activeSkin.rarity === 'epic'
                    ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white border-purple-200 shadow-[0_4px_0_#6b21a8]'
                    : 'bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-white border-cyan-200 shadow-[0_4px_0_#0369a1]'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>UNLOCK FOR {activeSkin.gemCost} GEMS 💎</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
