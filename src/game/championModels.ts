import * as THREE from 'three';

export type ChampionId = 'leo' | 'kai' | 'nova' | 'titan' | 'kage' | 'bolt';

export interface ChampionInfo {
  id: ChampionId;
  name: string;
  title: string;
  archetype: string;
  chapter: string;
  color: string;
  glowColor: number;
  tagline: string;
  description: string;
}

export const CHAMPIONS: Record<ChampionId, ChampionInfo> = {
  leo: {
    id: 'leo',
    name: 'Leo',
    title: 'Island Scout',
    archetype: 'Coastal Brawler',
    chapter: 'Chapter 1: Emerald Isles',
    color: '#10b981',
    glowColor: 0x10b981,
    tagline: 'Backwards cap, scout vest, quick reflexes and skate kicks.',
    description: 'An adventurous human coastal brawler with razor-sharp agility, snapback swagger, and swift kinetic counter-punches.',
  },
  kai: {
    id: 'kai',
    name: 'Kai',
    title: 'Street Striker',
    archetype: 'Urban Skater',
    chapter: 'Neon Metropolis',
    color: '#00f5ff',
    glowColor: 0x00f5ff,
    tagline: 'Neon hoodie, street headphones, spiky hair, fearless momentum.',
    description: 'An urban street brawler who rules the pavement with high-speed footwork, rhythm-timed strikes, and electric cyan sneakers.',
  },
  nova: {
    id: 'nova',
    name: 'Nova',
    title: 'Valkyrie Boxer',
    archetype: 'Agile Kickboxer',
    chapter: 'Grand Championship',
    color: '#f43f5e',
    glowColor: 0xf43f5e,
    tagline: 'High swinging ponytail, taped boxing wraps, explosive ring recovery.',
    description: 'A fearless female kickboxing champion known for lightning-fast edge recoveries, disciplined stance, and relentless flurry combos.',
  },
  titan: {
    id: 'titan',
    name: 'Gorr',
    title: 'Heavy Strongman',
    archetype: 'Mountain Juggernaut',
    chapter: 'Iron Peak Highlands',
    color: '#f59e0b',
    glowColor: 0xf59e0b,
    tagline: 'Massive barrel chest, bearded powerhouse, golden champion belt.',
    description: 'A colossal human heavyweight powerhouse. With boulder shoulders and heavyweight powerlifting grip, Gorr sends opponents flying into the sea.',
  },
  kage: {
    id: 'kage',
    name: 'Kage',
    title: 'Shadow Shinobi',
    archetype: 'Ninja Martial Artist',
    chapter: 'Night Shallows',
    color: '#059669',
    glowColor: 0x059669,
    tagline: 'Trailing headband ribbons, cloth ninja mask, silent counter-strikes.',
    description: 'A disciplined shinobi martial artist wrapped in jade and obsidian robes. He glides across the ring boundary with phantom grace.',
  },
  bolt: {
    id: 'bolt',
    name: 'Axel',
    title: 'Lightning Parkourist',
    archetype: 'Street Sprinter',
    chapter: 'High-Voltage Rooftops',
    color: '#eab308',
    glowColor: 0xeab308,
    tagline: 'Speed goggles, zip windbreaker, hyperactive parkour sprint.',
    description: 'An acrobatic human parkour trickster wearing high-voltage yellow runners. Axel darts around slower heavyweights before blasting them over the cliff.',
  },
};

export const CHAMPION_LIST: ChampionInfo[] = Object.values(CHAMPIONS);

export interface CreatedChampion {
  group: THREE.Group;
  bodyMesh: THREE.Mesh;
  coreMesh: THREE.Mesh;
  fists: THREE.Mesh[];
  accentMeshes: THREE.Mesh[];
  legs?: THREE.Group[];
  arms?: THREE.Group[];
}

/**
 * Creates high-detail procedural 3D human champion models with Zooba / Pixar stylized appeal,
 * PBR materials, expressive faces, articulated running rigs, and zero robotic parts.
 */
export function createChampionMesh(id: ChampionId): CreatedChampion {
  switch (id) {
    case 'leo':
      return createLeoMesh();
    case 'kai':
      return createKaiMesh();
    case 'nova':
      return createNovaMesh();
    case 'titan':
      return createTitanGorrMesh();
    case 'kage':
      return createKageMesh();
    case 'bolt':
    default:
      return createAxelBoltMesh();
  }
}

// ======================================================================
// SHARED PROCEDURAL HELPERS FOR ZOOBA-STYLE HUMAN FACIAL FEATURES
// ======================================================================

/**
 * Creates a pair of stylized expressive cartoon eyes with sclera, iris, pupil, and specular catchlights.
 */
function createExpressiveEyes(
  irisColor: number,
  eyeWidth: number = 0.08,
  eyeHeight: number = 0.11,
  spacing: number = 0.11,
  yPos: number = 1.74,
  zPos: number = -0.25
): THREE.Group {
  const eyesGroup = new THREE.Group();

  const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const eyeIrisMat = new THREE.MeshBasicMaterial({ color: irisColor });
  const eyePupilMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });
  const eyeShineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  [-spacing, spacing].forEach((xSide) => {
    // White sclera
    const scleraGeo = new THREE.SphereGeometry(eyeWidth, 16, 16);
    scleraGeo.scale(1.0, eyeHeight / eyeWidth, 0.45);
    const sclera = new THREE.Mesh(scleraGeo, eyeWhiteMat);
    sclera.position.set(xSide, yPos, zPos);
    eyesGroup.add(sclera);

    // Colored iris
    const irisGeo = new THREE.SphereGeometry(eyeWidth * 0.65, 12, 12);
    irisGeo.scale(1.0, 1.0, 0.2);
    const iris = new THREE.Mesh(irisGeo, eyeIrisMat);
    iris.position.set(xSide * 0.95, yPos, zPos - 0.025);
    eyesGroup.add(iris);

    // Dark pupil
    const pupilGeo = new THREE.SphereGeometry(eyeWidth * 0.38, 10, 10);
    pupilGeo.scale(1.0, 1.0, 0.2);
    const pupil = new THREE.Mesh(pupilGeo, eyePupilMat);
    pupil.position.set(xSide * 0.95, yPos, zPos - 0.038);
    eyesGroup.add(pupil);

    // Specular catchlight highlight (makes characters look alive and vibrant)
    const shineGeo = new THREE.SphereGeometry(eyeWidth * 0.20, 8, 8);
    const shine = new THREE.Mesh(shineGeo, eyeShineMat);
    shine.position.set(xSide * 0.95 + 0.02, yPos + 0.025, zPos - 0.046);
    eyesGroup.add(shine);

    // Secondary subtle twinkle
    const twinkleGeo = new THREE.SphereGeometry(eyeWidth * 0.10, 6, 6);
    const twinkle = new THREE.Mesh(twinkleGeo, eyeShineMat);
    twinkle.position.set(xSide * 0.95 - 0.015, yPos - 0.02, zPos - 0.046);
    eyesGroup.add(twinkle);
  });

  return eyesGroup;
}

/**
 * Creates sculpted human ears framing the head.
 */
function createHumanEars(skinMat: THREE.Material, headRadius: number = 0.28, yPos: number = 1.70): THREE.Group {
  const earsGroup = new THREE.Group();
  [-headRadius, headRadius].forEach((xSide) => {
    const isRight = xSide > 0;
    const earGeo = new THREE.SphereGeometry(0.065, 10, 10);
    earGeo.scale(0.45, 1.0, 0.75);
    const ear = new THREE.Mesh(earGeo, skinMat);
    ear.position.set(xSide * 0.98, yPos, -0.01);
    ear.rotation.y = isRight ? 0.12 : -0.12;
    earsGroup.add(ear);
  });
  return earsGroup;
}

// ----------------------------------------------------------------------
// 1. LEO — ISLAND SCOUT (Human Coastal Brawler)
// ----------------------------------------------------------------------
function createLeoMesh(): CreatedChampion {
  const group = new THREE.Group();
  const accentMeshes: THREE.Mesh[] = [];

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xf5bf94, roughness: 0.60, metalness: 0.02 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x432410, roughness: 0.70, metalness: 0.0 });
  const vestMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.42, metalness: 0.08 });
  const vestDarkMat = new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.50, metalness: 0.08 });
  const whiteClothMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.65, metalness: 0.03 });
  const denimMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.76, metalness: 0.04 });
  const leatherMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.52, metalness: 0.10 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.90, roughness: 0.20 });
  const goldGlowMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const gloveMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.55, metalness: 0.10 });

  // Pelvis & Belt
  const pelvisGeo = new THREE.BoxGeometry(0.64, 0.24, 0.40);
  const pelvis = new THREE.Mesh(pelvisGeo, denimMat);
  pelvis.position.set(0, 0.74, 0);
  group.add(pelvis);

  const beltGeo = new THREE.BoxGeometry(0.70, 0.06, 0.44);
  const belt = new THREE.Mesh(beltGeo, leatherMat);
  belt.position.set(0, 0.86, 0);
  group.add(belt);

  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 0.05), goldMat);
  buckle.position.set(0, 0.86, -0.23);
  group.add(buckle);

  // Torso / White Tee & Vest
  const chestGeo = new THREE.BoxGeometry(0.70, 0.48, 0.42);
  const chest = new THREE.Mesh(chestGeo, vestMat);
  chest.position.set(0, 1.25, 0);
  chest.castShadow = true;
  group.add(chest);

  const whiteTee = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.46, 0.04), whiteClothMat);
  whiteTee.position.set(0, 1.24, -0.215);
  group.add(whiteTee);

  // Compass Medallion
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 16), goldMat);
  core.rotateX(Math.PI / 2);
  core.position.set(0, 1.30, -0.235);
  group.add(core);

  const compassStar = new THREE.Mesh(new THREE.RingGeometry(0.02, 0.06, 4), goldGlowMat);
  compassStar.position.set(0, 1.30, -0.252);
  group.add(compassStar);
  accentMeshes.push(compassStar);

  // Head & Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.16, 16), skinMat);
  neck.position.set(0, 1.50, 0);
  group.add(neck);

  const headGeo = new THREE.SphereGeometry(0.28, 32, 24);
  headGeo.scale(1.0, 1.05, 0.95);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.set(0, 1.72, 0);
  head.castShadow = true;
  group.add(head);

  // Expressive Eyes (Azure Blue)
  const eyes = createExpressiveEyes(0x0284c7, 0.075, 0.10, 0.10, 1.74, -0.25);
  group.add(eyes);

  // Eyebrows
  [-0.10, 0.10].forEach((xSide) => {
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.024, 0.03), hairMat);
    brow.position.set(xSide, 1.83, -0.26);
    brow.rotation.z = xSide > 0 ? -0.15 : 0.15;
    group.add(brow);
  });

  // Nose & Confident Smile
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.05, 6), skinMat);
  nose.rotateX(Math.PI / 2);
  nose.position.set(0, 1.68, -0.28);
  group.add(nose);

  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.025, 0.02), new THREE.MeshBasicMaterial({ color: 0x881337 }));
  mouth.position.set(0, 1.60, -0.26);
  group.add(mouth);

  const teeth = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.012, 0.015), whiteClothMat);
  teeth.position.set(0, 1.61, -0.265);
  group.add(teeth);

  // Ears
  group.add(createHumanEars(skinMat, 0.28, 1.70));

  // Backwards Snapback Cap
  const capGroup = new THREE.Group();
  capGroup.position.set(0, 1.84, 0.03);
  capGroup.rotation.x = -0.20;
  group.add(capGroup);

  const capDome = new THREE.Mesh(new THREE.SphereGeometry(0.298, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.52), vestMat);
  capGroup.add(capDome);

  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.026, 0.22), vestDarkMat);
  visor.position.set(0, 0.01, 0.28);
  capGroup.add(visor);

  const capButton = new THREE.Mesh(new THREE.SphereGeometry(0.034, 8, 8), goldMat);
  capButton.position.set(0, 0.305, 0);
  capGroup.add(capButton);

  // Hair Bangs under cap
  [-0.12, -0.04, 0.04, 0.12].forEach((xOff, i) => {
    const bang = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.14, 6), hairMat);
    bang.rotateX(0.35);
    bang.rotateZ((i - 1.5) * 0.15);
    bang.position.set(xOff, 1.83, -0.26);
    group.add(bang);
  });

  // Articulated Legs & Skate Sneakers
  const legGroupL = new THREE.Group();
  const legGroupR = new THREE.Group();

  [-0.18, 0.18].forEach((xPos, idx) => {
    const legGroup = idx === 0 ? legGroupL : legGroupR;
    legGroup.position.set(xPos, 0.70, 0);
    group.add(legGroup);

    // Hip joint
    legGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.128, 12, 12), denimMat));

    // Thigh
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.12, 0.32, 16), denimMat);
    thigh.position.set(0, -0.14, 0);
    legGroup.add(thigh);

    // Knee
    const knee = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.08, 0.22), denimMat);
    knee.position.set(0, -0.30, 0);
    legGroup.add(knee);

    // Calf & Cuff
    const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.11, 0.22, 16), denimMat);
    calf.position.set(0, -0.42, 0);
    legGroup.add(calf);

    const ankle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.08, 12), skinMat);
    ankle.position.set(0, -0.56, 0);
    legGroup.add(ankle);

    // Skate Sneaker
    const footGroup = new THREE.Group();
    footGroup.position.set(0, -0.70, 0);
    legGroup.add(footGroup);

    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.13, 0.36), vestMat);
    shoe.position.set(0, 0.09, -0.05);
    footGroup.add(shoe);

    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.05, 0.38), whiteClothMat);
    sole.position.set(0, 0.025, -0.05);
    footGroup.add(sole);
  });

  // Articulated Arms & Brawler Fists
  const armGroupL = new THREE.Group();
  const armGroupR = new THREE.Group();
  const fistGroupL = new THREE.Group();
  const fistGroupR = new THREE.Group();

  [-0.42, 0.42].forEach((xSide, idx) => {
    const isRight = xSide > 0;
    const armGroup = idx === 0 ? armGroupL : armGroupR;
    const fistGroup = isRight ? fistGroupR : fistGroupL;

    armGroup.position.set(xSide, 1.28, -0.02);
    group.add(armGroup);

    // Shoulder cap
    armGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 12), vestMat));

    const armInner = new THREE.Group();
    armInner.rotation.z = isRight ? -0.16 : 0.16;
    armInner.rotation.x = -0.10;
    armGroup.add(armInner);

    // Upper Arm
    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.09, 0.24, 12), skinMat);
    upperArm.position.set(0, -0.12, 0);
    armInner.add(upperArm);

    // Forearm angled inward in combat guard
    const forearmGroup = new THREE.Group();
    forearmGroup.position.set(0, -0.24, 0);
    forearmGroup.rotation.x = 0.48;
    forearmGroup.rotation.z = isRight ? 0.22 : -0.22;
    armInner.add(forearmGroup);

    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.082, 0.22, 12), skinMat);
    forearm.position.set(0, -0.11, 0);
    forearmGroup.add(forearm);

    // Wristband & Brawler Fist
    const wristband = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.022, 8, 14), vestDarkMat);
    wristband.rotateX(Math.PI / 2);
    wristband.position.set(0, -0.21, 0);
    forearmGroup.add(wristband);

    fistGroup.position.set(0, -0.28, 0);
    forearmGroup.add(fistGroup);

    const gloveBody = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.14, 0.16), gloveMat);
    fistGroup.add(gloveBody);

    const knucklePlate = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.035), goldMat);
    knucklePlate.position.set(0, 0.02, 0.085);
    fistGroup.add(knucklePlate);
  });

  const leftFistMesh = fistGroupL.children[0] as THREE.Mesh;
  const rightFistMesh = fistGroupR.children[0] as THREE.Mesh;

  return {
    group,
    bodyMesh: chest,
    coreMesh: core,
    fists: [leftFistMesh, rightFistMesh],
    accentMeshes,
    legs: [legGroupL, legGroupR],
    arms: [armGroupL, armGroupR],
  };
}

// ----------------------------------------------------------------------
// 2. KAI — STREET STRIKER (Human Urban Skater Brawler)
// ----------------------------------------------------------------------
function createKaiMesh(): CreatedChampion {
  const group = new THREE.Group();
  const accentMeshes: THREE.Mesh[] = [];

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfcd5b4, roughness: 0.58, metalness: 0.02 });
  const hairDarkMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.70, metalness: 0.0 });
  const cyanNeonMat = new THREE.MeshStandardMaterial({
    color: 0x00f5ff,
    emissive: 0x00b4d8,
    emissiveIntensity: 0.45,
    roughness: 0.25,
    metalness: 0.15,
  });
  const cyanGlowMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });
  const hoodieCharcoalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65, metalness: 0.04 });
  const joggersMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.75, metalness: 0.02 });
  const whiteTrimMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.60, metalness: 0.05 });
  const gloveMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.45, metalness: 0.20 });

  // Pelvis & Tapered Jogger Waist
  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.24, 0.40), joggersMat);
  pelvis.position.set(0, 0.74, 0);
  group.add(pelvis);

  // Hoodie Torso (Oversized Streetwear Pullover)
  const chestGeo = new THREE.BoxGeometry(0.74, 0.52, 0.46);
  const chest = new THREE.Mesh(chestGeo, hoodieCharcoalMat);
  chest.position.set(0, 1.25, 0);
  chest.castShadow = true;
  group.add(chest);

  // Kangaroo Pocket on Front
  const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.20, 0.08), hoodieCharcoalMat);
  pocket.position.set(0, 1.12, -0.22);
  group.add(pocket);

  // Neon Cyan Chest Logo Emblem
  const core = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.02), cyanNeonMat);
  core.position.set(0, 1.35, -0.24);
  group.add(core);
  accentMeshes.push(core);

  // White Hoodie Drawstrings
  [-0.08, 0.08].forEach((xSide) => {
    const string = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 8), whiteTrimMat);
    string.position.set(xSide, 1.34, -0.245);
    group.add(string);

    const aglet = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.04, 8), cyanNeonMat);
    aglet.position.set(xSide, 1.22, -0.245);
    group.add(aglet);
  });

  // Neck & Modern Street DJ Headphones around Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.16, 16), skinMat);
  neck.position.set(0, 1.50, 0);
  group.add(neck);

  // Headphones resting around collar
  const hpCollar = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.035, 12, 32, Math.PI * 1.4), cyanNeonMat);
  hpCollar.rotateX(Math.PI / 2);
  hpCollar.position.set(0, 1.50, 0.02);
  group.add(hpCollar);

  [-0.24, 0.24].forEach((xSide) => {
    const earcup = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 16), hoodieCharcoalMat);
    earcup.rotateZ(Math.PI / 2);
    earcup.position.set(xSide, 1.50, -0.05);
    group.add(earcup);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.015, 8, 16), cyanGlowMat);
    ring.rotateY(Math.PI / 2);
    ring.position.set(xSide > 0 ? xSide + 0.035 : xSide - 0.035, 1.50, -0.05);
    group.add(ring);
    accentMeshes.push(ring);
  });

  // Human Head & Expressive Amber Eyes
  const headGeo = new THREE.SphereGeometry(0.28, 32, 24);
  headGeo.scale(1.0, 1.05, 0.95);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.set(0, 1.72, 0);
  head.castShadow = true;
  group.add(head);

  // Expressive Honey-Amber Eyes
  group.add(createExpressiveEyes(0xf59e0b, 0.075, 0.10, 0.10, 1.74, -0.25));

  // Determined Brawler Brows
  [-0.10, 0.10].forEach((xSide) => {
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.024, 0.03), hairDarkMat);
    brow.position.set(xSide, 1.83, -0.26);
    brow.rotation.z = xSide > 0 ? -0.22 : 0.22;
    group.add(brow);
  });

  // Nose & Smirk
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.05, 6), skinMat);
  nose.rotateX(Math.PI / 2);
  nose.position.set(0, 1.68, -0.28);
  group.add(nose);

  const smirk = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.022, 0.02), new THREE.MeshBasicMaterial({ color: 0x881337 }));
  smirk.position.set(0.02, 1.60, -0.26);
  smirk.rotation.z = 0.10;
  group.add(smirk);

  group.add(createHumanEars(skinMat, 0.28, 1.70));

  // Spiky Anime Streetwear Hair (Black with Cyan Frosted Tips)
  const hairGroup = new THREE.Group();
  hairGroup.position.set(0, 1.76, 0);
  group.add(hairGroup);

  const hairBase = new THREE.Mesh(new THREE.SphereGeometry(0.295, 24, 20), hairDarkMat);
  hairGroup.add(hairBase);

  // Dynamic Spikes across crown & front bangs
  const spikes = [
    { x: 0, y: 0.28, z: -0.05, rx: 0.1, rz: 0, s: 0.14 },
    { x: -0.12, y: 0.26, z: -0.08, rx: 0.15, rz: 0.35, s: 0.13 },
    { x: 0.12, y: 0.26, z: -0.08, rx: 0.15, rz: -0.35, s: 0.13 },
    { x: -0.18, y: 0.18, z: -0.15, rx: 0.3, rz: 0.45, s: 0.12 },
    { x: 0.18, y: 0.18, z: -0.15, rx: 0.3, rz: -0.45, s: 0.12 },
    { x: -0.06, y: 0.16, z: -0.26, rx: 0.4, rz: 0.15, s: 0.11 },
    { x: 0.06, y: 0.16, z: -0.26, rx: 0.4, rz: -0.15, s: 0.11 },
  ];

  spikes.forEach((sp) => {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.06, sp.s * 1.8, 6), hairDarkMat);
    cone.position.set(sp.x, sp.y, sp.z);
    cone.rotation.x = sp.rx;
    cone.rotation.z = sp.rz;
    hairGroup.add(cone);

    // Cyan dyed tip
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.035, sp.s * 0.9, 6), cyanNeonMat);
    tip.position.set(sp.x * 1.15, sp.y * 1.12, sp.z * 1.15);
    tip.rotation.x = sp.rx;
    tip.rotation.z = sp.rz;
    hairGroup.add(tip);
    accentMeshes.push(tip);
  });

  // Articulated Combat Jogger Legs & Hi-Top Street Kicks
  const legGroupL = new THREE.Group();
  const legGroupR = new THREE.Group();

  [-0.18, 0.18].forEach((xPos, idx) => {
    const isRight = xPos > 0;
    const legGroup = idx === 0 ? legGroupL : legGroupR;
    legGroup.position.set(xPos, 0.70, 0);
    group.add(legGroup);

    legGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 12), joggersMat));

    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.12, 0.32, 16), joggersMat);
    thigh.position.set(0, -0.14, 0);
    legGroup.add(thigh);

    // Cyan side stripe on joggers
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.50, 0.04), cyanNeonMat);
    stripe.position.set(isRight ? 0.13 : -0.13, -0.28, 0);
    legGroup.add(stripe);
    accentMeshes.push(stripe);

    const knee = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.08, 0.22), joggersMat);
    knee.position.set(0, -0.30, 0);
    legGroup.add(knee);

    const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.24, 16), joggersMat);
    calf.position.set(0, -0.42, 0);
    legGroup.add(calf);

    // Chunky High-Top Street Sneaker with Glowing Air Sole
    const footGroup = new THREE.Group();
    footGroup.position.set(0, -0.70, 0);
    legGroup.add(footGroup);

    const shoeBody = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.14, 0.38), hoodieCharcoalMat);
    shoeBody.position.set(0, 0.10, -0.05);
    footGroup.add(shoeBody);

    const airSole = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.06, 0.40), cyanNeonMat);
    airSole.position.set(0, 0.03, -0.05);
    footGroup.add(airSole);
    accentMeshes.push(airSole);
  });

  // Articulated Arms & Cyan-Taped Brawler Fists
  const armGroupL = new THREE.Group();
  const armGroupR = new THREE.Group();
  const fistGroupL = new THREE.Group();
  const fistGroupR = new THREE.Group();

  [-0.43, 0.43].forEach((xSide, idx) => {
    const isRight = xSide > 0;
    const armGroup = idx === 0 ? armGroupL : armGroupR;
    const fistGroup = isRight ? fistGroupR : fistGroupL;

    armGroup.position.set(xSide, 1.28, -0.02);
    group.add(armGroup);

    // Shoulder hoodie sleeve cap
    armGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.135, 12, 12), hoodieCharcoalMat));

    const armInner = new THREE.Group();
    armInner.rotation.z = isRight ? -0.16 : 0.16;
    armInner.rotation.x = -0.10;
    armGroup.add(armInner);

    // Upper Arm (Rolled hoodie sleeve)
    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.095, 0.24, 12), hoodieCharcoalMat);
    upperArm.position.set(0, -0.12, 0);
    armInner.add(upperArm);

    // Forearm with black compression sleeve
    const forearmGroup = new THREE.Group();
    forearmGroup.position.set(0, -0.24, 0);
    forearmGroup.rotation.x = 0.48;
    forearmGroup.rotation.z = isRight ? 0.22 : -0.22;
    armInner.add(forearmGroup);

    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.082, 0.22, 12), joggersMat);
    forearm.position.set(0, -0.11, 0);
    forearmGroup.add(forearm);

    // Cyan Athletic Tape on Wrists & Clenched Fist
    const tape = new THREE.Mesh(new THREE.CylinderGeometry(0.092, 0.092, 0.06, 12), cyanNeonMat);
    tape.position.set(0, -0.20, 0);
    forearmGroup.add(tape);
    accentMeshes.push(tape);

    fistGroup.position.set(0, -0.28, 0);
    forearmGroup.add(fistGroup);

    const glove = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.14, 0.16), gloveMat);
    fistGroup.add(glove);
  });

  return {
    group,
    bodyMesh: chest,
    coreMesh: core,
    fists: [fistGroupL.children[0] as THREE.Mesh, fistGroupR.children[0] as THREE.Mesh],
    accentMeshes,
    legs: [legGroupL, legGroupR],
    arms: [armGroupL, armGroupR],
  };
}

// ----------------------------------------------------------------------
// 3. NOVA — VALKYRIE BOXER (Human Female Kickboxer Champion)
// ----------------------------------------------------------------------
function createNovaMesh(): CreatedChampion {
  const group = new THREE.Group();
  const accentMeshes: THREE.Mesh[] = [];

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfed7aa, roughness: 0.58, metalness: 0.02 });
  const magentaHairMat = new THREE.MeshStandardMaterial({ color: 0xbe185d, roughness: 0.65, metalness: 0.05 });
  const cropTopMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.60, metalness: 0.05 });
  const roseTrimMat = new THREE.MeshStandardMaterial({
    color: 0xf43f5e,
    emissive: 0xe11d48,
    emissiveIntensity: 0.35,
    roughness: 0.35,
  });
  const roseGlowMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.60 });
  const goldRingMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.85, roughness: 0.20 });

  // Athletic High-Waisted Combat Shorts
  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.60, 0.22, 0.38), roseTrimMat);
  pelvis.position.set(0, 0.74, 0);
  group.add(pelvis);

  const shortsBand = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.06, 0.40), whiteMat);
  shortsBand.position.set(0, 0.85, 0);
  group.add(shortsBand);

  // Athletic Sports Crop Top & Midriff
  const midriff = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.16, 0.36), skinMat);
  midriff.position.set(0, 0.98, 0);
  group.add(midriff);

  const chestGeo = new THREE.BoxGeometry(0.64, 0.38, 0.40);
  const chest = new THREE.Mesh(chestGeo, cropTopMat);
  chest.position.set(0, 1.25, 0);
  chest.castShadow = true;
  group.add(chest);

  // Rose Chevron Emblem on Crop Top
  const core = new THREE.Mesh(new THREE.RingGeometry(0.04, 0.09, 3), roseGlowMat);
  core.rotateZ(Math.PI);
  core.position.set(0, 1.28, -0.205);
  group.add(core);
  accentMeshes.push(core);

  // Neck & Head
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.12, 0.16, 16), skinMat);
  neck.position.set(0, 1.48, 0);
  group.add(neck);

  const headGeo = new THREE.SphereGeometry(0.27, 32, 24);
  headGeo.scale(0.98, 1.05, 0.95);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.set(0, 1.70, 0);
  head.castShadow = true;
  group.add(head);

  // Fierce Radiant Amethyst/Violet Eyes
  group.add(createExpressiveEyes(0xa855f7, 0.075, 0.10, 0.095, 1.72, -0.245));

  // Cat-Eye Liner & Curved Feminine Brows
  [-0.095, 0.095].forEach((xSide) => {
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.020, 0.03), magentaHairMat);
    brow.position.set(xSide, 1.81, -0.25);
    brow.rotation.z = xSide > 0 ? -0.18 : 0.18;
    group.add(brow);
  });

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.045, 6), skinMat);
  nose.rotateX(Math.PI / 2);
  nose.position.set(0, 1.66, -0.27);
  group.add(nose);

  const lips = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.022, 0.02), new THREE.MeshBasicMaterial({ color: 0xbe123c }));
  lips.position.set(0, 1.58, -0.25);
  group.add(lips);

  group.add(createHumanEars(skinMat, 0.27, 1.68));

  // High Swinging Ponytail Hairstyle with Sweeping Bangs
  const hairBase = new THREE.Mesh(new THREE.SphereGeometry(0.285, 24, 20), magentaHairMat);
  hairBase.position.set(0, 1.72, 0);
  group.add(hairBase);

  // Golden Ponytail Tie
  const ponyTie = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.025, 8, 16), goldRingMat);
  ponyTie.rotateX(Math.PI / 4);
  ponyTie.position.set(0, 1.95, 0.20);
  group.add(ponyTie);

  // Long flowing ponytail cascading behind
  const tailGroup = new THREE.Group();
  tailGroup.position.set(0, 1.95, 0.20);
  group.add(tailGroup);

  const pTail1 = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.08, 0.35, 12), magentaHairMat);
  pTail1.rotation.x = -0.35;
  pTail1.position.set(0, -0.15, 0.10);
  tailGroup.add(pTail1);

  const pTail2 = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.32, 10), roseTrimMat);
  pTail2.rotation.x = -0.20;
  pTail2.position.set(0, -0.42, 0.20);
  tailGroup.add(pTail2);
  accentMeshes.push(pTail2);

  // Sweeping Side Bangs
  const bangL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 0.04), magentaHairMat);
  bangL.position.set(-0.16, 1.76, -0.24);
  bangL.rotation.z = 0.25;
  group.add(bangL);

  // Articulated Kickboxer Legs & Combat Boots
  const legGroupL = new THREE.Group();
  const legGroupR = new THREE.Group();

  [-0.17, 0.17].forEach((xPos, idx) => {
    const legGroup = idx === 0 ? legGroupL : legGroupR;
    legGroup.position.set(xPos, 0.70, 0);
    group.add(legGroup);

    legGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), roseTrimMat));

    // Bare athletic kickboxer thighs
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.105, 0.32, 16), skinMat);
    thigh.position.set(0, -0.14, 0);
    legGroup.add(thigh);

    // Kickboxer Knee Guard
    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), cropTopMat);
    knee.position.set(0, -0.30, -0.02);
    legGroup.add(knee);

    // Shin with black compression guard
    const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.095, 0.24, 16), cropTopMat);
    calf.position.set(0, -0.42, 0);
    legGroup.add(calf);

    // Combat Brawler Boot with Rose Trim
    const footGroup = new THREE.Group();
    footGroup.position.set(0, -0.70, 0);
    legGroup.add(footGroup);

    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.14, 0.34), cropTopMat);
    boot.position.set(0, 0.10, -0.05);
    footGroup.add(boot);

    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.05, 0.36), roseTrimMat);
    sole.position.set(0, 0.025, -0.05);
    footGroup.add(sole);
    accentMeshes.push(sole);
  });

  // Articulated Arms & Taped Boxing Wraps
  const armGroupL = new THREE.Group();
  const armGroupR = new THREE.Group();
  const fistGroupL = new THREE.Group();
  const fistGroupR = new THREE.Group();

  [-0.39, 0.39].forEach((xSide, idx) => {
    const isRight = xSide > 0;
    const armGroup = idx === 0 ? armGroupL : armGroupR;
    const fistGroup = isRight ? fistGroupR : fistGroupL;

    armGroup.position.set(xSide, 1.28, -0.02);
    group.add(armGroup);

    armGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.115, 12, 12), cropTopMat));

    const armInner = new THREE.Group();
    armInner.rotation.z = isRight ? -0.16 : 0.16;
    armInner.rotation.x = -0.10;
    armGroup.add(armInner);

    // Bare athletic upper arm
    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.08, 0.24, 12), skinMat);
    upperArm.position.set(0, -0.12, 0);
    armInner.add(upperArm);

    // Forearm with white boxing handwraps
    const forearmGroup = new THREE.Group();
    forearmGroup.position.set(0, -0.24, 0);
    forearmGroup.rotation.x = 0.50;
    forearmGroup.rotation.z = isRight ? 0.22 : -0.22;
    armInner.add(forearmGroup);

    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.078, 0.22, 12), whiteMat);
    forearm.position.set(0, -0.11, 0);
    forearmGroup.add(forearm);

    // Boxing Fist with Rose Impact Guard
    fistGroup.position.set(0, -0.28, 0);
    forearmGroup.add(fistGroup);

    const glove = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.13, 0.15), roseTrimMat);
    fistGroup.add(glove);
    accentMeshes.push(glove);
  });

  return {
    group,
    bodyMesh: chest,
    coreMesh: core,
    fists: [fistGroupL.children[0] as THREE.Mesh, fistGroupR.children[0] as THREE.Mesh],
    accentMeshes,
    legs: [legGroupL, legGroupR],
    arms: [armGroupL, armGroupR],
  };
}

// ----------------------------------------------------------------------
// 4. GORR (TITAN) — HEAVY STRONGMAN (Human Mountain Powerhouse)
// ----------------------------------------------------------------------
function createTitanGorrMesh(): CreatedChampion {
  const group = new THREE.Group();
  const accentMeshes: THREE.Mesh[] = [];

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.62, metalness: 0.02 });
  const beardHairMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.75, metalness: 0.0 });
  const singletMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.60, metalness: 0.05 });
  const amberStripeMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.35,
    roughness: 0.35,
  });
  const leatherBeltMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.50, metalness: 0.10 });
  const goldChampionMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.90, roughness: 0.18 });

  // Massive Pelvis & Championship Weight Belt
  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.26, 0.48), singletMat);
  pelvis.position.set(0, 0.74, 0);
  group.add(pelvis);

  // Colossal Gold Champion Belt
  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.12, 0.52), leatherBeltMat);
  belt.position.set(0, 0.88, 0);
  group.add(belt);

  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.06), goldChampionMat);
  buckle.position.set(0, 0.88, -0.27);
  group.add(buckle);

  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 16), amberStripeMat);
  core.rotateX(Math.PI / 2);
  core.position.set(0, 0.88, -0.305);
  group.add(core);
  accentMeshes.push(core);

  // Colossal Barrel Chest & Strongman Singlet (1.5x standard width)
  const chestGeo = new THREE.BoxGeometry(0.92, 0.54, 0.54);
  const chest = new THREE.Mesh(chestGeo, singletMat);
  chest.position.set(0, 1.25, 0);
  chest.castShadow = true;
  group.add(chest);

  // Amber Power Straps across massive pectorals
  [-0.22, 0.22].forEach((xSide) => {
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.54, 0.03), amberStripeMat);
    strap.position.set(xSide, 1.25, -0.275);
    group.add(strap);
    accentMeshes.push(strap);
  });

  // Massive Muscular Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.20, 0.18, 16), skinMat);
  neck.position.set(0, 1.52, 0);
  group.add(neck);

  // Broad Square Jaw & Head
  const headGeo = new THREE.BoxGeometry(0.44, 0.46, 0.44);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.set(0, 1.74, 0);
  head.castShadow = true;
  group.add(head);

  // Full Heavy Brawler Beard & Mustache
  const beard = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.28, 0.32), beardHairMat);
  beard.position.set(0, 1.62, -0.12);
  group.add(beard);

  const mustache = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.08, 0.12), beardHairMat);
  mustache.position.set(0, 1.67, -0.26);
  group.add(mustache);

  // Fierce Dark Brawler Eyes
  group.add(createExpressiveEyes(0x451a03, 0.07, 0.09, 0.12, 1.76, -0.23));

  // Thick Bushy Eyebrows
  [-0.12, 0.12].forEach((xSide) => {
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.05), beardHairMat);
    brow.position.set(xSide, 1.84, -0.24);
    brow.rotation.z = xSide > 0 ? -0.25 : 0.25;
    group.add(brow);
  });

  // Short Undercut Buzz Hair
  const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.12, 0.44), beardHairMat);
  hairTop.position.set(0, 1.96, 0);
  group.add(hairTop);

  group.add(createHumanEars(skinMat, 0.24, 1.74));

  // Tree-Trunk Heavyweight Legs & Heavy Work Boots
  const legGroupL = new THREE.Group();
  const legGroupR = new THREE.Group();

  [-0.23, 0.23].forEach((xPos, idx) => {
    const legGroup = idx === 0 ? legGroupL : legGroupR;
    legGroup.position.set(xPos, 0.70, 0);
    group.add(legGroup);

    legGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), singletMat));

    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.32, 16), singletMat);
    thigh.position.set(0, -0.14, 0);
    legGroup.add(thigh);

    const knee = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.10, 0.26), singletMat);
    knee.position.set(0, -0.30, 0);
    legGroup.add(knee);

    const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.24, 16), singletMat);
    calf.position.set(0, -0.42, 0);
    legGroup.add(calf);

    // Heavy Iron-Toe Work Boot
    const footGroup = new THREE.Group();
    footGroup.position.set(0, -0.70, 0);
    legGroup.add(footGroup);

    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.16, 0.42), leatherBeltMat);
    boot.position.set(0, 0.10, -0.05);
    footGroup.add(boot);

    const steelToe = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.08, 0.15), goldChampionMat);
    steelToe.position.set(0, 0.06, -0.20);
    footGroup.add(steelToe);
  });

  // Massive Boulder Arms & Taped Fists (Heavyweight Muscle)
  const armGroupL = new THREE.Group();
  const armGroupR = new THREE.Group();
  const fistGroupL = new THREE.Group();
  const fistGroupR = new THREE.Group();

  [-0.56, 0.56].forEach((xSide, idx) => {
    const isRight = xSide > 0;
    const armGroup = idx === 0 ? armGroupL : armGroupR;
    const fistGroup = isRight ? fistGroupR : fistGroupL;

    armGroup.position.set(xSide, 1.28, -0.02);
    group.add(armGroup);

    // Giant Deltoid Boulder
    armGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 14), skinMat));

    const armInner = new THREE.Group();
    armInner.rotation.z = isRight ? -0.14 : 0.14;
    armInner.rotation.x = -0.10;
    armGroup.add(armInner);

    // Heavy Biceps
    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.13, 0.26, 14), skinMat);
    upperArm.position.set(0, -0.13, 0);
    armInner.add(upperArm);

    // Thick Taped Forearm
    const forearmGroup = new THREE.Group();
    forearmGroup.position.set(0, -0.26, 0);
    forearmGroup.rotation.x = 0.48;
    forearmGroup.rotation.z = isRight ? 0.20 : -0.20;
    armInner.add(forearmGroup);

    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.12, 0.24, 14), leatherBeltMat);
    forearm.position.set(0, -0.12, 0);
    forearmGroup.add(forearm);

    // Colossal Brawler Fist
    fistGroup.position.set(0, -0.30, 0);
    forearmGroup.add(fistGroup);

    const glove = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.18, 0.22), leatherBeltMat);
    fistGroup.add(glove);

    const knuckles = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.05), goldChampionMat);
    knuckles.position.set(0, 0.02, 0.11);
    fistGroup.add(knuckles);
  });

  return {
    group,
    bodyMesh: chest,
    coreMesh: core,
    fists: [fistGroupL.children[0] as THREE.Mesh, fistGroupR.children[0] as THREE.Mesh],
    accentMeshes,
    legs: [legGroupL, legGroupR],
    arms: [armGroupL, armGroupR],
  };
}

// ----------------------------------------------------------------------
// 5. KAGE — SHADOW SHINOBI (Human Ninja Martial Artist)
// ----------------------------------------------------------------------
function createKageMesh(): CreatedChampion {
  const group = new THREE.Group();
  const accentMeshes: THREE.Mesh[] = [];

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.58, metalness: 0.02 });
  const ninjaBlackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.65, metalness: 0.05 });
  const jadeMat = new THREE.MeshStandardMaterial({
    color: 0x059669,
    emissive: 0x047857,
    emissiveIntensity: 0.35,
    roughness: 0.40,
  });
  const jadeGlowMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
  const crimsonCordMat = new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.60 });
  const steelPlateMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.90, roughness: 0.20 });
  const wrapMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.70 });

  // Shinobi Gi Trousers & Red Cord Belt
  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.24, 0.40), ninjaBlackMat);
  pelvis.position.set(0, 0.74, 0);
  group.add(pelvis);

  // Red Shimenawa-Style Cord Belt
  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.028, 8, 24), crimsonCordMat);
  belt.rotateX(Math.PI / 2);
  belt.position.set(0, 0.86, 0);
  group.add(belt);

  // Crossed Shinobi Gi Tunic with Jade Sash
  const chestGeo = new THREE.BoxGeometry(0.70, 0.50, 0.42);
  const chest = new THREE.Mesh(chestGeo, ninjaBlackMat);
  chest.position.set(0, 1.25, 0);
  chest.castShadow = true;
  group.add(chest);

  // Crossed Jade Chest Sash
  const sash = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.56, 0.04), jadeMat);
  sash.rotateZ(0.40);
  sash.position.set(0, 1.25, -0.215);
  group.add(sash);
  accentMeshes.push(sash);

  // Jade Emblem Core
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 8), jadeGlowMat);
  core.rotateX(Math.PI / 2);
  core.position.set(0, 1.25, -0.235);
  group.add(core);
  accentMeshes.push(core);

  // Neck & Shinobi Cloth Face Mask
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.16, 16), skinMat);
  neck.position.set(0, 1.50, 0);
  group.add(neck);

  const headGeo = new THREE.SphereGeometry(0.28, 32, 24);
  headGeo.scale(1.0, 1.05, 0.95);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.set(0, 1.72, 0);
  head.castShadow = true;
  group.add(head);

  // Dark Ninja Cloth Mask (Covers nose, mouth, and lower cheeks)
  const maskGeo = new THREE.SphereGeometry(0.285, 24, 16, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55);
  const mask = new THREE.Mesh(maskGeo, ninjaBlackMat);
  mask.position.set(0, 1.72, 0);
  group.add(mask);

  // Sharp, Piercing Emerald Green Eyes
  group.add(createExpressiveEyes(0x10b981, 0.070, 0.09, 0.095, 1.75, -0.25));

  // Steel Forehead Protector (Hitai-Ate) with Tied Flowing Ribbons
  const headband = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.09, 32, 1, true), ninjaBlackMat);
  headband.position.set(0, 1.84, 0);
  group.add(headband);

  const metalPlate = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.07, 0.02), steelPlateMat);
  metalPlate.position.set(0, 1.84, -0.285);
  group.add(metalPlate);

  // Flowing Headband Ribbons behind
  const ribbonL = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.45, 0.015), ninjaBlackMat);
  ribbonL.position.set(-0.06, 1.64, 0.30);
  ribbonL.rotation.x = -0.35;
  ribbonL.rotation.z = 0.15;
  group.add(ribbonL);

  const ribbonR = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.48, 0.015), jadeMat);
  ribbonR.position.set(0.06, 1.62, 0.32);
  ribbonR.rotation.x = -0.40;
  ribbonR.rotation.z = -0.20;
  group.add(ribbonR);
  accentMeshes.push(ribbonR);

  group.add(createHumanEars(skinMat, 0.28, 1.70));

  // Articulated Shinobi Legs & Ninja Tabi Boots
  const legGroupL = new THREE.Group();
  const legGroupR = new THREE.Group();

  [-0.18, 0.18].forEach((xPos, idx) => {
    const legGroup = idx === 0 ? legGroupL : legGroupR;
    legGroup.position.set(xPos, 0.70, 0);
    group.add(legGroup);

    legGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 12), ninjaBlackMat));

    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.115, 0.32, 16), ninjaBlackMat);
    thigh.position.set(0, -0.14, 0);
    legGroup.add(thigh);

    const knee = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.08, 0.22), ninjaBlackMat);
    knee.position.set(0, -0.30, 0);
    legGroup.add(knee);

    // Tight calf wrappings (Kyahan)
    const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.10, 0.24, 16), wrapMat);
    calf.position.set(0, -0.42, 0);
    legGroup.add(calf);

    // Split-Toe Ninja Tabi Boot
    const footGroup = new THREE.Group();
    footGroup.position.set(0, -0.70, 0);
    legGroup.add(footGroup);

    const tabi = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.13, 0.36), ninjaBlackMat);
    tabi.position.set(0, 0.09, -0.05);
    footGroup.add(tabi);

    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.05, 0.38), jadeMat);
    sole.position.set(0, 0.025, -0.05);
    footGroup.add(sole);
    accentMeshes.push(sole);
  });

  // Articulated Martial Arts Arms & Hand Wraps
  const armGroupL = new THREE.Group();
  const armGroupR = new THREE.Group();
  const fistGroupL = new THREE.Group();
  const fistGroupR = new THREE.Group();

  [-0.42, 0.42].forEach((xSide, idx) => {
    const isRight = xSide > 0;
    const armGroup = idx === 0 ? armGroupL : armGroupR;
    const fistGroup = isRight ? fistGroupR : fistGroupL;

    armGroup.position.set(xSide, 1.28, -0.02);
    group.add(armGroup);

    armGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 12), ninjaBlackMat));

    const armInner = new THREE.Group();
    armInner.rotation.z = isRight ? -0.16 : 0.16;
    armInner.rotation.x = -0.10;
    armGroup.add(armInner);

    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.09, 0.24, 12), skinMat);
    upperArm.position.set(0, -0.12, 0);
    armInner.add(upperArm);

    // Forearm with black & jade shinobi arm guard
    const forearmGroup = new THREE.Group();
    forearmGroup.position.set(0, -0.24, 0);
    forearmGroup.rotation.x = 0.50;
    forearmGroup.rotation.z = isRight ? 0.22 : -0.22;
    armInner.add(forearmGroup);

    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.082, 0.22, 12), wrapMat);
    forearm.position.set(0, -0.11, 0);
    forearmGroup.add(forearm);

    fistGroup.position.set(0, -0.28, 0);
    forearmGroup.add(fistGroup);

    const glove = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.13, 0.15), ninjaBlackMat);
    fistGroup.add(glove);

    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.05, 0.03), steelPlateMat);
    plate.position.set(0, 0.02, 0.08);
    fistGroup.add(plate);
  });

  return {
    group,
    bodyMesh: chest,
    coreMesh: core,
    fists: [fistGroupL.children[0] as THREE.Mesh, fistGroupR.children[0] as THREE.Mesh],
    accentMeshes,
    legs: [legGroupL, legGroupR],
    arms: [armGroupL, armGroupR],
  };
}

// ----------------------------------------------------------------------
// 6. AXEL (BOLT) — LIGHTNING PARKOURIST (Human Street Trickster)
// ----------------------------------------------------------------------
function createAxelBoltMesh(): CreatedChampion {
  const group = new THREE.Group();
  const accentMeshes: THREE.Mesh[] = [];

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfed7aa, roughness: 0.58, metalness: 0.02 });
  const yellowJacketMat = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    roughness: 0.40,
    metalness: 0.10,
  });
  const yellowGlowMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  const charcoalMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.65, metalness: 0.05 });
  const blondeHairMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.70, metalness: 0.0 });
  const goggleLensMat = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    metalness: 0.90,
    roughness: 0.15,
  });
  const whiteTrimMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.60 });

  // Pelvis & Athletic Runner Shorts
  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.24, 0.40), charcoalMat);
  pelvis.position.set(0, 0.74, 0);
  group.add(pelvis);

  // Zip-Up Windbreaker Jacket (High-Voltage Yellow & Charcoal)
  const chestGeo = new THREE.BoxGeometry(0.70, 0.50, 0.42);
  const chest = new THREE.Mesh(chestGeo, yellowJacketMat);
  chest.position.set(0, 1.25, 0);
  chest.castShadow = true;
  group.add(chest);

  // Charcoal side panels
  [-0.32, 0.32].forEach((xSide) => {
    const sidePanel = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.48, 0.41), charcoalMat);
    sidePanel.position.set(xSide, 1.25, 0);
    group.add(sidePanel);
  });

  // White Center Windbreaker Zipper
  const zipper = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.48, 0.02), whiteTrimMat);
  zipper.position.set(0, 1.25, -0.215);
  group.add(zipper);

  // Lightning Bolt Emblem on Chest
  const core = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.02), yellowGlowMat);
  core.rotateZ(0.25);
  core.position.set(-0.12, 1.32, -0.22);
  group.add(core);
  accentMeshes.push(core);

  // High Wind Collar
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.12, 16, 1, true), charcoalMat);
  collar.position.set(0, 1.50, 0);
  group.add(collar);

  // Neck & Head
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.14, 16), skinMat);
  neck.position.set(0, 1.48, 0);
  group.add(neck);

  const headGeo = new THREE.SphereGeometry(0.28, 32, 24);
  headGeo.scale(1.0, 1.05, 0.95);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.set(0, 1.72, 0);
  head.castShadow = true;
  group.add(head);

  // Energetic Hazel-Gold Eyes
  group.add(createExpressiveEyes(0xeab308, 0.075, 0.10, 0.10, 1.74, -0.25));

  // Cocky Smirk & Cheek Band-Aid
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.05, 6), skinMat);
  nose.rotateX(Math.PI / 2);
  nose.position.set(0, 1.68, -0.28);
  group.add(nose);

  const smirk = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.022, 0.02), new THREE.MeshBasicMaterial({ color: 0x881337 }));
  smirk.position.set(0.02, 1.60, -0.26);
  smirk.rotation.z = 0.15;
  group.add(smirk);

  // Playful Street Trickster Band-Aid on Right Cheek
  const bandaid = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.025, 0.01), whiteTrimMat);
  bandaid.position.set(0.14, 1.65, -0.24);
  bandaid.rotation.z = -0.35;
  group.add(bandaid);

  group.add(createHumanEars(skinMat, 0.28, 1.70));

  // Dynamic Wind-Blown Blonde Hair
  const hairGroup = new THREE.Group();
  hairGroup.position.set(0, 1.75, 0);
  group.add(hairGroup);

  const hairBase = new THREE.Mesh(new THREE.SphereGeometry(0.295, 24, 20), blondeHairMat);
  hairGroup.add(hairBase);

  // Energetic Blonde Spikes Sweeping Forward
  [-0.14, -0.05, 0.05, 0.14].forEach((xOff, i) => {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.20, 6), blondeHairMat);
    spike.position.set(xOff, 0.22, -0.15);
    spike.rotation.x = 0.40;
    spike.rotation.z = (i - 1.5) * 0.18;
    hairGroup.add(spike);
  });

  // Aerodynamic Speed Goggles Worn on Forehead
  const goggleStrap = new THREE.Mesh(new THREE.CylinderGeometry(0.295, 0.295, 0.04, 32, 1, true), charcoalMat);
  goggleStrap.position.set(0, 1.84, 0);
  group.add(goggleStrap);

  [-0.08, 0.08].forEach((xSide) => {
    const lens = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), goggleLensMat);
    lens.scale.set(1.2, 0.8, 0.3);
    lens.position.set(xSide, 1.85, -0.28);
    group.add(lens);
    accentMeshes.push(lens);
  });

  // Articulated Parkour Runner Legs & Lightning Sneakers
  const legGroupL = new THREE.Group();
  const legGroupR = new THREE.Group();

  [-0.18, 0.18].forEach((xPos, idx) => {
    const legGroup = idx === 0 ? legGroupL : legGroupR;
    legGroup.position.set(xPos, 0.70, 0);
    group.add(legGroup);

    legGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.125, 12, 12), charcoalMat));

    // Thigh with athletic running shorts
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.115, 0.32, 16), charcoalMat);
    thigh.position.set(0, -0.14, 0);
    legGroup.add(thigh);

    const knee = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.08, 0.22), charcoalMat);
    knee.position.set(0, -0.30, 0);
    legGroup.add(knee);

    // Bare athletic runner calves
    const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.095, 0.24, 16), skinMat);
    calf.position.set(0, -0.42, 0);
    legGroup.add(calf);

    // High-Voltage Aerodynamic Parkour Sneakers
    const footGroup = new THREE.Group();
    footGroup.position.set(0, -0.70, 0);
    legGroup.add(footGroup);

    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.13, 0.36), yellowJacketMat);
    shoe.position.set(0, 0.09, -0.05);
    footGroup.add(shoe);

    const lightningSole = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.38), yellowGlowMat);
    lightningSole.position.set(0, 0.03, -0.05);
    footGroup.add(lightningSole);
    accentMeshes.push(lightningSole);
  });

  // Articulated Arms & Parkour Grip Gloves
  const armGroupL = new THREE.Group();
  const armGroupR = new THREE.Group();
  const fistGroupL = new THREE.Group();
  const fistGroupR = new THREE.Group();

  [-0.42, 0.42].forEach((xSide, idx) => {
    const isRight = xSide > 0;
    const armGroup = idx === 0 ? armGroupL : armGroupR;
    const fistGroup = isRight ? fistGroupR : fistGroupL;

    armGroup.position.set(xSide, 1.28, -0.02);
    group.add(armGroup);

    // Yellow Windbreaker Shoulder Cap
    armGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 12), yellowJacketMat));

    const armInner = new THREE.Group();
    armInner.rotation.z = isRight ? -0.16 : 0.16;
    armInner.rotation.x = -0.10;
    armGroup.add(armInner);

    // Upper Arm (Yellow sleeve)
    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.09, 0.24, 12), yellowJacketMat);
    upperArm.position.set(0, -0.12, 0);
    armInner.add(upperArm);

    // Bare athletic forearm
    const forearmGroup = new THREE.Group();
    forearmGroup.position.set(0, -0.24, 0);
    forearmGroup.rotation.x = 0.48;
    forearmGroup.rotation.z = isRight ? 0.22 : -0.22;
    armInner.add(forearmGroup);

    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.080, 0.22, 12), skinMat);
    forearm.position.set(0, -0.11, 0);
    forearmGroup.add(forearm);

    // Fingerless Yellow Parkour Grip Gloves
    fistGroup.position.set(0, -0.28, 0);
    forearmGroup.add(fistGroup);

    const glove = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.14, 0.16), yellowJacketMat);
    fistGroup.add(glove);

    const palmPad = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.10, 0.03), charcoalMat);
    palmPad.position.set(0, 0, -0.08);
    fistGroup.add(palmPad);
  });

  return {
    group,
    bodyMesh: chest,
    coreMesh: core,
    fists: [fistGroupL.children[0] as THREE.Mesh, fistGroupR.children[0] as THREE.Mesh],
    accentMeshes,
    legs: [legGroupL, legGroupR],
    arms: [armGroupL, armGroupR],
  };
}
