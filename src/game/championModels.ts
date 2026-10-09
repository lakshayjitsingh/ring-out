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
    archetype: 'Human Brawler',
    chapter: 'Chapter 1: Emerald Isles',
    color: '#10b981',
    glowColor: 0x10b981,
    tagline: 'Backwards cap, island scout vest, confident smile.',
    description: 'An adventurous human brawler from the coastal shores. Armed with quick reflexes, a golden compass medallion, and punchy skate kicks.',
  },
  kai: {
    id: 'kai',
    name: 'Kai',
    title: 'Neon Vanguard',
    archetype: 'Cyber Striker',
    chapter: 'Original Fighter',
    color: '#00f5ff',
    glowColor: 0x00f5ff,
    tagline: 'Precision timing, street style, unstoppable momentum.',
    description: 'Armed with high-frequency kinetic headphones and a reactive cyber-jacket, Kai commands the center ring with sharp reflexes.',
  },
  nova: {
    id: 'nova',
    name: 'Nova',
    title: 'Plasma Valkyrie',
    archetype: 'Agile Duelist',
    chapter: 'Orbital Arena',
    color: '#f43f5e',
    glowColor: 0xf43f5e,
    tagline: 'Twin plasma antennae. Razor-sharp ring recovery.',
    description: 'A champion from the neon orbital circuit. Her high-voltage magenta conduits and lightweight alloy suit make her dashes lethal.',
  },
  titan: {
    id: 'titan',
    name: 'Titan (Gorr)',
    title: 'Heavy Juggernaut',
    archetype: 'Iron Juggernaut',
    chapter: 'Industrial Works',
    color: '#f59e0b',
    glowColor: 0xf59e0b,
    tagline: 'Heavy hydraulic pistons. Shakes the floor on impact.',
    description: 'Reinforced industrial mech built for pure ring dominance. Broad hazard-striped pauldrons and giant iron knuckles blast foes off the perimeter.',
  },
  kage: {
    id: 'kage',
    name: 'Kage',
    title: 'Shadow Shinobi',
    archetype: 'Void Assassin',
    chapter: 'Night Shallows',
    color: '#10b981',
    glowColor: 0x10b981,
    tagline: 'Obsidian stealth hood with glowing emerald optics.',
    description: 'Silent fighter cloaked in carbon-fiber scale armor and trailing cyber-scarf ribbons. Moves like a phantom across the boundary.',
  },
  bolt: {
    id: 'bolt',
    name: 'Bolt',
    title: 'Cyber Robo-Fox',
    archetype: 'Beast Scout',
    chapter: 'Solar Outpost',
    color: '#eab308',
    glowColor: 0xeab308,
    tagline: 'Pointed radar ears, digital LED eyes, blazing tail core.',
    description: 'A fierce mechanical animal brawler equipped with high-torque claw thrusters and an expressive holographic visor.',
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
    case 'leo':
      return createLeoMesh();
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
// 0. LEO (Stylized Human Brawler - Island Scout, Chapter 1)
// ----------------------------------------------------------------------
function createLeoMesh(): CreatedChampion {
  const group = new THREE.Group();
  const accentMeshes: THREE.Mesh[] = [];

  // PBR Stylized Materials
  // Warm natural cartoon skin tone
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xf5cba7,
    roughness: 0.55,
    metalness: 0.05,
  });

  // Chestnut / caramel hair tone
  const hairMat = new THREE.MeshStandardMaterial({
    color: 0x5c3a21,
    roughness: 0.7,
    metalness: 0.0,
  });

  // Emerald Island Scout Vest & Cap fabric
  const emeraldMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    roughness: 0.4,
    metalness: 0.1,
  });

  // Deep forest green accent trim
  const forestMat = new THREE.MeshStandardMaterial({
    color: 0x064e3b,
    roughness: 0.45,
    metalness: 0.1,
  });

  // Clean white tee & sneaker rubber
  const whiteClothMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.6,
    metalness: 0.05,
  });

  // Indigo denim jeans
  const denimMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a,
    roughness: 0.75,
    metalness: 0.05,
  });

  // Warm leather brown (belt & utility pouches)
  const leatherMat = new THREE.MeshStandardMaterial({
    color: 0x78350f,
    roughness: 0.6,
    metalness: 0.1,
  });

  // Polished golden brass (belt buckle, compass medallion, cap pin)
  const goldBrassMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    metalness: 0.85,
    roughness: 0.2,
  });

  // Emissive compass core & sneaker glow trims
  const goldGlowMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const emeraldGlowMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });

  // Cartoon Eye Materials
  const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const eyeIrisMat = new THREE.MeshBasicMaterial({ color: 0x0f172a }); // Dark anime iris
  const eyeShineMat = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Specular catchlight
  const mouthMat = new THREE.MeshBasicMaterial({ color: 0x881337 }); // Deep rose mouth

  // 1. Pelvis, Belt, and Rolled Denim Jeans
  const pelvisGeo = new THREE.BoxGeometry(0.72, 0.32, 0.52);
  const pelvis = new THREE.Mesh(pelvisGeo, denimMat);
  pelvis.position.set(0, 0.72, 0);
  pelvis.castShadow = true;
  group.add(pelvis);

  // Leather belt around waist
  const beltGeo = new THREE.BoxGeometry(0.76, 0.09, 0.55);
  const belt = new THREE.Mesh(beltGeo, leatherMat);
  belt.position.set(0, 0.86, 0);
  group.add(belt);

  // Big cartoon golden belt buckle
  const buckleGeo = new THREE.BoxGeometry(0.18, 0.12, 0.06);
  const buckle = new THREE.Mesh(buckleGeo, goldBrassMat);
  buckle.position.set(0, 0.86, -0.28);
  group.add(buckle);

  // Hip utility pouches (left & right)
  [-0.4, 0.4].forEach((xSide) => {
    const pouchGeo = new THREE.BoxGeometry(0.12, 0.15, 0.18);
    const pouch = new THREE.Mesh(pouchGeo, leatherMat);
    pouch.position.set(xSide, 0.82, 0);
    group.add(pouch);
  });

  // Twin denim legs
  [-0.2, 0.2].forEach((xPos) => {
    const legGeo = new THREE.CylinderGeometry(0.15, 0.13, 0.46, 14);
    const leg = new THREE.Mesh(legGeo, denimMat);
    leg.position.set(xPos, 0.48, 0);
    leg.castShadow = true;
    group.add(leg);

    // Light rolled-up denim jean cuffs
    const cuffGeo = new THREE.TorusGeometry(0.14, 0.035, 8, 16);
    cuffGeo.rotateX(Math.PI / 2);
    const cuff = new THREE.Mesh(cuffGeo, whiteClothMat);
    cuff.position.set(xPos, 0.28, 0);
    group.add(cuff);

    // Bare ankles
    const ankleGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 12);
    const ankle = new THREE.Mesh(ankleGeo, skinMat);
    ankle.position.set(xPos, 0.22, 0);
    group.add(ankle);

    // Chunky Cartoon Skate Sneakers (Brawl Stars style)
    const shoeUpperGeo = new THREE.BoxGeometry(0.24, 0.18, 0.42);
    const shoeUpper = new THREE.Mesh(shoeUpperGeo, emeraldMat);
    shoeUpper.position.set(xPos, 0.14, -0.06);
    group.add(shoeUpper);

    // White rubber toe cap
    const toeCapGeo = new THREE.SphereGeometry(0.13, 10, 10);
    toeCapGeo.scale(1.0, 0.7, 0.9);
    const toeCap = new THREE.Mesh(toeCapGeo, whiteClothMat);
    toeCap.position.set(xPos, 0.1, -0.23);
    group.add(toeCap);

    // Thick white rubber skate sole
    const soleGeo = new THREE.BoxGeometry(0.26, 0.08, 0.48);
    const sole = new THREE.Mesh(soleGeo, whiteClothMat);
    sole.position.set(xPos, 0.04, -0.06);
    group.add(sole);

    // Glowing green heel stripe
    const heelStripeGeo = new THREE.BoxGeometry(0.18, 0.04, 0.05);
    const heelStripe = new THREE.Mesh(heelStripeGeo, emeraldGlowMat);
    heelStripe.position.set(xPos, 0.12, 0.16);
    group.add(heelStripe);
    accentMeshes.push(heelStripe);
  });

  // 2. Torso: White Athletic Tee & Open Island Scout Vest
  const innerShirtGeo = new THREE.CapsuleGeometry(0.38, 0.48, 8, 16);
  const innerShirt = new THREE.Mesh(innerShirtGeo, whiteClothMat);
  innerShirt.position.set(0, 1.15, 0);
  innerShirt.castShadow = true;
  group.add(innerShirt);

  // Left & right open vest panels
  [-0.22, 0.22].forEach((xSide) => {
    const vestPanelGeo = new THREE.BoxGeometry(0.26, 0.62, 0.36);
    const vestPanel = new THREE.Mesh(vestPanelGeo, emeraldMat);
    vestPanel.position.set(xSide, 1.16, -0.16);
    group.add(vestPanel);

    // Forest green vest pocket trim
    const pocketGeo = new THREE.BoxGeometry(0.16, 0.12, 0.05);
    const pocket = new THREE.Mesh(pocketGeo, forestMat);
    pocket.position.set(xSide, 1.05, -0.34);
    group.add(pocket);
  });

  // Vest high back and collar
  const vestBackGeo = new THREE.BoxGeometry(0.72, 0.62, 0.2);
  const vestBack = new THREE.Mesh(vestBackGeo, emeraldMat);
  vestBack.position.set(0, 1.16, 0.22);
  group.add(vestBack);

  const collarGeo = new THREE.CylinderGeometry(0.26, 0.28, 0.14, 16, 1, true);
  const collar = new THREE.Mesh(collarGeo, forestMat);
  collar.position.set(0, 1.48, -0.02);
  group.add(collar);

  // Chest Island Compass Medallion Core
  const coreGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.06, 16);
  coreGeo.rotateX(Math.PI / 2);
  const core = new THREE.Mesh(coreGeo, goldBrassMat);
  core.position.set(0, 1.25, -0.4);
  group.add(core);

  // Glowing center star of the compass
  const starGeo = new THREE.RingGeometry(0.03, 0.08, 4);
  const star = new THREE.Mesh(starGeo, goldGlowMat);
  star.position.set(0, 1.25, -0.44);
  group.add(star);
  accentMeshes.push(star);

  // 3. Human Neck & Stylized Head
  const neckGeo = new THREE.CylinderGeometry(0.14, 0.15, 0.16, 12);
  const neck = new THREE.Mesh(neckGeo, skinMat);
  neck.position.set(0, 1.52, 0);
  group.add(neck);

  const headGeo = new THREE.SphereGeometry(0.38, 20, 20);
  headGeo.scale(1.0, 1.04, 0.96);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.set(0, 1.84, -0.02);
  head.castShadow = true;
  group.add(head);

  // Cute cartoon ears
  [-0.38, 0.38].forEach((xSide) => {
    const earGeo = new THREE.SphereGeometry(0.08, 8, 8);
    earGeo.scale(0.5, 1.0, 0.8);
    const ear = new THREE.Mesh(earGeo, skinMat);
    ear.position.set(xSide, 1.82, -0.02);
    group.add(ear);
  });

  // 4. Stylized Cartoon Face Features (Brawl Stars Style)
  // Eyes (Left & Right)
  [-0.14, 0.14].forEach((xPos) => {
    // Sclera (White eye background)
    const scleraGeo = new THREE.SphereGeometry(0.09, 12, 12);
    scleraGeo.scale(1.0, 1.25, 0.3);
    const sclera = new THREE.Mesh(scleraGeo, eyeWhiteMat);
    sclera.position.set(xPos, 1.85, -0.38);
    group.add(sclera);

    // Dark Cartoon Pupil / Iris
    const irisGeo = new THREE.SphereGeometry(0.065, 10, 10);
    irisGeo.scale(0.9, 1.1, 0.25);
    const iris = new THREE.Mesh(irisGeo, eyeIrisMat);
    iris.position.set(xPos + (xPos > 0 ? -0.015 : 0.015), 1.84, -0.4);
    group.add(iris);

    // Sparkly Specular Catchlight Highlight
    const shineGeo = new THREE.SphereGeometry(0.022, 6, 6);
    const shine = new THREE.Mesh(shineGeo, eyeShineMat);
    shine.position.set(xPos - 0.02, 1.88, -0.41);
    group.add(shine);

    // Expressive Eyebrows
    const browGeo = new THREE.BoxGeometry(0.14, 0.045, 0.06);
    browGeo.rotateZ(xPos > 0 ? -0.15 : 0.15);
    const brow = new THREE.Mesh(browGeo, hairMat);
    brow.position.set(xPos, 1.97, -0.36);
    group.add(brow);
  });

  // Cute Cartoon Nose
  const noseGeo = new THREE.SphereGeometry(0.045, 8, 8);
  noseGeo.scale(1.0, 0.7, 0.9);
  const nose = new THREE.Mesh(noseGeo, skinMat);
  nose.position.set(0, 1.77, -0.4);
  group.add(nose);

  // Confident Smirk / Smile
  const smileGeo = new THREE.TorusGeometry(0.08, 0.02, 6, 12, Math.PI * 0.75);
  smileGeo.rotateX(0.2);
  smileGeo.rotateZ(-Math.PI * 0.85);
  const smile = new THREE.Mesh(smileGeo, mouthMat);
  smile.position.set(0.02, 1.70, -0.38);
  group.add(smile);

  // 5. Hair & Backwards Snapback Cap
  // Spiky bangs sticking out from under the cap
  [-0.18, -0.05, 0.1, 0.22].forEach((xPos, idx) => {
    const bangGeo = new THREE.ConeGeometry(0.07, 0.22, 5);
    bangGeo.rotateX(0.4);
    bangGeo.rotateZ((idx - 1.5) * 0.2);
    const bang = new THREE.Mesh(bangGeo, hairMat);
    bang.position.set(xPos, 2.0, -0.34);
    group.add(bang);
  });

  // Sideburns
  [-0.34, 0.34].forEach((xSide) => {
    const sideburnGeo = new THREE.BoxGeometry(0.06, 0.18, 0.12);
    const sideburn = new THREE.Mesh(sideburnGeo, hairMat);
    sideburn.position.set(xSide, 1.82, -0.15);
    group.add(sideburn);
  });

  // Backwards Snapback Cap Dome
  const capDomeGeo = new THREE.SphereGeometry(0.41, 18, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
  const capDome = new THREE.Mesh(capDomeGeo, emeraldMat);
  capDome.position.set(0, 1.89, -0.01);
  group.add(capDome);

  // Golden button on top of cap
  const capButtonGeo = new THREE.SphereGeometry(0.05, 8, 8);
  const capButton = new THREE.Mesh(capButtonGeo, goldBrassMat);
  capButton.position.set(0, 2.19, -0.01);
  group.add(capButton);

  // White front panel patch with golden island compass badge
  const patchGeo = new THREE.BoxGeometry(0.26, 0.16, 0.05);
  patchGeo.rotateX(-0.2);
  const patch = new THREE.Mesh(patchGeo, whiteClothMat);
  patch.position.set(0, 2.06, -0.33);
  group.add(patch);

  const emblemGeo = new THREE.SphereGeometry(0.04, 8, 8);
  const emblem = new THREE.Mesh(emblemGeo, goldBrassMat);
  emblem.position.set(0, 2.06, -0.36);
  group.add(emblem);

  // Backwards Snapback Visor / Brim sticking out backward
  const brimGeo = new THREE.BoxGeometry(0.38, 0.04, 0.28);
  brimGeo.rotateX(0.15);
  const brim = new THREE.Mesh(brimGeo, forestMat);
  brim.position.set(0, 1.95, 0.38);
  group.add(brim);

  // 6. Arms & Chunky Brawler Hands / Gloves
  [-0.62, 0.62].forEach((xSide) => {
    // Shoulder (vest sleeve)
    const shoulderGeo = new THREE.SphereGeometry(0.16, 10, 10);
    const shoulder = new THREE.Mesh(shoulderGeo, emeraldMat);
    shoulder.position.set(xSide, 1.28, -0.05);
    group.add(shoulder);

    // Bare Arm
    const armGeo = new THREE.CylinderGeometry(0.11, 0.1, 0.32, 10);
    const arm = new THREE.Mesh(armGeo, skinMat);
    arm.position.set(xSide, 1.08, -0.1);
    group.add(arm);

    // Athletic wrist sweatband
    const sweatbandGeo = new THREE.TorusGeometry(0.11, 0.03, 8, 14);
    sweatbandGeo.rotateX(Math.PI / 2);
    const sweatband = new THREE.Mesh(sweatbandGeo, forestMat);
    sweatband.position.set(xSide, 0.94, -0.14);
    group.add(sweatband);
  });

  // Stylized Brawler Fists with Fingerless Gloves
  const fistGeo = new THREE.SphereGeometry(0.22, 14, 14);
  const gloveMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.5,
    metalness: 0.1,
  });
  const leftFist = new THREE.Mesh(fistGeo, gloveMat);
  const rightFist = new THREE.Mesh(fistGeo, gloveMat);
  leftFist.position.set(-0.72, 0.88, -0.26);
  rightFist.position.set(0.72, 0.88, -0.26);
  leftFist.castShadow = true;
  rightFist.castShadow = true;
  group.add(leftFist);
  group.add(rightFist);

  // Knuckle accent plates
  [-0.72, 0.72].forEach((xPos) => {
    const knuckleGeo = new THREE.BoxGeometry(0.18, 0.08, 0.1);
    const knuckle = new THREE.Mesh(knuckleGeo, goldBrassMat);
    knuckle.position.set(xPos, 0.92, -0.34);
    group.add(knuckle);
  });

  return {
    group,
    bodyMesh: innerShirt,
    coreMesh: core,
    fists: [leftFist, rightFist],
    accentMeshes,
  };
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
