import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  CHAMPIONS,
  CHAMPION_LIST,
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
  Swords,
  Check,
  Rotate3d,
  Sparkles,
  Shield,
  Home,
  Flame,
  Gauge,
  BatteryCharging,
  Crown,
  Unlock,
  Gem,
} from 'lucide-react';
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
  onBackToBattle,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<ChampionId>(selectedChampion);
  const activeChampion = CHAMPIONS[activeId];

  // Skin Locker State
  const [equippedSkinId, setEquippedSkinState] = useState<string>(() => getEquippedSkin(selectedChampion));
  const [previewSkinId, setPreviewSkinId] = useState<string>(() => getEquippedSkin(selectedChampion));
  const [, setSkinsVersion] = useState(0);
  const [mobileTab, setMobileTab] = useState<'stats' | 'skins'>('stats');
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

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = null; // Ultra high-tech transparent canvas revealing 4K matte painting!
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    const camX = container.clientWidth < 768 ? 0 : -0.22;
    camera.position.set(camX, 1.35, 4.5);
    camera.lookAt(camX, 1.05, 0);

    // 2. Renderer (transparent WebGL alpha canvas)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);

    // 3. Studio Showroom Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambient);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0284c7, 1.1);
    scene.add(hemiLight);

    // Front Key Light (illuminates face and armor)
    const frontKey = new THREE.DirectionalLight(0xfffbeb, 2.4);
    frontKey.position.set(1.5, 5.0, 5.0);
    frontKey.castShadow = true;
    frontKey.shadow.mapSize.width = 1024;
    frontKey.shadow.mapSize.height = 1024;
    scene.add(frontKey);

    // Overhead Key Spotlight
    const keySpot = new THREE.SpotLight(0xfef08a, 2.0, 20, Math.PI / 4, 0.35, 1);
    keySpot.position.set(0, 6, 2);
    scene.add(keySpot);

    // Sky Fill Backlight
    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 1.8);
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    // Champion Accent Floor Light (color dynamically updates per champion)
    const accentFloorLight = new THREE.PointLight(activeChampion.glowColor, 3.5, 8);
    accentFloorLight.position.set(0, 0.3, 0);
    scene.add(accentFloorLight);

    // 4. Showroom Pedestal Turntable (Cyan Platform with Golden Rim)
    const pedestalGroup = new THREE.Group();
    pedestalRef.current = pedestalGroup;

    // Platform base
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

    // Neon glowing perimeter rim
    const rimGeo = new THREE.TorusGeometry(1.72, 0.035, 16, 48);
    rimGeo.rotateX(Math.PI / 2);
    const rimMat = new THREE.MeshBasicMaterial({ color: activeChampion.glowColor });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.position.y = 0.015;
    pedestalGroup.add(rimMesh);

    scene.add(pedestalGroup);

    // 5. Model Holder Group (Rotates 360°)
    const modelHolder = new THREE.Group();
    modelHolderRef.current = modelHolder;
    scene.add(modelHolder);

    // Multi-tier Sea Foam Ripple Rings around Pedestal
    const surfRings: { mesh: THREE.Mesh; pulseSpeed: number }[] = [];
    [
      { r: 1.95, opacity: 0.45, speed: 2.2 },
      { r: 2.30, opacity: 0.30, speed: 1.8 },
      { r: 2.70, opacity: 0.18, speed: 1.4 },
    ].forEach((spec) => {
      const ringGeo = new THREE.RingGeometry(spec.r - 0.04, spec.r + 0.04, 48);
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

    // 5. Drifting Tropical Foliage & Petals
    const leafCount = 35;
    const leafGeo = new THREE.PlaneGeometry(0.16, 0.09);
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
    const foliageList: { mesh: THREE.Mesh; rotSpeed: { x: number; y: number; z: number }; floatSpeed: number; swayAmp: number; seed: number }[] = [];
    const foliageGroup = new THREE.Group();
    for (let i = 0; i < leafCount; i++) {
      const mesh = new THREE.Mesh(leafGeo, i % 2 === 0 ? leafMat : petalMat);
      mesh.position.set(
        (Math.random() - 0.5) * 14,
        Math.random() * 5 + 0.2,
        (Math.random() - 0.5) * 12
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

    // Load initial champion
    loadChampion(activeId);

    // 6. Animation loop using performance.now() (zero Clock deprecation warning)
    let animationId = 0;
    const startTime = performance.now();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) * 0.001;

      // Pulse Pedestal Foam Rings
      surfRings.forEach((sr) => {
        const s = 1.0 + Math.sin(elapsedTime * sr.pulseSpeed) * 0.04;
        sr.mesh.scale.set(s, s, 1);
      });

      // Flutter 3D Tropical Leaves & Petals in the sea breeze
      foliageList.forEach((f) => {
        f.mesh.position.y -= f.floatSpeed;
        f.mesh.position.x += Math.sin(elapsedTime * 1.5 + f.seed) * f.swayAmp;
        f.mesh.position.z += Math.cos(elapsedTime * 1.2 + f.seed) * (f.swayAmp * 0.7);
        f.mesh.rotation.x += f.rotSpeed.x;
        f.mesh.rotation.y += f.rotSpeed.y;
        f.mesh.rotation.z += f.rotSpeed.z;

        if (f.mesh.position.y < 0.0) {
          f.mesh.position.y = 5.2;
          f.mesh.position.x = (Math.random() - 0.5) * 14;
          f.mesh.position.z = (Math.random() - 0.5) * 12;
        }
      });

      // Only rotate when dragged by user; stays stationary when idle as requested
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

      // Subtle breathing float on hero pose (no walking/jumping)
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

    // Drag handlers for 360 inspection
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
    const onMouseDown = (e: MouseEvent) => handleStart(e.clientX);
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) handleStart(e.touches[0].clientX);
    };

    const onPointerMove = (e: PointerEvent) => handleMove(e.clientX);
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) handleMove(e.touches[0].clientX);
    };

    const handleUp = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('touchstart', onTouchStart, { passive: true });

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', handleUp);

    // Optional debug hook
    (window as unknown as { __rotateChampionTurntable?: (angle: number) => void }).__rotateChampionTurntable = (angle: number) => {
      currentRotationYRef.current += angle;
    };

    // Resize handler
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
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', handleUp);
      delete (window as unknown as { __rotateChampionTurntable?: (angle: number) => void }).__rotateChampionTurntable;
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update 3D Model when active champion or skin changes
  const loadChampion = (champId: ChampionId, skinId?: string) => {
    if (!modelHolderRef.current || !sceneRef.current) return;

    // Remove old model
    if (currentModelRef.current) {
      modelHolderRef.current.remove(currentModelRef.current.group);
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

    const effectiveSkin = skinId || getEquippedSkin(champId);
    const champ = createChampionMesh(champId, effectiveSkin);
    currentModelRef.current = champ;
    modelHolderRef.current.add(champ.group);
    currentRotationYRef.current = Math.PI;

    // Update pedestal glow color
    const skins = getChampionSkins(champId);
    const skinInfo = skins.find((s) => s.id === effectiveSkin);
    const glowHex = skinInfo?.glowColor ?? CHAMPIONS[champId].glowColor;

    if (pedestalRef.current) {
      pedestalRef.current.children.forEach((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.material && !(mesh.geometry instanceof THREE.CylinderGeometry)) {
          (mesh.material as THREE.MeshBasicMaterial).color.setHex(glowHex);
        }
      });
    }
  };

  const handleSelectTab = (id: ChampionId) => {
    sounds.playBump(0.8);
    setActiveId(id);
    const eq = getEquippedSkin(id);
    setEquippedSkinState(eq);
    setPreviewSkinId(eq);
    loadChampion(id, eq);
  };

  const handleSelectSkinPreview = (skin: ChampionSkin) => {
    sounds.playBump(0.7);
    setPreviewSkinId(skin.id);
    loadChampion(activeId, skin.id);
  };

  const handleEquipSkin = (skin: ChampionSkin) => {
    sounds.playVictory();
    setEquippedSkin(activeId, skin.id);
    setEquippedSkinState(skin.id);
    showToast(`Equipped ${skin.name}! ✨`);
  };

  const handleUnlockSkin = (skin: ChampionSkin) => {
    if (gems < skin.gemCost) {
      sounds.playBump(0.8);
      showToast(`Need ${skin.gemCost} Gems to unlock!`);
      return;
    }
    sounds.playVictory();
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
    setSkinsVersion((v) => v + 1);
    showToast(`Unlocked & Equipped ${skin.name}! 🎉`);
  };

  const handleEquip = () => {
    sounds.playVictory();
    onSelectChampion(activeId);
  };

  // 360 Touch/Pointer/Mouse Drag to Rotate
  const handleDragStart = (clientX: number) => {
    isDraggingRef.current = true;
    prevMouseXRef.current = clientX;
  };

  const isEquipped = selectedChampion === activeId;
  const currentSkins = getChampionSkins(activeId);
  const activePreviewSkin = currentSkins.find((s) => s.id === previewSkinId) || currentSkins[0];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-[#0284c7] via-[#38bdf8] to-[#7dd3fc] font-sans select-none text-white">
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(2,132,199,0.22)_80%,rgba(1,63,107,0.46)_100%)]" />
      </div>

      {/* 3D WebGL Studio Canvas (Interactive 360° Drag over transparent matte canvas) */}
      <div
        id="showcase-stage"
        ref={containerRef}
        onPointerDown={(e) => handleDragStart(e.clientX)}
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onTouchStart={(e) => e.touches.length > 0 && handleDragStart(e.touches[0].clientX)}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none z-10"
      />

      {/* TOP HEADER NAVIGATION */}
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-5 flex items-center justify-between pointer-events-auto z-20">
        <button
          onClick={() => {
            sounds.playBump(0.7);
            onBackToBattle();
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0284c7]/85 hover:bg-[#0369a1] text-white border-2 border-white/40 rounded-2xl backdrop-blur-md shadow-xl active:scale-95 cursor-pointer transition-all group"
        >
          <Home className="w-5 h-5 text-amber-300 group-hover:-translate-y-0.5 transition-transform" />
          <span className="text-xs sm:text-sm font-black tracking-wider uppercase drop-shadow-sm">
            Home Lobby
          </span>
        </button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 px-5 py-2 bg-[#0284c7]/85 backdrop-blur-md border-2 border-white/40 rounded-2xl shadow-xl">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <h1 className="text-sm sm:text-base font-black tracking-widest uppercase text-white drop-shadow">
              Brawlers Locker
            </h1>
          </div>
          <span className="text-[10px] text-sky-100 font-bold mt-1 uppercase tracking-wider flex items-center gap-1.5 drop-shadow-sm">
            <Rotate3d className="w-3.5 h-3.5 text-amber-300" />
            Drag to Rotate 360°
          </span>
        </div>

        {/* Currency / Trophies */}
        <div className="flex items-center gap-2 bg-[#0284c7]/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-white/40 shadow-xl">
          <span className="text-xs font-black text-amber-300 font-mono">🏆 {trophies.toLocaleString()}</span>
          <div className="w-px h-3.5 bg-white/30" />
          <span className="text-xs font-black text-yellow-300 font-mono">🪙 {gold.toLocaleString()}</span>
          <div className="w-px h-3.5 bg-white/30" />
          <span className="text-xs font-black text-cyan-300 font-mono">💎 {gems.toLocaleString()}</span>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-18 left-1/2 -translate-x-1/2 px-5 py-2.5 bg-slate-900/95 border-2 border-amber-400 text-amber-200 font-black text-xs uppercase tracking-wider rounded-2xl shadow-2xl z-50 animate-bounce flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300" />
          {toastMessage}
        </div>
      )}

      {/* Mobile Tab Switcher */}
      <div className="absolute top-18 left-4 right-4 flex md:hidden items-center justify-center gap-2 z-30">
        <button
          onClick={() => setMobileTab('stats')}
          className={`flex-1 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'stats'
              ? 'bg-amber-400 text-slate-950 shadow-lg'
              : 'bg-slate-900/80 text-white/80 border border-white/20 backdrop-blur-md'
          }`}
        >
          <Flame className="w-3.5 h-3.5" /> Combat Stats
        </button>
        <button
          onClick={() => setMobileTab('skins')}
          className={`flex-1 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'skins'
              ? 'bg-amber-400 text-slate-950 shadow-lg'
              : 'bg-slate-900/80 text-white/80 border border-white/20 backdrop-blur-md'
          }`}
        >
          <Crown className="w-3.5 h-3.5" /> Skins Vault (5)
        </button>
      </div>

      {/* LEFT CHAMPION INFO & REAL STATS CARD */}
      <div className={`absolute top-28 md:top-20 left-4 sm:left-6 max-w-sm pointer-events-auto z-20 ${mobileTab === 'stats' ? 'block' : 'hidden'} md:block animate-in slide-in-from-left duration-200`}>
        <div className="bg-slate-900/80 backdrop-blur-xl border-2 border-white/20 rounded-3xl p-5 shadow-[0_16px_50px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border shadow-sm"
              style={{
                color: activeChampion.color,
                borderColor: `${activeChampion.color}80`,
                backgroundColor: `${activeChampion.color}25`,
              }}
            >
              {activeChampion.archetype}
            </span>
            {isEquipped && (
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 flex items-center gap-1">
                <Check className="w-3 h-3 stroke-[3]" /> Active Brawler
              </span>
            )}
          </div>

          <h2 className="text-3xl font-black italic tracking-wide text-white drop-shadow-sm">
            {activeChampion.name}
          </h2>
          <p className="text-xs font-bold text-sky-300 uppercase tracking-wider mb-2">
            {activeChampion.title}
          </p>

          <p className="text-xs text-slate-200 leading-relaxed mb-3.5">
            {activeChampion.description}
          </p>

          {/* DYNAMIC COMBAT STATS PANEL */}
          <div className="space-y-2.5 bg-slate-950/70 border border-white/10 rounded-2xl p-3.5 mb-4 shadow-inner">
            <div className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center justify-between pb-1.5 border-b border-white/10">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Dynamic Combat Attributes
              </span>
              <span className="text-[10px] text-sky-300/80 font-mono">Physical Mass</span>
            </div>

            {/* Signature Trait Badge */}
            <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-transparent border-l-4 border-amber-400 px-3 py-1.5 rounded-r-xl">
              <div className="text-[9px] uppercase font-bold text-amber-300/80">Signature Trait</div>
              <div className="text-xs font-black text-amber-200 tracking-wide">{activeChampion.stats.trait}</div>
            </div>

            {/* Stat 1: Speed */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="flex items-center gap-1.5 font-bold text-sky-200">
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" /> Movement Speed
                </span>
                <span className="font-mono font-black text-cyan-300">{activeChampion.stats.speed} / 5</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-400 transition-all duration-300 shadow-[0_0_8px_rgba(56,189,248,0.8)]"
                  style={{ width: `${(activeChampion.stats.speed / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Stat 2: Push Knockback */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="flex items-center gap-1.5 font-bold text-rose-200">
                  <Flame className="w-3.5 h-3.5 text-rose-400" /> Push Knockback
                </span>
                <span className="font-mono font-black text-rose-300">{activeChampion.stats.power} / 5</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-400 transition-all duration-300 shadow-[0_0_8px_rgba(244,63,94,0.8)]"
                  style={{ width: `${(activeChampion.stats.power / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Stat 3: Weight / Resistance */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="flex items-center gap-1.5 font-bold text-emerald-200">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" /> Mass & Resistance
                </span>
                <span className="font-mono font-black text-emerald-300">{activeChampion.stats.weight} / 5</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                  style={{ width: `${(activeChampion.stats.weight / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Stat 4: Dash Recharge */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="flex items-center gap-1.5 font-bold text-amber-200">
                  <BatteryCharging className="w-3.5 h-3.5 text-amber-400" /> Dash Recharge
                </span>
                <span className="font-mono font-black text-amber-300">{activeChampion.stats.chargeSpeed} / 5</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-300 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                  style={{ width: `${(activeChampion.stats.chargeSpeed / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Equip Button */}
          <button
            onClick={handleEquip}
            disabled={isEquipped}
            className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 cursor-pointer ${
              isEquipped
                ? 'bg-slate-800/80 text-emerald-400 border border-emerald-500/40 cursor-default shadow-none'
                : 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-slate-950 font-black shadow-orange-500/30 border border-amber-200'
            }`}
          >
            {isEquipped ? (
              <>
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> EQUIPPED IN COMBAT
              </>
            ) : (
              <>
                <Swords className="w-4 h-4" /> EQUIP FOR BATTLE
              </>
            )}
          </button>
        </div>
      </div>

      {/* RIGHT CHAMPION SKINS VAULT (5 Skins + Default) */}
      <div className={`absolute top-28 md:top-20 right-4 sm:right-6 w-80 sm:w-96 pointer-events-auto z-20 ${mobileTab === 'skins' ? 'block' : 'hidden'} md:block animate-in slide-in-from-right duration-200`}>
        <div className="bg-slate-900/85 backdrop-blur-xl border-2 border-white/20 rounded-3xl p-5 shadow-[0_16px_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[calc(100vh-190px)]">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-amber-400/20 border border-amber-300/40 text-amber-300 shadow-sm">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Skins Vault ({currentSkins.length})
                </h3>
                <p className="text-[10px] text-amber-300 font-bold">2 Rare • 2 Epic • 1 Legendary</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-sky-200 bg-sky-500/20 px-2 py-0.5 rounded-full border border-sky-400/30">
              3D Live Preview
            </span>
          </div>

          {/* Scrollable list of 6 skins */}
          <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 [scrollbar-width:thin]">
            {currentSkins.map((skin) => {
              const isSelectedPreview = skin.id === previewSkinId;
              const isSkinEquipped = skin.id === equippedSkinId;
              const unlocked = isSkinUnlocked(skin.id);

              return (
                <div
                  key={skin.id}
                  onClick={() => handleSelectSkinPreview(skin)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                    isSelectedPreview
                      ? 'bg-white/15 shadow-[0_0_15px_rgba(255,255,255,0.25)] scale-[1.01]'
                      : 'bg-slate-950/60 hover:bg-white/10'
                  }`}
                  style={{
                    borderColor: isSelectedPreview
                      ? skin.rarity === 'legendary'
                        ? '#facc15'
                        : skin.rarity === 'epic'
                        ? '#ec4899'
                        : skin.rarity === 'rare'
                        ? '#06b6d4'
                        : '#ffffff'
                      : 'rgba(255,255,255,0.1)',
                  }}
                >
                  {/* Subtle Legendary Glow Backing */}
                  {skin.rarity === 'legendary' && (
                    <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-amber-400/25 to-yellow-500/10 rounded-full blur-xl pointer-events-none" />
                  )}

                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          skin.rarity === 'legendary'
                            ? 'bg-amber-500/30 text-amber-300 border-amber-400/60 shadow-[0_0_10px_rgba(250,204,21,0.5)] animate-pulse'
                            : skin.rarity === 'epic'
                            ? 'bg-purple-500/25 text-purple-300 border-purple-400/50'
                            : skin.rarity === 'rare'
                            ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400/50'
                            : 'bg-slate-700/50 text-slate-300 border-white/20'
                        }`}
                      >
                        {skin.rarity === 'legendary' ? '👑 LEGENDARY' : skin.badge}
                      </span>
                    </div>

                    {isSkinEquipped ? (
                      <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <Check className="w-3 h-3 stroke-[3]" /> EQUIPPED
                      </span>
                    ) : unlocked ? (
                      <span className="text-[10px] font-black text-sky-300 flex items-center gap-1 bg-sky-500/20 px-2 py-0.5 rounded-full border border-sky-500/30">
                        <Unlock className="w-3 h-3" /> UNLOCKED
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-black text-yellow-300 flex items-center gap-1 bg-yellow-500/20 px-2 py-0.5 rounded-full border border-yellow-500/30">
                        <Gem className="w-3 h-3 text-cyan-300" /> {skin.gemCost}
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-black text-white group-hover:text-amber-200 transition-colors">
                    {skin.name}
                  </div>
                  <div className="text-[10px] text-sky-200/90 font-medium line-clamp-1 mb-1">
                    {skin.tagline}
                  </div>
                  <div className="text-[9px] text-slate-300 leading-tight line-clamp-2">
                    {skin.description}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action button for active preview skin */}
          <div className="pt-3 border-t border-white/10 mt-3">
            {activePreviewSkin.id === equippedSkinId ? (
              <div className="w-full py-3 rounded-2xl bg-slate-800/80 border border-emerald-500/40 text-emerald-400 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                <Check className="w-4 h-4 stroke-[3]" /> Skin Equipped in Battle
              </div>
            ) : isSkinUnlocked(activePreviewSkin.id) ? (
              <button
                onClick={() => handleEquipSkin(activePreviewSkin)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-emerald-300"
              >
                <Check className="w-4 h-4 stroke-[3]" /> Equip {activePreviewSkin.name}
              </button>
            ) : (
              <button
                onClick={() => handleUnlockSkin(activePreviewSkin)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-amber-200"
              >
                <Gem className="w-4 h-4 text-slate-950" /> Unlock for {activePreviewSkin.gemCost} Gems
              </button>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM CHAMPION ROSTER CAROUSEL */}
      <div className="absolute bottom-5 left-3 right-3 flex flex-col items-center pointer-events-auto z-20">
        <div className="w-full max-w-4xl bg-[#0284c7]/80 backdrop-blur-xl border-2 border-white/30 rounded-3xl p-3 shadow-2xl flex items-center justify-between gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CHAMPION_LIST.map((champ) => {
            const isActive = champ.id === activeId;
            const isChampEquipped = champ.id === selectedChampion;

            return (
              <button
                key={champ.id}
                data-champ={champ.id}
                onClick={() => handleSelectTab(champ.id)}
                className={`flex-1 min-w-[120px] sm:min-w-[130px] p-2.5 rounded-2xl border transition-all flex flex-col items-center text-center cursor-pointer active:scale-95 ${
                  isActive
                    ? 'bg-white/20 border-white shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-105'
                    : 'bg-black/20 border-white/10 hover:bg-white/10'
                }`}
                style={{
                  borderColor: isActive ? '#fef08a' : undefined,
                }}
              >
                <div className="relative mb-1">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-base border-2 shadow-md"
                    style={{
                      backgroundColor: `${champ.color}35`,
                      borderColor: champ.color,
                      color: '#ffffff',
                    }}
                  >
                    {champ.name.charAt(0)}
                  </div>
                  {isChampEquipped && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border border-white flex items-center justify-center shadow">
                      <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                    </div>
                  )}
                </div>

                <div className="font-black text-xs text-white tracking-wide drop-shadow-sm">
                  {champ.name}
                </div>
                <div className="text-[9px] text-sky-100 uppercase tracking-widest font-bold">
                  {champ.archetype}
                </div>
                
                {/* Mini Stat preview */}
                <div className="flex items-center gap-1.5 mt-1 text-[9px] font-mono text-amber-200">
                  <span>⚡{champ.stats.speed}</span>
                  <span>💥{champ.stats.power}</span>
                  <span>🛡️{champ.stats.weight}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Mobile Equip Button & Return Shortcut */}
        <div className="w-full max-w-4xl mt-2.5 flex items-center gap-2 md:hidden">
          <button
            onClick={() => {
              sounds.playBump(0.7);
              onBackToBattle();
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-3 bg-white/20 border border-white/30 rounded-2xl text-xs font-black uppercase text-white shadow-lg active:scale-95"
          >
            <Home className="w-4 h-4 text-amber-300" />
            <span>Home</span>
          </button>

          <button
            onClick={handleEquip}
            disabled={isEquipped}
            className={`flex-1 py-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl ${
              isEquipped
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40'
                : 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-slate-950 font-black'
            }`}
          >
            {isEquipped ? (
              <>
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> EQUIPPED
              </>
            ) : (
              <>
                <Swords className="w-4 h-4" /> EQUIP {activeChampion.name.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
