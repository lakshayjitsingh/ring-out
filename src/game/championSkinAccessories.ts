import * as THREE from 'three';
import { type ChampionId } from './championModels';

export interface SkinPalette {
  skinColor: number;
  hairColor: number;
  jacketColor: number;
  jacketTrimColor: number;
  pantsColor: number;
  teeColor: number;
  accentColor: number;
  metalColor: number;
  gloveColor: number;
  eyeColor: number;
  emissiveColor?: number;
  metalness?: number;
  roughness?: number;
}

export function getChampionSkinPalette(champId: ChampionId, skinId: string = ''): SkinPalette {
  switch (champId) {
    case 'leo': {
      if (skinId === 'leo_sunset') {
        return {
          skinColor: 0xf5c396,
          hairColor: 0xd97706,
          jacketColor: 0xea580c,
          jacketTrimColor: 0x06b6d4,
          pantsColor: 0xd4d4d8,
          teeColor: 0xfff7ed,
          accentColor: 0x06b6d4,
          metalColor: 0xd97706,
          gloveColor: 0x0d9488,
          eyeColor: 0xf59e0b,
        };
      }
      if (skinId === 'leo_midnight') {
        return {
          skinColor: 0xfde2d0,
          hairColor: 0x0f172a,
          jacketColor: 0x1e1b4b,
          jacketTrimColor: 0x22d3ee,
          pantsColor: 0x0f172a,
          teeColor: 0x1e293b,
          accentColor: 0x22d3ee,
          metalColor: 0x38bdf8,
          gloveColor: 0x06b6d4,
          eyeColor: 0x06b6d4,
          emissiveColor: 0x0891b2,
        };
      }
      if (skinId === 'leo_volcanic') {
        return {
          skinColor: 0xdf9b74,
          hairColor: 0x1c1917,
          jacketColor: 0x292524,
          jacketTrimColor: 0xef4444,
          pantsColor: 0x171717,
          teeColor: 0x18181b,
          accentColor: 0xf97316,
          metalColor: 0xef4444,
          gloveColor: 0xf97316,
          eyeColor: 0xdc2626,
          emissiveColor: 0xef4444,
        };
      }
      if (skinId === 'leo_cyber') {
        return {
          skinColor: 0xfbd5b5,
          hairColor: 0x93c5fd,
          jacketColor: 0x0284c7,
          jacketTrimColor: 0x00f5ff,
          pantsColor: 0x1e293b,
          teeColor: 0x090d16,
          accentColor: 0x00f5ff,
          metalColor: 0x38bdf8,
          gloveColor: 0x00f5ff,
          eyeColor: 0x00f5ff,
          emissiveColor: 0x00f5ff,
        };
      }
      if (skinId === 'leo_poseidon') {
        return {
          skinColor: 0xfef08a,
          hairColor: 0x06b6d4,
          jacketColor: 0xfacc15,
          jacketTrimColor: 0x0284c7,
          pantsColor: 0x1d4ed8,
          teeColor: 0x38bdf8,
          accentColor: 0xfacc15,
          metalColor: 0xfacc15,
          gloveColor: 0xfacc15,
          eyeColor: 0x38bdf8,
          emissiveColor: 0x38bdf8,
          metalness: 0.85,
          roughness: 0.20,
        };
      }
      // default
      return {
        skinColor: 0xfbd5b5,
        hairColor: 0x4a2511,
        jacketColor: 0x0284c7,
        jacketTrimColor: 0x0369a1,
        pantsColor: 0x1e3a8a,
        teeColor: 0xf8fafc,
        accentColor: 0xfbbf24,
        metalColor: 0xfbbf24,
        gloveColor: 0x0f172a,
        eyeColor: 0x0284c7,
      };
    }

    case 'kai': {
      if (skinId === 'kai_acid') {
        return {
          skinColor: 0xfcd5b4,
          hairColor: 0x111827,
          jacketColor: 0x4d7c0f,
          jacketTrimColor: 0x84cc16,
          pantsColor: 0x09090b,
          teeColor: 0x18181b,
          accentColor: 0x84cc16,
          metalColor: 0x84cc16,
          gloveColor: 0x65a30d,
          eyeColor: 0x84cc16,
        };
      }
      if (skinId === 'kai_vapor') {
        return {
          skinColor: 0xfcd5b4,
          hairColor: 0xc084fc,
          jacketColor: 0xdb2777,
          jacketTrimColor: 0x06b6d4,
          pantsColor: 0x3b0764,
          teeColor: 0xfdf2f8,
          accentColor: 0x06b6d4,
          metalColor: 0xf43f5e,
          gloveColor: 0x06b6d4,
          eyeColor: 0xf43f5e,
        };
      }
      if (skinId === 'kai_mecha') {
        return {
          skinColor: 0xfcd5b4,
          hairColor: 0x475569,
          jacketColor: 0x334155,
          jacketTrimColor: 0xef4444,
          pantsColor: 0x1e293b,
          teeColor: 0x0f172a,
          accentColor: 0xef4444,
          metalColor: 0x94a3b8,
          gloveColor: 0xef4444,
          eyeColor: 0xef4444,
          metalness: 0.65,
          roughness: 0.35,
        };
      }
      if (skinId === 'kai_inferno') {
        return {
          skinColor: 0xdf9b74,
          hairColor: 0xef4444,
          jacketColor: 0x18181b,
          jacketTrimColor: 0xf97316,
          pantsColor: 0x0c0a09,
          teeColor: 0x292524,
          accentColor: 0xf97316,
          metalColor: 0xf97316,
          gloveColor: 0xea580c,
          eyeColor: 0xf97316,
          emissiveColor: 0xf97316,
        };
      }
      if (skinId === 'kai_quantum') {
        return {
          skinColor: 0xe2e8f0,
          hairColor: 0xa855f7,
          jacketColor: 0x1e1b4b,
          jacketTrimColor: 0x38bdf8,
          pantsColor: 0x0f172a,
          teeColor: 0x312e81,
          accentColor: 0x38bdf8,
          metalColor: 0xa855f7,
          gloveColor: 0x38bdf8,
          eyeColor: 0xa855f7,
          emissiveColor: 0x38bdf8,
          metalness: 0.80,
          roughness: 0.25,
        };
      }
      // default
      return {
        skinColor: 0xfcd5b4,
        hairColor: 0x111827,
        jacketColor: 0x1e293b,
        jacketTrimColor: 0x00f5ff,
        pantsColor: 0x0f172a,
        teeColor: 0xf8fafc,
        accentColor: 0x00f5ff,
        metalColor: 0x00f5ff,
        gloveColor: 0x0284c7,
        eyeColor: 0x00f5ff,
      };
    }

    case 'nova': {
      if (skinId === 'nova_amethyst') {
        return {
          skinColor: 0xfed7aa,
          hairColor: 0x581c87,
          jacketColor: 0x3b0764,
          jacketTrimColor: 0xa855f7,
          pantsColor: 0x7e22ce,
          teeColor: 0x2e1065,
          accentColor: 0xa855f7,
          metalColor: 0xa855f7,
          gloveColor: 0xa855f7,
          eyeColor: 0xa855f7,
        };
      }
      if (skinId === 'nova_arctic') {
        return {
          skinColor: 0xf0fdfa,
          hairColor: 0xe0f2fe,
          jacketColor: 0x0f172a,
          jacketTrimColor: 0x38bdf8,
          pantsColor: 0x0284c7,
          teeColor: 0xf8fafc,
          accentColor: 0x38bdf8,
          metalColor: 0x38bdf8,
          gloveColor: 0x38bdf8,
          eyeColor: 0x67e8f9,
        };
      }
      if (skinId === 'nova_crimson_valkyrie') {
        return {
          skinColor: 0xfed7aa,
          hairColor: 0x991b1b,
          jacketColor: 0x7f1d1d,
          jacketTrimColor: 0xfacc15,
          pantsColor: 0x991b1b,
          teeColor: 0xfef08a,
          accentColor: 0xfacc15,
          metalColor: 0xfacc15,
          gloveColor: 0xfacc15,
          eyeColor: 0xfbbf24,
          metalness: 0.70,
          roughness: 0.28,
        };
      }
      if (skinId === 'nova_cyberpunk') {
        return {
          skinColor: 0xfed7aa,
          hairColor: 0x06b6d4,
          jacketColor: 0x09090b,
          jacketTrimColor: 0xec4899,
          pantsColor: 0x18181b,
          teeColor: 0x09090b,
          accentColor: 0xec4899,
          metalColor: 0x06b6d4,
          gloveColor: 0x06b6d4,
          eyeColor: 0x00f5ff,
          emissiveColor: 0xec4899,
        };
      }
      if (skinId === 'nova_solar_eclipse') {
        return {
          skinColor: 0xfef08a,
          hairColor: 0xf59e0b,
          jacketColor: 0x0f172a,
          jacketTrimColor: 0xfacc15,
          pantsColor: 0x1e1b4b,
          teeColor: 0xfacc15,
          accentColor: 0xfacc15,
          metalColor: 0xfacc15,
          gloveColor: 0xfacc15,
          eyeColor: 0xfbbf24,
          emissiveColor: 0xfacc15,
          metalness: 0.85,
          roughness: 0.20,
        };
      }
      // default
      return {
        skinColor: 0xfed7aa,
        hairColor: 0xbe185d,
        jacketColor: 0x18181b,
        jacketTrimColor: 0xf43f5e,
        pantsColor: 0xf43f5e,
        teeColor: 0xf8fafc,
        accentColor: 0xf43f5e,
        metalColor: 0xfbbf24,
        gloveColor: 0xf43f5e,
        eyeColor: 0xf43f5e,
      };
    }

    case 'titan': {
      if (skinId === 'titan_granite') {
        return {
          skinColor: 0x64748b,
          hairColor: 0x1e293b,
          jacketColor: 0x334155,
          jacketTrimColor: 0x10b981,
          pantsColor: 0x334155,
          teeColor: 0x475569,
          accentColor: 0x10b981,
          metalColor: 0x94a3b8,
          gloveColor: 0x475569,
          eyeColor: 0x10b981,
        };
      }
      if (skinId === 'titan_crimson') {
        return {
          skinColor: 0xd97706,
          hairColor: 0x78350f,
          jacketColor: 0xdc2626,
          jacketTrimColor: 0xfbbf24,
          pantsColor: 0xdc2626,
          teeColor: 0xb91c1c,
          accentColor: 0xfbbf24,
          metalColor: 0xfacc15,
          gloveColor: 0xdc2626,
          eyeColor: 0xfbbf24,
        };
      }
      if (skinId === 'titan_gladiator') {
        return {
          skinColor: 0xb45309,
          hairColor: 0x451a03,
          jacketColor: 0x78350f,
          jacketTrimColor: 0xf59e0b,
          pantsColor: 0x78350f,
          teeColor: 0x451a03,
          accentColor: 0xd97706,
          metalColor: 0xd97706,
          gloveColor: 0xd97706,
          eyeColor: 0xf59e0b,
          metalness: 0.75,
          roughness: 0.30,
        };
      }
      if (skinId === 'titan_yeti') {
        return {
          skinColor: 0xcbd5e1,
          hairColor: 0xf1f5f9,
          jacketColor: 0x1e293b,
          jacketTrimColor: 0x38bdf8,
          pantsColor: 0x1e293b,
          teeColor: 0xf8fafc,
          accentColor: 0x38bdf8,
          metalColor: 0x94a3b8,
          gloveColor: 0x38bdf8,
          eyeColor: 0x38bdf8,
        };
      }
      if (skinId === 'titan_magma_titan') {
        return {
          skinColor: 0x1c1917,
          hairColor: 0x7c2d12,
          jacketColor: 0x0c0a09,
          jacketTrimColor: 0xef4444,
          pantsColor: 0x0c0a09,
          teeColor: 0x292524,
          accentColor: 0xf97316,
          metalColor: 0xf97316,
          gloveColor: 0xef4444,
          eyeColor: 0xf97316,
          emissiveColor: 0xef4444,
          metalness: 0.70,
          roughness: 0.35,
        };
      }
      // default
      return {
        skinColor: 0xd97706,
        hairColor: 0x451a03,
        jacketColor: 0x1f2937,
        jacketTrimColor: 0xf59e0b,
        pantsColor: 0x1f2937,
        teeColor: 0x78350f,
        accentColor: 0xf59e0b,
        metalColor: 0xfbbf24,
        gloveColor: 0x78350f,
        eyeColor: 0xf59e0b,
      };
    }

    case 'kage': {
      if (skinId === 'kage_bloodline') {
        return {
          skinColor: 0xffedd5,
          hairColor: 0x7f1d1d,
          jacketColor: 0x7f1d1d,
          jacketTrimColor: 0xdc2626,
          pantsColor: 0x7f1d1d,
          teeColor: 0x18181b,
          accentColor: 0xdc2626,
          metalColor: 0x991b1b,
          gloveColor: 0xdc2626,
          eyeColor: 0xef4444,
        };
      }
      if (skinId === 'kage_white_lotus') {
        return {
          skinColor: 0xffedd5,
          hairColor: 0xf8fafc,
          jacketColor: 0xf8fafc,
          jacketTrimColor: 0xfacc15,
          pantsColor: 0xf8fafc,
          teeColor: 0xe2e8f0,
          accentColor: 0xfacc15,
          metalColor: 0xf59e0b,
          gloveColor: 0xfacc15,
          eyeColor: 0xf59e0b,
        };
      }
      if (skinId === 'kage_cyber_ronin') {
        return {
          skinColor: 0xe2e8f0,
          hairColor: 0x09090b,
          jacketColor: 0x09090b,
          jacketTrimColor: 0x06b6d4,
          pantsColor: 0x09090b,
          teeColor: 0x1e293b,
          accentColor: 0x00f5ff,
          metalColor: 0x00f5ff,
          gloveColor: 0x00f5ff,
          eyeColor: 0x00f5ff,
          emissiveColor: 0x00f5ff,
          metalness: 0.85,
          roughness: 0.22,
        };
      }
      if (skinId === 'kage_demon_oni') {
        return {
          skinColor: 0x991b1b,
          hairColor: 0x18181b,
          jacketColor: 0x18181b,
          jacketTrimColor: 0xe11d48,
          pantsColor: 0x18181b,
          teeColor: 0xf8fafc,
          accentColor: 0xe11d48,
          metalColor: 0x7f1d1d,
          gloveColor: 0xe11d48,
          eyeColor: 0xfacc15,
        };
      }
      if (skinId === 'kage_void_phantom') {
        return {
          skinColor: 0x0f172a,
          hairColor: 0x030712,
          jacketColor: 0x030712,
          jacketTrimColor: 0x7c3aed,
          pantsColor: 0x030712,
          teeColor: 0x4c1d95,
          accentColor: 0x7c3aed,
          metalColor: 0x8b5cf6,
          gloveColor: 0x7c3aed,
          eyeColor: 0xc084fc,
          emissiveColor: 0x8b5cf6,
          metalness: 0.80,
          roughness: 0.25,
        };
      }
      // default
      return {
        skinColor: 0xffedd5,
        hairColor: 0x0f172a,
        jacketColor: 0x0f172a,
        jacketTrimColor: 0x059669,
        pantsColor: 0x0f172a,
        teeColor: 0xbe123c,
        accentColor: 0x10b981,
        metalColor: 0x94a3b8,
        gloveColor: 0x334155,
        eyeColor: 0x10b981,
      };
    }

    case 'bolt':
    default: {
      if (skinId === 'bolt_azure') {
        return {
          skinColor: 0xfed7aa,
          hairColor: 0x38bdf8,
          jacketColor: 0x0284c7,
          jacketTrimColor: 0x38bdf8,
          pantsColor: 0xf8fafc,
          teeColor: 0x0284c7,
          accentColor: 0x38bdf8,
          metalColor: 0x00f5ff,
          gloveColor: 0x0284c7,
          eyeColor: 0x00f5ff,
        };
      }
      if (skinId === 'bolt_velocity') {
        return {
          skinColor: 0xfed7aa,
          hairColor: 0xf97316,
          jacketColor: 0xea580c,
          jacketTrimColor: 0xfacc15,
          pantsColor: 0x18181b,
          teeColor: 0xea580c,
          accentColor: 0xfacc15,
          metalColor: 0xfacc15,
          gloveColor: 0xea580c,
          eyeColor: 0xf97316,
        };
      }
      if (skinId === 'bolt_cyber_racer') {
        return {
          skinColor: 0xfed7aa,
          hairColor: 0x94a3b8,
          jacketColor: 0x0f172a,
          jacketTrimColor: 0x38bdf8,
          pantsColor: 0x1e293b,
          teeColor: 0x0284c7,
          accentColor: 0x38bdf8,
          metalColor: 0x0284c7,
          gloveColor: 0x0284c7,
          eyeColor: 0x38bdf8,
          emissiveColor: 0x38bdf8,
          metalness: 0.75,
          roughness: 0.28,
        };
      }
      if (skinId === 'bolt_stealth_operative') {
        return {
          skinColor: 0xfed7aa,
          hairColor: 0x1e293b,
          jacketColor: 0x0f172a,
          jacketTrimColor: 0x22c55e,
          pantsColor: 0x18181b,
          teeColor: 0x09090b,
          accentColor: 0x22c55e,
          metalColor: 0x22c55e,
          gloveColor: 0x09090b,
          eyeColor: 0x22c55e,
        };
      }
      if (skinId === 'bolt_raijin') {
        return {
          skinColor: 0xfef08a,
          hairColor: 0xfde047,
          jacketColor: 0xfacc15,
          jacketTrimColor: 0xfde047,
          pantsColor: 0x312e81,
          teeColor: 0xfacc15,
          accentColor: 0xfde047,
          metalColor: 0xfacc15,
          gloveColor: 0xfacc15,
          eyeColor: 0xfef08a,
          emissiveColor: 0xfde047,
          metalness: 0.85,
          roughness: 0.22,
        };
      }
      // default
      return {
        skinColor: 0xfed7aa,
        hairColor: 0xfde047,
        jacketColor: 0xeab308,
        jacketTrimColor: 0xfacc15,
        pantsColor: 0x1f2937,
        teeColor: 0xf8fafc,
        accentColor: 0xfacc15,
        metalColor: 0xf97316,
        gloveColor: 0x1f2937,
        eyeColor: 0x0284c7,
      };
    }
  }
}

// ======================================================================
// 3D ACCESSORIES & FLOATING GEOMETRY SUITE
// ======================================================================

/**
 * Builds the Poseidon God-King floating golden trident crown, orbiting water spheres,
 * and divine celestial shoulder fins.
 */
export function buildPoseidonGodKingLegendary(group: THREE.Group, accentMeshes: THREE.Mesh[]): THREE.Group {
  const floatingGroup = new THREE.Group();
  group.add(floatingGroup);

  // 1. Floating Golden Trident Crown hovering above head
  const crownGroup = new THREE.Group();
  crownGroup.position.set(0, 2.22, 0);
  floatingGroup.add(crownGroup);

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    metalness: 0.95,
    roughness: 0.15,
    emissive: 0xd97706,
    emissiveIntensity: 0.35,
  });

  const gemMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x00f5ff,
    emissiveIntensity: 0.8,
    roughness: 0.1,
  });

  // Base circular diadem ring
  const diadem = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.022, 12, 32), goldMat);
  diadem.rotateX(Math.PI / 2);
  crownGroup.add(diadem);

  // 3 Sovereign Golden Trident Spikes
  [-0.14, 0, 0.14].forEach((xPos, idx) => {
    const spikeHeight = idx === 1 ? 0.24 : 0.16;
    const spikeGeo = new THREE.ConeGeometry(0.032, spikeHeight, 8);
    const spike = new THREE.Mesh(spikeGeo, goldMat);
    spike.position.set(xPos, spikeHeight * 0.5, -0.22);
    crownGroup.add(spike);

    const gem = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 12), gemMat);
    gem.position.set(xPos, 0.02, -0.23);
    crownGroup.add(gem);
    accentMeshes.push(gem);
  });

  // 2. Four Orbiting Azure Water Orbs around hips/waist (below chest/face)
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x06b6d4,
    emissiveIntensity: 0.9,
    roughness: 0.1,
    transparent: true,
    opacity: 0.88,
  });

  const orbDistance = 0.68;
  [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].forEach((angle) => {
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), waterMat);
    orb.position.set(Math.cos(angle) * orbDistance, 0.70, Math.sin(angle) * orbDistance);
    floatingGroup.add(orb);
    accentMeshes.push(orb);
  });

  // 3. Flowing God-Fin Cloak behind shoulders
  const finMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    emissive: 0x0284c7,
    emissiveIntensity: 0.4,
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide,
  });

  [-0.24, 0.24].forEach((xSide) => {
    const finGeo = new THREE.CylinderGeometry(0.02, 0.14, 0.65, 8);
    const fin = new THREE.Mesh(finGeo, finMat);
    fin.position.set(xSide, 1.15, 0.28);
    fin.rotation.z = xSide > 0 ? -0.25 : 0.25;
    fin.rotation.x = 0.35;
    group.add(fin);
  });

  return floatingGroup;
}

/**
 * Builds the Quantum Overdrive floating hard-light tachyon wings and quantum pulse halo.
 */
export function buildQuantumOverdriveLegendary(group: THREE.Group, accentMeshes: THREE.Mesh[]): THREE.Group {
  const floatingGroup = new THREE.Group();
  group.add(floatingGroup);

  const tachyonMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x00f5ff,
    emissiveIntensity: 0.9,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
  });

  const purpleTachyonMat = new THREE.MeshStandardMaterial({
    color: 0xa855f7,
    emissive: 0x9333ea,
    emissiveIntensity: 0.9,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
  });

  // 1. Twin Angular Tachyon Energy Wings (Anchored firmly to character BACK - NEVER sweeps through face!)
  const backWingsGroup = new THREE.Group();
  backWingsGroup.position.set(0, 1.40, 0.28);
  group.add(backWingsGroup);

  [-1, 1].forEach((dir) => {
    const wingGroup = new THREE.Group();
    wingGroup.position.set(dir * 0.35, 0, 0);
    wingGroup.rotation.y = dir * 0.40;
    wingGroup.rotation.z = dir * -0.20;
    backWingsGroup.add(wingGroup);

    // Primary wing blade
    const blade1Geo = new THREE.ConeGeometry(0.12, 0.75, 4);
    blade1Geo.rotateZ(dir * -1.1);
    const blade1 = new THREE.Mesh(blade1Geo, tachyonMat);
    wingGroup.add(blade1);
    accentMeshes.push(blade1);

    // Secondary lower blade
    const blade2Geo = new THREE.ConeGeometry(0.08, 0.50, 4);
    blade2Geo.rotateZ(dir * -1.5);
    blade2Geo.translate(0, -0.15, 0);
    const blade2 = new THREE.Mesh(blade2Geo, purpleTachyonMat);
    wingGroup.add(blade2);
    accentMeshes.push(blade2);
  });

  // 2. Quantum Pulse Halo (Floats HIGH ABOVE HEAD at y = 2.22 in floatingGroup)
  const haloGroup = new THREE.Group();
  haloGroup.position.set(0, 2.22, 0);
  floatingGroup.add(haloGroup);

  const haloGeo = new THREE.TorusGeometry(0.28, 0.024, 8, 32);
  const halo = new THREE.Mesh(haloGeo, tachyonMat);
  halo.rotateX(Math.PI / 2);
  haloGroup.add(halo);
  accentMeshes.push(halo);

  // 3. Orbiting Tachyon Prisms around WAIST/HIPS (y = 0.65, radius = 0.70)
  const prismDist = 0.70;
  [0, Math.PI * 0.66, Math.PI * 1.33].forEach((angle) => {
    const prism = new THREE.Mesh(new THREE.OctahedronGeometry(0.048), purpleTachyonMat);
    prism.position.set(Math.cos(angle) * prismDist, 0.65, Math.sin(angle) * prismDist);
    floatingGroup.add(prism);
    accentMeshes.push(prism);
  });

  return floatingGroup;
}

/**
 * Builds the Solar Eclipse Goddess twin coronal wings and radiant sun halo.
 * Designed so wings stay on her back and halo floats above head, never blocking the face!
 */
export function buildSolarEclipseGoddessLegendary(group: THREE.Group, accentMeshes: THREE.Mesh[]): THREE.Group {
  const floatingGroup = new THREE.Group();
  group.add(floatingGroup);

  const solarGoldMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.95,
    roughness: 0.15,
    metalness: 0.90,
  });

  const eclipseCoronaMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfacc15,
    emissiveIntensity: 1.0,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
  });

  // 1. BACK SOLAR WINGS (Attached directly to character group, strictly behind back!)
  const backWingsGroup = new THREE.Group();
  backWingsGroup.position.set(0, 1.35, 0.28);
  group.add(backWingsGroup);

  [-1, 1].forEach((dir) => {
    const wing = new THREE.Group();
    wing.position.set(dir * 0.22, 0, 0);
    wing.rotation.y = dir * 0.35;
    backWingsGroup.add(wing);

    // 4 Layered Radiant Solar Feather Blades per wing
    [0, 1, 2, 3].forEach((idx) => {
      const bladeGeo = new THREE.ConeGeometry(0.045, 0.45 + idx * 0.14, 4);
      bladeGeo.rotateZ(dir * (0.65 + idx * 0.30));
      const blade = new THREE.Mesh(bladeGeo, solarGoldMat);
      blade.position.set(dir * (0.15 + idx * 0.08), 0.10 + idx * 0.09, 0);
      wing.add(blade);
      accentMeshes.push(blade);
    });
  });

  // 2. Coronal Sun Eclipse Halo (HIGH ABOVE HEAD at y = 2.22 in floatingGroup)
  const haloGroup = new THREE.Group();
  haloGroup.position.set(0, 2.22, 0);
  floatingGroup.add(haloGroup);

  // Radiant Sun Ring
  const haloRing = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.022, 10, 32), eclipseCoronaMat);
  haloRing.rotateX(Math.PI / 2);
  haloGroup.add(haloRing);
  accentMeshes.push(haloRing);

  // 8 Diamond Sunburst Spikes radiating outward
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const spikeGeo = new THREE.ConeGeometry(0.024, 0.14, 4);
    spikeGeo.rotateZ(angle - Math.PI / 2);
    const spike = new THREE.Mesh(spikeGeo, solarGoldMat);
    spike.position.set(Math.cos(angle) * 0.32, 0, Math.sin(angle) * 0.32);
    haloGroup.add(spike);
    accentMeshes.push(spike);
  }

  // 3. Orbiting Solar Flare Orbs around WAIST/HIPS (y = 0.65, radius = 0.72)
  const orbDistance = 0.72;
  [0, Math.PI * 0.66, Math.PI * 1.33].forEach((angle) => {
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.048, 16, 16), eclipseCoronaMat);
    orb.position.set(Math.cos(angle) * orbDistance, 0.65, Math.sin(angle) * orbDistance);
    floatingGroup.add(orb);
    accentMeshes.push(orb);
  });

  return floatingGroup;
}

/**
 * Builds the Magma Titan Destroyer cracking molten core fissure, horned obsidian crown,
 * and 3 orbiting volcanic basalt boulders.
 */
export function buildMagmaTitanDestroyerLegendary(group: THREE.Group, accentMeshes: THREE.Mesh[]): THREE.Group {
  const floatingGroup = new THREE.Group();
  group.add(floatingGroup);

  const basaltMat = new THREE.MeshStandardMaterial({
    color: 0x1c1917,
    roughness: 0.90,
    metalness: 0.10,
  });

  const lavaMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xf97316,
    emissiveIntensity: 0.95,
    roughness: 0.20,
  });

  // 1. Massive Igneous Volcanic Brow Horns
  [-0.22, 0.22].forEach((xSide) => {
    const isRight = xSide > 0;
    const hornGeo = new THREE.ConeGeometry(0.075, 0.38, 8);
    hornGeo.rotateZ(isRight ? -0.55 : 0.55);
    hornGeo.rotateX(-0.25);
    const horn = new THREE.Mesh(hornGeo, basaltMat);
    horn.position.set(xSide, 1.85, -0.18);
    group.add(horn);

    const hornLavaTip = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.14, 8), lavaMat);
    hornLavaTip.position.set(xSide * 1.5, 1.96, -0.22);
    hornLavaTip.rotation.z = isRight ? -0.55 : 0.55;
    group.add(hornLavaTip);
    accentMeshes.push(hornLavaTip);
  });

  // 2. Three Massive Orbiting Volcanic Basalt Boulders around WAIST/HIPS (y = 0.70, completely clear of face!)
  const boulderDistance = 0.95;
  [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].forEach((angle) => {
    const boulderGeo = new THREE.DodecahedronGeometry(0.12, 1);
    const boulder = new THREE.Mesh(boulderGeo, basaltMat);
    boulder.position.set(Math.cos(angle) * boulderDistance, 0.70, Math.sin(angle) * boulderDistance);
    floatingGroup.add(boulder);

    // Glowing magma vein running through boulder
    const vein = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), lavaMat);
    boulder.add(vein);
    accentMeshes.push(vein);
  });

  // 3. Cracked Molten Core on Chest
  const fissureGeo = new THREE.TorusGeometry(0.12, 0.035, 8, 16);
  const fissure = new THREE.Mesh(fissureGeo, lavaMat);
  fissure.position.set(0, 1.15, -0.32);
  group.add(fissure);
  accentMeshes.push(fissure);

  return floatingGroup;
}

/**
 * Builds the Void Phantom Kage 6 floating spectral obsidian blade wings,
 * singularity event horizon halo, and shadow horn crown.
 * Blades are anchored behind the back so they NEVER sweep across his face!
 */
export function buildVoidPhantomKageLegendary(group: THREE.Group, accentMeshes: THREE.Mesh[]): THREE.Group {
  const floatingGroup = new THREE.Group();
  group.add(floatingGroup);

  const voidBladeMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    emissive: 0x7c3aed,
    emissiveIntensity: 0.90,
    roughness: 0.15,
    metalness: 0.95,
  });

  const voidSingularityMat = new THREE.MeshStandardMaterial({
    color: 0x3b0764,
    emissive: 0xa855f7,
    emissiveIntensity: 0.95,
    transparent: true,
    opacity: 0.88,
    side: THREE.DoubleSide,
  });

  // 1. BACK SPECTRAL OBSIDIAN BLADES (Attached to character group behind back, NEVER in front of face!)
  const backBladesGroup = new THREE.Group();
  backBladesGroup.position.set(0, 1.35, 0.30);
  group.add(backBladesGroup);

  [-1, 1].forEach((dir) => {
    [0, 1, 2].forEach((idx) => {
      const bladeGeo = new THREE.ConeGeometry(0.042, 0.52 + idx * 0.15, 4);
      bladeGeo.rotateZ(dir * (0.65 + idx * 0.38));
      const blade = new THREE.Mesh(bladeGeo, voidBladeMat);
      blade.position.set(dir * (0.24 + idx * 0.12), 0.08 + idx * 0.12, 0);
      backBladesGroup.add(blade);
      accentMeshes.push(blade);
    });
  });

  // 2. Void Singularity Halo (HIGH ABOVE HEAD at y = 2.22 in floatingGroup)
  const haloGroup = new THREE.Group();
  haloGroup.position.set(0, 2.22, 0);
  floatingGroup.add(haloGroup);

  const haloRing = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.024, 8, 32), voidSingularityMat);
  haloRing.rotateX(Math.PI / 2);
  haloGroup.add(haloRing);
  accentMeshes.push(haloRing);

  // 3 Floating Void Spikes on the halo
  [-0.18, 0, 0.18].forEach((xPos, idx) => {
    const spikeHeight = idx === 1 ? 0.22 : 0.14;
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.03, spikeHeight, 5), voidBladeMat);
    spike.position.set(xPos, spikeHeight * 0.5, 0);
    haloGroup.add(spike);
    accentMeshes.push(spike);
  });

  // 3. Orbiting Void Singularity Pearls around WAIST (y = 0.65, radius = 0.70)
  const orbDistance = 0.70;
  [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].forEach((angle) => {
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 14), voidSingularityMat);
    orb.position.set(Math.cos(angle) * orbDistance, 0.65, Math.sin(angle) * orbDistance);
    floatingGroup.add(orb);
    accentMeshes.push(orb);
  });

  return floatingGroup;
}

/**
 * Builds the Thunder God Raijin Axel legendary crescent of Taiko thunder drums
 * with connecting golden lightning arcs and storm crown!
 * Drums are mounted strictly behind the back, framing shoulders from behind.
 */
export function buildRaijinThunderGodLegendary(group: THREE.Group, accentMeshes: THREE.Mesh[]): THREE.Group {
  const floatingGroup = new THREE.Group();
  group.add(floatingGroup);

  const drumBodyMat = new THREE.MeshStandardMaterial({
    color: 0x451a03,
    roughness: 0.35,
    metalness: 0.25,
  });

  const drumRimMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    metalness: 0.95,
    roughness: 0.15,
    emissive: 0xd97706,
    emissiveIntensity: 0.45,
  });

  const lightningMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfacc15,
    emissiveIntensity: 1.0,
    roughness: 0.1,
  });

  // 1. AUTHENTIC RAIJIN TAIKO DRUMS CRESCENT ARCH (Firmly on character BACK at z = 0.35, NEVER sweeps face!)
  const drumsArchGroup = new THREE.Group();
  drumsArchGroup.position.set(0, 1.45, 0.35);
  group.add(drumsArchGroup);

  // 5 Taiko drums arranged in a dramatic semi-circular crescent over shoulders & behind head
  const archRadius = 0.58;
  const drumAngles = [-Math.PI * 0.65, -Math.PI * 0.35, 0, Math.PI * 0.35, Math.PI * 0.65];

  drumAngles.forEach((angle) => {
    const drumX = Math.sin(angle) * archRadius;
    const drumY = Math.cos(angle) * archRadius * 0.7;

    const drum = new THREE.Group();
    drum.position.set(drumX, drumY, 0);
    drumsArchGroup.add(drum);

    // Barrel
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.10, 16), drumBodyMat);
    barrel.rotateX(Math.PI / 2);
    drum.add(barrel);

    // Golden Rims
    [-0.05, 0.05].forEach((zOff) => {
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.014, 8, 16), drumRimMat);
      rim.position.set(0, 0, zOff);
      drum.add(rim);
    });

    // Golden Mitsudomoe Thunder Crest on front face
    const crest = new THREE.Mesh(new THREE.CircleGeometry(0.045, 8), lightningMat);
    crest.position.set(0, 0, 0.052);
    drum.add(crest);
    accentMeshes.push(crest);
  });

  // Connecting Golden Lightning Rods between the 5 drums in the arch
  for (let i = 0; i < drumAngles.length - 1; i++) {
    const x1 = Math.sin(drumAngles[i]) * archRadius;
    const y1 = Math.cos(drumAngles[i]) * archRadius * 0.7;
    const x2 = Math.sin(drumAngles[i + 1]) * archRadius;
    const y2 = Math.cos(drumAngles[i + 1]) * archRadius * 0.7;

    const midX = (x1 + x2) * 0.5;
    const midY = (y1 + y2) * 0.5;
    const len = Math.hypot(x2 - x1, y2 - y1);

    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, len, 6), lightningMat);
    rod.position.set(midX, midY, 0);
    rod.rotation.z = Math.atan2(y2 - y1, x2 - x1) - Math.PI / 2;
    drumsArchGroup.add(rod);
    accentMeshes.push(rod);
  }

  // 2. Storm Lightning Crown Nimbus (HIGH ABOVE HEAD at y = 2.22 in floatingGroup)
  const stormGroup = new THREE.Group();
  stormGroup.position.set(0, 2.22, 0);
  floatingGroup.add(stormGroup);

  const stormRing = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.022, 8, 24), lightningMat);
  stormRing.rotateX(Math.PI / 2);
  stormGroup.add(stormRing);
  accentMeshes.push(stormRing);

  // 4 Zigzag Lightning Tendrils on Crown
  [-0.16, 0.16].forEach((xSide) => {
    const spark = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.18, 4), lightningMat);
    spark.position.set(xSide, 0.09, 0);
    spark.rotation.z = xSide > 0 ? -0.4 : 0.4;
    stormGroup.add(spark);
    accentMeshes.push(spark);
  });

  // 3. Orbiting Electric Sparks around WAIST (y = 0.65, radius = 0.68)
  const sparkDistance = 0.68;
  [0, Math.PI * 0.66, Math.PI * 1.33].forEach((angle) => {
    const sparkOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.045), lightningMat);
    sparkOrb.position.set(Math.cos(angle) * sparkDistance, 0.65, Math.sin(angle) * sparkDistance);
    floatingGroup.add(sparkOrb);
    accentMeshes.push(sparkOrb);
  });

  return floatingGroup;
}

// ======================================================================
// EPIC HEADGEAR & ACCESSORY BUILDERS
// ======================================================================

/**
 * Curved Holographic Cyber HUD Visor for Leo & Bolt
 */
export function buildCyberHudVisor(group: THREE.Group, colorHex: number = 0x00f5ff, yPos: number = 1.74): void {
  const visorMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    emissive: colorHex,
    emissiveIntensity: 0.85,
    transparent: true,
    opacity: 0.75,
    roughness: 0.1,
  });

  const visorGeo = new THREE.CapsuleGeometry(0.045, 0.24, 8, 16);
  visorGeo.rotateZ(Math.PI / 2);
  const visor = new THREE.Mesh(visorGeo, visorMat);
  visor.position.set(0, yPos, -0.285);
  group.add(visor);
}

/**
 * Tactical Mecha Shoulder Pistons & Monocle for Kai Mecha Rebel
 */
export function buildMechaExoShoulders(group: THREE.Group): void {
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.90, roughness: 0.20 });
  const redLedMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

  [-0.38, 0.38].forEach((xSide) => {
    const pistonGroup = new THREE.Group();
    pistonGroup.position.set(xSide, 1.36, 0);
    group.add(pistonGroup);

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.18, 12), steelMat);
    pistonGroup.add(base);

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.12, 10), steelMat);
    shaft.position.y = 0.12;
    pistonGroup.add(shaft);

    const led = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), redLedMat);
    led.position.set(0, 0, -0.07);
    pistonGroup.add(led);
  });

  // Targeting Monocle over eye
  const monocle = new THREE.Mesh(new THREE.RingGeometry(0.025, 0.055, 12), redLedMat);
  monocle.position.set(-0.11, 1.74, -0.29);
  group.add(monocle);
}

/**
 * Winged Golden Valkyrie Tiara for Nova Crimson Valkyrie
 */
export function buildValkyrieTiara(group: THREE.Group): void {
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.92, roughness: 0.18 });

  // Tiara band
  const bandGeo = new THREE.TorusGeometry(0.28, 0.020, 8, 24, Math.PI);
  bandGeo.rotateX(Math.PI / 2);
  const band = new THREE.Mesh(bandGeo, goldMat);
  band.position.set(0, 1.84, -0.05);
  group.add(band);

  // Twin golden wings on temples
  [-0.28, 0.28].forEach((xSide) => {
    const isRight = xSide > 0;
    const wingGeo = new THREE.ConeGeometry(0.05, 0.24, 4);
    wingGeo.rotateZ(isRight ? -0.7 : 0.7);
    const wing = new THREE.Mesh(wingGeo, goldMat);
    wing.position.set(xSide, 1.88, -0.08);
    group.add(wing);
  });
}

/**
 * Roman Gladiator Helmet Plume & Spiked Lion Pauldron for Gorr
 */
export function buildGladiatorPlumeAndPauldron(group: THREE.Group): void {
  const bronzeMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.88, roughness: 0.22 });
  const plumeMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.70 });

  // Sweeping Crimson Crest Plume
  const plumeGeo = new THREE.TorusGeometry(0.32, 0.055, 10, 24, Math.PI * 0.7);
  plumeGeo.rotateZ(Math.PI * 0.65);
  const plume = new THREE.Mesh(plumeGeo, plumeMat);
  plume.position.set(0, 1.88, 0.05);
  group.add(plume);

  // Spiked Gladiator Pauldron on Left Shoulder
  const pauldron = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), bronzeMat);
  pauldron.position.set(-0.46, 1.30, 0);
  group.add(pauldron);

  const spike = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.16, 8), bronzeMat);
  spike.position.set(-0.46, 1.48, 0);
  group.add(spike);
}

/**
 * White Snow-Beast Fur Mantle for Gorr Frost Yeti
 */
export function buildYetiFurMantle(group: THREE.Group): void {
  const furMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.90 });

  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.09, 12, 24), furMat);
  collar.rotateX(Math.PI / 2);
  collar.position.set(0, 1.35, 0.04);
  group.add(collar);
}

/**
 * Cyber Samurai Kabuto with Dual Cyan Crest & Katanas for Kage Cyber Ronin
 */
export function buildCyberRoninKabutoAndKatanas(group: THREE.Group): void {
  const carbonMat = new THREE.MeshStandardMaterial({ color: 0x09090b, metalness: 0.85, roughness: 0.20 });
  const cyanEnergyMat = new THREE.MeshStandardMaterial({
    color: 0x00f5ff,
    emissive: 0x00f5ff,
    emissiveIntensity: 0.9,
  });

  // Dual Horn Crest on Forehead
  [-0.10, 0.10].forEach((xSide) => {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.22, 6), cyanEnergyMat);
    horn.position.set(xSide, 1.95, -0.22);
    horn.rotation.z = xSide > 0 ? -0.45 : 0.45;
    group.add(horn);
  });

  // Dual Cyber Katanas on Back
  [-0.12, 0.12].forEach((xSide) => {
    const scabbard = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.85, 8), carbonMat);
    scabbard.position.set(xSide, 1.25, 0.30);
    scabbard.rotation.z = xSide > 0 ? -0.35 : 0.35;
    scabbard.rotation.x = 0.25;
    group.add(scabbard);
  });
}

/**
 * Carved Crimson Demon Oni Mask for Kage Demon Oni
 */
export function buildDemonOniMask(group: THREE.Group): void {
  const redLacquerMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.35, metalness: 0.25 });
  const ivoryMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.30 });

  // Demon Brow Horns
  [-0.14, 0.14].forEach((xSide) => {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.20, 8), ivoryMat);
    horn.position.set(xSide, 1.90, -0.25);
    horn.rotation.z = xSide > 0 ? -0.55 : 0.55;
    group.add(horn);
  });

  // Curved Ivory Tusks/Fangs protruding from jaw
  [-0.10, 0.10].forEach((xSide) => {
    const tusk = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.11, 8), ivoryMat);
    tusk.position.set(xSide, 1.58, -0.27);
    tusk.rotation.x = Math.PI;
    group.add(tusk);
  });

  // Menacing Red Nose Bridge
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.09, 0.08), redLacquerMat);
  snout.position.set(0, 1.68, -0.28);
  group.add(snout);
}

/**
 * Cyber Racer Aero-Fins & Chest Speedometer for Axel Bolt
 */
export function buildCyberRacerAeroFins(group: THREE.Group): void {
  const aeroMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.85, roughness: 0.20 });
  const hudMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

  // Rear Aero Airfoils on Shoulders
  [-0.32, 0.32].forEach((xSide) => {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.14), aeroMat);
    fin.position.set(xSide, 1.44, 0.16);
    fin.rotation.z = xSide > 0 ? -0.30 : 0.30;
    group.add(fin);
  });

  // Glowing Chest Speedometer
  const speedo = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.06), hudMat);
  speedo.position.set(0, 1.30, -0.26);
  group.add(speedo);
}

/**
 * Quad-Lens Night Vision Goggles for Axel Stealth Operative
 */
export function buildStealthNightVisionGoggles(group: THREE.Group): void {
  const matteMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.80 });
  const phosphorGreenMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });

  const goggleBar = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.07, 0.09), matteMat);
  goggleBar.position.set(0, 1.82, -0.26);
  group.add(goggleBar);

  [-0.10, -0.035, 0.035, 0.10].forEach((xPos) => {
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.06, 12), phosphorGreenMat);
    lens.rotateX(Math.PI / 2);
    lens.position.set(xPos, 1.82, -0.31);
    group.add(lens);
  });
}
