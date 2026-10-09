import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  CHAMPIONS,
  CHAMPION_LIST,
  type ChampionId,
  createChampionMesh,
  type CreatedChampion,
} from '../game/championModels';
import { Swords, Check, ArrowLeft, Rotate3d, Sparkles, Shield, Zap } from 'lucide-react';

interface ChampionShowcaseProps {
  selectedChampion: ChampionId;
  onSelectChampion: (id: ChampionId) => void;
  onBackToBattle: () => void;
}

export const ChampionShowcase: React.FC<ChampionShowcaseProps> = ({
  selectedChampion,
  onSelectChampion,
  onBackToBattle,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<ChampionId>(selectedChampion);
  const activeChampion = CHAMPIONS[activeId];

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

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.035);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 1.45, 5.0);
    camera.lookAt(0, 1.05, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 3. Studio Showroom Lighting
    const ambient = new THREE.AmbientLight(0xdbeafe, 1.1);
    scene.add(ambient);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x0f172a, 1.0);
    scene.add(hemiLight);

    // Front Key Light (illuminates visor, face, chest armor directly)
    const frontKey = new THREE.DirectionalLight(0xffffff, 2.2);
    frontKey.position.set(1.5, 4.0, 5.0);
    frontKey.castShadow = true;
    frontKey.shadow.mapSize.width = 1024;
    frontKey.shadow.mapSize.height = 1024;
    scene.add(frontKey);

    // Overhead Key Spotlight
    const keySpot = new THREE.SpotLight(0xffffff, 2.5, 20, Math.PI / 4, 0.35, 1);
    keySpot.position.set(0, 6, 2);
    scene.add(keySpot);

    // Blue/Cyan Rim Backlight
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    // Champion Accent Floor Light (color dynamically updates per champion)
    const accentFloorLight = new THREE.PointLight(activeChampion.glowColor, 3.0, 6);
    accentFloorLight.position.set(0, 0.3, 0);
    scene.add(accentFloorLight);

    // 4. Showroom Pedestal Turntable
    const pedestalGroup = new THREE.Group();
    pedestalRef.current = pedestalGroup;

    // Outer dark metallic disc
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

    // Neon glowing perimeter rim
    const rimGeo = new THREE.TorusGeometry(1.8, 0.05, 16, 48);
    rimGeo.rotateX(Math.PI / 2);
    const rimMat = new THREE.MeshBasicMaterial({ color: activeChampion.glowColor });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.position.y = 0.01;
    pedestalGroup.add(rimMesh);

    // Inner glowing geometric rune rings
    const innerRingGeo = new THREE.RingGeometry(0.8, 0.86, 32);
    innerRingGeo.rotateX(-Math.PI / 2);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: activeChampion.glowColor,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });
    const innerRingMesh = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRingMesh.position.y = 0.02;
    pedestalGroup.add(innerRingMesh);

    scene.add(pedestalGroup);

    // 5. Model Holder Group (Rotates 360°)
    const modelHolder = new THREE.Group();
    modelHolderRef.current = modelHolder;
    scene.add(modelHolder);

    // Starfield showroom dust
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

    // Load initial champion
    loadChampion(activeId);

    // 6. Animation loop
    let animationId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      clock.getDelta();

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
        const breathe = Math.sin(clock.getElapsedTime() * 2.2) * 0.03;
        currentModelRef.current.group.position.y = breathe;
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

  // Update 3D Model when active champion changes
  const loadChampion = (champId: ChampionId) => {
    if (!modelHolderRef.current || !sceneRef.current) return;

    // Remove old model
    if (currentModelRef.current) {
      modelHolderRef.current.remove(currentModelRef.current.group);
    }

    // Create fresh champion mesh
    const champ = createChampionMesh(champId);
    currentModelRef.current = champ;
    modelHolderRef.current.add(champ.group);
    currentRotationYRef.current = Math.PI;

    // Update pedestal glow color
    const info = CHAMPIONS[champId];
    if (pedestalRef.current) {
      pedestalRef.current.children.forEach((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.material && !(mesh.geometry instanceof THREE.CylinderGeometry)) {
          (mesh.material as THREE.MeshBasicMaterial).color.setHex(info.glowColor);
        }
      });
    }
  };

  const handleSelectTab = (id: ChampionId) => {
    setActiveId(id);
    loadChampion(id);
  };

  const handleEquip = () => {
    onSelectChampion(activeId);
  };

  // 360 Touch/Pointer/Mouse Drag to Rotate
  const handleDragStart = (clientX: number) => {
    isDraggingRef.current = true;
    prevMouseXRef.current = clientX;
  };

  const isEquipped = selectedChampion === activeId;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none text-white">
      {/* 3D WebGL Studio Canvas (Interactive 360° Drag) */}
      <div
        id="showcase-stage"
        ref={containerRef}
        onPointerDown={(e) => handleDragStart(e.clientX)}
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onTouchStart={(e) => e.touches.length > 0 && handleDragStart(e.touches[0].clientX)}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* TOP HEADER NAVIGATION */}
      <div className="absolute top-0 left-0 right-0 p-5 flex items-center justify-between pointer-events-auto z-20">
        <button
          onClick={onBackToBattle}
          className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md border border-cyan-500/30 rounded-2xl transition-all shadow-xl active:scale-95 group"
        >
          <ArrowLeft className="w-5 h-5 text-cyan-400 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-black tracking-wider uppercase text-cyan-300">
            Arena Battle
          </span>
        </button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 px-5 py-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-xl">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h1 className="text-sm md:text-base font-black tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-amber-300 to-rose-400">
              Champions Locker
            </h1>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest flex items-center gap-1.5">
            <Rotate3d className="w-3.5 h-3.5 text-cyan-400" />
            Drag to Inspect 360°
          </span>
        </div>

        {/* Currency / Trophies */}
        <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700/60 shadow-lg">
          <span className="text-xs font-black text-amber-400 font-mono">35 🏆</span>
          <div className="w-px h-3.5 bg-slate-700" />
          <span className="text-xs font-black text-yellow-300 font-mono">420 🟡</span>
        </div>
      </div>

      {/* LEFT CHAMPION INFO CARD */}
      <div className="absolute top-24 left-6 max-w-sm pointer-events-auto z-20 hidden md:block animate-in slide-in-from-left duration-200">
        <div className="bg-slate-900/85 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-5 shadow-2xl">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border"
              style={{
                color: activeChampion.color,
                borderColor: `${activeChampion.color}60`,
                backgroundColor: `${activeChampion.color}15`,
              }}
            >
              {activeChampion.archetype}
            </span>
            {isEquipped && (
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                Current Fighter
              </span>
            )}
          </div>

          <h2 className="text-3xl font-black italic tracking-wide text-white">
            {activeChampion.name}
          </h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            {activeChampion.title}
          </p>

          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            {activeChampion.description}
          </p>

          {/* Stat Specs */}
          <div className="space-y-1.5 bg-slate-950/60 border border-slate-800 rounded-2xl p-3 mb-4 text-xs font-mono">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" /> Impact Force
              </span>
              <span className="text-cyan-300">{activeChampion.stats.impactForce}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" /> Balance Rating
              </span>
              <span className="text-amber-300">{activeChampion.stats.balanceRating}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-rose-400" /> Dash Overdrive
              </span>
              <span className="text-rose-300">{activeChampion.stats.dashOverdrive}</span>
            </div>
          </div>

          {/* Equip Button */}
          <button
            onClick={handleEquip}
            disabled={isEquipped}
            className={`w-full py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 ${
              isEquipped
                ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-default'
                : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white cursor-pointer shadow-cyan-500/30'
            }`}
          >
            {isEquipped ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" /> EQUIPPED
              </>
            ) : (
              <>
                <Swords className="w-4 h-4" /> EQUIP CHAMPION
              </>
            )}
          </button>
        </div>
      </div>

      {/* BOTTOM CHAMPION ROSTER CAROUSEL */}
      <div className="absolute bottom-6 left-4 right-4 flex flex-col items-center pointer-events-auto z-20">
        <div className="w-full max-w-4xl bg-slate-900/85 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-3 shadow-2xl flex items-center justify-between gap-2 overflow-x-auto">
          {CHAMPION_LIST.map((champ) => {
            const isActive = champ.id === activeId;
            const isChampEquipped = champ.id === selectedChampion;

            return (
              <button
                key={champ.id}
                data-champ={champ.id}
                onClick={() => handleSelectTab(champ.id)}
                className={`flex-1 min-w-[130px] p-2.5 rounded-2xl border transition-all flex flex-col items-center text-center cursor-pointer active:scale-95 ${
                  isActive
                    ? 'bg-slate-800/90 border-2 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/50'
                }`}
                style={{
                  borderColor: isActive ? champ.color : undefined,
                  boxShadow: isActive ? `0 0 20px ${champ.color}40` : undefined,
                }}
              >
                <div className="relative mb-1">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-base border"
                    style={{
                      backgroundColor: `${champ.color}20`,
                      borderColor: champ.color,
                      color: champ.color,
                    }}
                  >
                    {champ.name.charAt(0)}
                  </div>
                  {isChampEquipped && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border border-slate-900 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>

                <div className="font-black text-xs text-white tracking-wide">
                  {champ.name}
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                  {champ.archetype}
                </div>
              </button>
            );
          })}
        </div>

        {/* Mobile Equip Button */}
        <div className="w-full max-w-4xl mt-3 md:hidden">
          <button
            onClick={handleEquip}
            disabled={isEquipped}
            className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl ${
              isEquipped
                ? 'bg-slate-800 text-slate-400 border border-slate-700'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
            }`}
          >
            {isEquipped ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" /> EQUIPPED
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
