import * as THREE from 'three';

export type ChampionId = 'leo' | 'kai' | 'nova' | 'titan' | 'kage' | 'bolt';

export interface ChampionStats {
  speed: number;       // 1 - 5 rating
  power: number;       // 1 - 5 rating (push/knockback strength)
  weight: number;      // 1 - 5 rating (knockback resistance/mass)
  chargeSpeed: number; // 1 - 5 rating (dash stamina recharge)
  trait: string;       // Distinct archetype trait description
  speedMult: number;   // In-game physics speed multiplier (0.84 to 1.28)
  powerMult: number;   // In-game physics knockback push multiplier (0.82 to 1.50)
  massMult: number;    // In-game physics mass/inertia resistance (0.80 to 1.55)
  chargeMult: number;  // In-game physics stamina recharge multiplier (0.85 to 1.40)
}

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
  stats: ChampionStats;
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
    stats: {
      speed: 3,
      power: 3,
      weight: 3,
      chargeSpeed: 3,
      trait: 'Balanced Coastal Scout • Steady Agility & Well-Rounded Control',
      speedMult: 1.0,
      powerMult: 1.0,
      massMult: 1.0,
      chargeMult: 1.0,
    },
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
    stats: {
      speed: 4,
      power: 3,
      weight: 3,
      chargeSpeed: 4,
      trait: 'Urban Street Skater • Agile Footwork & Rapid Momentum',
      speedMult: 1.12,
      powerMult: 1.05,
      massMult: 0.95,
      chargeMult: 1.15,
    },
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
    stats: {
      speed: 3,
      power: 4,
      weight: 3,
      chargeSpeed: 4,
      trait: 'Agile Kickboxer • Explosive Counter-Punches & Flurry Recovery',
      speedMult: 1.06,
      powerMult: 1.18,
      massMult: 0.98,
      chargeMult: 1.20,
    },
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
    stats: {
      speed: 2,
      power: 5,
      weight: 5,
      chargeSpeed: 2,
      trait: 'Colossal Heavyweight • Massive Push Force • Unmovable Mass',
      speedMult: 0.84,
      powerMult: 1.50,
      massMult: 1.55,
      chargeMult: 0.85,
    },
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
    stats: {
      speed: 4,
      power: 3,
      weight: 2,
      chargeSpeed: 5,
      trait: 'Shadow Ninja • Rapid Dash Recharge & Silent Glide Mobility',
      speedMult: 1.16,
      powerMult: 0.95,
      massMult: 0.88,
      chargeMult: 1.30,
    },
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
    stats: {
      speed: 5,
      power: 2,
      weight: 2,
      chargeSpeed: 5,
      trait: 'Lightning Parkourist • Maximum Sprint Speed • Rapid Recovery',
      speedMult: 1.28,
      powerMult: 0.82,
      massMult: 0.80,
      chargeMult: 1.40,
    },
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

// ======================================================================
// HIGH-POLY ORGANIC PROCEDURAL MODELING SUITE (Zooba / Pixar Aesthetic)
// Zero boxy primitives. Smooth curved capsules, sculpted sneaker soles,
// organic facial anatomy, dimensional layered apparel, and expressive eyes.
// ======================================================================

/**
 * Creates high-appeal, multi-layered 3D Pixar / Zooba expressive cartoon eyes.
 * Includes curved sclera, dimensional gradient iris, glossy pupil, primary specular catchlight,
 * secondary twinkle, and curved 3D eyelid creases.
 */
function createPixarExpressiveEyes(
  irisColor: number,
  eyeWidth: number = 0.082,
  eyeHeight: number = 0.105,
  spacing: number = 0.105,
  yPos: number = 1.74,
  zPos: number = -0.265
): THREE.Group {
  const eyesGroup = new THREE.Group();

  const eyeWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.15,
    metalness: 0.02,
  });
  const limbalRingMat = new THREE.MeshBasicMaterial({ color: 0x090d16 });
  const eyeIrisMat = new THREE.MeshStandardMaterial({
    color: irisColor,
    roughness: 0.20,
    metalness: 0.10,
  });
  const eyePupilMat = new THREE.MeshBasicMaterial({ color: 0x050508 });
  const eyeShineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  [-spacing, spacing].forEach((xSide) => {
    // 1. White Curved Sclera
    const scleraGeo = new THREE.SphereGeometry(eyeWidth, 24, 20);
    scleraGeo.scale(1.0, eyeHeight / eyeWidth, 0.45);
    const sclera = new THREE.Mesh(scleraGeo, eyeWhiteMat);
    sclera.position.set(xSide, yPos, zPos);
    eyesGroup.add(sclera);

    // 2. Dark Limbal Ring framing iris
    const limbalGeo = new THREE.SphereGeometry(eyeWidth * 0.72, 20, 16);
    limbalGeo.scale(1.0, 1.05, 0.22);
    const limbal = new THREE.Mesh(limbalGeo, limbalRingMat);
    limbal.position.set(xSide * 0.94, yPos, zPos - 0.022);
    eyesGroup.add(limbal);

    // 3. Colored Iris
    const irisGeo = new THREE.SphereGeometry(eyeWidth * 0.65, 20, 16);
    irisGeo.scale(1.0, 1.05, 0.20);
    const iris = new THREE.Mesh(irisGeo, eyeIrisMat);
    iris.position.set(xSide * 0.94, yPos, zPos - 0.026);
    eyesGroup.add(iris);

    // 4. Glossy Deep Pupil
    const pupilGeo = new THREE.SphereGeometry(eyeWidth * 0.36, 16, 16);
    pupilGeo.scale(1.0, 1.05, 0.20);
    const pupil = new THREE.Mesh(pupilGeo, eyePupilMat);
    pupil.position.set(xSide * 0.94, yPos, zPos - 0.038);
    eyesGroup.add(pupil);

    // 5. Primary Specular Catchlight (Large, angled upper-right)
    const shineGeo = new THREE.SphereGeometry(eyeWidth * 0.22, 12, 12);
    const shine = new THREE.Mesh(shineGeo, eyeShineMat);
    shine.position.set(xSide * 0.94 + 0.022, yPos + 0.026, zPos - 0.046);
    eyesGroup.add(shine);

    // 6. Secondary Specular Twinkle (Tiny, lower-left)
    const twinkleGeo = new THREE.SphereGeometry(eyeWidth * 0.11, 8, 8);
    const twinkle = new THREE.Mesh(twinkleGeo, eyeShineMat);
    twinkle.position.set(xSide * 0.94 - 0.016, yPos - 0.022, zPos - 0.046);
    eyesGroup.add(twinkle);
  });

  return eyesGroup;
}

/**
 * Creates sculpted organic human ears with outer helix and inner concha curve.
 */
function createSculptedHumanEars(skinMat: THREE.Material, headRadius: number = 0.28, yPos: number = 1.70): THREE.Group {
  const earsGroup = new THREE.Group();
  [-headRadius, headRadius].forEach((xSide) => {
    const isRight = xSide > 0;
    const earOuter = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 16, 14),
      skinMat
    );
    earOuter.scale.set(0.40, 1.15, 0.85);
    earOuter.position.set(xSide * 0.96, yPos, -0.01);
    earOuter.rotation.y = isRight ? 0.15 : -0.15;
    earOuter.rotation.z = isRight ? -0.08 : 0.08;
    earsGroup.add(earOuter);
  });
  return earsGroup;
}

/**
 * Creates a high-poly, organic stylized sneaker / athletic boot.
 * Replaces sharp box shoes with smooth cupsole, rounded rubber toe bumper,
 * contoured leather upper, padded collar torus, and 3D laces.
 */
function createStylizedSneaker(
  shoeMat: THREE.Material,
  soleMat: THREE.Material,
  trimMat?: THREE.Material,
  accentMeshes?: THREE.Mesh[]
): THREE.Group {
  const shoeGroup = new THREE.Group();

  // 1. Contoured Cupsole (Smooth Capsule flattened on Y with toe-spring curve)
  const soleGeo = new THREE.CapsuleGeometry(0.115, 0.24, 14, 20);
  soleGeo.rotateX(Math.PI / 2);
  soleGeo.scale(0.98, 0.52, 1.05);
  const sole = new THREE.Mesh(soleGeo, soleMat);
  sole.position.set(0, 0.035, -0.05);
  sole.rotation.x = -0.04; // subtle toe-spring tilt
  shoeGroup.add(sole);

  // 2. Rounded Rubber Toe Bumper Cap
  const toeCapGeo = new THREE.SphereGeometry(0.118, 18, 16);
  toeCapGeo.scale(0.96, 0.72, 0.90);
  const toeCap = new THREE.Mesh(toeCapGeo, soleMat);
  toeCap.position.set(0, 0.065, -0.16);
  shoeGroup.add(toeCap);

  // 3. Contoured Main Sneaker Body / Upper
  const upperGeo = new THREE.CapsuleGeometry(0.108, 0.22, 14, 20);
  upperGeo.rotateX(Math.PI / 2);
  upperGeo.scale(0.95, 0.85, 0.98);
  const upper = new THREE.Mesh(upperGeo, shoeMat);
  upper.position.set(0, 0.095, -0.04);
  shoeGroup.add(upper);

  // 4. Padded High-Top / Low-Top Ankle Collar
  const collarGeo = new THREE.TorusGeometry(0.092, 0.024, 10, 20);
  collarGeo.rotateX(Math.PI / 2);
  const collar = new THREE.Mesh(collarGeo, trimMat || shoeMat);
  collar.position.set(0, 0.16, 0.02);
  shoeGroup.add(collar);

  // 5. 3D Criss-Cross Laces & Sneaker Tongue
  const tongueGeo = new THREE.CapsuleGeometry(0.042, 0.12, 8, 12);
  tongueGeo.rotateX(0.42);
  const tongue = new THREE.Mesh(tongueGeo, trimMat || soleMat);
  tongue.position.set(0, 0.13, -0.06);
  shoeGroup.add(tongue);

  [-0.035, 0.015].forEach((zOff) => {
    const laceGeo = new THREE.CapsuleGeometry(0.012, 0.09, 6, 10);
    laceGeo.rotateZ(Math.PI / 2);
    const lace = new THREE.Mesh(laceGeo, soleMat);
    lace.position.set(0, 0.125 - zOff * 0.4, -0.08 + zOff);
    shoeGroup.add(lace);
  });

  if (trimMat && accentMeshes) {
    accentMeshes.push(collar);
  }

  return shoeGroup;
}

/**
 * Creates an organic stylized clenched brawler fist with smooth curved palm,
 * 4 rounded fingers with knuckle curvature, and opposable thumb folded over.
 */
function createStylizedBrawlerFist(
  gloveMat: THREE.Material,
  trimMat?: THREE.Material,
  isRight: boolean = true
): THREE.Group {
  const fistGroup = new THREE.Group();

  // 1. Contoured Rounded Palm
  const palmGeo = new THREE.SphereGeometry(0.085, 18, 16);
  palmGeo.scale(0.95, 0.85, 1.15);
  const palm = new THREE.Mesh(palmGeo, gloveMat);
  palm.position.set(0, 0, 0);
  fistGroup.add(palm);

  // 2. Curled 4-Finger Punch Segment
  const fingersGeo = new THREE.CapsuleGeometry(0.038, 0.11, 10, 16);
  fingersGeo.rotateZ(Math.PI / 2);
  const fingers = new THREE.Mesh(fingersGeo, gloveMat);
  fingers.position.set(0, -0.018, 0.068);
  fistGroup.add(fingers);

  // 3. Opposable Thumb Folded Over
  const thumbGeo = new THREE.CapsuleGeometry(0.026, 0.065, 8, 12);
  thumbGeo.rotateZ(isRight ? -0.45 : 0.45);
  thumbGeo.rotateY(isRight ? 0.35 : -0.35);
  const thumb = new THREE.Mesh(thumbGeo, gloveMat);
  thumb.position.set(isRight ? -0.048 : 0.048, 0.022, 0.042);
  fistGroup.add(thumb);

  // 4. Knuckle Armor / Wrap Plate
  if (trimMat) {
    const plateGeo = new THREE.CapsuleGeometry(0.022, 0.095, 8, 14);
    plateGeo.rotateZ(Math.PI / 2);
    const plate = new THREE.Mesh(plateGeo, trimMat);
    plate.position.set(0, 0.025, 0.075);
    fistGroup.add(plate);
  }

  return fistGroup;
}

/**
 * Creates organic 3D curved eyebrows arched with determined brawler expression.
 */
function createCurvedEyebrows(
  color: number,
  spacing: number = 0.105,
  yPos: number = 1.83,
  zPos: number = -0.275,
  tilt: number = 0.22
): THREE.Group {
  const browGroup = new THREE.Group();
  const browMat = new THREE.MeshStandardMaterial({ color, roughness: 0.70 });

  [-spacing, spacing].forEach((xSide) => {
    const isRight = xSide > 0;
    const browGeo = new THREE.CapsuleGeometry(0.016, 0.082, 8, 14);
    browGeo.rotateZ(Math.PI / 2);
    const brow = new THREE.Mesh(browGeo, browMat);
    brow.position.set(xSide, yPos, zPos);
    brow.rotation.z = isRight ? -tilt : tilt;
    brow.rotation.x = -0.15;
    browGroup.add(brow);
  });

  return browGroup;
}

/**
 * Creates a cute 3D stylized button nose and smiling mouth.
 */
function createCuteStylizedNoseAndMouth(
  skinMat: THREE.Material,
  smileWidth: number = 0.09,
  yNose: number = 1.68,
  yMouth: number = 1.60
): THREE.Group {
  const featureGroup = new THREE.Group();

  // Cute Button Nose (Smooth rounded sphere)
  const noseGeo = new THREE.SphereGeometry(0.038, 16, 14);
  noseGeo.scale(1.0, 0.85, 1.15);
  const nose = new THREE.Mesh(noseGeo, skinMat);
  nose.position.set(0, yNose, -0.285);
  featureGroup.add(nose);

  // Smiling Mouth (Curved Torus Arc with inner depth)
  const mouthGeo = new THREE.TorusGeometry(smileWidth * 0.75, 0.014, 8, 18, Math.PI * 0.82);
  mouthGeo.rotateZ(-Math.PI * 0.91);
  const mouthMat = new THREE.MeshBasicMaterial({ color: 0x6b1426 });
  const mouth = new THREE.Mesh(mouthGeo, mouthMat);
  mouth.position.set(0, yMouth + 0.02, -0.272);
  featureGroup.add(mouth);

  // Subtle upper tooth shine
  const toothGeo = new THREE.CapsuleGeometry(0.008, 0.045, 6, 8);
  toothGeo.rotateZ(Math.PI / 2);
  const tooth = new THREE.Mesh(toothGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
  tooth.position.set(0, yMouth + 0.012, -0.274);
  featureGroup.add(tooth);

  return featureGroup;
}

// ----------------------------------------------------------------------
// 1. LEO — ISLAND SCOUT (Coastal Brawler)
// Athletic human coastal hero with tousled chestnut locks, backward charcoal
// snapback cap, azure bomber vest over crisp white tee, athletic tape wraps,
// cargo shorts, and skate high-tops.
// ----------------------------------------------------------------------
function createLeoMesh(): CreatedChampion {
  const group = new THREE.Group();
  const accentMeshes: THREE.Mesh[] = [];

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbd5b5, roughness: 0.55, metalness: 0.02 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x4a2511, roughness: 0.70, metalness: 0.0 });
  const capMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.55, metalness: 0.05 });
  const jacketMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.40, metalness: 0.08 });
  const jacketTrimMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.45, metalness: 0.08 });
  const whiteClothMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.60, metalness: 0.03 });
  const denimMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.72, metalness: 0.04 });
  const leatherMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.50, metalness: 0.10 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.90, roughness: 0.18 });
  const goldGlowMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const gloveMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.50, metalness: 0.15 });

  // 1. Contoured Pelvis & Leather Belt with Golden Buckle
  const pelvisGeo = new THREE.CapsuleGeometry(0.24, 0.22, 14, 22);
  pelvisGeo.scale(1.35, 1.0, 0.95);
  const pelvis = new THREE.Mesh(pelvisGeo, denimMat);
  pelvis.position.set(0, 0.74, 0);
  group.add(pelvis);

  // Curved Leather Belt
  const beltGeo = new THREE.TorusGeometry(0.32, 0.032, 12, 32);
  beltGeo.rotateX(Math.PI / 2);
  const belt = new THREE.Mesh(beltGeo, leatherMat);
  belt.position.set(0, 0.86, 0);
  group.add(belt);

  // Ornate Golden Belt Buckle
  const buckleGeo = new THREE.CapsuleGeometry(0.042, 0.11, 8, 14);
  buckleGeo.rotateZ(Math.PI / 2);
  const buckle = new THREE.Mesh(buckleGeo, goldMat);
  buckle.position.set(0, 0.86, -0.29);
  group.add(buckle);

  // 2. Athletic Torso: Crisp White Tee with Azure Coastal Brawler Vest
  const chestGeo = new THREE.CapsuleGeometry(0.26, 0.36, 16, 24);
  chestGeo.scale(1.30, 1.0, 0.92);
  const chest = new THREE.Mesh(chestGeo, whiteClothMat);
  chest.position.set(0, 1.25, 0);
  chest.castShadow = true;
  group.add(chest);

  // Open Coastal Vest Panels (Flanking left and right of chest)
  [-0.20, 0.20].forEach((xSide) => {
    const vestPanelGeo = new THREE.CapsuleGeometry(0.12, 0.32, 10, 16);
    vestPanelGeo.scale(0.85, 1.0, 0.70);
    const vestPanel = new THREE.Mesh(vestPanelGeo, jacketMat);
    vestPanel.position.set(xSide, 1.25, -0.12);
    group.add(vestPanel);

    // Contrasting White Edge Seam Piping
    const seamGeo = new THREE.CapsuleGeometry(0.02, 0.32, 6, 12);
    const seam = new THREE.Mesh(seamGeo, whiteClothMat);
    seam.position.set(xSide * 0.65, 1.25, -0.22);
    group.add(seam);
  });

  // Raised Coastal Jacket Collar around Nape
  const collarGeo = new THREE.TorusGeometry(0.19, 0.038, 10, 24, Math.PI * 1.15);
  collarGeo.rotateX(Math.PI / 2 - 0.2);
  collarGeo.rotateZ(Math.PI);
  const collar = new THREE.Mesh(collarGeo, jacketTrimMat);
  collar.position.set(0, 1.44, 0.04);
  group.add(collar);

  // Golden Coastal Sun-Wave Medallion on Chest
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.024, 20), goldMat);
  core.rotateX(Math.PI / 2);
  core.position.set(0, 1.28, -0.22);
  group.add(core);

  const sunStar = new THREE.Mesh(new THREE.RingGeometry(0.018, 0.052, 6), goldGlowMat);
  sunStar.position.set(0, 1.28, -0.235);
  group.add(sunStar);
  accentMeshes.push(sunStar);

  // 3. Head & Expressive Heroic Features
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.15, 20), skinMat);
  neck.position.set(0, 1.50, 0);
  group.add(neck);

  const headGeo = new THREE.SphereGeometry(0.285, 32, 26);
  headGeo.scale(1.0, 1.08, 1.02);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.set(0, 1.72, 0);
  head.castShadow = true;
  group.add(head);

  // Pixar Expressive Blue Eyes with Single Clean Eyebrows (NO double-eyebrow!)
  group.add(createPixarExpressiveEyes(0x0284c7, 0.082, 0.108, 0.105, 1.74, -0.265));
  // Single, confident, cleanly defined arched brawler eyebrows
  group.add(createCurvedEyebrows(0x3e1d08, 0.100, 1.83, -0.278, 0.20));
  group.add(createCuteStylizedNoseAndMouth(skinMat, 0.09, 1.68, 1.60));
  group.add(createSculptedHumanEars(skinMat, 0.28, 1.70));

  // 4. Backward Streetwear Snapback & Tousled Chestnut Hair
  const capGroup = new THREE.Group();
  capGroup.position.set(0, 1.80, 0.01);
  group.add(capGroup);

  // Backward Cap Dome
  const capDomeGeo = new THREE.SphereGeometry(0.294, 28, 22, 0, Math.PI * 2, 0, Math.PI * 0.50);
  const capDome = new THREE.Mesh(capDomeGeo, capMat);
  capGroup.add(capDome);

  // Contrast Azure Snapback Sweatband Rim around the base
  const capRimGeo = new THREE.TorusGeometry(0.290, 0.020, 10, 32);
  capRimGeo.rotateX(Math.PI / 2);
  const capRim = new THREE.Mesh(capRimGeo, jacketMat);
  capRim.position.set(0, 0.01, 0);
  capGroup.add(capRim);

  // Visor Pointing Backwards & Tilted Upward
  const visorGeo = new THREE.CapsuleGeometry(0.022, 0.22, 8, 16);
  visorGeo.rotateZ(Math.PI / 2);
  visorGeo.scale(1.25, 0.55, 1.5);
  const visor = new THREE.Mesh(visorGeo, jacketMat);
  visor.position.set(0, 0.06, 0.27);
  visor.rotation.x = -0.38;
  capGroup.add(visor);

  // Golden Button on Cap Crown
  const capButton = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 12), goldMat);
  capButton.position.set(0, 0.28, 0);
  capGroup.add(capButton);

  // Voluminous Layered Chestnut Hair (Natural sideburns & back locks — forehead is clean!)
  const hairGroup = new THREE.Group();
  group.add(hairGroup);

  // Sideburn locks framing temples and ears
  [-0.24, 0.24].forEach((xSide) => {
    const isRight = xSide > 0;
    const sideCurl = new THREE.Mesh(new THREE.CapsuleGeometry(0.034, 0.14, 8, 12), hairMat);
    sideCurl.position.set(xSide, 1.67, -0.12);
    sideCurl.rotation.z = isRight ? -0.15 : 0.15;
    hairGroup.add(sideCurl);

    const templeLock = new THREE.Mesh(new THREE.CapsuleGeometry(0.026, 0.10, 6, 10), hairMat);
    templeLock.position.set(xSide * 0.95, 1.76, -0.20);
    templeLock.rotation.z = isRight ? -0.25 : 0.25;
    hairGroup.add(templeLock);
  });

  // Neck curls spilling out behind ears & under backward cap
  [-0.15, 0, 0.15].forEach((xPos) => {
    const neckCurl = new THREE.Mesh(new THREE.CapsuleGeometry(0.032, 0.15, 6, 10), hairMat);
    neckCurl.position.set(xPos, 1.60, 0.22);
    neckCurl.rotation.x = 0.35;
    neckCurl.rotation.y = xPos * 0.5;
    hairGroup.add(neckCurl);
  });

  // 5. Articulated Legs & Stylized Skate High-Tops
  const legGroupL = new THREE.Group();
  const legGroupR = new THREE.Group();

  [-0.18, 0.18].forEach((xPos, idx) => {
    const legGroup = idx === 0 ? legGroupL : legGroupR;
    legGroup.position.set(xPos, 0.70, 0);
    group.add(legGroup);

    // Smooth Hip Joint
    legGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 14), denimMat));

    // Denim Cargo Shorts Thigh
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.132, 0.122, 0.32, 20), denimMat);
    thigh.position.set(0, -0.14, 0);
    legGroup.add(thigh);

    // Cargo Side Pocket
    const pocketGeo = new THREE.CapsuleGeometry(0.03, 0.12, 6, 10);
    pocketGeo.scale(0.8, 1.0, 1.2);
    const pocket = new THREE.Mesh(pocketGeo, denimMat);
    pocket.position.set(xPos > 0 ? 0.13 : -0.13, -0.14, 0);
    legGroup.add(pocket);

    // Shorts Hem Cuff Torus
    const shortsCuff = new THREE.Mesh(new THREE.TorusGeometry(0.126, 0.016, 8, 20), denimMat);
    shortsCuff.rotateX(Math.PI / 2);
    shortsCuff.position.set(0, -0.30, 0);
    legGroup.add(shortsCuff);

    // Bare Scout Knee & Ankle
    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.092, 14, 12), skinMat);
    knee.position.set(0, -0.32, -0.01);
    legGroup.add(knee);

    const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.088, 0.24, 18), skinMat);
    calf.position.set(0, -0.44, 0);
    legGroup.add(calf);

    // Crew Sock Collar
    const sock = new THREE.Mesh(new THREE.CylinderGeometry(0.092, 0.092, 0.08, 16), whiteClothMat);
    sock.position.set(0, -0.54, 0);
    legGroup.add(sock);

    // Skate High-Top Sneaker
    const footGroup = new THREE.Group();
    footGroup.position.set(0, -0.70, 0);
    legGroup.add(footGroup);

    const sneaker = createStylizedSneaker(jacketMat, whiteClothMat, jacketTrimMat, accentMeshes);
    footGroup.add(sneaker);
  });

  // 6. Articulated Arms & Brawler Boxing Fists
  const armGroupL = new THREE.Group();
  const armGroupR = new THREE.Group();
  const fistGroupL = new THREE.Group();
  const fistGroupR = new THREE.Group();

  [-0.40, 0.40].forEach((xSide, idx) => {
    const isRight = xSide > 0;
    const armGroup = idx === 0 ? armGroupL : armGroupR;
    const fistGroup = isRight ? fistGroupR : fistGroupL;

    armGroup.position.set(xSide, 1.28, -0.02);
    group.add(armGroup);

    // Vest Armhole Sleeve Cap (Azure jacket fabric)
    armGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.125, 18, 16), jacketMat));

    const armInner = new THREE.Group();
    armInner.rotation.z = isRight ? -0.16 : 0.16;
    armInner.rotation.x = -0.10;
    armGroup.add(armInner);

    // Athletic Bicep (Human Skin Tone)
    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.096, 0.088, 0.24, 16), skinMat);
    upperArm.position.set(0, -0.12, 0);
    armInner.add(upperArm);

    // Forearm with White Athletic Tape Wraps
    const forearmGroup = new THREE.Group();
    forearmGroup.position.set(0, -0.24, 0);
    forearmGroup.rotation.x = 0.48;
    forearmGroup.rotation.z = isRight ? 0.22 : -0.22;
    armInner.add(forearmGroup);

    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.090, 0.082, 0.22, 16), whiteClothMat);
    forearm.position.set(0, -0.11, 0);
    forearmGroup.add(forearm);

    // Torus Wrist Guard / Strap
    const wristband = new THREE.Mesh(new THREE.TorusGeometry(0.086, 0.020, 10, 18), jacketTrimMat);
    wristband.rotateX(Math.PI / 2);
    wristband.position.set(0, -0.21, 0);
    forearmGroup.add(wristband);

    // Stylized Clenched Brawler Fist with Gold Knuckle Armor
    fistGroup.position.set(0, -0.28, 0);
    forearmGroup.add(fistGroup);

    const brawlerFist = createStylizedBrawlerFist(gloveMat, goldMat, isRight);
    fistGroup.add(brawlerFist);
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
// 2. KAI — STREET STRIKER (Urban Skater Brawler)
// Oversized streetwear hoodie with tubular drawstrings, kangaroo pouch,
// modern DJ headphones with glowing rings, spiky black hair with cyan tips,
// cyan side-stripe joggers, air-sole high-top sneakers.
// ----------------------------------------------------------------------
function createKaiMesh(): CreatedChampion {
  const group = new THREE.Group();
  const accentMeshes: THREE.Mesh[] = [];

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfcd5b4, roughness: 0.55, metalness: 0.02 });
  const hairDarkMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.70, metalness: 0.0 });
  const cyanNeonMat = new THREE.MeshStandardMaterial({
    color: 0x00f5ff,
    emissive: 0x00b4d8,
    emissiveIntensity: 0.45,
    roughness: 0.25,
    metalness: 0.15,
  });
  const cyanGlowMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });
  const hoodieCharcoalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.60, metalness: 0.04 });
  const joggersMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.70, metalness: 0.02 });
  const whiteTrimMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.55, metalness: 0.05 });
  const gloveMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.45, metalness: 0.20 });

  // 1. Jogger Waist & Ribbed Hem
  const pelvisGeo = new THREE.CapsuleGeometry(0.24, 0.24, 14, 22);
  pelvisGeo.scale(1.36, 1.0, 0.95);
  const pelvis = new THREE.Mesh(pelvisGeo, joggersMat);
  pelvis.position.set(0, 0.74, 0);
  group.add(pelvis);

  // 2. Oversized Cozy Streetwear Pullover Hoodie
  const chestGeo = new THREE.CapsuleGeometry(0.28, 0.38, 16, 24);
  chestGeo.scale(1.36, 1.0, 1.02);
  const chest = new THREE.Mesh(chestGeo, hoodieCharcoalMat);
  chest.position.set(0, 1.25, 0);
  chest.castShadow = true;
  group.add(chest);

  // Curved Kangaroo Pouch on Front
  const pouchGeo = new THREE.CapsuleGeometry(0.12, 0.28, 10, 18);
  pouchGeo.scale(1.0, 0.82, 0.55);
  const pocket = new THREE.Mesh(pouchGeo, hoodieCharcoalMat);
  pocket.position.set(0, 1.12, -0.25);
  group.add(pocket);

  // Neon Cyan Chest Logo Emblem
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16), cyanNeonMat);
  core.rotateX(Math.PI / 2);
  core.position.set(0, 1.34, -0.275);
  group.add(core);
  accentMeshes.push(core);

  // Curved Tubular Hoodie Drawstrings with Glowing Cyan Aglets
  [-0.07, 0.07].forEach((xSide) => {
    const stringGeo = new THREE.CapsuleGeometry(0.012, 0.24, 6, 10);
    const string = new THREE.Mesh(stringGeo, whiteTrimMat);
    string.position.set(xSide, 1.32, -0.28);
    group.add(string);

    const aglet = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.045, 8), cyanNeonMat);
    aglet.position.set(xSide, 1.18, -0.28);
    group.add(aglet);
    accentMeshes.push(aglet);
  });

  // 3. Modern Street DJ Headphones around Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.15, 20), skinMat);
  neck.position.set(0, 1.50, 0);
  group.add(neck);

  const hpBand = new THREE.Mesh(
    new THREE.TorusGeometry(0.24, 0.034, 12, 32, Math.PI * 1.35),
    hoodieCharcoalMat
  );
  hpBand.rotateX(Math.PI / 2);
  hpBand.position.set(0, 1.50, 0.02);
  group.add(hpBand);

  [-0.25, 0.25].forEach((xSide) => {
    const earcup = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.065, 20), hoodieCharcoalMat);
    earcup.rotateZ(Math.PI / 2);
    earcup.position.set(xSide, 1.50, -0.05);
    group.add(earcup);

    // Glowing Equalizer Ring
    const eqRing = new THREE.Mesh(new THREE.TorusGeometry(0.072, 0.016, 8, 20), cyanGlowMat);
    eqRing.rotateY(Math.PI / 2);
    eqRing.position.set(xSide > 0 ? xSide + 0.038 : xSide - 0.038, 1.50, -0.05);
    group.add(eqRing);
    accentMeshes.push(eqRing);
  });

  // 4. Head & Expressive Amber Eyes
  const headGeo = new THREE.SphereGeometry(0.285, 32, 26);
  headGeo.scale(1.0, 1.08, 1.02);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.set(0, 1.72, 0);
  head.castShadow = true;
  group.add(head);

  group.add(createPixarExpressiveEyes(0xf59e0b, 0.082, 0.108, 0.105, 1.74, -0.265));
  group.add(createCurvedEyebrows(0x111827, 0.105, 1.83, -0.278, 0.24));
  group.add(createCuteStylizedNoseAndMouth(skinMat, 0.09, 1.68, 1.60));
  group.add(createSculptedHumanEars(skinMat, 0.28, 1.70));

  // 5. Spiky Anime Streetwear Hair with Cyan Dipped Tips
  const hairGroup = new THREE.Group();
  hairGroup.position.set(0, 1.76, 0.05);
  group.add(hairGroup);

  const hairBase = new THREE.Mesh(
    new THREE.SphereGeometry(0.292, 26, 22, 0, Math.PI * 2, 0, Math.PI * 0.48),
    hairDarkMat
  );
  hairGroup.add(hairBase);

  // Dynamic Spikes across crown & front
  const spikes = [
    { x: 0, y: 0.28, z: -0.06, rx: 0.1, rz: 0, s: 0.14 },
    { x: -0.12, y: 0.26, z: -0.09, rx: 0.15, rz: 0.35, s: 0.13 },
    { x: 0.12, y: 0.26, z: -0.09, rx: 0.15, rz: -0.35, s: 0.13 },
    { x: -0.18, y: 0.18, z: -0.16, rx: 0.3, rz: 0.45, s: 0.12 },
    { x: 0.18, y: 0.18, z: -0.16, rx: 0.3, rz: -0.45, s: 0.12 },
    { x: -0.06, y: 0.16, z: -0.27, rx: 0.4, rz: 0.15, s: 0.11 },
    { x: 0.06, y: 0.16, z: -0.27, rx: 0.4, rz: -0.15, s: 0.11 },
  ];

  spikes.forEach((sp) => {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.062, sp.s * 1.9, 8), hairDarkMat);
    cone.position.set(sp.x, sp.y, sp.z);
    cone.rotation.x = sp.rx;
    cone.rotation.z = sp.rz;
    hairGroup.add(cone);

    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.038, sp.s * 0.95, 8), cyanNeonMat);
    tip.position.set(sp.x * 1.15, sp.y * 1.12, sp.z * 1.15);
    tip.rotation.x = sp.rx;
    tip.rotation.z = sp.rz;
    hairGroup.add(tip);
    accentMeshes.push(tip);
  });

  // 6. Articulated Legs & Chunky Air-Sole Street Kicks
  const legGroupL = new THREE.Group();
  const legGroupR = new THREE.Group();

  [-0.18, 0.18].forEach((xPos, idx) => {
    const isRight = xPos > 0;
    const legGroup = idx === 0 ? legGroupL : legGroupR;
    legGroup.position.set(xPos, 0.70, 0);
    group.add(legGroup);

    legGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.135, 16, 14), joggersMat));

    // Joggers Thigh
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.138, 0.122, 0.32, 20), joggersMat);
    thigh.position.set(0, -0.14, 0);
    legGroup.add(thigh);

    // Cyan Neon Side Stripe
    const stripeGeo = new THREE.CapsuleGeometry(0.016, 0.48, 6, 10);
    const stripe = new THREE.Mesh(stripeGeo, cyanNeonMat);
    stripe.position.set(isRight ? 0.138 : -0.138, -0.28, 0);
    legGroup.add(stripe);
    accentMeshes.push(stripe);

    // Jogger Knee Crease
    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.10, 14, 12), joggersMat);
    knee.position.set(0, -0.30, -0.01);
    legGroup.add(knee);

    const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.120, 0.102, 0.24, 18), joggersMat);
    calf.position.set(0, -0.42, 0);
    legGroup.add(calf);

    // Chunky Air-Sole Sneaker
    const footGroup = new THREE.Group();
    footGroup.position.set(0, -0.70, 0);
    legGroup.add(footGroup);

    const sneaker = createStylizedSneaker(hoodieCharcoalMat, cyanNeonMat, whiteTrimMat, accentMeshes);
    footGroup.add(sneaker);
  });

  // 7. Articulated Arms & Cyan-Taped Brawler Fists
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

    armGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.14, 18, 16), hoodieCharcoalMat));

    const armInner = new THREE.Group();
    armInner.rotation.z = isRight ? -0.16 : 0.16;
    armInner.rotation.x = -0.10;
    armGroup.add(armInner);

    // Rolled Hoodie Sleeve
    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.098, 0.24, 16), hoodieCharcoalMat);
    upperArm.position.set(0, -0.12, 0);
    armInner.add(upperArm);

    // Forearm with black compression sleeve
    const forearmGroup = new THREE.Group();
    forearmGroup.position.set(0, -0.24, 0);
    forearmGroup.rotation.x = 0.48;
    forearmGroup.rotation.z = isRight ? 0.22 : -0.22;
    armInner.add(forearmGroup);

    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.092, 0.084, 0.22, 16), joggersMat);
    forearm.position.set(0, -0.11, 0);
    forearmGroup.add(forearm);

    // Cyan Athletic Tape on Wrists
    const tape = new THREE.Mesh(new THREE.TorusGeometry(0.088, 0.022, 10, 18), cyanNeonMat);
    tape.rotateX(Math.PI / 2);
    tape.position.set(0, -0.20, 0);
    forearmGroup.add(tape);
    accentMeshes.push(tape);

    fistGroup.position.set(0, -0.28, 0);
    forearmGroup.add(fistGroup);

    const fist = createStylizedBrawlerFist(gloveMat, cyanNeonMat, isRight);
    fistGroup.add(fist);
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
// 3. NOVA — VALKYRIE BOXER (Agile Female Kickboxer)
// Feminine athletic silhouette, high-waisted shorts with side slits,
// racerback sports crop top, high swinging magenta ponytail with golden tie,
// amorous violet eyes, kickboxer combat boots, taped wraps.
// ----------------------------------------------------------------------
function createNovaMesh(): CreatedChampion {
  const group = new THREE.Group();
  const accentMeshes: THREE.Mesh[] = [];

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfed7aa, roughness: 0.55, metalness: 0.02 });
  const magentaHairMat = new THREE.MeshStandardMaterial({ color: 0xbe185d, roughness: 0.65, metalness: 0.05 });
  const cropTopMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.55, metalness: 0.05 });
  const roseTrimMat = new THREE.MeshStandardMaterial({
    color: 0xf43f5e,
    emissive: 0xe11d48,
    emissiveIntensity: 0.35,
    roughness: 0.35,
  });
  const roseGlowMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.55 });
  const goldRingMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.88, roughness: 0.18 });

  // 1. High-Waisted Athletic Kickboxing Shorts
  const pelvisGeo = new THREE.CapsuleGeometry(0.22, 0.22, 14, 22);
  pelvisGeo.scale(1.25, 1.0, 0.92);
  const pelvis = new THREE.Mesh(pelvisGeo, roseTrimMat);
  pelvis.position.set(0, 0.74, 0);
  group.add(pelvis);

  // White Elastic Waistband
  const shortsBand = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.028, 10, 24), whiteMat);
  shortsBand.rotateX(Math.PI / 2);
  shortsBand.position.set(0, 0.86, 0);
  group.add(shortsBand);

  // 2. Athletic Toned Midriff & Sports Crop Top
  const midriffGeo = new THREE.CapsuleGeometry(0.20, 0.18, 12, 20);
  midriffGeo.scale(1.15, 1.0, 0.88);
  const midriff = new THREE.Mesh(midriffGeo, skinMat);
  midriff.position.set(0, 0.98, 0);
  group.add(midriff);

  // Contoured Crop Top with Natural Athletic Curves
  const chestGeo = new THREE.CapsuleGeometry(0.24, 0.30, 16, 24);
  chestGeo.scale(1.24, 1.0, 0.92);
  const chest = new THREE.Mesh(chestGeo, cropTopMat);
  chest.position.set(0, 1.25, 0);
  chest.castShadow = true;
  group.add(chest);

  // Rose Chevron Core Emblem
  const core = new THREE.Mesh(new THREE.RingGeometry(0.035, 0.085, 3), roseGlowMat);
  core.rotateZ(Math.PI);
  core.position.set(0, 1.28, -0.23);
  group.add(core);
  accentMeshes.push(core);

  // 3. Neck & Feminine Facial Features
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.115, 0.15, 20), skinMat);
  neck.position.set(0, 1.48, 0);
  group.add(neck);

  const headGeo = new THREE.SphereGeometry(0.27, 32, 26);
  headGeo.scale(0.98, 1.08, 0.98);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.set(0, 1.70, 0);
  head.castShadow = true;
  group.add(head);

  group.add(createPixarExpressiveEyes(0xa855f7, 0.078, 0.102, 0.098, 1.72, -0.255));
  group.add(createCurvedEyebrows(0xbe185d, 0.098, 1.81, -0.268, 0.18));
  group.add(createCuteStylizedNoseAndMouth(skinMat, 0.082, 1.66, 1.58));
  group.add(createSculptedHumanEars(skinMat, 0.27, 1.68));

  // 4. High Swinging Ponytail & Sweeping Bangs
  const hairBase = new THREE.Mesh(
    new THREE.SphereGeometry(0.282, 26, 22, 0, Math.PI * 2, 0, Math.PI * 0.50),
    magentaHairMat
  );
  hairBase.position.set(0, 1.74, 0.04);
  group.add(hairBase);

  // Golden Ponytail Ring
  const ponyTie = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.026, 10, 18), goldRingMat);
  ponyTie.rotateX(Math.PI / 4);
  ponyTie.position.set(0, 1.95, 0.20);
  group.add(ponyTie);

  // Cascading Curving Ponytail
  const tailGroup = new THREE.Group();
  tailGroup.position.set(0, 1.95, 0.20);
  group.add(tailGroup);

  const pTail1 = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.085, 0.36, 16), magentaHairMat);
  pTail1.rotation.x = -0.38;
  pTail1.position.set(0, -0.15, 0.10);
  tailGroup.add(pTail1);

  const pTail2 = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.34, 14), roseTrimMat);
  pTail2.rotation.x = -0.22;
  pTail2.position.set(0, -0.42, 0.20);
  tailGroup.add(pTail2);
  accentMeshes.push(pTail2);

  // Sweeping Side Bangs
  [-0.15, 0.15].forEach((xSide) => {
    const bang = new THREE.Mesh(new THREE.CapsuleGeometry(0.028, 0.18, 8, 12), magentaHairMat);
    bang.position.set(xSide, 1.76, -0.24);
    bang.rotation.z = xSide > 0 ? -0.28 : 0.28;
    group.add(bang);
  });

  // 5. Bare Athletic Legs & Rose Combat Boots
  const legGroupL = new THREE.Group();
  const legGroupR = new THREE.Group();

  [-0.17, 0.17].forEach((xPos, idx) => {
    const legGroup = idx === 0 ? legGroupL : legGroupR;
    legGroup.position.set(xPos, 0.70, 0);
    group.add(legGroup);

    legGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.125, 16, 14), roseTrimMat));

    // Bare Toned Thigh
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.122, 0.105, 0.32, 20), skinMat);
    thigh.position.set(0, -0.14, 0);
    legGroup.add(thigh);

    // Kickboxer Knee Guard
    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.092, 14, 12), cropTopMat);
    knee.position.set(0, -0.30, -0.02);
    legGroup.add(knee);

    // Black Compression Shin Wrap
    const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.095, 0.24, 18), cropTopMat);
    calf.position.set(0, -0.42, 0);
    legGroup.add(calf);

    // Combat Brawler Boot with Rose Trim
    const footGroup = new THREE.Group();
    footGroup.position.set(0, -0.70, 0);
    legGroup.add(footGroup);

    const boot = createStylizedSneaker(cropTopMat, roseTrimMat, whiteMat, accentMeshes);
    footGroup.add(boot);
  });

  // 6. Articulated Arms & Taped Boxing Wraps
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

    armGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 14), cropTopMat));

    const armInner = new THREE.Group();
    armInner.rotation.z = isRight ? -0.16 : 0.16;
    armInner.rotation.x = -0.10;
    armGroup.add(armInner);

    // Bare Athletic Arm
    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.082, 0.24, 16), skinMat);
    upperArm.position.set(0, -0.12, 0);
    armInner.add(upperArm);

    // Forearm with white boxing handwraps
    const forearmGroup = new THREE.Group();
    forearmGroup.position.set(0, -0.24, 0);
    forearmGroup.rotation.x = 0.50;
    forearmGroup.rotation.z = isRight ? 0.22 : -0.22;
    armInner.add(forearmGroup);

    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.080, 0.22, 16), whiteMat);
    forearm.position.set(0, -0.11, 0);
    forearmGroup.add(forearm);

    fistGroup.position.set(0, -0.28, 0);
    forearmGroup.add(fistGroup);

    const fist = createStylizedBrawlerFist(roseTrimMat, whiteMat, isRight);
    fistGroup.add(fist);
    accentMeshes.push(fistGroup.children[0] as THREE.Mesh);
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
// 4. GORR (TITAN) — HEAVY STRONGMAN (Mountain Juggernaut)
// Colossal powerhouse brawler, massive barrel chest, powerlifting singlet,
// huge sculpted Viking beard and mustache, golden championship belt,
// heavy iron-toe lumberjack boots, boulder shoulders.
// ----------------------------------------------------------------------
function createTitanGorrMesh(): CreatedChampion {
  const group = new THREE.Group();
  const accentMeshes: THREE.Mesh[] = [];

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.60, metalness: 0.02 });
  const beardHairMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.72, metalness: 0.0 });
  const singletMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.58, metalness: 0.05 });
  const amberStripeMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.35,
    roughness: 0.35,
  });
  const leatherBeltMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.50, metalness: 0.10 });
  const goldChampionMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.90, roughness: 0.18 });

  // 1. Massive Pelvis & Championship Belt
  const pelvisGeo = new THREE.CapsuleGeometry(0.28, 0.22, 16, 24);
  pelvisGeo.scale(1.42, 1.0, 1.0);
  const pelvis = new THREE.Mesh(pelvisGeo, singletMat);
  pelvis.position.set(0, 0.65, 0);
  group.add(pelvis);

  // Colossal Gold Champion Weight Belt
  const beltGeo = new THREE.TorusGeometry(0.38, 0.045, 12, 32);
  beltGeo.rotateX(Math.PI / 2);
  const belt = new THREE.Mesh(beltGeo, leatherBeltMat);
  belt.position.set(0, 0.78, 0);
  group.add(belt);

  // Massive Golden Medallion Buckle with Eagle Crest
  const buckleGeo = new THREE.CylinderGeometry(0.10, 0.10, 0.035, 20);
  buckleGeo.rotateX(Math.PI / 2);
  const buckle = new THREE.Mesh(buckleGeo, goldChampionMat);
  buckle.position.set(0, 0.78, -0.36);
  group.add(buckle);

  const core = new THREE.Mesh(new THREE.SphereGeometry(0.040, 12, 12), amberStripeMat);
  core.position.set(0, 0.78, -0.38);
  group.add(core);
  accentMeshes.push(core);

  // 2. Colossal Muscular Barrel Chest (Stops cleanly at y = 1.35)
  const chestGeo = new THREE.CapsuleGeometry(0.30, 0.24, 18, 24);
  chestGeo.scale(1.42, 1.0, 1.05);
  const chest = new THREE.Mesh(chestGeo, singletMat);
  chest.position.set(0, 1.10, 0);
  chest.castShadow = true;
  group.add(chest);

  // Heavy Powerlifting Singlet Straps
  [-0.20, 0.20].forEach((xSide) => {
    const strapGeo = new THREE.CapsuleGeometry(0.036, 0.32, 8, 14);
    const strap = new THREE.Mesh(strapGeo, amberStripeMat);
    strap.position.set(xSide, 1.12, -0.30);
    group.add(strap);
    accentMeshes.push(strap);
  });

  // 3. Defined Muscular Neck & Broad Heroic Head
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.20, 0.16, 24), skinMat);
  neck.position.set(0, 1.45, 0);
  group.add(neck);

  const headGeo = new THREE.SphereGeometry(0.285, 32, 26);
  headGeo.scale(1.05, 1.08, 1.02);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.set(0, 1.70, 0);
  head.castShadow = true;
  group.add(head);

  // Viking Jawline Chin Beard (Hugs lower jaw from y = 1.48 to 1.56)
  const chinBeardGeo = new THREE.CapsuleGeometry(0.055, 0.24, 10, 16);
  chinBeardGeo.rotateZ(Math.PI / 2);
  const chinBeard = new THREE.Mesh(chinBeardGeo, beardHairMat);
  chinBeard.position.set(0, 1.52, -0.22);
  group.add(chinBeard);

  // Sideburns connecting jaw to ears
  [-0.24, 0.24].forEach((xSide) => {
    const sideburn = new THREE.Mesh(new THREE.CapsuleGeometry(0.038, 0.12, 8, 12), beardHairMat);
    sideburn.position.set(xSide, 1.64, -0.06);
    group.add(sideburn);
  });

  // Curled 3D Strongman Handlebar Mustache
  const stacheGeo = new THREE.CapsuleGeometry(0.032, 0.18, 8, 14);
  stacheGeo.rotateZ(Math.PI / 2);
  const mustache = new THREE.Mesh(stacheGeo, beardHairMat);
  mustache.position.set(0, 1.62, -0.27);
  group.add(mustache);

  // Broad Strongman Button Nose
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.042, 16, 14), skinMat);
  nose.scale.set(1.0, 0.85, 1.15);
  nose.position.set(0, 1.68, -0.27);
  group.add(nose);

  group.add(createPixarExpressiveEyes(0x451a03, 0.076, 0.096, 0.11, 1.74, -0.265));
  group.add(createCurvedEyebrows(0x451a03, 0.11, 1.83, -0.278, 0.22));
  group.add(createSculptedHumanEars(skinMat, 0.29, 1.70));

  // Short Undercut Buzz Hair on Crown and Nape
  const hairTop = new THREE.Mesh(
    new THREE.SphereGeometry(0.295, 24, 20, 0, Math.PI * 2, 0, Math.PI * 0.45),
    beardHairMat
  );
  hairTop.position.set(0, 1.76, 0.03);
  group.add(hairTop);

  // 4. Tree-Trunk Heavyweight Legs & Iron-Toe Boots
  const legGroupL = new THREE.Group();
  const legGroupR = new THREE.Group();

  [-0.24, 0.24].forEach((xPos, idx) => {
    const legGroup = idx === 0 ? legGroupL : legGroupR;
    legGroup.position.set(xPos, 0.70, 0);
    group.add(legGroup);

    legGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.17, 18, 16), singletMat));

    // Heavyweight Thigh
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.155, 0.32, 20), singletMat);
    thigh.position.set(0, -0.14, 0);
    legGroup.add(thigh);

    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 12), singletMat);
    knee.position.set(0, -0.30, -0.01);
    legGroup.add(knee);

    const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.138, 0.24, 20), singletMat);
    calf.position.set(0, -0.42, 0);
    legGroup.add(calf);

    // Heavy Iron-Toe Work Boot
    const footGroup = new THREE.Group();
    footGroup.position.set(0, -0.70, 0);
    legGroup.add(footGroup);

    const boot = createStylizedSneaker(leatherBeltMat, goldChampionMat, amberStripeMat, accentMeshes);
    boot.scale.set(1.22, 1.15, 1.20);
    footGroup.add(boot);
  });

  // 5. Massive Boulder Arms & Taped Fists (Heavyweight Muscle)
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
    armGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.19, 20, 18), skinMat));

    const armInner = new THREE.Group();
    armInner.rotation.z = isRight ? -0.14 : 0.14;
    armInner.rotation.x = -0.10;
    armGroup.add(armInner);

    // Heavy Biceps
    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.148, 0.136, 0.26, 18), skinMat);
    upperArm.position.set(0, -0.13, 0);
    armInner.add(upperArm);

    // Thick Taped Forearm
    const forearmGroup = new THREE.Group();
    forearmGroup.position.set(0, -0.26, 0);
    forearmGroup.rotation.x = 0.48;
    forearmGroup.rotation.z = isRight ? 0.20 : -0.20;
    armInner.add(forearmGroup);

    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.138, 0.126, 0.24, 18), leatherBeltMat);
    forearm.position.set(0, -0.12, 0);
    forearmGroup.add(forearm);

    // Colossal Brawler Fist
    fistGroup.position.set(0, -0.30, 0);
    forearmGroup.add(fistGroup);

    const fist = createStylizedBrawlerFist(leatherBeltMat, goldChampionMat, isRight);
    fist.scale.set(1.25, 1.25, 1.25);
    fistGroup.add(fist);
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
// 5. KAGE — SHADOW SHINOBI (Ninja Martial Artist)
// Wrapped ninja gi, jade fabric sash with dimensional knot, steel hitai-ate
// plate with trailing physics ribbons, sharp green eyes, split-toe tabi boots.
// ----------------------------------------------------------------------
function createKageMesh(): CreatedChampion {
  const group = new THREE.Group();
  const accentMeshes: THREE.Mesh[] = [];

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.55, metalness: 0.02 });
  const ninjaBlackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.60, metalness: 0.05 });
  const jadeMat = new THREE.MeshStandardMaterial({
    color: 0x059669,
    emissive: 0x047857,
    emissiveIntensity: 0.35,
    roughness: 0.40,
  });
  const jadeGlowMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
  const crimsonCordMat = new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.60 });
  const steelPlateMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.90, roughness: 0.18 });
  const wrapMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.65 });

  // 1. Shinobi Gi Trousers & Red Cord Belt
  const pelvisGeo = new THREE.CapsuleGeometry(0.24, 0.24, 14, 22);
  pelvisGeo.scale(1.35, 1.0, 0.95);
  const pelvis = new THREE.Mesh(pelvisGeo, ninjaBlackMat);
  pelvis.position.set(0, 0.74, 0);
  group.add(pelvis);

  // Red Shimenawa-Style Cord Belt
  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.032, 10, 28), crimsonCordMat);
  belt.rotateX(Math.PI / 2);
  belt.position.set(0, 0.86, 0);
  group.add(belt);

  // 2. Wrapped Shinobi Gi Tunic with Diagonal Jade Lapel
  const chestGeo = new THREE.CapsuleGeometry(0.26, 0.38, 16, 24);
  chestGeo.scale(1.34, 1.0, 0.95);
  const chest = new THREE.Mesh(chestGeo, ninjaBlackMat);
  chest.position.set(0, 1.25, 0);
  chest.castShadow = true;
  group.add(chest);

  // Crossed Jade Sash
  const sashGeo = new THREE.CapsuleGeometry(0.045, 0.48, 8, 16);
  sashGeo.rotateZ(0.42);
  const sash = new THREE.Mesh(sashGeo, jadeMat);
  sash.position.set(0, 1.25, -0.22);
  group.add(sash);
  accentMeshes.push(sash);

  // Jade Emblem Core
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.024, 16), jadeGlowMat);
  core.rotateX(Math.PI / 2);
  core.position.set(0, 1.25, -0.24);
  group.add(core);
  accentMeshes.push(core);

  // 3. Badass Shinobi Cowl, Hitai-ate Forehead Plate & Angular Mempo Face Mask
  // Wrapped Midnight Cowl Collar around neck
  const cowlCollar = new THREE.Mesh(
    new THREE.TorusGeometry(0.18, 0.05, 12, 24),
    ninjaBlackMat
  );
  cowlCollar.rotateX(Math.PI / 2);
  cowlCollar.position.set(0, 1.48, 0);
  group.add(cowlCollar);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.16, 20), ninjaBlackMat);
  neck.position.set(0, 1.50, 0);
  group.add(neck);

  // Full Midnight Shinobi Head Cowl (Enclosing skull, temples, and jaw)
  const headGeo = new THREE.SphereGeometry(0.285, 32, 26);
  headGeo.scale(1.0, 1.08, 1.02);
  const headCowl = new THREE.Mesh(headGeo, ninjaBlackMat);
  headCowl.position.set(0, 1.72, 0);
  headCowl.castShadow = true;
  group.add(headCowl);

  // Dark Inset Visor Frame (Deep shadow chamber for eyes)
  const visorFrameGeo = new THREE.CapsuleGeometry(0.040, 0.23, 8, 16);
  visorFrameGeo.rotateZ(Math.PI / 2);
  const visorFrame = new THREE.Mesh(visorFrameGeo, new THREE.MeshBasicMaterial({ color: 0x050508 }));
  visorFrame.position.set(0, 1.74, -0.278);
  group.add(visorFrame);

  // Twin Fierce Glowing Jade Ninja Eyes (Aggressive, angled slit gaze with white hot core)
  [-0.075, 0.075].forEach((xSide) => {
    const isRight = xSide > 0;
    // Outer Jade Glow Slit Lens
    const eyeGeo = new THREE.CapsuleGeometry(0.016, 0.065, 8, 12);
    eyeGeo.rotateZ(isRight ? -0.22 : 0.22);
    const eyeOuter = new THREE.Mesh(eyeGeo, jadeGlowMat);
    eyeOuter.position.set(xSide, 1.74, -0.286);
    group.add(eyeOuter);
    accentMeshes.push(eyeOuter);

    // Inner Radiant White-Hot Energy Slit Core
    const coreGeo = new THREE.CapsuleGeometry(0.007, 0.042, 6, 8);
    coreGeo.rotateZ(isRight ? -0.22 : 0.22);
    const eyeCore = new THREE.Mesh(coreGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
    eyeCore.position.set(xSide, 1.74, -0.289);
    group.add(eyeCore);

    // Sharp Angled Obsidian Brow Plate over each eye
    const browGeo = new THREE.CapsuleGeometry(0.015, 0.082, 6, 10);
    browGeo.rotateZ(isRight ? -0.32 : 0.32);
    const browPlate = new THREE.Mesh(browGeo, ninjaBlackMat);
    browPlate.position.set(xSide, 1.775, -0.285);
    group.add(browPlate);
  });

  // Sculpted Shinobi Mempo (Smooth lower face mask covering from nose bridge to chin)
  const maskGeo = new THREE.SphereGeometry(0.288, 28, 22, 0, Math.PI * 2, Math.PI * 0.44, Math.PI * 0.38);
  const maskMesh = new THREE.Mesh(maskGeo, ninjaBlackMat);
  maskMesh.position.set(0, 1.72, 0);
  group.add(maskMesh);

  // Angular Chiseled Center Nose/Chin Seam
  const centerSeamGeo = new THREE.CapsuleGeometry(0.014, 0.22, 8, 14);
  const centerSeam = new THREE.Mesh(centerSeamGeo, jadeMat);
  centerSeam.position.set(0, 1.63, -0.288);
  group.add(centerSeam);
  accentMeshes.push(centerSeam);

  // Left & Right Aerodynamic Jade Breathing Vents (Embedded in cheek curve)
  [-0.12, 0.12].forEach((xSide) => {
    const isRight = xSide > 0;
    [-0.022, 0.015].forEach((yOff) => {
      const ventGeo = new THREE.CapsuleGeometry(0.009, 0.055, 6, 10);
      ventGeo.rotateZ(isRight ? 0.30 : -0.30);
      const vent = new THREE.Mesh(ventGeo, jadeGlowMat);
      vent.position.set(xSide, 1.63 + yOff, -0.278);
      group.add(vent);
      accentMeshes.push(vent);
    });
  });

  // Top Edge Trim of Mask (Contoured Jade Lip directly below the eyes)
  const maskLipGeo = new THREE.CapsuleGeometry(0.015, 0.25, 8, 16);
  maskLipGeo.rotateZ(Math.PI / 2);
  const maskLip = new THREE.Mesh(maskLipGeo, jadeMat);
  maskLip.position.set(0, 1.70, -0.284);
  group.add(maskLip);
  accentMeshes.push(maskLip);

  // Crimson Headband wrapping around the head
  const tieBand = new THREE.Mesh(new THREE.TorusGeometry(0.288, 0.022, 10, 32), crimsonCordMat);
  tieBand.rotateX(Math.PI / 2);
  tieBand.position.set(0, 1.84, 0);
  group.add(tieBand);

  // Polished Steel Forehead Protector (Hitai-ate) in FRONT
  const plateGeo = new THREE.CapsuleGeometry(0.042, 0.22, 8, 18);
  plateGeo.rotateZ(Math.PI / 2);
  const plate = new THREE.Mesh(plateGeo, steelPlateMat);
  plate.position.set(0, 1.84, -0.282);
  group.add(plate);

  // Etched Glowing Jade Ninja Shuriken Crest on Forehead Plate
  const crestGeo = new THREE.RingGeometry(0.012, 0.038, 4);
  crestGeo.rotateZ(Math.PI / 4);
  const crest = new THREE.Mesh(crestGeo, jadeGlowMat);
  crest.position.set(0, 1.84, -0.328);
  group.add(crest);
  accentMeshes.push(crest);

  // Corner Rivets on Metal Plate
  [-0.10, 0.10].forEach((xSide) => {
    const rivet = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 8), steelPlateMat);
    rivet.position.set(xSide, 1.84, -0.320);
    group.add(rivet);
  });

  // Twin Cinematic 3D Headband Ribbons Flowing Behind in Wind
  [-0.04, 0.04].forEach((xSide, i) => {
    const ribbonGeo = new THREE.CapsuleGeometry(0.018, 0.55, 6, 16);
    ribbonGeo.rotateX(-0.62);
    ribbonGeo.rotateZ((i - 0.5) * 0.32);
    const ribbon = new THREE.Mesh(ribbonGeo, crimsonCordMat);
    ribbon.position.set(xSide, 1.84, 0.30);
    group.add(ribbon);
  });

  // 4. Articulated Legs & Split-Toe Tabi Boots
  const legGroupL = new THREE.Group();
  const legGroupR = new THREE.Group();

  [-0.18, 0.18].forEach((xPos, idx) => {
    const legGroup = idx === 0 ? legGroupL : legGroupR;
    legGroup.position.set(xPos, 0.70, 0);
    group.add(legGroup);

    legGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 14), ninjaBlackMat));

    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.12, 0.32, 20), ninjaBlackMat);
    thigh.position.set(0, -0.14, 0);
    legGroup.add(thigh);

    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.095, 14, 12), ninjaBlackMat);
    knee.position.set(0, -0.30, -0.01);
    legGroup.add(knee);

    const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.10, 0.24, 18), wrapMat);
    calf.position.set(0, -0.42, 0);
    legGroup.add(calf);

    // Split-Toe Tabi Sneaker
    const footGroup = new THREE.Group();
    footGroup.position.set(0, -0.70, 0);
    legGroup.add(footGroup);

    const tabi = createStylizedSneaker(ninjaBlackMat, jadeMat, steelPlateMat, accentMeshes);
    footGroup.add(tabi);
  });

  // 5. Articulated Arms & Wrapped Shinobi Vambraces
  const armGroupL = new THREE.Group();
  const armGroupR = new THREE.Group();
  const fistGroupL = new THREE.Group();
  const fistGroupR = new THREE.Group();

  [-0.41, 0.41].forEach((xSide, idx) => {
    const isRight = xSide > 0;
    const armGroup = idx === 0 ? armGroupL : armGroupR;
    const fistGroup = isRight ? fistGroupR : fistGroupL;

    armGroup.position.set(xSide, 1.28, -0.02);
    group.add(armGroup);

    armGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.135, 18, 16), ninjaBlackMat));

    const armInner = new THREE.Group();
    armInner.rotation.z = isRight ? -0.16 : 0.16;
    armInner.rotation.x = -0.10;
    armGroup.add(armInner);

    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.096, 0.088, 0.24, 16), skinMat);
    upperArm.position.set(0, -0.12, 0);
    armInner.add(upperArm);

    const forearmGroup = new THREE.Group();
    forearmGroup.position.set(0, -0.24, 0);
    forearmGroup.rotation.x = 0.50;
    forearmGroup.rotation.z = isRight ? 0.22 : -0.22;
    armInner.add(forearmGroup);

    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.090, 0.082, 0.22, 16), wrapMat);
    forearm.position.set(0, -0.11, 0);
    forearmGroup.add(forearm);

    fistGroup.position.set(0, -0.28, 0);
    forearmGroup.add(fistGroup);

    const fist = createStylizedBrawlerFist(ninjaBlackMat, steelPlateMat, isRight);
    fistGroup.add(fist);
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
// 6. AXEL (BOLT) — LIGHTNING PARKOURIST (Street Sprinter)
// High-voltage yellow windbreaker jacket with zip collar, messy blonde hair,
// forehead parkour goggles with orange-tinted lenses, cheek band-aid,
// aerodynamic sprint sneakers with lightning tread.
// ----------------------------------------------------------------------
function createAxelBoltMesh(): CreatedChampion {
  const group = new THREE.Group();
  const accentMeshes: THREE.Mesh[] = [];

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfed7aa, roughness: 0.55, metalness: 0.02 });
  const yellowJacketMat = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    roughness: 0.38,
    metalness: 0.10,
  });
  const yellowGlowMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  const charcoalMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.60, metalness: 0.05 });
  const blondeHairMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.70, metalness: 0.0 });
  const goggleLensMat = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    metalness: 0.88,
    roughness: 0.15,
  });
  const whiteTrimMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.55 });

  // 1. Pelvis & Athletic Runner Shorts
  const pelvisGeo = new THREE.CapsuleGeometry(0.24, 0.22, 14, 22);
  pelvisGeo.scale(1.35, 1.0, 0.95);
  const pelvis = new THREE.Mesh(pelvisGeo, charcoalMat);
  pelvis.position.set(0, 0.74, 0);
  group.add(pelvis);

  // 2. Zip-Up Windbreaker Jacket (High-Voltage Yellow & Charcoal)
  const chestGeo = new THREE.CapsuleGeometry(0.26, 0.38, 16, 24);
  chestGeo.scale(1.34, 1.0, 0.95);
  const chest = new THREE.Mesh(chestGeo, yellowJacketMat);
  chest.position.set(0, 1.25, 0);
  chest.castShadow = true;
  group.add(chest);

  // High Windbreaker Collar
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.12, 20, 1, true), charcoalMat);
  collar.position.set(0, 1.50, 0);
  group.add(collar);

  // White Center Windbreaker Zipper
  const zipperGeo = new THREE.CapsuleGeometry(0.016, 0.44, 6, 10);
  const zipper = new THREE.Mesh(zipperGeo, whiteTrimMat);
  zipper.position.set(0, 1.25, -0.25);
  group.add(zipper);

  // Lightning Bolt Emblem on Chest
  const core = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.14, 0.02), yellowGlowMat);
  core.rotateZ(0.25);
  core.position.set(-0.12, 1.32, -0.26);
  group.add(core);
  accentMeshes.push(core);

  // 3. Neck & Head
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.14, 20), skinMat);
  neck.position.set(0, 1.48, 0);
  group.add(neck);

  const headGeo = new THREE.SphereGeometry(0.285, 32, 26);
  headGeo.scale(1.0, 1.08, 1.02);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.set(0, 1.72, 0);
  head.castShadow = true;
  group.add(head);

  group.add(createPixarExpressiveEyes(0xeab308, 0.082, 0.105, 0.105, 1.74, -0.265));
  group.add(createCurvedEyebrows(0xb45309, 0.105, 1.83, -0.278, 0.22));
  group.add(createCuteStylizedNoseAndMouth(skinMat, 0.09, 1.68, 1.60));
  group.add(createSculptedHumanEars(skinMat, 0.28, 1.70));

  // Cheek Band-Aid (Playful Street Trickster Signature)
  const bandaid = new THREE.Mesh(new THREE.CapsuleGeometry(0.014, 0.052, 6, 8), whiteTrimMat);
  bandaid.position.set(0.15, 1.65, -0.25);
  bandaid.rotation.z = -0.38;
  group.add(bandaid);

  // 4. Dynamic Wind-Blown Blonde Hair & Forehead Speed Goggles
  const hairGroup = new THREE.Group();
  hairGroup.position.set(0, 1.76, 0.05);
  group.add(hairGroup);

  const hairBase = new THREE.Mesh(
    new THREE.SphereGeometry(0.292, 24, 20, 0, Math.PI * 2, 0, Math.PI * 0.45),
    blondeHairMat
  );
  hairGroup.add(hairBase);

  // Energetic Blonde Spikes Sweeping Forward
  [-0.14, -0.05, 0.05, 0.14].forEach((xOff, i) => {
    const spikeGeo = new THREE.CapsuleGeometry(0.032, 0.18, 8, 12);
    spikeGeo.rotateX(0.42);
    spikeGeo.rotateZ((i - 1.5) * 0.20);
    const spike = new THREE.Mesh(spikeGeo, blondeHairMat);
    spike.position.set(xOff, 0.20, -0.15);
    hairGroup.add(spike);
  });

  // Aerodynamic Speed Goggles Worn on Forehead
  const goggleStrap = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.30, 0.045, 32, 1, true), charcoalMat);
  goggleStrap.position.set(0, 1.84, 0);
  group.add(goggleStrap);

  [-0.085, 0.085].forEach((xSide) => {
    const lens = new THREE.Mesh(new THREE.SphereGeometry(0.068, 16, 14), goggleLensMat);
    lens.scale.set(1.25, 0.82, 0.35);
    lens.position.set(xSide, 1.85, -0.29);
    group.add(lens);
    accentMeshes.push(lens);
  });

  // 5. Articulated Legs & Aerodynamic Lightning Runners
  const legGroupL = new THREE.Group();
  const legGroupR = new THREE.Group();

  [-0.18, 0.18].forEach((xPos, idx) => {
    const legGroup = idx === 0 ? legGroupL : legGroupR;
    legGroup.position.set(xPos, 0.70, 0);
    group.add(legGroup);

    legGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 14), charcoalMat));

    // Thigh with runner shorts
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.132, 0.118, 0.32, 20), charcoalMat);
    thigh.position.set(0, -0.14, 0);
    legGroup.add(thigh);

    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.092, 14, 12), skinMat);
    knee.position.set(0, -0.30, -0.01);
    legGroup.add(knee);

    const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.108, 0.092, 0.24, 18), skinMat);
    calf.position.set(0, -0.42, 0);
    legGroup.add(calf);

    // Lightning Runner Sneaker
    const footGroup = new THREE.Group();
    footGroup.position.set(0, -0.70, 0);
    legGroup.add(footGroup);

    const sneaker = createStylizedSneaker(yellowJacketMat, yellowGlowMat, charcoalMat, accentMeshes);
    footGroup.add(sneaker);
  });

  // 6. Articulated Arms & Parkour Grip Gloves
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

    armGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.135, 18, 16), yellowJacketMat));

    const armInner = new THREE.Group();
    armInner.rotation.z = isRight ? -0.16 : 0.16;
    armInner.rotation.x = -0.10;
    armGroup.add(armInner);

    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.098, 0.090, 0.24, 16), yellowJacketMat);
    upperArm.position.set(0, -0.12, 0);
    armInner.add(upperArm);

    const forearmGroup = new THREE.Group();
    forearmGroup.position.set(0, -0.24, 0);
    forearmGroup.rotation.x = 0.48;
    forearmGroup.rotation.z = isRight ? 0.22 : -0.22;
    armInner.add(forearmGroup);

    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.092, 0.084, 0.22, 16), skinMat);
    forearm.position.set(0, -0.11, 0);
    forearmGroup.add(forearm);

    fistGroup.position.set(0, -0.28, 0);
    forearmGroup.add(fistGroup);

    const fist = createStylizedBrawlerFist(charcoalMat, yellowGlowMat, isRight);
    fistGroup.add(fist);
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
