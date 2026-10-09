import * as THREE from 'three';

export type ChampionId = 'kai' | 'nova' | 'titan' | 'kage' | 'bolt';

export interface ChampionInfo {
  id: ChampionId;
  name: string;
  title: string;
  archetype: 'Striker' | 'Agile Duelist' | 'Juggernaut' | 'Shadow Assassin' | 'Beast Scout';
  color: string;
  glowColor: number;
  tagline: string;
  description: string;
  stats: {
    impactForce: string; // purely visual flavor
    balanceRating: string;
    dashOverdrive: string;
  };
}

export const CHAMPIONS: Record<ChampionId, ChampionInfo> = {
  kai: {
    id: 'kai',
    name: 'Kai',
    title: 'Neon Vanguard',
    archetype: 'Striker',
    color: '#00f5ff',
    glowColor: 0x00f5ff,
    tagline: 'Precision timing, street style, unstoppable momentum.',
    description: 'Armed with high-frequency kinetic headphones and a reactive cyber-jacket, Kai commands the center ring with sharp reflexes.',
    stats: {
      impactForce: '★★★★☆',
      balanceRating: '★★★★☆',
      dashOverdrive: '★★★★★',
    },
  },
  nova: {
    id: 'nova',
    name: 'Nova',
    title: 'Plasma Valkyrie',
    archetype: 'Agile Duelist',
    color: '#f43f5e',
    glowColor: 0xf43f5e,
    tagline: 'Twin plasma antennae. Razor-sharp ring recovery.',
    description: 'A champion from the neon orbital circuit. Her high-voltage magenta conduits and lightweight alloy suit make her dashes lethal.',
    stats: {
      impactForce: '★★★☆☆',
      balanceRating: '★★★★★',
      dashOverdrive: '★★★★★',
    },
  },
  titan: {
    id: 'titan',
    name: 'Titan (Gorr)',
    title: 'Heavy Juggernaut',
    archetype: 'Juggernaut',
    color: '#f59e0b',
    glowColor: 0xf59e0b,
    tagline: 'Heavy hydraulic pistons. Shakes the floor on impact.',
    description: 'Reinforced industrial mech built for pure ring dominance. Broad hazard-striped pauldrons and giant iron knuckles blast foes off the perimeter.',
    stats: {
      impactForce: '★★★★★',
      balanceRating: '★★★★★',
      dashOverdrive: '★★★☆☆',
    },
  },
  kage: {
    id: 'kage',
    name: 'Kage',
    title: 'Shadow Shinobi',
    archetype: 'Shadow Assassin',
    color: '#10b981',
    glowColor: 0x10b981,
    tagline: 'Obsidian stealth hood with a glowing emerald slash optic.',
    description: 'Silent fighter cloaked in carbon-fiber scale armor and trailing cyber-scarf ribbons. Moves like a phantom across the boundary.',
    stats: {
      impactForce: '★★★★☆',
      balanceRating: '★★★★☆',
      dashOverdrive: '★★★★★',
    },
  },
  bolt: {
    id: 'bolt',
    name: 'Bolt',
    title: 'Cyber Robo-Fox',
    archetype: 'Beast Scout',
    color: '#eab308',
    glowColor: 0xeab308,
    tagline: 'Pointed radar ears, digital LED eyes, blazing tail core.',
    description: 'A fierce mechanical animal brawler equipped with high-torque claw thrusters and an expressive holographic visor.',
    stats: {
      impactForce: '★★★★☆',
      balanceRating: '★★★★☆',
      dashOverdrive: '★★★★★',
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
}

/**
 * Creates high-detail procedural 3D champion models with PBR materials,
 * glossy metallic armor, chiseled shapes, and vibrant emissive accents.
 */
export function createChampionMesh(id: ChampionId): CreatedChampion {
  switch (id) {
    case 'nova':
      return createNovaMesh();
    case 'titan':
      return createTitanMesh();
    case 'kage':
      return createKageMesh();
    case 'bolt':
      return createBoltMesh();
    case 'kai':
    default:
      return createKaiMesh();
  }
}

// ----------------------------------------------------------------------
// 1. KAI (Cyber Boy - Streetwear Vanguard)
// ----------------------------------------------------------------------
function createKaiMesh(): CreatedChampion {
  const group = new THREE.Group();
  const accentMeshes: THREE.Mesh[] = [];

  // PBR Materials
  const armorMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.8,
    roughness: 0.2,
  });
  const clothMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.2,
    roughness: 0.7,
  });
  const cyanGlowMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });
  const whiteGlowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  // 1. Torso & Jacket
  const bodyGeo = new THREE.CapsuleGeometry(0.52, 0.7, 8, 16);
  const body = new THREE.Mesh(bodyGeo, armorMat);
  body.position.y = 1.05;
  body.castShadow = true;
  group.add(body);

  // Jacket collar
  const collarGeo = new THREE.CylinderGeometry(0.55, 0.58, 0.28, 16, 1, true);
  const collar = new THREE.Mesh(collarGeo, clothMat);
  collar.position.set(0, 1.45, -0.05);
  group.add(collar);

  // Chest Arc Reactor Core
  const coreGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.08, 16);
  coreGeo.rotateX(Math.PI / 2);
  const core = new THREE.Mesh(coreGeo, cyanGlowMat);
  core.position.set(0, 1.15, -0.48);
  group.add(core);
  accentMeshes.push(core);

  // Chest armor harness plates
  const plateGeo = new THREE.BoxGeometry(0.68, 0.35, 0.15);
  const plate = new THREE.Mesh(plateGeo, armorMat);
  plate.position.set(0, 1.1, -0.42);
  group.add(plate);

  // 2. Head & Visor
  const headGeo = new THREE.SphereGeometry(0.38, 16, 16);
  const head = new THREE.Mesh(headGeo, armorMat);
  head.position.set(0, 1.75, 0);
  head.castShadow = true;
  group.add(head);

  // Spiky hair tuft
  const hairGeo = new THREE.ConeGeometry(0.32, 0.35, 6);
  hairGeo.rotateX(0.2);
  const hair = new THREE.Mesh(hairGeo, clothMat);
  hair.position.set(0, 2.1, -0.05);
  group.add(hair);

  // Cyber Visor Glasses
  const visorGeo = new THREE.BoxGeometry(0.65, 0.16, 0.25);
  const visor = new THREE.Mesh(visorGeo, cyanGlowMat);
  visor.position.set(0, 1.75, -0.32);
  group.add(visor);
  accentMeshes.push(visor);

  // Headphone ear cups with glowing rings
  [-0.42, 0.42].forEach((xSide) => {
    const cupGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 16);
    cupGeo.rotateZ(Math.PI / 2);
    const cup = new THREE.Mesh(cupGeo, armorMat);
    cup.position.set(xSide, 1.75, 0);
    group.add(cup);

    const ringGeo = new THREE.TorusGeometry(0.14, 0.03, 8, 16);
    ringGeo.rotateY(Math.PI / 2);
    const ring = new THREE.Mesh(ringGeo, cyanGlowMat);
    ring.position.set(xSide > 0 ? xSide + 0.06 : xSide - 0.06, 1.75, 0);
    group.add(ring);
    accentMeshes.push(ring);
  });

  // Headphone headband
  const bandGeo = new THREE.TorusGeometry(0.42, 0.04, 8, 16, Math.PI);
  bandGeo.rotateZ(Math.PI / 2);
  bandGeo.rotateY(Math.PI / 2);
  const band = new THREE.Mesh(bandGeo, clothMat);
  band.position.set(0, 1.82, 0);
  group.add(band);

  // 3. Fists & Gauntlets
  const fistGeo = new THREE.SphereGeometry(0.25, 14, 14);
  const fistMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.25 });
  const leftFist = new THREE.Mesh(fistGeo, fistMat);
  const rightFist = new THREE.Mesh(fistGeo, fistMat);
  leftFist.position.set(-0.75, 0.95, -0.3);
  rightFist.position.set(0.75, 0.95, -0.3);
  leftFist.castShadow = true;
  rightFist.castShadow = true;
  group.add(leftFist);
  group.add(rightFist);

  // Knuckle glow bands
  [-0.75, 0.75].forEach((xPos) => {
    const kBandGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.08, 12);
    kBandGeo.rotateX(Math.PI / 2);
    const kBand = new THREE.Mesh(kBandGeo, whiteGlowMat);
    kBand.position.set(xPos, 0.95, -0.3);
    group.add(kBand);
    accentMeshes.push(kBand);
  });

  // 4. Runner Sneakers
  [-0.32, 0.32].forEach((xPos) => {
    const bootGeo = new THREE.BoxGeometry(0.26, 0.2, 0.5);
    const boot = new THREE.Mesh(bootGeo, clothMat);
    boot.position.set(xPos, 0.15, -0.05);
    group.add(boot);

    const soleGeo = new THREE.BoxGeometry(0.28, 0.06, 0.54);
    const sole = new THREE.Mesh(soleGeo, cyanGlowMat);
    sole.position.set(xPos, 0.04, -0.05);
    group.add(sole);
    accentMeshes.push(sole);
  });

  return { group, bodyMesh: body, coreMesh: core, fists: [leftFist, rightFist], accentMeshes };
}

// ----------------------------------------------------------------------
// 2. NOVA (Cyber Girl - Plasma Valkyrie)
// ----------------------------------------------------------------------
function createNovaMesh(): CreatedChampion {
  const group = new THREE.Group();
  const accentMeshes: THREE.Mesh[] = [];

  const suitMat = new THREE.MeshStandardMaterial({
    color: 0x2e1065,
    metalness: 0.85,
    roughness: 0.18,
  });
  const armorMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    metalness: 0.9,
    roughness: 0.15,
  });
  const magentaGlow = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
  const violetGlow = new THREE.MeshBasicMaterial({ color: 0xa855f7 });

  // 1. Sleek Torso
  const bodyGeo = new THREE.CapsuleGeometry(0.46, 0.72, 8, 16);
  const body = new THREE.Mesh(bodyGeo, suitMat);
  body.position.y = 1.05;
  body.castShadow = true;
  group.add(body);

  // Angular Chestplate
  const plateGeo = new THREE.BoxGeometry(0.62, 0.38, 0.14);
  const plate = new THREE.Mesh(plateGeo, armorMat);
  plate.position.set(0, 1.15, -0.38);
  group.add(plate);

  // Heart Core Diamond
  const coreGeo = new THREE.OctahedronGeometry(0.18, 0);
  const core = new THREE.Mesh(coreGeo, magentaGlow);
  core.position.set(0, 1.18, -0.46);
  group.add(core);
  accentMeshes.push(core);

  // 2. Sleek Head
  const headGeo = new THREE.SphereGeometry(0.35, 16, 16);
  const head = new THREE.Mesh(headGeo, armorMat);
  head.position.set(0, 1.75, 0);
  head.castShadow = true;
  group.add(head);

  // Slanted Cat-Eye Cyber Visor
  const visorGeo = new THREE.BoxGeometry(0.58, 0.12, 0.28);
  const visor = new THREE.Mesh(visorGeo, magentaGlow);
  visor.position.set(0, 1.76, -0.28);
  group.add(visor);
  accentMeshes.push(visor);

  // Twin Curved Plasma Ponytails / Hair Ribbons
  [-0.32, 0.32].forEach((xSide) => {
    // Ponytail root ring
    const rootGeo = new THREE.TorusGeometry(0.1, 0.04, 8, 16);
    rootGeo.rotateX(Math.PI / 2);
    const root = new THREE.Mesh(rootGeo, armorMat);
    root.position.set(xSide, 1.95, 0.15);
    group.add(root);

    // Segmented flowing ponytail curve
    const strandGeo = new THREE.CylinderGeometry(0.08, 0.02, 1.1, 8);
    strandGeo.rotateZ(xSide > 0 ? -0.25 : 0.25);
    strandGeo.rotateX(-0.35);
    const strand = new THREE.Mesh(strandGeo, magentaGlow);
    strand.position.set(xSide * 1.3, 1.45, 0.45);
    group.add(strand);
    accentMeshes.push(strand);
  });

  // Shoulder Pauldrons
  [-0.6, 0.6].forEach((xSide) => {
    const padGeo = new THREE.SphereGeometry(0.2, 8, 8);
    padGeo.scale(1.2, 0.6, 1.0);
    const pad = new THREE.Mesh(padGeo, armorMat);
    pad.position.set(xSide, 1.35, -0.05);
    group.add(pad);
  });

  // 3. Fists
  const fistGeo = new THREE.SphereGeometry(0.22, 12, 12);
  const fistMat = new THREE.MeshStandardMaterial({ color: 0xec4899, metalness: 0.7, roughness: 0.2 });
  const leftFist = new THREE.Mesh(fistGeo, fistMat);
  const rightFist = new THREE.Mesh(fistGeo, fistMat);
  leftFist.position.set(-0.7, 0.95, -0.28);
  rightFist.position.set(0.7, 0.95, -0.28);
  group.add(leftFist);
  group.add(rightFist);

  // 4. Combat Boots with Thruster Heels
  [-0.28, 0.28].forEach((xPos) => {
    const bootGeo = new THREE.BoxGeometry(0.24, 0.26, 0.48);
    const boot = new THREE.Mesh(bootGeo, armorMat);
    boot.position.set(xPos, 0.16, -0.05);
    group.add(boot);

    const heelGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.12, 12);
    const heel = new THREE.Mesh(heelGeo, violetGlow);
    heel.position.set(xPos, 0.1, 0.18);
    group.add(heel);
    accentMeshes.push(heel);
  });

  return { group, bodyMesh: body, coreMesh: core, fists: [leftFist, rightFist], accentMeshes };
}

// ----------------------------------------------------------------------
// 3. TITAN (Heavy Mech / Cyber Gorilla - Juggernaut)
// ----------------------------------------------------------------------
function createTitanMesh(): CreatedChampion {
  const group = new THREE.Group();
  const accentMeshes: THREE.Mesh[] = [];

  const gunmetalMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.9,
    roughness: 0.3,
  });
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    metalness: 0.85,
    roughness: 0.2,
  });
  const amberGlow = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const redMonoEye = new THREE.MeshBasicMaterial({ color: 0xff0033 });

  // 1. Lower Pelvis & Waist Core
  const pelvisGeo = new THREE.BoxGeometry(0.85, 0.42, 0.62);
  const pelvis = new THREE.Mesh(pelvisGeo, gunmetalMat);
  pelvis.position.set(0, 0.65, 0);
  pelvis.castShadow = true;
  group.add(pelvis);

  // 2. Heavy Upper Chest Torso Slab
  const torsoGeo = new THREE.BoxGeometry(1.25, 0.72, 0.82);
  const body = new THREE.Mesh(torsoGeo, gunmetalMat);
  body.position.set(0, 1.18, 0);
  body.castShadow = true;
  group.add(body);

  // Massive Front Chest Armor Plate
  const chestGeo = new THREE.BoxGeometry(1.05, 0.45, 0.16);
  const chest = new THREE.Mesh(chestGeo, steelMat);
  chest.position.set(0, 1.22, -0.45);
  group.add(chest);

  // Central Amber Turbine Reactor
  const coreGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.1, 16);
  coreGeo.rotateX(Math.PI / 2);
  const core = new THREE.Mesh(coreGeo, amberGlow);
  core.position.set(0, 1.22, -0.54);
  group.add(core);
  accentMeshes.push(core);

  // Industrial Exhaust Stacks / Spine on Back
  [-0.22, 0.22].forEach((xPos) => {
    const pipeGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.65, 12);
    pipeGeo.rotateX(0.2);
    const pipe = new THREE.Mesh(pipeGeo, steelMat);
    pipe.position.set(xPos, 1.45, 0.45);
    group.add(pipe);
  });

  // 3. Chiseled Mech Head & Crimson Mono-Eye Slit
  const neckGeo = new THREE.BoxGeometry(0.68, 0.22, 0.45);
  const neck = new THREE.Mesh(neckGeo, steelMat);
  neck.position.set(0, 1.58, -0.05);
  group.add(neck);

  const headGeo = new THREE.BoxGeometry(0.62, 0.42, 0.52);
  const head = new THREE.Mesh(headGeo, gunmetalMat);
  head.position.set(0, 1.85, -0.05);
  head.castShadow = true;
  group.add(head);

  // Brow shield plate
  const browGeo = new THREE.BoxGeometry(0.64, 0.14, 0.22);
  const brow = new THREE.Mesh(browGeo, steelMat);
  brow.position.set(0, 1.98, -0.25);
  group.add(brow);

  // Recessed Horizontal Crimson Mono-Eye Visor
  const eyeGeo = new THREE.BoxGeometry(0.48, 0.12, 0.12);
  const eye = new THREE.Mesh(eyeGeo, redMonoEye);
  eye.position.set(0, 1.84, -0.32);
  group.add(eye);
  accentMeshes.push(eye);

  // 4. Heavy Shoulder Pauldrons
  [-0.92, 0.92].forEach((xSide) => {
    const pGeo = new THREE.BoxGeometry(0.52, 0.42, 0.65);
    const pauldron = new THREE.Mesh(pGeo, steelMat);
    pauldron.position.set(xSide, 1.42, -0.02);
    group.add(pauldron);

    // Hazard amber trim stripe
    const stripeGeo = new THREE.BoxGeometry(0.55, 0.08, 0.68);
    const stripe = new THREE.Mesh(stripeGeo, amberGlow);
    stripe.position.set(xSide, 1.42, -0.02);
    group.add(stripe);
    accentMeshes.push(stripe);
  });

  // 5. Heavy Piston Knuckles
  const fistGeo = new THREE.BoxGeometry(0.52, 0.48, 0.52);
  const fistMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.2 });
  const leftFist = new THREE.Mesh(fistGeo, fistMat);
  const rightFist = new THREE.Mesh(fistGeo, fistMat);
  leftFist.position.set(-1.05, 0.85, -0.32);
  rightFist.position.set(1.05, 0.85, -0.32);
  group.add(leftFist);
  group.add(rightFist);

  // 6. Heavy Hydraulic Stomp Boots
  [-0.4, 0.4].forEach((xPos) => {
    const bootGeo = new THREE.BoxGeometry(0.42, 0.3, 0.65);
    const boot = new THREE.Mesh(bootGeo, steelMat);
    boot.position.set(xPos, 0.16, -0.05);
    group.add(boot);

    const toeCapGeo = new THREE.BoxGeometry(0.44, 0.12, 0.18);
    const toeCap = new THREE.Mesh(toeCapGeo, amberGlow);
    toeCap.position.set(xPos, 0.1, -0.36);
    group.add(toeCap);
    accentMeshes.push(toeCap);
  });

  return { group, bodyMesh: body, coreMesh: core, fists: [leftFist, rightFist], accentMeshes };
}

// ----------------------------------------------------------------------
// 4. KAGE (Shadow Shinobi / Void Ninja)
// ----------------------------------------------------------------------
function createKageMesh(): CreatedChampion {
  const group = new THREE.Group();
  const accentMeshes: THREE.Mesh[] = [];

  const stealthMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    metalness: 0.6,
    roughness: 0.4,
  });
  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x1f2937,
    metalness: 0.85,
    roughness: 0.25,
  });
  const emeraldGlow = new THREE.MeshBasicMaterial({ color: 0x10b981 });
  const jadeGlow = new THREE.MeshBasicMaterial({ color: 0x059669 });

  // 1. Lean Athletic Torso
  const bodyGeo = new THREE.CapsuleGeometry(0.44, 0.55, 8, 16);
  const body = new THREE.Mesh(bodyGeo, stealthMat);
  body.position.y = 0.88;
  body.castShadow = true;
  group.add(body);

  // Carbon Scale Chest Vest
  const vestGeo = new THREE.BoxGeometry(0.62, 0.45, 0.22);
  const vest = new THREE.Mesh(vestGeo, carbonMat);
  vest.position.set(0, 0.98, -0.36);
  group.add(vest);

  // Glowing Jade Core Inscription
  const coreGeo = new THREE.RingGeometry(0.08, 0.18, 6);
  const core = new THREE.Mesh(coreGeo, emeraldGlow);
  core.position.set(0, 0.98, -0.48);
  group.add(core);
  accentMeshes.push(core);

  // 2. Ninja Cowl / Hood & Face Mask
  const hoodGeo = new THREE.ConeGeometry(0.48, 0.58, 6);
  hoodGeo.rotateX(0.12);
  const hood = new THREE.Mesh(hoodGeo, stealthMat);
  hood.position.set(0, 1.95, -0.02);
  group.add(hood);

  // Faceless Obsidian Mask
  const maskGeo = new THREE.BoxGeometry(0.46, 0.38, 0.32);
  const mask = new THREE.Mesh(maskGeo, carbonMat);
  mask.position.set(0, 1.68, -0.15);
  group.add(mask);

  // Twin Angled Emerald Ninja Eye Slits
  [-0.13, 0.13].forEach((xPos) => {
    const eyeGeo = new THREE.BoxGeometry(0.16, 0.06, 0.1);
    eyeGeo.rotateZ(xPos > 0 ? -0.25 : 0.25);
    const eye = new THREE.Mesh(eyeGeo, emeraldGlow);
    eye.position.set(xPos, 1.72, -0.34);
    group.add(eye);
    accentMeshes.push(eye);
  });

  // Carbon Forehead Protector Metal Plate
  const plateGeo = new THREE.BoxGeometry(0.38, 0.08, 0.1);
  const plate = new THREE.Mesh(plateGeo, stealthMat);
  plate.position.set(0, 1.84, -0.32);
  group.add(plate);

  // 3. Trailing Dual Cyber-Scarf Ribbons on Back
  [-0.15, 0.15].forEach((xPos) => {
    const scarfGeo = new THREE.PlaneGeometry(0.18, 1.2);
    scarfGeo.rotateX(0.25);
    const scarf = new THREE.Mesh(scarfGeo, emeraldGlow);
    scarf.position.set(xPos, 1.1, 0.42);
    (scarf.material as THREE.Material).side = THREE.DoubleSide;
    group.add(scarf);
    accentMeshes.push(scarf);
  });

  // 4. Vambrace Gauntlets
  const fistGeo = new THREE.SphereGeometry(0.24, 12, 12);
  const fistMat = new THREE.MeshStandardMaterial({ color: 0x059669, metalness: 0.8, roughness: 0.2 });
  const leftFist = new THREE.Mesh(fistGeo, fistMat);
  const rightFist = new THREE.Mesh(fistGeo, fistMat);
  leftFist.position.set(-0.72, 0.95, -0.28);
  rightFist.position.set(0.72, 0.95, -0.28);
  group.add(leftFist);
  group.add(rightFist);

  // 5. Tabi Ninja Boots
  [-0.28, 0.28].forEach((xPos) => {
    const bootGeo = new THREE.BoxGeometry(0.24, 0.22, 0.46);
    const boot = new THREE.Mesh(bootGeo, carbonMat);
    boot.position.set(xPos, 0.14, -0.05);
    group.add(boot);

    const edgeGlow = new THREE.BoxGeometry(0.26, 0.04, 0.48);
    const edge = new THREE.Mesh(edgeGlow, jadeGlow);
    edge.position.set(xPos, 0.03, -0.05);
    group.add(edge);
    accentMeshes.push(edge);
  });

  return { group, bodyMesh: body, coreMesh: core, fists: [leftFist, rightFist], accentMeshes };
}

// ----------------------------------------------------------------------
// 5. BOLT (Robo-Fox / Cyber Animal Beast)
// ----------------------------------------------------------------------
function createBoltMesh(): CreatedChampion {
  const group = new THREE.Group();
  const accentMeshes: THREE.Mesh[] = [];

  const orangeMat = new THREE.MeshStandardMaterial({
    color: 0xea580c,
    metalness: 0.7,
    roughness: 0.25,
  });
  const whitePlateMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    metalness: 0.85,
    roughness: 0.15,
  });
  const goldGlow = new THREE.MeshBasicMaterial({ color: 0xeab308 });
  const cyanEyeGlow = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

  // 1. Compact Aerodynamic Chassis
  const bodyGeo = new THREE.CapsuleGeometry(0.44, 0.55, 8, 16);
  const body = new THREE.Mesh(bodyGeo, orangeMat);
  body.position.y = 0.88;
  body.castShadow = true;
  group.add(body);

  // White Chestplate Plastron
  const chestGeo = new THREE.BoxGeometry(0.6, 0.44, 0.2);
  const chest = new THREE.Mesh(chestGeo, whitePlateMat);
  chest.position.set(0, 0.98, -0.36);
  group.add(chest);

  // Gold Core Reactor
  const coreGeo = new THREE.SphereGeometry(0.16, 12, 12);
  const core = new THREE.Mesh(coreGeo, goldGlow);
  core.position.set(0, 0.98, -0.47);
  group.add(core);
  accentMeshes.push(core);

  // 2. Fox Head & Pointed Cyber-Ears
  const headGeo = new THREE.SphereGeometry(0.38, 16, 16);
  const head = new THREE.Mesh(headGeo, orangeMat);
  head.position.set(0, 1.62, 0);
  head.castShadow = true;
  group.add(head);

  // Fox Snout / Muzzle
  const muzzleGeo = new THREE.ConeGeometry(0.22, 0.36, 4);
  muzzleGeo.rotateX(-Math.PI / 2);
  muzzleGeo.rotateZ(Math.PI / 4);
  const muzzle = new THREE.Mesh(muzzleGeo, whitePlateMat);
  muzzle.position.set(0, 1.55, -0.42);
  group.add(muzzle);

  // Nose tip
  const noseGeo = new THREE.SphereGeometry(0.06, 8, 8);
  const noseMat = new THREE.MeshBasicMaterial({ color: 0x18181b });
  const nose = new THREE.Mesh(noseGeo, noseMat);
  nose.position.set(0, 1.58, -0.62);
  group.add(nose);

  // Expressive LED Visor Eyes
  [-0.18, 0.18].forEach((xPos) => {
    const eyeGeo = new THREE.BoxGeometry(0.14, 0.08, 0.08);
    eyeGeo.rotateZ(xPos > 0 ? -0.2 : 0.2);
    const eye = new THREE.Mesh(eyeGeo, cyanEyeGlow);
    eye.position.set(xPos, 1.72, -0.34);
    group.add(eye);
    accentMeshes.push(eye);
  });

  // Pointed Cyber-Ears with Inner Glow
  [-0.32, 0.32].forEach((xSide) => {
    const earGeo = new THREE.ConeGeometry(0.2, 0.45, 3);
    earGeo.rotateZ(xSide > 0 ? -0.35 : 0.35);
    earGeo.rotateY(Math.PI / 2);
    const ear = new THREE.Mesh(earGeo, orangeMat);
    ear.position.set(xSide, 2.05, -0.05);
    group.add(ear);

    // Inner glowing ear panel
    const innerEarGeo = new THREE.ConeGeometry(0.12, 0.32, 3);
    innerEarGeo.rotateZ(xSide > 0 ? -0.35 : 0.35);
    innerEarGeo.rotateY(Math.PI / 2);
    const inner = new THREE.Mesh(innerEarGeo, goldGlow);
    inner.position.set(xSide, 2.04, -0.09);
    group.add(inner);
    accentMeshes.push(inner);
  });

  // 3. Segmented Robotic Fox Tail
  const tailGroup = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const segGeo = new THREE.SphereGeometry(0.16 - i * 0.02, 10, 10);
    const seg = new THREE.Mesh(segGeo, i === 3 ? goldGlow : orangeMat);
    seg.position.set(0, 0.2 + i * 0.22, 0.25 + i * 0.22);
    tailGroup.add(seg);
    if (i === 3) accentMeshes.push(seg);
  }
  tailGroup.position.set(0, 0.65, 0.2);
  group.add(tailGroup);

  // 4. Claws / Paws
  const fistGeo = new THREE.SphereGeometry(0.24, 12, 12);
  const fistMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7, roughness: 0.2 });
  const leftFist = new THREE.Mesh(fistGeo, fistMat);
  const rightFist = new THREE.Mesh(fistGeo, fistMat);
  leftFist.position.set(-0.7, 0.88, -0.28);
  rightFist.position.set(0.7, 0.88, -0.28);
  group.add(leftFist);
  group.add(rightFist);

  // 5. Paw Boots
  [-0.28, 0.28].forEach((xPos) => {
    const bootGeo = new THREE.BoxGeometry(0.24, 0.2, 0.42);
    const boot = new THREE.Mesh(bootGeo, whitePlateMat);
    boot.position.set(xPos, 0.14, -0.05);
    group.add(boot);

    const padGeo = new THREE.BoxGeometry(0.26, 0.05, 0.44);
    const pad = new THREE.Mesh(padGeo, goldGlow);
    pad.position.set(xPos, 0.03, -0.05);
    group.add(pad);
    accentMeshes.push(pad);
  });

  return { group, bodyMesh: body, coreMesh: core, fists: [leftFist, rightFist], accentMeshes };
}
