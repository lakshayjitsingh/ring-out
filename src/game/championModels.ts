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

  // PBR Stylized Materials with High-End Game Finishes
  // Warm sun-kissed anime/Brawl Stars brawler skin tone
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xf5bf94,
    roughness: 0.60,
    metalness: 0.02,
  });

  // Rich chestnut brown hair & eyebrows
  const hairMat = new THREE.MeshStandardMaterial({
    color: 0x432410,
    roughness: 0.70,
    metalness: 0.0,
  });

  // Emerald Island Scout Vest & Cap twill
  const vestMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    roughness: 0.42,
    metalness: 0.08,
  });

  // Deep forest green canvas (visor, collar, trims)
  const vestDarkMat = new THREE.MeshStandardMaterial({
    color: 0x065f46,
    roughness: 0.50,
    metalness: 0.08,
  });

  // Crisp white cotton tee, cap patch & sneaker rubber
  const whiteClothMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.65,
    metalness: 0.03,
  });

  // Deep indigo denim jeans
  const denimMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a,
    roughness: 0.76,
    metalness: 0.04,
  });

  // Weathered saddle brown leather (belt & hip pouches)
  const leatherMat = new THREE.MeshStandardMaterial({
    color: 0x78350f,
    roughness: 0.52,
    metalness: 0.10,
  });

  // Polished golden brass (buckle, compass medallion, cap button)
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    metalness: 0.90,
    roughness: 0.20,
  });

  // Emissive glows for accents
  const goldGlowMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const emeraldGlowMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });

  // Stylized Face & Eye Materials
  const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const eyeIrisMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 }); // Radiant ocean azure
  const eyePupilMat = new THREE.MeshBasicMaterial({ color: 0x0f172a }); // Deep black pupil
  const eyeShineMat = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Crisp catchlight
  const mouthMat = new THREE.MeshBasicMaterial({ color: 0x881337 }); // Mouth interior
  const teethMat = new THREE.MeshBasicMaterial({ color: 0xffffff }); // White smile
  const gloveMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.55,
    metalness: 0.10,
  });
  const soleDarkMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.80,
  });

  // ====================================================================
  // 1. PELVIS, LEATHER BELT & HIP ADVENTURE POUCHES
  // ====================================================================
  const pelvisGeo = new THREE.BoxGeometry(0.64, 0.24, 0.40);
  const pelvis = new THREE.Mesh(pelvisGeo, denimMat);
  pelvis.position.set(0, 0.74, 0);
  pelvis.castShadow = true;
  group.add(pelvis);

  // Denim waistband with belt loops
  const waistbandGeo = new THREE.BoxGeometry(0.68, 0.08, 0.42);
  const waistband = new THREE.Mesh(waistbandGeo, denimMat);
  waistband.position.set(0, 0.86, 0);
  group.add(waistband);

  // Saddle brown leather belt
  const beltGeo = new THREE.BoxGeometry(0.70, 0.06, 0.44);
  const belt = new THREE.Mesh(beltGeo, leatherMat);
  belt.position.set(0, 0.86, 0);
  group.add(belt);

  // Golden belt buckle
  const buckleGeo = new THREE.BoxGeometry(0.16, 0.09, 0.05);
  const buckle = new THREE.Mesh(buckleGeo, goldMat);
  buckle.position.set(0, 0.86, -0.23);
  group.add(buckle);

  // Belt prong & tip
  const tongueGeo = new THREE.BoxGeometry(0.10, 0.04, 0.04);
  const tongue = new THREE.Mesh(tongueGeo, leatherMat);
  tongue.position.set(0.12, 0.86, -0.23);
  group.add(tongue);

  // Dual adventure utility hip pouches
  [-0.36, 0.36].forEach((xSide) => {
    const pouchGeo = new THREE.BoxGeometry(0.12, 0.15, 0.16);
    const pouch = new THREE.Mesh(pouchGeo, leatherMat);
    pouch.position.set(xSide, 0.78, 0.02);
    group.add(pouch);

    const snapGeo = new THREE.SphereGeometry(0.018, 6, 6);
    const snap = new THREE.Mesh(snapGeo, goldMat);
    snap.position.set(xSide > 0 ? xSide + 0.06 : xSide - 0.06, 0.78, 0.02);
    group.add(snap);
  });

  // ====================================================================
  // 2. DENIM LEGS & SKATE HIGH-TOPS (Straight, Perfectly Vertical Stance)
  // ====================================================================
  [-0.18, 0.18].forEach((xPos) => {
    const legGroup = new THREE.Group();
    legGroup.position.set(xPos, 0, 0);
    // 100% straight vertical alignment
    group.add(legGroup);

    // Thigh with clean vertical taper
    const thighGeo = new THREE.CylinderGeometry(0.13, 0.12, 0.32, 16);
    const thigh = new THREE.Mesh(thighGeo, denimMat);
    thigh.position.set(0, 0.56, 0);
    thigh.castShadow = true;
    legGroup.add(thigh);

    // Knee articulation
    const kneeGeo = new THREE.BoxGeometry(0.20, 0.08, 0.22);
    const knee = new THREE.Mesh(kneeGeo, denimMat);
    knee.position.set(0, 0.40, 0);
    legGroup.add(knee);

    // Straight calf
    const calfGeo = new THREE.CylinderGeometry(0.12, 0.11, 0.22, 16);
    const calf = new THREE.Mesh(calfGeo, denimMat);
    calf.position.set(0, 0.28, 0);
    calf.castShadow = true;
    legGroup.add(calf);

    // Rolled-up cream denim cuffs
    const cuffGeo = new THREE.TorusGeometry(0.115, 0.03, 8, 16);
    cuffGeo.rotateX(Math.PI / 2);
    const cuff = new THREE.Mesh(cuffGeo, whiteClothMat);
    cuff.position.set(0, 0.18, 0);
    legGroup.add(cuff);

    // Bare athletic ankles
    const ankleGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.08, 12);
    const ankle = new THREE.Mesh(ankleGeo, skinMat);
    ankle.position.set(0, 0.14, 0);
    legGroup.add(ankle);

    // High-Top Skate Sneakers (Straight forward)
    const footGroup = new THREE.Group();
    footGroup.position.set(0, 0, 0);
    legGroup.add(footGroup);

    // Sneaker collar
    const collarShoeGeo = new THREE.BoxGeometry(0.19, 0.15, 0.24);
    const collarShoe = new THREE.Mesh(collarShoeGeo, vestMat);
    collarShoe.position.set(0, 0.14, 0.03);
    footGroup.add(collarShoe);

    // Shoe tongue with white patch
    const shoeTongueGeo = new THREE.BoxGeometry(0.11, 0.14, 0.04);
    shoeTongueGeo.rotateX(-0.15);
    const shoeTongue = new THREE.Mesh(shoeTongueGeo, vestDarkMat);
    shoeTongue.position.set(0, 0.16, -0.07);
    footGroup.add(shoeTongue);

    const tonguePatchGeo = new THREE.BoxGeometry(0.07, 0.045, 0.02);
    const tonguePatch = new THREE.Mesh(tonguePatchGeo, whiteClothMat);
    tonguePatch.position.set(0, 0.20, -0.08);
    footGroup.add(tonguePatch);

    // Shoe body
    const shoeBodyGeo = new THREE.BoxGeometry(0.21, 0.12, 0.36);
    const shoeBody = new THREE.Mesh(shoeBodyGeo, vestMat);
    shoeBody.position.set(0, 0.09, -0.05);
    footGroup.add(shoeBody);

    // Rubber toe bumper
    const toeCapGeo = new THREE.SphereGeometry(0.105, 12, 12);
    toeCapGeo.scale(1.0, 0.65, 0.85);
    const toeCap = new THREE.Mesh(toeCapGeo, whiteClothMat);
    toeCap.position.set(0, 0.08, -0.20);
    footGroup.add(toeCap);

    // White shoe laces
    [-0.03, 0.01, 0.05].forEach((zOff, i) => {
      const laceGeo = new THREE.BoxGeometry(0.11 - i * 0.015, 0.02, 0.025);
      const lace = new THREE.Mesh(laceGeo, whiteClothMat);
      lace.position.set(0, 0.135 - i * 0.018, -0.04 + zOff);
      footGroup.add(lace);
    });

    // Side racing swoosh
    [-0.11, 0.11].forEach((xSide) => {
      const stripeGeo = new THREE.BoxGeometry(0.018, 0.045, 0.18);
      const stripe = new THREE.Mesh(stripeGeo, whiteClothMat);
      stripe.position.set(xSide, 0.09, 0.02);
      footGroup.add(stripe);
    });

    // White rubber midsole
    const midsoleGeo = new THREE.BoxGeometry(0.23, 0.055, 0.42);
    const midsole = new THREE.Mesh(midsoleGeo, whiteClothMat);
    midsole.position.set(0, 0.035, -0.05);
    footGroup.add(midsole);

    // Dark rubber bottom outsole
    const outsoleGeo = new THREE.BoxGeometry(0.23, 0.018, 0.42);
    const outsole = new THREE.Mesh(outsoleGeo, soleDarkMat);
    outsole.position.set(0, 0.01, -0.05);
    footGroup.add(outsole);

    // Glowing green heel reflector
    const heelReflectorGeo = new THREE.BoxGeometry(0.12, 0.035, 0.025);
    const heelReflector = new THREE.Mesh(heelReflectorGeo, emeraldGlowMat);
    heelReflector.position.set(0, 0.085, 0.155);
    footGroup.add(heelReflector);
    accentMeshes.push(heelReflector);
  });

  // ====================================================================
  // 3. ATHLETIC TORSO & ALL-AROUND EMERALD VEST (No White Side Boxes!)
  // ====================================================================
  // Inner white cotton tee (narrowed so it only shows through front opening)
  const chestGeo = new THREE.BoxGeometry(0.50, 0.38, 0.32);
  const chest = new THREE.Mesh(chestGeo, whiteClothMat);
  chest.position.set(0, 1.20, -0.02);
  chest.castShadow = true;
  group.add(chest);

  const waistGeo = new THREE.BoxGeometry(0.48, 0.22, 0.30);
  const waist = new THREE.Mesh(waistGeo, whiteClothMat);
  waist.position.set(0, 0.98, -0.02);
  group.add(waist);

  // White crewneck collar
  const crewneckGeo = new THREE.TorusGeometry(0.14, 0.026, 8, 16);
  crewneckGeo.rotateX(Math.PI / 2);
  const crewneck = new THREE.Mesh(crewneckGeo, whiteClothMat);
  crewneck.position.set(0, 1.40, -0.02);
  group.add(crewneck);

  // Emerald Vest: Back panel (Green)
  const vestBackGeo = new THREE.BoxGeometry(0.66, 0.50, 0.16);
  const vestBack = new THREE.Mesh(vestBackGeo, vestMat);
  vestBack.position.set(0, 1.16, 0.12);
  group.add(vestBack);

  // Emerald Vest: Left & Right Side Wrap Panels (100% Green on Flanks!)
  [-0.32, 0.32].forEach((xSide) => {
    const sidePanelGeo = new THREE.BoxGeometry(0.06, 0.50, 0.38);
    const sidePanel = new THREE.Mesh(sidePanelGeo, vestMat);
    sidePanel.position.set(xSide, 1.16, 0.01);
    group.add(sidePanel);
  });

  // Emerald Vest: Left & Right front panels with folded lapels
  [-0.23, 0.23].forEach((xSide) => {
    const isRight = xSide > 0;
    const frontPanelGeo = new THREE.BoxGeometry(0.18, 0.50, 0.26);
    const frontPanel = new THREE.Mesh(frontPanelGeo, vestMat);
    frontPanel.position.set(xSide, 1.16, -0.07);
    group.add(frontPanel);

    // Zipper track down lapel inner edge
    const zipGeo = new THREE.BoxGeometry(0.018, 0.44, 0.025);
    const zip = new THREE.Mesh(zipGeo, goldMat);
    zip.position.set(isRight ? xSide - 0.09 : xSide + 0.09, 1.16, -0.20);
    group.add(zip);

    // Flap utility chest pockets
    const pocketGeo = new THREE.BoxGeometry(0.13, 0.11, 0.04);
    const pocket = new THREE.Mesh(pocketGeo, vestDarkMat);
    pocket.position.set(xSide, 1.08, -0.215);
    group.add(pocket);

    const pocketSnapGeo = new THREE.SphereGeometry(0.018, 6, 6);
    const pocketSnap = new THREE.Mesh(pocketSnapGeo, goldMat);
    pocketSnap.position.set(xSide, 1.12, -0.24);
    group.add(pocketSnap);
  });

  // Vest stand-up collar framing the neck
  const vestCollarGeo = new THREE.CylinderGeometry(0.20, 0.22, 0.12, 16, 1, true, -Math.PI * 0.75, Math.PI * 1.5);
  const vestCollar = new THREE.Mesh(vestCollarGeo, vestDarkMat);
  vestCollar.position.set(0, 1.42, 0.02);
  group.add(vestCollar);

  // Leather neck necklace cord
  const cordGeo = new THREE.TorusGeometry(0.15, 0.012, 6, 16, Math.PI);
  cordGeo.rotateX(Math.PI / 2 + 0.25);
  const cord = new THREE.Mesh(cordGeo, leatherMat);
  cord.position.set(0, 1.32, -0.13);
  group.add(cord);

  // Golden Island Compass Medallion
  const coreGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.04, 16);
  coreGeo.rotateX(Math.PI / 2);
  const core = new THREE.Mesh(coreGeo, goldMat);
  core.position.set(0, 1.20, -0.20);
  group.add(core);

  // Glowing 4-point compass star core
  const starGeo = new THREE.RingGeometry(0.025, 0.07, 4);
  const star = new THREE.Mesh(starGeo, goldGlowMat);
  star.position.set(0, 1.20, -0.225);
  group.add(star);
  accentMeshes.push(star);

  // ====================================================================
  // 4. CLEAN, SMOOTH HUMAN HEAD SCULPT (No Stepped Boxes!)
  // ====================================================================
  // Smooth athletic neck
  const neckGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.20, 20);
  const neck = new THREE.Mesh(neckGeo, skinMat);
  neck.position.set(0, 1.46, -0.02);
  neck.castShadow = true;
  group.add(neck);

  // Unified Primary Head Sculpt: Smooth stylized human cranium & face
  const headGeo = new THREE.SphereGeometry(0.28, 32, 28);
  headGeo.scale(0.96, 1.10, 1.0); // Natural stylized anime/human proportion
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.position.set(0, 1.72, 0);
  headMesh.castShadow = true;
  group.add(headMesh);

  // Smooth tapered jaw contour seamlessly integrated into the head
  const jawGeo = new THREE.CylinderGeometry(0.22, 0.13, 0.18, 32);
  jawGeo.scale(1.0, 1.0, 0.85);
  const jaw = new THREE.Mesh(jawGeo, skinMat);
  jaw.position.set(0, 1.61, -0.02);
  group.add(jaw);

  // Soft rounded chin
  const chinGeo = new THREE.SphereGeometry(0.075, 16, 16);
  chinGeo.scale(1.1, 0.8, 0.9);
  const chin = new THREE.Mesh(chinGeo, skinMat);
  chin.position.set(0, 1.53, -0.08);
  group.add(chin);

  // Sculpted Ears on sides
  [-0.275, 0.275].forEach((xSide) => {
    const isRight = xSide > 0;
    const earGeo = new THREE.SphereGeometry(0.065, 12, 12);
    earGeo.scale(0.35, 1.25, 0.75);
    const ear = new THREE.Mesh(earGeo, skinMat);
    ear.position.set(xSide, 1.70, -0.01);
    ear.rotation.y = isRight ? 0.12 : -0.12;
    group.add(ear);
  });

  // ====================================================================
  // 5. FULL REAR & SIDES HAIR (Chestnut Hair Strictly on Back z >= 0)
  // ====================================================================
  // Rear Hair Dome (phi: 0 to PI strictly covers the rear hemisphere z >= 0)
  const backHairGeo = new THREE.SphereGeometry(0.288, 24, 20, 0, Math.PI, 0, Math.PI);
  const backHair = new THREE.Mesh(backHairGeo, hairMat);
  backHair.position.set(0, 1.72, 0.005);
  group.add(backHair);

  // Sculpted layered hair locks at the rear neckline / nape
  [-0.14, -0.07, 0, 0.07, 0.14].forEach((xOff, i) => {
    const lockGeo = new THREE.ConeGeometry(0.045, 0.18, 6);
    lockGeo.rotateX(-0.32);
    lockGeo.rotateZ((i - 2) * 0.12);
    const lock = new THREE.Mesh(lockGeo, hairMat);
    lock.position.set(xOff, 1.56, 0.15);
    group.add(lock);
  });

  // Sideburns framing the cheeks in front of ears
  [-0.27, 0.27].forEach((xSide) => {
    const sideburnGeo = new THREE.BoxGeometry(0.04, 0.15, 0.08);
    const sideburn = new THREE.Mesh(sideburnGeo, hairMat);
    sideburn.position.set(xSide, 1.70, -0.08);
    group.add(sideburn);
  });

  // Natural spiky bangs sweeping across the forehead
  const hairBangs = [
    { x: -0.14, y: 1.83, z: -0.26, rz: 0.35, len: 0.14, r: 0.040 },
    { x: -0.06, y: 1.84, z: -0.27, rz: 0.15, len: 0.16, r: 0.044 },
    { x: 0.03, y: 1.84, z: -0.27, rz: -0.15, len: 0.15, r: 0.042 },
    { x: 0.12, y: 1.83, z: -0.26, rz: -0.32, len: 0.14, r: 0.038 },
  ];
  hairBangs.forEach((b) => {
    const bangGeo = new THREE.ConeGeometry(b.r, b.len, 5);
    bangGeo.rotateX(0.38);
    bangGeo.rotateZ(b.rz);
    const bang = new THREE.Mesh(bangGeo, hairMat);
    bang.position.set(b.x, b.y, b.z);
    group.add(bang);
  });

  // ====================================================================
  // 6. BACKWARDS SNAPBACK CAP WITH SLEEK FLAT EMBROIDERY
  // ====================================================================
  const capGroup = new THREE.Group();
  capGroup.position.set(0, 1.84, 0.03);
  capGroup.rotation.x = -0.20; // Tilted backward naturally
  group.add(capGroup);

  // Cap Crown Dome (solid half-sphere extending past rim seam to eliminate any transparent gap)
  const capDomeGeo = new THREE.SphereGeometry(0.298, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.52);
  const capDome = new THREE.Mesh(capDomeGeo, vestMat);
  capDome.castShadow = true;
  capGroup.add(capDome);

  // Sweatband Rim Ring (thickened to seamlessly seal the dome base)
  const capRimGeo = new THREE.TorusGeometry(0.295, 0.025, 12, 32);
  capRimGeo.rotateX(Math.PI / 2);
  const capRim = new THREE.Mesh(capRimGeo, vestDarkMat);
  capRim.position.set(0, 0, 0);
  capGroup.add(capRim);

  // Backwards Visor Brim (extending backward over the rear hair)
  const visorGeo = new THREE.BoxGeometry(0.28, 0.026, 0.22);
  visorGeo.rotateX(0.12);
  const visor = new THREE.Mesh(visorGeo, vestDarkMat);
  visor.position.set(0, 0.01, 0.28);
  capGroup.add(visor);

  // Top Golden Button
  const capButtonGeo = new THREE.SphereGeometry(0.034, 8, 8);
  const capButton = new THREE.Mesh(capButtonGeo, goldMat);
  capButton.position.set(0, 0.305, 0);
  capGroup.add(capButton);

  // Sleek Flat Embroidered Patch (circular, sits flush on cap)
  const patchGeo = new THREE.CylinderGeometry(0.060, 0.060, 0.008, 16);
  patchGeo.rotateX(-Math.PI / 2 + 0.20);
  const patch = new THREE.Mesh(patchGeo, whiteClothMat);
  patch.position.set(0, 0.14, -0.275);
  capGroup.add(patch);

  // Golden Island Compass Star Emblem on patch
  const emblemGeo = new THREE.RingGeometry(0.012, 0.038, 4);
  emblemGeo.rotateX(-0.20);
  const emblem = new THREE.Mesh(emblemGeo, goldGlowMat);
  emblem.position.set(0, 0.14, -0.282);
  capGroup.add(emblem);

  // Plastic Snapback Adjuster Strap at front
  const strapGeo = new THREE.BoxGeometry(0.14, 0.030, 0.018);
  const strap = new THREE.Mesh(strapGeo, vestDarkMat);
  strap.position.set(0, 0.03, 0.16);
  capGroup.add(strap);

  // ====================================================================
  // 7. CLEAN EXPRESSIVE FACE (Almond Anime Eyes, Nose, Smile)
  // ====================================================================
  // Left & Right Almond-Shaped Eyes (Placed cleanly on front of face)
  [-0.110, 0.110].forEach((xPos) => {
    const isRight = xPos > 0;

    // Sclera (White eye background)
    const scleraGeo = new THREE.SphereGeometry(0.062, 16, 16);
    scleraGeo.scale(1.15, 0.90, 0.28);
    const sclera = new THREE.Mesh(scleraGeo, eyeWhiteMat);
    sclera.position.set(xPos, 1.71, -0.265);
    group.add(sclera);

    // Bold Dark Upper Eyelash Contour (Sharp hero gaze)
    const upperLidGeo = new THREE.BoxGeometry(0.120, 0.026, 0.04);
    upperLidGeo.rotateZ(isRight ? -0.16 : 0.16);
    const upperLid = new THREE.Mesh(upperLidGeo, hairMat);
    upperLid.position.set(xPos, 1.77, -0.274);
    group.add(upperLid);

    // Radiant Ocean Azure Iris
    const irisGeo = new THREE.SphereGeometry(0.042, 14, 14);
    irisGeo.scale(1.0, 1.08, 0.25);
    const iris = new THREE.Mesh(irisGeo, eyeIrisMat);
    iris.position.set(xPos + (isRight ? -0.005 : 0.005), 1.705, -0.272);
    group.add(iris);

    // Deep Dark Pupil
    const pupilGeo = new THREE.SphereGeometry(0.024, 10, 10);
    pupilGeo.scale(1.0, 1.08, 0.22);
    const pupil = new THREE.Mesh(pupilGeo, eyePupilMat);
    pupil.position.set(xPos + (isRight ? -0.005 : 0.005), 1.705, -0.280);
    group.add(pupil);

    // Specular Anime Highlights
    const shineMainGeo = new THREE.SphereGeometry(0.014, 6, 6);
    const shineMain = new THREE.Mesh(shineMainGeo, eyeShineMat);
    shineMain.position.set(xPos - 0.013, 1.73, -0.285);
    group.add(shineMain);

    const shineSubGeo = new THREE.SphereGeometry(0.007, 4, 4);
    const shineSub = new THREE.Mesh(shineSubGeo, eyeShineMat);
    shineSub.position.set(xPos + 0.009, 1.685, -0.285);
    group.add(shineSub);

    // Expressive Confident Eyebrows
    const browGeo = new THREE.BoxGeometry(0.120, 0.034, 0.045);
    browGeo.rotateZ(isRight ? -0.22 : 0.22);
    const brow = new THREE.Mesh(browGeo, hairMat);
    brow.position.set(xPos, 1.795, -0.258);
    group.add(brow);
  });

  // Smooth Stylized Anime Nose
  const noseBridgeGeo = new THREE.BoxGeometry(0.028, 0.070, 0.05);
  noseBridgeGeo.rotateX(0.14);
  const noseBridge = new THREE.Mesh(noseBridgeGeo, skinMat);
  noseBridge.position.set(0, 1.66, -0.270);
  group.add(noseBridge);

  const noseTipGeo = new THREE.SphereGeometry(0.028, 10, 10);
  noseTipGeo.scale(1.1, 0.85, 1.0);
  const noseTip = new THREE.Mesh(noseTipGeo, skinMat);
  noseTip.position.set(0, 1.625, -0.295);
  group.add(noseTip);

  // Confident Brawler Smile / Smirk
  const mouthGroup = new THREE.Group();
  mouthGroup.position.set(0.01, 1.56, -0.225);
  mouthGroup.rotation.z = 0.06;

  const mouthBackGeo = new THREE.BoxGeometry(0.10, 0.034, 0.025);
  const mouthBack = new THREE.Mesh(mouthBackGeo, mouthMat);
  mouthGroup.add(mouthBack);

  const teethGeo = new THREE.BoxGeometry(0.085, 0.016, 0.02);
  const teeth = new THREE.Mesh(teethGeo, teethMat);
  teeth.position.set(0, 0.009, -0.010);
  mouthGroup.add(teeth);

  const lowerLipGeo = new THREE.BoxGeometry(0.075, 0.012, 0.015);
  const lowerLip = new THREE.Mesh(lowerLipGeo, skinMat);
  lowerLip.position.set(0, -0.015, -0.008);
  mouthGroup.add(lowerLip);

  group.add(mouthGroup);

  // ====================================================================
  // 7. DYNAMIC ARMS & CLENCHED BRAWLER GUARD (Heroic Stance)
  // ====================================================================
  const fistGroupL = new THREE.Group();
  const fistGroupR = new THREE.Group();

  [-0.42, 0.42].forEach((xSide) => {
    const isRight = xSide > 0;
    const fistGroup = isRight ? fistGroupR : fistGroupL;

    // Shoulder / Deltoid (vest armhole sleeve cap)
    const shoulderGeo = new THREE.SphereGeometry(0.13, 12, 12);
    const shoulder = new THREE.Mesh(shoulderGeo, vestMat);
    shoulder.position.set(xSide, 1.28, -0.02);
    group.add(shoulder);

    // Upper Arm (Biceps / Triceps) angled slightly out & back
    const armGroup = new THREE.Group();
    armGroup.position.set(xSide, 1.28, -0.02);
    armGroup.rotation.z = isRight ? -0.16 : 0.16;
    armGroup.rotation.x = -0.10;
    group.add(armGroup);

    const upperArmGeo = new THREE.CylinderGeometry(0.095, 0.09, 0.24, 12);
    const upperArm = new THREE.Mesh(upperArmGeo, skinMat);
    upperArm.position.set(0, -0.12, 0);
    armGroup.add(upperArm);

    // Elbow Joint
    const elbowGeo = new THREE.SphereGeometry(0.088, 10, 10);
    const elbow = new THREE.Mesh(elbowGeo, skinMat);
    elbow.position.set(0, -0.24, 0);
    armGroup.add(elbow);

    // Forearm angled forward & inward in a ready combat guard!
    const forearmGroup = new THREE.Group();
    forearmGroup.position.set(0, -0.24, 0);
    forearmGroup.rotation.x = 0.48; // Bend elbow forward
    forearmGroup.rotation.z = isRight ? 0.22 : -0.22; // Angle forearm inward
    armGroup.add(forearmGroup);

    const forearmGeo = new THREE.CylinderGeometry(0.09, 0.082, 0.22, 12);
    const forearm = new THREE.Mesh(forearmGeo, skinMat);
    forearm.position.set(0, -0.11, 0);
    forearmGroup.add(forearm);

    // Athletic wrist sweatband
    const wristbandGeo = new THREE.TorusGeometry(0.085, 0.022, 8, 14);
    wristbandGeo.rotateX(Math.PI / 2);
    const wristband = new THREE.Mesh(wristbandGeo, vestDarkMat);
    wristband.position.set(0, -0.21, 0);
    forearmGroup.add(wristband);

    // Attach Fist to end of forearm
    fistGroup.position.set(0, -0.28, 0);
    forearmGroup.add(fistGroup);

    // Clenched Brawler Glove Body
    const gloveBodyGeo = new THREE.BoxGeometry(0.15, 0.14, 0.16);
    const gloveBody = new THREE.Mesh(gloveBodyGeo, gloveMat);
    gloveBody.castShadow = true;
    fistGroup.add(gloveBody);

    // 4 Curled Fingers with bare skin tips
    for (let f = 0; f < 4; f++) {
      const yOff = 0.04 - f * 0.028;
      const fingerGeo = new THREE.CylinderGeometry(0.020, 0.020, 0.12, 8);
      fingerGeo.rotateZ(Math.PI / 2);
      const finger = new THREE.Mesh(fingerGeo, gloveMat);
      finger.position.set(0, yOff, -0.08);
      fistGroup.add(finger);

      const tipGeo = new THREE.SphereGeometry(0.018, 6, 6);
      const tip = new THREE.Mesh(tipGeo, skinMat);
      tip.position.set(isRight ? -0.05 : 0.05, yOff, -0.08);
      fistGroup.add(tip);
    }

    // Folded Thumb
    const thumbGeo = new THREE.CylinderGeometry(0.024, 0.022, 0.10, 8);
    thumbGeo.rotateX(Math.PI / 2);
    thumbGeo.rotateZ(isRight ? -0.4 : 0.4);
    const thumb = new THREE.Mesh(thumbGeo, skinMat);
    thumb.position.set(isRight ? -0.06 : 0.06, 0.02, -0.05);
    fistGroup.add(thumb);

    // Golden Knuckle Armor Plate
    const knucklePlateGeo = new THREE.BoxGeometry(0.12, 0.06, 0.035);
    const knucklePlate = new THREE.Mesh(knucklePlateGeo, goldMat);
    knucklePlate.position.set(0, 0.02, 0.085);
    fistGroup.add(knucklePlate);
  });

  // Retain meshes for engine compatibility
  const leftFistMesh = fistGroupL.children[0] as THREE.Mesh;
  const rightFistMesh = fistGroupR.children[0] as THREE.Mesh;

  return {
    group,
    bodyMesh: chest,
    coreMesh: core,
    fists: [leftFistMesh, rightFistMesh],
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
