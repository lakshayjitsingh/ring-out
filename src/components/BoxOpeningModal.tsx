import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { type ChampionSkin } from '../game/championSkins';
import { CHAMPIONS, createChampionMesh, type CreatedChampion } from '../game/championModels';
import { MegaBoxGraphic } from './MegaBoxGraphic';
import { StandardBoxGraphic } from './StandardBoxGraphic';
import { sounds } from '../audio/soundManager';
import confetti from 'canvas-confetti';
import { Check, Sparkles, ChevronRight, Crown, Zap, Diamond } from 'lucide-react';
import { getSkinPortrait } from '../game/skinThumbnails';

export interface BoxReward {
  boxTitle: string;
  isMegaBox: boolean;
  gems: number;
  coins: number;
  skin: ChampionSkin;
  isDuplicate: boolean;
  duplicateGemRefund?: number;
}

interface BoxOpeningModalProps {
  isOpen: boolean;
  reward: BoxReward | null;
  onClose: () => void;
  onEquipSkin?: (skin: ChampionSkin) => void;
}

export const BoxOpeningModal: React.FC<BoxOpeningModalProps> = ({
  isOpen,
  reward,
  onClose,
  onEquipSkin,
}) => {
  // Opening steps:
  // 0: Shaking Box ("TAP TO OPEN - 3 ITEMS REMAINING")
  // 1: First item pop up: GEMS (+gems gained)
  // 2: Second item pop up: COINS (+coins gained)
  // 3: Grand final reveal: COMPLETE SKIN VISIBLE in 3D!
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);

  // 3D Canvas ref for the skin reveal step
  const canvasHolderRef = useRef<HTMLDivElement>(null);
  const currentModelRef = useRef<CreatedChampion | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      sounds.playBump(0.7);
    }
  }, [isOpen]);

  // Handle advancing through the items on tap
  const handleNextStep = () => {
    if (step === 0) {
      sounds.playVictory?.();
      setStep(1); // Reveal Gems
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#38bdf8', '#00f5ff', '#ffffff'],
      });
    } else if (step === 1) {
      sounds.playBump(0.8);
      setStep(2); // Reveal Coins
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#fbbf24', '#f59e0b', '#fde047'],
      });
    } else if (step === 2) {
      sounds.playVictory?.();
      setStep(3); // Reveal Complete Skin
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.45 },
        colors: ['#38bdf8', '#facc15', '#a855f7', '#22c55e', '#ec4899'],
      });
    }
  };

  // 3D turntable for step 3 (Complete Skin)
  useEffect(() => {
    if (step !== 3 || !reward || !canvasHolderRef.current) return;
    const container = canvasHolderRef.current;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 1.4, 4.4);
    camera.lookAt(0, 1.05, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Studio Lights
    const ambient = new THREE.AmbientLight(0xffffff, 1.6);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xfffbeb, 2.5);
    key.position.set(1.5, 4.0, 4.0);
    scene.add(key);

    const rim = new THREE.DirectionalLight(0x7dd3fc, 2.0);
    rim.position.set(0, 3.0, -3.5);
    scene.add(rim);

    // Pedestal
    const pedestalGroup = new THREE.Group();
    const baseGeo = new THREE.CylinderGeometry(1.4, 1.6, 0.18, 36);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.5, roughness: 0.3 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.09;
    pedestalGroup.add(baseMesh);

    const ringGeo = new THREE.TorusGeometry(1.45, 0.03, 16, 36);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: reward.skin.glowColor || 0x38bdf8 });
    pedestalGroup.add(new THREE.Mesh(ringGeo, ringMat));
    scene.add(pedestalGroup);

    // Brawler Model Holder
    const modelHolder = new THREE.Group();
    const model = createChampionMesh(reward.skin.championId, reward.skin.id);
    currentModelRef.current = model;
    modelHolder.add(model.group);
    scene.add(modelHolder);

    let animationId: number;
    let rotation = Math.PI;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      rotation += 0.015;
      modelHolder.rotation.y = rotation;
      pedestalGroup.rotation.y = rotation * 0.25;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [step, reward]);

  if (!isOpen || !reward) return null;

  const skin = reward.skin;
  const champion = CHAMPIONS[skin.championId];
  const portraitUrl = getSkinPortrait(skin.championId, skin.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 select-none animate-in fade-in duration-200">
      
      {/* Dynamic Animated Sunburst Rays in the backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div
          className="absolute inset-0 animate-[spin_20s_linear_infinite]"
          style={{
            background: `conic-gradient(from 0deg, ${skin.themeColor} 0deg 15deg, transparent 15deg 30deg, ${skin.themeColor} 30deg 45deg, transparent 45deg 60deg, ${skin.themeColor} 60deg 75deg, transparent 75deg 90deg, ${skin.themeColor} 90deg 105deg, transparent 105deg 120deg, ${skin.themeColor} 120deg 135deg, transparent 135deg 150deg, ${skin.themeColor} 150deg 165deg, transparent 165deg 180deg, ${skin.themeColor} 180deg 195deg, transparent 195deg 210deg, ${skin.themeColor} 210deg 225deg, transparent 225deg 240deg, ${skin.themeColor} 240deg 255deg, transparent 255deg 270deg, ${skin.themeColor} 270deg 285deg, transparent 285deg 300deg, ${skin.themeColor} 300deg 315deg, transparent 315deg 330deg, ${skin.themeColor} 330deg 345deg, transparent 345deg 360deg)`,
          }}
        />
      </div>

      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-white/20 rounded-3xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-center flex flex-col items-center overflow-hidden">
        
        {/* Top Header Badge */}
        <div className="mb-3 px-4 py-1 rounded-full bg-white/10 border border-white/20 text-white font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 shadow">
          <span>{reward.isMegaBox ? '🎁' : '📦'}</span>
          <span>{reward.boxTitle}</span>
        </div>

        {/* ========================================================================= */}
        {/* STEP 0: TAP TO OPEN (Shaking Box with 3 Items remaining) */}
        {/* ========================================================================= */}
        {step === 0 && (
          <div
            onClick={handleNextStep}
            className="w-full flex flex-col items-center py-6 cursor-pointer group"
          >
            <div className="animate-bounce transition-transform group-hover:scale-110 mb-4">
              {reward.isMegaBox ? (
                <MegaBoxGraphic size={140} isOpening />
              ) : (
                <StandardBoxGraphic size={140} isOpening />
              )}
            </div>

            <div className="text-xl sm:text-2xl font-black uppercase text-amber-300 drop-shadow mb-1 animate-pulse">
              TAP TO OPEN!
            </div>
            <div className="text-xs font-bold text-sky-200">
              3 Items Remaining Inside
            </div>

            <div className="mt-6 px-6 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs uppercase tracking-wider border border-yellow-200 shadow-[0_4px_12px_rgba(245,158,11,0.5)] flex items-center gap-1">
              <span>TAP TO REVEAL</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: FIRST ITEM POP UP -> GEMS! */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div
            onClick={handleNextStep}
            className="w-full flex flex-col items-center py-4 cursor-pointer animate-in zoom-in-90 duration-200"
          >
            <div className="text-xs font-black uppercase tracking-wider text-cyan-300 mb-2 px-3 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400">
              REWARD 1 OF 3
            </div>

            {/* Glowing Big 3D Gem Graphic */}
            <div className="relative w-36 h-36 my-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-xl animate-pulse" />
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-cyan-600 via-sky-400 to-cyan-200 border-4 border-white flex items-center justify-center text-6xl shadow-[0_10px_30px_rgba(6,182,212,0.6)] transform hover:rotate-6 transition-transform">
                💎
              </div>
            </div>

            <div className="text-3xl sm:text-4xl font-mono font-black text-cyan-300 drop-shadow-[0_2px_10px_rgba(6,182,212,0.8)] mb-1">
              +{reward.gems} GEMS!
            </div>
            <div className="text-xs font-bold text-slate-300">
              Added directly to your gem balance
            </div>

            <div className="mt-6 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-xs uppercase tracking-wider border border-cyan-200 shadow-[0_4px_12px_rgba(6,182,212,0.5)] flex items-center gap-1 animate-pulse">
              <span>TAP FOR NEXT ITEM (2 LEFT)</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: SECOND ITEM POP UP -> COINS / GOLD! */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div
            onClick={handleNextStep}
            className="w-full flex flex-col items-center py-4 cursor-pointer animate-in zoom-in-90 duration-200"
          >
            <div className="text-xs font-black uppercase tracking-wider text-amber-300 mb-2 px-3 py-0.5 rounded-full bg-amber-950/80 border border-amber-400">
              REWARD 2 OF 3
            </div>

            {/* Glowing Big Coin Graphic */}
            <div className="relative w-36 h-36 my-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-amber-400/25 blur-xl animate-pulse" />
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 border-4 border-white flex items-center justify-center text-6xl shadow-[0_10px_30px_rgba(245,158,11,0.6)] transform hover:-rotate-6 transition-transform">
                🪙
              </div>
            </div>

            <div className="text-3xl sm:text-4xl font-mono font-black text-amber-300 drop-shadow-[0_2px_10px_rgba(245,158,11,0.8)] mb-1">
              +{reward.coins.toLocaleString()} COINS!
            </div>
            <div className="text-xs font-bold text-slate-300">
              Added directly to your coin balance
            </div>

            <div className="mt-6 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs uppercase tracking-wider border border-yellow-200 shadow-[0_4px_12px_rgba(245,158,11,0.5)] flex items-center gap-1 animate-pulse">
              <span>TAP TO REVEAL FINAL ITEM (1 LEFT)</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: GRAND REVEAL -> THE COMPLETE SKIN VISIBLE! */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="w-full flex flex-col items-center animate-in zoom-in-95 duration-200">
            {/* Rarity & Status Banner */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-[10px] font-black uppercase px-3 py-0.5 rounded-full border shadow flex items-center gap-1 ${
                  skin.rarity === 'legendary'
                    ? 'bg-amber-400/25 text-amber-300 border-amber-400'
                    : skin.rarity === 'epic'
                    ? 'bg-purple-400/25 text-purple-300 border-purple-400'
                    : 'bg-cyan-400/25 text-cyan-300 border-cyan-400'
                }`}
              >
                {skin.rarity === 'legendary' && <Crown className="w-3 h-3" />}
                {skin.rarity === 'epic' && <Zap className="w-3 h-3" />}
                {skin.rarity === 'rare' && <Diamond className="w-3 h-3" />}
                <span>{skin.rarity.toUpperCase()} SKIN</span>
              </span>

              {reward.isDuplicate ? (
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-500/25 text-rose-300 border border-rose-400">
                  DUPLICATE CONVERTED
                </span>
              ) : (
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>NEW SKIN UNLOCKED!</span>
                </span>
              )}
            </div>

            {/* Complete Skin 3D Stage + 2D Portrait Bust Fallback */}
            <div className="relative w-full h-52 sm:h-56 my-1 flex items-center justify-center">
              {/* 3D Turntable Canvas */}
              <div ref={canvasHolderRef} className="absolute inset-0 w-full h-full z-10" />

              {/* Glowing Aura Ring */}
              <div
                className="absolute inset-x-8 inset-y-4 rounded-full blur-2xl opacity-40 pointer-events-none"
                style={{ backgroundColor: skin.themeColor }}
              />

              {/* Inset High-Res Skin Portrait Badge at Corner */}
              {portraitUrl && (
                <div
                  className="absolute top-2 left-2 z-20 w-14 h-14 rounded-2xl border-2 overflow-hidden bg-slate-900 shadow-xl"
                  style={{ borderColor: skin.themeColor }}
                  title={skin.name}
                >
                  <img src={portraitUrl} alt={skin.name} className="w-full h-full object-cover scale-110" />
                </div>
              )}
            </div>

            {/* Skin Title & Lore */}
            <div className="w-full my-1">
              <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-wide drop-shadow">
                {skin.name}
              </h2>
              <div className="text-xs font-bold text-amber-300 mt-0.5">
                {champion.name} • <span className="text-sky-200">{skin.tagline}</span>
              </div>
              <p className="text-[11px] text-slate-300 max-w-sm mx-auto mt-1 line-clamp-2">
                {skin.description}
              </p>
            </div>

            {/* Duplicate Gem Refund Callout */}
            {reward.isDuplicate && (
              <div className="mt-2 px-3 py-1 rounded-xl bg-rose-500/15 border border-rose-400/40 text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                <span>Already owned! Converted to</span>
                <span className="text-cyan-300">+{reward.duplicateGemRefund || Math.floor(skin.gemCost / 2)} Gems 💎</span>
              </div>
            )}

            {/* Action Buttons: EQUIP (Closes Immediately) or CONTINUE */}
            <div className="w-full mt-4 flex items-center gap-3">
              {!reward.isDuplicate && (
                <button
                  onClick={() => {
                    sounds.playVictory?.();
                    onEquipSkin?.(skin);
                    onClose();
                  }}
                  className="flex-1 py-3 font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-white border-emerald-200 shadow-[0_4px_0_#065f46] active:translate-y-1 active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>EQUIP SKIN</span>
                </button>
              )}

              <button
                onClick={() => {
                  sounds.playBump(0.6);
                  onClose();
                }}
                className={`py-3 px-6 font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl border-2 shadow transition-all cursor-pointer flex items-center justify-center gap-1.5 active:translate-y-1 active:scale-95 ${
                  reward.isDuplicate
                    ? 'w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-white border-yellow-200 shadow-[0_4px_0_#9a3412]'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border-white/20'
                }`}
              >
                <span>CONTINUE</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
