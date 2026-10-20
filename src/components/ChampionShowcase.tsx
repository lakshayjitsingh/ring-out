import React, { useEffect, useRef, useState, useCallback } from 'react';
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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../audio/soundManager';
import { getSkinPortrait } from '../game/skinThumbnails';

interface ChampionShowcaseProps {
  selectedChampion: ChampionId;
  trophies?: number;
  gold?: number;
  gems?: number;
  setGems?: React.Dispatch<React.SetStateAction<number>>;
  onSelectChampion: (id: ChampionId) => void;
  onBackToBattle: () => void;
}

const CHAMPION_IDS: ChampionId[] = ['leo', 'kai', 'nova', 'titan', 'kage', 'bolt'];

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
  const currentIndex = CHAMPION_IDS.indexOf(activeId);

  const handlePrevChampion = useCallback(() => {
    sounds.playBump(0.6);
    const prevIdx = (currentIndex - 1 + CHAMPION_IDS.length) % CHAMPION_IDS.length;
    const newId = CHAMPION_IDS[prevIdx];
    setActiveId(newId);
    onSelectChampion(newId);
    const skin = getEquippedSkin(newId);
    setEquippedSkinState(skin);
    setPreviewSkinId(skin);
  }, [currentIndex, onSelectChampion]);

  const handleNextChampion = useCallback(() => {
    sounds.playBump(0.6);
    const nextIdx = (currentIndex + 1) % CHAMPION_IDS.length;
    const newId = CHAMPION_IDS[nextIdx];
    setActiveId(newId);
    onSelectChampion(newId);
    const skin = getEquippedSkin(newId);
    setEquippedSkinState(skin);
    setPreviewSkinId(skin);
  }, [currentIndex, onSelectChampion]);

  // Keyboard navigation support (Arrow Left & Arrow Right)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevChampion();
      if (e.key === 'ArrowRight') handleNextChampion();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevChampion, handleNextChampion]);

  // 3D Turntable Initialization
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Perfectly framed 3D stage sitting strictly above the bottom card
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 1.35, 6.2);
    camera.lookAt(0, 1.0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambient);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0284c7, 1.2);
    scene.add(hemiLight);

    const frontKey = new THREE.DirectionalLight(0xfffbeb, 2.4);
    frontKey.position.set(1.5, 5.0, 5.0);
    frontKey.castShadow = true;
    scene.add(frontKey);

    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 1.8);
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    // Pedestal Turntable (Sits cleanly on the stage floor)
    const pedestalGroup = new THREE.Group();
    pedestalGroup.position.set(0, 0.05, 0);
    pedestalRef.current = pedestalGroup;

    const baseGeo = new THREE.CylinderGeometry(1.65, 1.85, 0.22, 48);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.4,
      roughness: 0.35,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.11;
    baseMesh.receiveShadow = true;
    pedestalGroup.add(baseMesh);

    const ringGeo = new THREE.TorusGeometry(1.7, 0.035, 16, 48);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = 0.005;
    pedestalGroup.add(ringMesh);

    scene.add(pedestalGroup);

    // Model Holder (Positioned at y = 0.05 matching pedestal)
    const modelHolder = new THREE.Group();
    modelHolder.position.set(0, 0.05, 0);
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

        {/* 360 Hint (Neatly centered in the header) */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/15 text-[10px] text-sky-200 font-bold uppercase tracking-wider backdrop-blur-md pointer-events-none shadow">
          <Rotate3d className="w-3.5 h-3.5 text-amber-300" />
          <span>Drag 360°</span>
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

      {/* 2. 3D TURNTABLE STAGE (Confined to upper area above bottom cards) */}
      <div ref={containerRef} className="absolute top-12 left-0 right-0 bottom-52 cursor-grab active:cursor-grabbing z-10" />

      {/* 3. NAVIGATION ARROWS (Positioned at mid-body level z-50, fully clickable!) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handlePrevChampion();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className="absolute left-3 sm:left-6 top-[32%] -translate-y-1/2 z-50 w-12 h-14 sm:w-14 sm:h-16 rounded-2xl bg-black/75 hover:bg-black/90 border-2 border-white/40 text-white flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-2xl backdrop-blur-md group pointer-events-auto"
        title="Previous Champion"
        aria-label="Previous Champion"
      >
        <ChevronLeft className="w-8 h-8 sm:w-9 sm:h-9 group-hover:-translate-x-0.5 transition-transform pointer-events-none" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleNextChampion();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className="absolute right-3 sm:right-6 top-[32%] -translate-y-1/2 z-50 w-12 h-14 sm:w-14 sm:h-16 rounded-2xl bg-black/75 hover:bg-black/90 border-2 border-white/40 text-white flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-2xl backdrop-blur-md group pointer-events-auto"
        title="Next Champion"
        aria-label="Next Champion"
      >
        <ChevronRight className="w-8 h-8 sm:w-9 sm:h-9 group-hover:translate-x-0.5 transition-transform pointer-events-none" />
      </button>

      {/* 4. SLEEK COMPACT BOTTOM CARD (Matching Image 2: Zero Overlap with Character/Pedestal!) */}
      <div className="absolute bottom-18 sm:bottom-20 left-0 right-0 z-40 px-3 sm:px-6 pointer-events-auto">
        <div className="max-w-xl mx-auto bg-slate-950/90 backdrop-blur-xl border border-white/20 rounded-2xl p-2.5 sm:p-3 shadow-[0_15px_35px_rgba(0,0,0,0.6)] flex flex-col gap-2">
          
          {/* Character & Skin Lore Title Bar (Sleek single row) */}
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black uppercase text-white tracking-wide">
                {activeChampion.name}
              </h2>
              <span
                className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shadow-sm"
                style={{
                  backgroundColor: `${activeChampion.color}25`,
                  borderColor: activeChampion.color,
                  color: activeChampion.color,
                }}
              >
                {activeChampion.archetype}
              </span>
            </div>

            {/* Currently selected skin badge */}
            <div className="text-right">
              <span className="text-xs font-black text-amber-300">{activeSkin.name}</span>
            </div>
          </div>

          {/* SMALL SKINS THUMBNAILS ROW (Compact mini-thumbnails - Zero character obstruction!) */}
          <div className="flex items-center gap-2 overflow-x-auto py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {skins.map((skin) => {
              const isSelected = skin.id === previewSkinId;
              const isUnlocked = isSkinUnlocked(skin.id);
              const isSkinEquipped = activeId === selectedChampion && equippedSkinId === skin.id;

              return (
                <div
                  key={skin.id}
                  onClick={() => handleSelectSkin(skin)}
                  className={`relative flex-shrink-0 w-14 h-16 sm:w-16 sm:h-17 p-1 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-between text-center ${
                    isSelected
                      ? 'bg-sky-950/90 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.6)] scale-105'
                      : 'bg-slate-900/70 hover:bg-slate-900/90 border-white/15'
                  }`}
                  title={`${skin.name} (${skin.rarity.toUpperCase()})`}
                >
                  {/* Real 3D Skin Portrait Image */}
                  <div
                    className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 overflow-hidden flex items-center justify-center shadow-md bg-slate-900/90 mt-0.5"
                    style={{ borderColor: skin.themeColor }}
                  >
                    <img
                      src={getSkinPortrait(skin.championId, skin.id)}
                      alt={skin.name}
                      className="w-full h-full object-cover scale-110 drop-shadow"
                    />
                    <span
                      className="absolute bottom-0 right-0 w-3 h-3 rounded-full border border-black flex items-center justify-center text-[7px]"
                      style={{ backgroundColor: skin.themeColor }}
                    >
                      {skin.rarity === 'legendary' ? '👑' : skin.rarity === 'epic' ? '⚡' : skin.rarity === 'rare' ? '💎' : '•'}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  <div className="w-full truncate px-0.5">
                    {isSkinEquipped ? (
                      <span className="text-[7.5px] font-black text-emerald-400 uppercase tracking-tight">
                        EQUIPPED
                      </span>
                    ) : isUnlocked ? (
                      <span className="text-[7.5px] font-bold text-sky-300 uppercase tracking-tight">
                        OWNED
                      </span>
                    ) : (
                      <span className="text-[7.5px] font-mono font-bold text-amber-300">
                        💎 {skin.gemCost}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ACTION BUTTON (Matching Image 2: "EQUIP" / "UNLOCK") */}
          <div>
            {isEquipped ? (
              <div className="w-full py-2.5 bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 shadow-inner">
                <Check className="w-4 h-4 stroke-[3]" /> EQUIPPED FOR COMBAT
              </div>
            ) : isPreviewSkinUnlocked ? (
              <button
                type="button"
                onClick={handleEquip}
                className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#0284c7] hover:from-[#38bdf8] hover:to-[#0284c7] text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl border-2 border-sky-200 shadow-[0_3px_0_#0369a1,0_6px_15px_rgba(14,165,233,0.4)] active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center"
              >
                <span>EQUIP</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleUnlockSkin(activeSkin)}
                className={`w-full py-2.5 sm:py-3 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl border-2 shadow active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeSkin.rarity === 'legendary'
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-slate-950 border-yellow-200 shadow-[0_3px_0_#b45309]'
                    : activeSkin.rarity === 'epic'
                    ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white border-purple-200 shadow-[0_3px_0_#6b21a8]'
                    : 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white border-cyan-200 shadow-[0_3px_0_#0369a1]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>UNLOCK FOR {activeSkin.gemCost} GEMS 💎</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
