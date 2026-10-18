import * as THREE from 'three';
import { sounds } from '../audio/soundManager';
import confetti from 'canvas-confetti';
import {
  createChampionMesh,
  type ChampionId,
  CHAMPIONS,
  animateChampion,
  type CreatedChampion,
} from './championModels';

export type CameraMode = 'third_person' | 'isometric' | 'close_action';
export type RoundWinner = 'player' | 'bot' | 'draw';

export interface GameState {
  timeRemaining: number;
  arenaRadius: number;
  initialRadius: number;
  playerRoundWins: number; // 0 to 3 (first to 3 wins)
  botRoundWins: number;    // 0 to 3
  currentRound: number;    // 1 to 5
  roundHistory: RoundWinner[]; // e.g. ['player', 'draw', 'bot']
  roundBannerText: string | null; // e.g. "ROUND 1: KAI WINS!" or "ROUND 1: DRAW!"
  roundBannerType: RoundWinner | null;
  playerCharge: number;    // 0 to 100%
  isAiming: boolean;
  aimAngle: number;
  countdown: number;       // 3, 2, 1, 0 (0 = FIGHT!)
  isPaused: boolean;
  isGameOver: boolean;
  winner: 'player' | 'bot' | 'draw' | null;
  cameraMode: CameraMode;
  warningText: string | null;
  playerSkillCooldown: number;
  playerSkillMaxCooldown: number;
  isPlayerSkillActive: boolean;
  playerChampionId: ChampionId;
}

interface Brawler {
  mesh: THREE.Group;
  bodyMesh: THREE.Mesh;
  coreMesh: THREE.Mesh;
  fists: THREE.Mesh[];
  legs?: THREE.Object3D[];
  arms?: THREE.Object3D[];
  champData?: CreatedChampion;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  targetAngle: number;
  currentAngle: number;
  isDashing: boolean;
  dashTimer: number;
  dashPowerPercent: number; // records the charge % used for active dash
  chargePercent: number;    // 0 - 100%
  radius: number;
  isGrounded: boolean;
  isKnockedOut: boolean;
  walkCycle: number;
  isBot: boolean;
}

export class GameEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;

  // Rounds & Match State
  private playerRoundWins = 0;
  private botRoundWins = 0;
  private currentRound = 1;
  private readonly maxRoundWins = 3; // First to 3 wins
  private readonly maxRounds = 5;    // Maximum 5 rounds in match
  private roundHistory: RoundWinner[] = [];
  private roundTimeoutId: number | null = null;
  private warningSoundCooldown = 0;

  // Aim Reticle
  private aimReticleGroup: THREE.Group;

  // Arena
  private arenaGroup: THREE.Group;
  private initialRadius = 13.0;
  private currentRadius = 13.0;
  private matchDuration = 60; // 60 seconds (1 minute per round)
  private elapsedTime = 0;

  // Characters
  public player!: Brawler;
  public bot!: Brawler;
  public playerChampionId: ChampionId = 'leo';
  public botChampionId: ChampionId = 'kage';
  private particles: { mesh: THREE.Mesh; life: number; maxLife: number; vel: THREE.Vector3 }[] = [];

  // Chapter 1: Emerald Isles Environment Elements
  private clouds: { group: THREE.Group; speed: number }[] = [];
  private breezeParticles: { mesh: THREE.Mesh; seed: number; speed: number }[] = [];
  private oceanWaveRings: THREE.Mesh[] = [];
  private islandFoamRings: THREE.Mesh[] = [];
  private oceanMaterial: THREE.ShaderMaterial | null = null;
  private sunCoronaSprite: THREE.Sprite | null = null;
  private sunRaysSprite: THREE.Sprite | null = null;
  private centerFirePit: THREE.Group | null = null;
  private flameParticles: {
    mesh: THREE.Mesh;
    baseX: number;
    baseZ: number;
    speedY: number;
    phase: number;
    scaleBase: number;
  }[] = [];
  private fireLight: THREE.PointLight | null = null;
  private fireEmbers: { mesh: THREE.Mesh; seed: number; speed: number; life: number; maxLife: number }[] = [];
  private fireSmoke: { mesh: THREE.Mesh; seed: number; speed: number; life: number; maxLife: number }[] = [];
  private grassMaterial: THREE.MeshStandardMaterial | null = null;
  private flowerMaterial: THREE.MeshStandardMaterial | null = null;
  private splashTriggered: { player: boolean; bot: boolean } = { player: false, bot: false };

  // Inputs
  private inputVector = { x: 0, z: 0 };
  private keys: { [key: string]: boolean } = {};
  private spaceKeyHeld = false;

  // Trophy Scaling & Bot AI
  public playerTrophies: number = 1250;

  // Active Special Skill State
  private playerSkillCooldownTimer: number = 0;
  private botSkillCooldownTimer: number = 0;
  private playerSkillActiveTimer: number = 0;
  private botSkillActiveTimer: number = 0;
  private isPlayerInvulnerable: boolean = false;
  private isBotInvulnerable: boolean = false;
  private playerShieldMesh: THREE.Mesh | null = null;
  private botShieldMesh: THREE.Mesh | null = null;
  private activeVortex: { pos: THREE.Vector3; timer: number; mesh: THREE.Mesh; casterIsPlayer: boolean } | null = null;

  // Game flow
  public state: GameState;
  private onStateChange: (state: GameState) => void;
  private shakeTimer = 0;
  private shakeIntensity = 0;
  private animationId: number = 0;

  constructor(container: HTMLElement, onStateChange: (state: GameState) => void) {
    this.container = container;
    this.onStateChange = onStateChange;

    this.state = {
      timeRemaining: this.matchDuration,
      arenaRadius: this.initialRadius,
      initialRadius: this.initialRadius,
      playerRoundWins: 0,
      botRoundWins: 0,
      currentRound: 1,
      roundHistory: [],
      roundBannerText: null,
      roundBannerType: null,
      playerCharge: 100, // Starts fully charged at round 1
      isAiming: false,
      aimAngle: 0,
      countdown: 3,
      isPaused: false,
      isGameOver: false,
      winner: null,
      cameraMode: 'third_person',
      warningText: null,
      playerSkillCooldown: 0,
      playerSkillMaxCooldown: CHAMPIONS[this.playerChampionId]?.skill?.cooldown ?? 7,
      isPlayerSkillActive: false,
      playerChampionId: this.playerChampionId,
    };

    // 1. Three.js Scene & Camera (Chapter 1: Emerald Isles Tropical Daylight)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x38bdf8); // Radiant tropical azure sky
    this.scene.fog = new THREE.FogExp2(0x7dd3fc, 0.005); // Soft coastal sea horizon haze

    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    this.camera.position.set(0, 10, 22);

    // 2. Renderer with soft shadows
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();

    // 3. Environment & Lights (Tropical Sun, Ocean, Sky, Islands)
    this.setupLighting();
    this.setupEnvironment();

    // 4. Arena & Characters (Grassy Island Plateau & Sun Compass)
    this.arenaGroup = new THREE.Group();
    const arena = this.createArena();
    this.arenaGroup.add(arena);
    this.scene.add(this.arenaGroup);

    this.setupCharacters();

    // 5. Aim Reticle on Ground
    this.aimReticleGroup = this.createAimReticle();
    this.scene.add(this.aimReticleGroup);

    // 5. Event Listeners
    window.addEventListener('resize', this.onResize);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    // 6. Start Loop
    this.loop();
  }

  private setupLighting() {
    // Warm Sunlit Atmosphere: warm ivory sunlight down, rich emerald grass bounce up (prevents pale cyan washout)
    const hemi = new THREE.HemisphereLight(0xfffbeb, 0x15803d, 0.85);
    this.scene.add(hemi);

    // Radiant Sun Directional Light (Warm golden tropical sunlight)
    const sunLight = new THREE.DirectionalLight(0xfffaea, 1.30);
    sunLight.position.set(35, 52, 22);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 90;
    sunLight.shadow.camera.left = -18;
    sunLight.shadow.camera.right = 18;
    sunLight.shadow.camera.top = 18;
    sunLight.shadow.camera.bottom = -18;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    // Subtle Ocean Fill Light (gentle soft sky bounce)
    const oceanFill = new THREE.DirectionalLight(0x38bdf8, 0.20);
    oceanFill.position.set(-25, 12, -25);
    this.scene.add(oceanFill);

    // Center Sunlight Warmth Point
    const centerWarmth = new THREE.PointLight(0xfef08a, 0.5, 18);
    centerWarmth.position.set(0, 3, 0);
    this.scene.add(centerWarmth);
  }

  private setupEnvironment() {
    // 1. Panoramic Sky Dome (Azure to Warm Coastal Horizon Gradient)
    const skyGeo = new THREE.SphereGeometry(380, 32, 24);
    const skyMat = new THREE.MeshBasicMaterial({
      map: this.createSkyGradientTexture(),
      side: THREE.BackSide,
    });
    const skyDome = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(skyDome);

    // 2. The Celestial Radiant Sun in the Sky
    const sunGroup = this.createRealisticSun();
    this.scene.add(sunGroup);

    // 3. Multi-Layer Drifting Cumulus Clouds
    const cloudsGroup = this.createClouds();
    this.scene.add(cloudsGroup);

    // 4. Dynamic Masterpiece Ocean (Subdivided Plane with multi-frequency GPU waves, depth gradient, caustics, and surf)
    const ocean = this.createDynamicOcean();
    this.scene.add(ocean);

    // Dynamic shoreline foam rings around arena cliff base
    this.oceanWaveRings = [];
    [14, 22].forEach((radius) => {
      const waveGeo = new THREE.TorusGeometry(radius, radius === 14 ? 0.75 : 1.1, 8, 64);
      waveGeo.rotateX(Math.PI / 2);
      const waveMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.55,
      });
      const wave = new THREE.Mesh(waveGeo, waveMat);
      wave.position.y = -6.42;
      this.scene.add(wave);
      this.oceanWaveRings.push(wave);
    });

    // 5. Majestic Distant Tropical Archipelago on the Horizon
    const distantIslands = this.createDistantIslands();
    this.scene.add(distantIslands);

    // 6. Island Breeze Leaf & Pollen Particles
    this.createBreezeParticles(this.scene);
  }

  private createSkyGradientTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0.0, '#0284c7');  // Deep tropical azure zenith
    grad.addColorStop(0.40, '#38bdf8'); // Radiant cerulean sky
    grad.addColorStop(0.75, '#7dd3fc'); // Coastal turquoise horizon mist
    grad.addColorStop(0.92, '#bae6fd'); // Soft light sea foam
    grad.addColorStop(1.0, '#fef3c7');  // Warm golden sunlit horizon kiss
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 512);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }

  private createRealisticSun(): THREE.Group {
    const sunGroup = new THREE.Group();
    // Positioned in upper right sky frustum matching the golden sunlight: (26, 6.8, -75)
    sunGroup.position.set(26, 6.8, -75);

    // 1. Incandescent White-Hot Sun Disc (Core)
    const coreTex = this.createSunDiscTexture();
    const coreMat = new THREE.SpriteMaterial({
      map: coreTex,
      color: 0xffffff,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const coreSprite = new THREE.Sprite(coreMat);
    coreSprite.scale.set(16, 16, 1);
    sunGroup.add(coreSprite);

    // 2. Wide Rayleigh Atmospheric Scattering Corona (Warm Golden Amber)
    const coronaTex = this.createSunCoronaTexture();
    const coronaMat = new THREE.SpriteMaterial({
      map: coronaTex,
      color: 0xfffbeb,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.sunCoronaSprite = new THREE.Sprite(coronaMat);
    this.sunCoronaSprite.scale.set(45, 45, 1);
    sunGroup.add(this.sunCoronaSprite);

    // 3. Diffraction Star Rays & Anamorphic Lens Flare
    const raysTex = this.createSunRaysTexture();
    const raysMat = new THREE.SpriteMaterial({
      map: raysTex,
      color: 0xfef08a,
      transparent: true,
      opacity: 0.70,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.sunRaysSprite = new THREE.Sprite(raysMat);
    this.sunRaysSprite.scale.set(65, 65, 1);
    sunGroup.add(this.sunRaysSprite);

    return sunGroup;
  }

  private createSunDiscTexture(): THREE.CanvasTexture {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    const cx = size / 2;
    const cy = size / 2;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.45);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');     // Pure white core
    grad.addColorStop(0.2, 'rgba(255, 255, 245, 0.95)');    // Intense white-yellow
    grad.addColorStop(0.45, 'rgba(254, 240, 138, 0.7)');    // Golden brilliance
    grad.addColorStop(0.75, 'rgba(251, 191, 36, 0.25)');    // Warm golden falloff
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.45, 0, Math.PI * 2);
    ctx.fill();
    return new THREE.CanvasTexture(canvas);
  }

  private createSunCoronaTexture(): THREE.CanvasTexture {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    const cx = size / 2;
    const cy = size / 2;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.48);
    grad.addColorStop(0.0, 'rgba(254, 243, 199, 0.75)');    // Warm ivory center
    grad.addColorStop(0.25, 'rgba(253, 224, 71, 0.45)');   // Golden corona
    grad.addColorStop(0.55, 'rgba(251, 146, 60, 0.20)');   // Amber atmospheric glow
    grad.addColorStop(0.82, 'rgba(217, 119, 6, 0.05)');    // Warm twilight haze
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.48, 0, Math.PI * 2);
    ctx.fill();
    return new THREE.CanvasTexture(canvas);
  }

  private createSunRaysTexture(): THREE.CanvasTexture {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    const cx = size / 2;
    const cy = size / 2;

    // 1. Soft wide circular glow
    const baseGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.45);
    baseGrad.addColorStop(0.0, 'rgba(254, 249, 195, 0.45)');
    baseGrad.addColorStop(0.4, 'rgba(253, 224, 71, 0.15)');
    baseGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
    ctx.fillStyle = baseGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.45, 0, Math.PI * 2);
    ctx.fill();

    // 2. 8 subtle feathered diffraction star spikes
    const rayCount = 8;
    ctx.save();
    ctx.translate(cx, cy);
    for (let r = 0; r < rayCount; r++) {
      const angle = (r * Math.PI) / (rayCount / 2);
      ctx.rotate(angle);
      const rayGrad = ctx.createLinearGradient(0, -size * 0.48, 0, size * 0.48);
      rayGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0.0)');
      rayGrad.addColorStop(0.45, 'rgba(254, 240, 138, 0.18)');
      rayGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.45)');
      rayGrad.addColorStop(0.55, 'rgba(254, 240, 138, 0.18)');
      rayGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
      ctx.fillStyle = rayGrad;
      const rayWidth = r % 2 === 0 ? 8 : 4;
      ctx.fillRect(-rayWidth / 2, -size * 0.48, rayWidth, size * 0.96);
      ctx.rotate(-angle);
    }

    // 3. Horizontal subtle anamorphic lens flare streak
    const streakGrad = ctx.createLinearGradient(-size * 0.48, 0, size * 0.48, 0);
    streakGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0.0)');
    streakGrad.addColorStop(0.3, 'rgba(254, 240, 138, 0.12)');
    streakGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.55)');
    streakGrad.addColorStop(0.7, 'rgba(254, 240, 138, 0.12)');
    streakGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
    ctx.fillStyle = streakGrad;
    ctx.fillRect(-size * 0.48, -4, size * 0.96, 8);
    ctx.restore();

    return new THREE.CanvasTexture(canvas);
  }

  private createDynamicOcean(): THREE.Mesh {
    const oceanGeo = new THREE.PlaneGeometry(620, 620, 128, 128);
    oceanGeo.rotateX(-Math.PI / 2);

    this.oceanMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSunDir: { value: new THREE.Vector3(26, 6.8, -75).normalize() },
        uSunColor: { value: new THREE.Color(0xfffaea) },
        uArenaRadius: { value: this.initialRadius },
        uCamPos: { value: new THREE.Vector3() },
      },
      vertexShader: `
        uniform float uTime;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        varying float vWaveHeight;

        void main() {
          vUv = uv;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vec2 p = worldPos.xz;

          // Multi-frequency sinusoidal ocean swell
          float w1 = sin(p.x * 0.05 + p.y * 0.07 + uTime * 1.1) * 0.38;
          float w2 = sin(-p.x * 0.08 + p.y * 0.06 + uTime * 1.5) * 0.22;
          float w3 = sin(p.x * 0.16 + p.y * 0.12 + uTime * 2.2) * 0.12;
          float w4 = sin(p.x * 0.35 - p.y * 0.25 + uTime * 3.0) * 0.05;

          float waveHeight = w1 + w2 + w3 + w4;
          vWaveHeight = waveHeight;
          worldPos.y += waveHeight;

          // Normal estimation via finite differences
          float delta = 0.4;
          float hL = sin((p.x - delta) * 0.05 + p.y * 0.07 + uTime * 1.1) * 0.38 + sin(-(p.x - delta) * 0.08 + p.y * 0.06 + uTime * 1.5) * 0.22;
          float hR = sin((p.x + delta) * 0.05 + p.y * 0.07 + uTime * 1.1) * 0.38 + sin(-(p.x + delta) * 0.08 + p.y * 0.06 + uTime * 1.5) * 0.22;
          float hD = sin(p.x * 0.05 + (p.y - delta) * 0.07 + uTime * 1.1) * 0.38 + sin(-p.x * 0.08 + (p.y - delta) * 0.06 + uTime * 1.5) * 0.22;
          float hU = sin(p.x * 0.05 + (p.y + delta) * 0.07 + uTime * 1.1) * 0.38 + sin(-p.x * 0.08 + (p.y + delta) * 0.06 + uTime * 1.5) * 0.22;

          vNormal = normalize(vec3((hL - hR) / (2.0 * delta), 1.0, (hD - hU) / (2.0 * delta)));
          vWorldPosition = worldPos.xyz;

          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uSunDir;
        uniform vec3 uSunColor;
        uniform float uArenaRadius;
        uniform vec3 uCamPos;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        varying float vWaveHeight;

        void main() {
          vec3 viewDir = normalize(uCamPos - vWorldPosition);
          vec3 norm = normalize(vNormal);

          // 1. Tropical Ocean Color Palette (Deep Sapphire to Translucent Lagoon Turquoise)
          vec3 deepColor = vec3(0.015, 0.20, 0.46);    // Deep oceanic sapphire
          vec3 midColor = vec3(0.035, 0.52, 0.70);     // Vibrant azure blue
          vec3 shallowColor = vec3(0.08, 0.78, 0.75);  // Translucent lagoon turquoise

          float distFromArena = length(vWorldPosition.xz);
          float coastal = clamp((distFromArena - uArenaRadius) / 42.0, 0.0, 1.0);

          vec3 waterColor = mix(shallowColor, midColor, smoothstep(0.0, 0.4, coastal));
          waterColor = mix(waterColor, deepColor, smoothstep(0.4, 1.0, coastal));

          // Wave crest tint
          waterColor += vec3(0.04, 0.16, 0.14) * smoothstep(0.12, 0.55, vWaveHeight);

          // 2. Animated Caustics Shimmer in coastal waters
          vec2 cp1 = vWorldPosition.xz * 0.28 + vec2(uTime * 0.12, uTime * 0.08);
          vec2 cp2 = vWorldPosition.xz * 0.36 - vec2(uTime * 0.10, uTime * 0.15);
          float c1 = sin(cp1.x * 3.8 + sin(cp1.y * 3.8)) * 0.5 + 0.5;
          float c2 = sin(cp2.x * 4.6 + sin(cp2.y * 4.6)) * 0.5 + 0.5;
          float causticPattern = pow(c1 * c2, 1.8);
          waterColor += vec3(0.12, 0.32, 0.28) * causticPattern * (1.0 - coastal * 0.75);

          // 3. Fresnel Sky Reflection (grazing angles reflect vibrant sky)
          float fresnel = pow(1.0 - max(dot(viewDir, norm), 0.0), 3.2);
          vec3 skyColor = vec3(0.42, 0.76, 0.98);
          waterColor = mix(waterColor, skyColor, fresnel * 0.68);

          // 4. Radiant Sun Specular Highlight & Sparkle
          vec3 sunDir = normalize(uSunDir);
          vec3 halfDir = normalize(sunDir + viewDir);
          float nDotH = max(dot(norm, halfDir), 0.0);
          float spec = pow(nDotH, 52.0) * 1.9;
          float sparkle = pow(nDotH, 140.0) * 3.2 * (sin(vWorldPosition.x * 7.0 + uTime * 5.0) * 0.5 + 0.5);
          waterColor += uSunColor * (spec + sparkle);

          // 5. Dynamic Arena Shoreline Foam Breakers
          float surfWave = sin(uTime * 2.4 - distFromArena * 0.85) * 0.5 + 0.5;
          float foamRing = smoothstep(uArenaRadius + 0.15, uArenaRadius + 1.1, distFromArena)
                         * (1.0 - smoothstep(uArenaRadius + 1.8 + surfWave * 1.4, uArenaRadius + 3.6, distFromArena));

          float crestFoam = smoothstep(0.46, 0.66, vWaveHeight) * (sin(uTime * 4.5 + vWorldPosition.x) * 0.35 + 0.65);
          float foamFactor = clamp(foamRing * 0.85 + crestFoam * 0.4, 0.0, 1.0);
          waterColor = mix(waterColor, vec3(0.96, 0.99, 1.0), foamFactor);

          // 6. Horizon Atmospheric Haze Blend
          float distFromCam = length(uCamPos - vWorldPosition);
          float haze = smoothstep(110.0, 290.0, distFromCam);
          vec3 hazeColor = vec3(0.48, 0.80, 0.98);
          waterColor = mix(waterColor, hazeColor, haze * 0.85);

          gl_FragColor = vec4(waterColor, 0.94);
        }
      `,
      transparent: true,
      depthWrite: true,
    });

    const ocean = new THREE.Mesh(oceanGeo, this.oceanMaterial);
    ocean.position.y = -6.5;
    return ocean;
  }

  private createRealisticFlameTexture(): THREE.CanvasTexture {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    const cx = size / 2;
    const cy = size / 2;

    // Teardrop / flame plume gradient with intense white-hot core
    const grad = ctx.createRadialGradient(cx, cy * 1.15, 6, cx, cy, size * 0.48);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');    // Blinding white-hot core
    grad.addColorStop(0.18, 'rgba(254, 240, 138, 0.95)');  // Incandescent yellow
    grad.addColorStop(0.42, 'rgba(249, 115, 22, 0.85)');   // Fiery electric orange
    grad.addColorStop(0.72, 'rgba(220, 38, 38, 0.45)');    // Glowing ruby flame lick
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');          // Dissipates to transparent

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(cx, cy * 0.15);
    ctx.bezierCurveTo(cx + size * 0.42, cy * 0.55, cx + size * 0.35, cy * 1.35, cx, cy * 1.35);
    ctx.bezierCurveTo(cx - size * 0.35, cy * 1.35, cx - size * 0.42, cy * 0.55, cx, cy * 0.15);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  private createGrassTexture(): THREE.CanvasTexture {
    const size = 2048;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    const center = size / 2;

    // 1. Rich Botanical Meadow Emerald Gradient (Deep, vibrant & natural)
    const baseGrad = ctx.createRadialGradient(center, center, 40, center, center, center);
    baseGrad.addColorStop(0.0, '#14532d');  // Deep moist soil emerald
    baseGrad.addColorStop(0.20, '#16a34a'); // Lush emerald lawn
    baseGrad.addColorStop(0.60, '#15803d'); // Rich meadow green
    baseGrad.addColorStop(0.88, '#166534'); // Forest perimeter
    baseGrad.addColorStop(1.0, '#14532d');  // Deep earthy edge
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, size, size);

    // 2. Natural Sun-Dappled Meadow Patches (Light & shade terrain depth)
    for (let p = 0; p < 140; p++) {
      const px = Math.random() * size;
      const py = Math.random() * size;
      const rad = 45 + Math.random() * 110;
      const pGrad = ctx.createRadialGradient(px, py, 6, px, py, rad);
      const isSunlit = Math.random() > 0.45;
      pGrad.addColorStop(0, isSunlit ? 'rgba(74, 222, 128, 0.28)' : 'rgba(20, 83, 45, 0.25)');
      pGrad.addColorStop(0.7, isSunlit ? 'rgba(134, 239, 172, 0.12)' : 'rgba(5, 46, 22, 0.15)');
      pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.arc(px, py, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Dense Multi-Layered Natural Turf Blades (8,000 delicate organic blade strokes)
    const bladePalettes = [
      'rgba(5, 46, 22, 0.40)',    // Deep undergrowth root shadow
      'rgba(21, 128, 61, 0.55)',  // Rich emerald turf body
      'rgba(22, 163, 74, 0.60)',  // Vibrant meadow blade
      'rgba(34, 197, 94, 0.55)',  // Sunlit grass leaf
      'rgba(74, 222, 128, 0.50)', // Fresh spring blade highlight
      'rgba(163, 230, 53, 0.42)', // Warm chartreuse sun kiss
      'rgba(187, 247, 208, 0.35)',// Dewdrop tip sheen
    ];

    for (let i = 0; i < 8000; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * (center - 20);
      const px = center + Math.cos(angle) * dist;
      const py = center + Math.sin(angle) * dist;

      const bladeLen = 9 + Math.random() * 16;
      const bladeCurve = (Math.random() - 0.5) * 9;
      const color = bladePalettes[Math.floor(Math.random() * bladePalettes.length)];

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6 + Math.random() * 1.4;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.quadraticCurveTo(px + bladeCurve * 0.5, py - bladeLen * 0.6, px + bladeCurve, py - bladeLen);
      ctx.stroke();
    }

    // 4. Wildflower Meadow Petal Specks (Scattered natural blossoms on turf)
    const petalColors = [
      'rgba(250, 204, 21, 0.75)',  // Gold buttercup petal
      'rgba(255, 255, 255, 0.85)', // White daisy petal
      'rgba(244, 63, 94, 0.70)',   // Pink poppy petal
      'rgba(56, 189, 248, 0.75)',  // Blue forget-me-not petal
      'rgba(192, 132, 252, 0.70)', // Lavender petal
    ];
    for (let f = 0; f < 350; f++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * (center - 50);
      const fx = center + Math.cos(angle) * dist;
      const fy = center + Math.sin(angle) * dist;
      ctx.fillStyle = petalColors[Math.floor(Math.random() * petalColors.length)];
      ctx.beginPath();
      ctx.arc(fx, fy, 2.0 + Math.random() * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Rich Clover Leaf Clusters (Natural meadow ground cover)
    for (let c = 0; c < 160; c++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 35 + Math.random() * (center - 50);
      const cx = center + Math.cos(angle) * dist;
      const cy = center + Math.sin(angle) * dist;

      ctx.fillStyle = 'rgba(74, 222, 128, 0.45)';
      for (let lobe = 0; lobe < 3; lobe++) {
        const la = (lobe / 3) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(la) * 3.8, cy + Math.sin(la) * 3.8, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 6. Seamless Central Basalt Stone Hearth Blend Ring (Snug at altar rim)
    const fireRadiusPx = (2.15 / 13.0) * center;
    ctx.beginPath();
    ctx.arc(center, center, fireRadiusPx + 4, 0, Math.PI * 2);
    ctx.lineWidth = 10;
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.85)'; // Clean dark basalt transition
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  private createBotanicalGrassTexture(withFlowers: boolean): THREE.CanvasTexture {
    const w = 512;
    const h = 512;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    // Completely transparent background
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const baseLine = h - 4;

    // 42 fine, organically curved, slender botanical grass blades across the quad
    const bladeCount = 42;
    for (let i = 0; i < bladeCount; i++) {
      // Clustered root distribution across the base
      const rootX = cx + (Math.random() - 0.5) * 260;
      const rootW = 10 + Math.random() * 12; // Slender base width (10-22px)
      const height = 310 + Math.random() * 190; // Natural varied height
      const tipY = baseLine - height;

      // Natural arching curve: left blades arch left, right blades arch right
      const side = (rootX - cx) / 120; // -1 to 1 approx
      const archForce = (side * 60) + (Math.random() - 0.5) * 50;
      const tipX = rootX + archForce;
      const ctrlX = rootX + archForce * 0.65;
      const ctrlY = baseLine - height * 0.55;

      // Botanical color gradient: deep forest green root -> rich emerald body -> bright lime sunlit tip
      const grad = ctx.createLinearGradient(rootX, baseLine, tipX, tipY);
      grad.addColorStop(0.0, '#064e3b');  // Deep moist soil root
      grad.addColorStop(0.25, '#15803d'); // Rich dark forest turf
      grad.addColorStop(0.55, '#16a34a'); // Vibrant emerald blade
      grad.addColorStop(0.85, '#4ade80'); // Sunlit spring lime
      grad.addColorStop(1.0, '#86efac');  // Bright sunlit dewdrop tip

      // Draw tapered curved blade
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(rootX - rootW * 0.5, baseLine);
      ctx.quadraticCurveTo(ctrlX - rootW * 0.25, ctrlY, tipX, tipY);
      ctx.quadraticCurveTo(ctrlX + rootW * 0.25, ctrlY, rootX + rootW * 0.5, baseLine);
      ctx.closePath();
      ctx.fill();

      // Subtle blade spine vein highlight
      ctx.strokeStyle = 'rgba(190, 242, 100, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(rootX, baseLine);
      ctx.quadraticCurveTo(ctrlX, ctrlY, tipX, tipY);
      ctx.stroke();
    }

    // Add charming botanical wildflowers if requested
    if (withFlowers) {
      const flowerTypes = [
        { petals: '#ffffff', center: '#f59e0b', count: 6 }, // Island Daisy
        { petals: '#ef4444', center: '#1c1917', count: 5 }, // Ruby Poppy
        { petals: '#facc15', center: '#b45309', count: 5 }, // Gold Buttercup
        { petals: '#38bdf8', center: '#ffffff', count: 5 }, // Blue Forget-me-not
        { petals: '#a855f7', center: '#fde047', count: 5 }, // Orchid Violet
      ];

      const flowerCount = 3 + Math.floor(Math.random() * 2);
      for (let f = 0; f < flowerCount; f++) {
        const ft = flowerTypes[f % flowerTypes.length];
        const fx = cx + (Math.random() - 0.5) * 190;
        const fy = baseLine - 220 - Math.random() * 160;

        // Slender botanical stem
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(cx + (fx - cx) * 0.35, baseLine);
        ctx.quadraticCurveTo(fx + (Math.random() - 0.5) * 20, (baseLine + fy) * 0.5, fx, fy);
        ctx.stroke();

        // Petals
        ctx.fillStyle = ft.petals;
        const petalCount = ft.count;
        const petalRadius = 13;
        for (let p = 0; p < petalCount; p++) {
          const ang = (p / petalCount) * Math.PI * 2;
          const px = fx + Math.cos(ang) * petalRadius;
          const py = fy + Math.sin(ang) * petalRadius;
          ctx.beginPath();
          ctx.arc(px, py, 7.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Flower central core
        ctx.fillStyle = ft.center;
        ctx.beginPath();
        ctx.arc(fx, fy, 6.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  private createClouds(): THREE.Group {
    const group = new THREE.Group();
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.82,
      metalness: 0.0,
      emissive: 0xfffdf5,
      emissiveIntensity: 0.22, // Warm sun transmission so clouds stay soft & bright
    });

    this.clouds = [];

    // Layer 1: Mid-Altitude Floating Cumulus Clouds (y = 4.0 to 7.0, framing the sky)
    for (let i = 0; i < 16; i++) {
      const cloudGroup = new THREE.Group();
      const cx = (Math.random() - 0.5) * 260;
      const cy = 4.2 + (i % 4) * 0.85 + (Math.random() - 0.5) * 0.6;
      const cz = -62 - (i % 3) * 14;
      cloudGroup.position.set(cx, cy, cz);

      // Cumulus Anatomy: Flat base puffs + Billowing upper domes
      const basePuffCount = 3 + Math.floor(Math.random() * 3);
      for (let b = 0; b < basePuffCount; b++) {
        const bRad = 2.6 + Math.random() * 1.8;
        const bGeo = new THREE.SphereGeometry(bRad, 12, 10);
        bGeo.scale(1.8, 0.55, 1.3);
        const bMesh = new THREE.Mesh(bGeo, cloudMat);
        bMesh.position.set((b - basePuffCount / 2) * 3.6, 0, (Math.random() - 0.5) * 1.8);
        cloudGroup.add(bMesh);
      }

      const domeCount = 2 + Math.floor(Math.random() * 2);
      for (let d = 0; d < domeCount; d++) {
        const dRad = 3.2 + Math.random() * 2.2;
        const dGeo = new THREE.SphereGeometry(dRad, 12, 10);
        dGeo.scale(1.15, 1.25, 1.15);
        const dMesh = new THREE.Mesh(dGeo, cloudMat);
        dMesh.position.set((d - domeCount / 2) * 3.2 + (Math.random() - 0.5) * 1.2, 1.8 + Math.random() * 1.2, (Math.random() - 0.5) * 1.4);
        cloudGroup.add(dMesh);
      }

      group.add(cloudGroup);
      this.clouds.push({
        group: cloudGroup,
        speed: 1.8 + Math.random() * 2.2,
      });
    }

    // Layer 2: Distant Horizon Cumulus Banks (y = 1.2 to 3.2, z = -110 to -170)
    for (let i = 0; i < 10; i++) {
      const horizonCloud = new THREE.Group();
      const hx = (Math.random() - 0.5) * 320;
      const hy = 1.4 + (i % 3) * 0.65;
      const hz = -120 - (i % 3) * 20;
      horizonCloud.position.set(hx, hy, hz);

      const puffCount = 5 + Math.floor(Math.random() * 3);
      for (let p = 0; p < puffCount; p++) {
        const pRad = 5.2 + Math.random() * 3.2;
        const pGeo = new THREE.SphereGeometry(pRad, 10, 8);
        pGeo.scale(2.2, 0.7, 1.4);
        const pMesh = new THREE.Mesh(pGeo, cloudMat);
        pMesh.position.set((p - puffCount / 2) * 7.2, (Math.random() - 0.5) * 1.4, (Math.random() - 0.5) * 3.0);
        horizonCloud.add(pMesh);
      }

      group.add(horizonCloud);
      this.clouds.push({
        group: horizonCloud,
        speed: 0.9 + Math.random() * 1.1,
      });
    }

    return group;
  }

  private createPalmTree(height: number, leanAngle: number, leanDir: number): THREE.Group {
    const palm = new THREE.Group();

    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.85,
    });
    const frondMat = new THREE.MeshStandardMaterial({
      color: 0x16a34a,
      roughness: 0.6,
    });
    const tipMat = new THREE.MeshStandardMaterial({
      color: 0x4ade80,
      roughness: 0.5,
    });

    // 3 curved trunk segments creating organic lean
    const segHeight = height / 3;
    let currY = 0;
    let currX = 0;
    let currZ = 0;
    const dx = Math.sin(leanDir) * Math.sin(leanAngle) * segHeight * 0.7;
    const dz = Math.cos(leanDir) * Math.sin(leanAngle) * segHeight * 0.7;

    for (let s = 0; s < 3; s++) {
      const bottomR = 0.44 - s * 0.06;
      const topR = 0.36 - s * 0.06;
      const trunkGeo = new THREE.CylinderGeometry(topR, bottomR, segHeight, 6);
      trunkGeo.translate(0, segHeight / 2, 0);
      const trunkMesh = new THREE.Mesh(trunkGeo, trunkMat);
      trunkMesh.position.set(currX, currY, currZ);
      trunkMesh.rotation.z = Math.sin(leanDir) * (leanAngle * (s + 1) * 0.35);
      trunkMesh.rotation.x = Math.cos(leanDir) * (leanAngle * (s + 1) * 0.35);
      palm.add(trunkMesh);

      currY += segHeight * 0.92;
      currX += dx;
      currZ += dz;
    }

    // Coconut cluster
    const cocoMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
    const cocoGeo = new THREE.SphereGeometry(0.3, 5, 5);
    for (let c = 0; c < 3; c++) {
      const coco = new THREE.Mesh(cocoGeo, cocoMat);
      const cAng = (c / 3) * Math.PI * 2;
      coco.position.set(currX + Math.cos(cAng) * 0.35, currY - 0.15, currZ + Math.sin(cAng) * 0.35);
      palm.add(coco);
    }

    // 7 arching palm fronds
    for (let f = 0; f < 7; f++) {
      const frondAngle = (f / 7) * Math.PI * 2;
      const frondGroup = new THREE.Group();
      frondGroup.position.set(currX, currY, currZ);
      frondGroup.rotation.y = frondAngle;

      const bladeGeo = new THREE.ConeGeometry(1.4, 3.8, 4);
      bladeGeo.scale(0.85, 1, 0.15); // Flattened palm frond
      bladeGeo.rotateX(Math.PI / 2.3);
      const blade = new THREE.Mesh(bladeGeo, f % 2 === 0 ? frondMat : tipMat);
      blade.position.set(0, 0, 1.6);
      frondGroup.add(blade);

      palm.add(frondGroup);
    }

    return palm;
  }

  private createDistantIslands(): THREE.Group {
    const group = new THREE.Group();
    this.islandFoamRings = [];

    const sandMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.85 });
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
    const darkRockMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.92 });
    const jungleMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.7 });
    const deepJungleMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.75 });
    const foamMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 });

    // Helper: Add shoreline foam ring around an island base
    const addIslandFoam = (x: number, z: number, rX: number, rZ: number) => {
      const foamGeo = new THREE.RingGeometry(rX * 0.92, rX * 1.08, 32);
      foamGeo.scale(1, rZ / rX, 1);
      foamGeo.rotateX(-Math.PI / 2);
      const foam = new THREE.Mesh(foamGeo, foamMat);
      foam.position.set(x, -6.38, z);
      group.add(foam);
      this.islandFoamRings.push(foam);
    };

    // Island 1: Twin Karst Sea Pinnacles & Sandbar (North-East, under the morning sun)
    {
      const isl = new THREE.Group();
      isl.position.set(85, -6.5, -115);

      // Warm coral sandspit resting on waterline
      const sandGeo = new THREE.SphereGeometry(22, 10, 8);
      sandGeo.scale(1.6, 0.16, 1.2);
      const sand = new THREE.Mesh(sandGeo, sandMat);
      sand.position.set(0, 1.8, 0);
      isl.add(sand);

      // Main Karst Pinnacle
      const rock1Geo = new THREE.CylinderGeometry(2.8, 5.0, 8.5, 8);
      const rock1 = new THREE.Mesh(rock1Geo, rockMat);
      rock1.position.set(-3, 5.2, -1);
      isl.add(rock1);

      const cap1Geo = new THREE.SphereGeometry(4.2, 8, 8);
      cap1Geo.scale(1.1, 0.5, 1.1);
      const cap1 = new THREE.Mesh(cap1Geo, jungleMat);
      cap1.position.set(-3, 9.8, -1);
      isl.add(cap1);

      // Secondary Sea Stack
      const rock2Geo = new THREE.CylinderGeometry(2.0, 3.8, 6.0, 8);
      const rock2 = new THREE.Mesh(rock2Geo, darkRockMat);
      rock2.position.set(4, 3.8, 3);
      isl.add(rock2);

      const cap2Geo = new THREE.SphereGeometry(3.2, 8, 8);
      cap2Geo.scale(1.0, 0.45, 1.0);
      const cap2 = new THREE.Mesh(cap2Geo, deepJungleMat);
      cap2.position.set(4, 7.2, 3);
      isl.add(cap2);

      // Leaning tropical palms along the sandbar
      const palm1 = this.createPalmTree(4.6, 0.25, 0.8);
      palm1.position.set(1, 2.5, -4);
      isl.add(palm1);

      const palm2 = this.createPalmTree(3.8, 0.28, -1.2);
      palm2.position.set(-7, 2.5, 2);
      isl.add(palm2);

      group.add(isl);
      addIslandFoam(85, -115, 30, 24);
    }

    // Island 2: Emerald Mountain Island (North-West)
    {
      const isl = new THREE.Group();
      isl.position.set(-95, -6.5, -125);

      // Wide sandy cove base
      const sandGeo = new THREE.SphereGeometry(26, 10, 8);
      sandGeo.scale(1.7, 0.18, 1.3);
      const sand = new THREE.Mesh(sandGeo, sandMat);
      sand.position.set(0, 2.0, 0);
      isl.add(sand);

      // Layered jungle mountain ridge
      const hillGeo = new THREE.SphereGeometry(18, 8, 8);
      hillGeo.scale(1.4, 0.35, 1.1);
      const hill = new THREE.Mesh(hillGeo, deepJungleMat);
      hill.position.set(0, 4.2, 0);
      isl.add(hill);

      const peakGeo = new THREE.ConeGeometry(9, 8.5, 8);
      const peak = new THREE.Mesh(peakGeo, rockMat);
      peak.position.set(0, 9.0, -1);
      isl.add(peak);

      const peakCapGeo = new THREE.SphereGeometry(5.5, 8, 8);
      peakCapGeo.scale(1.1, 0.5, 1.1);
      const peakCap = new THREE.Mesh(peakCapGeo, jungleMat);
      peakCap.position.set(0, 13.5, -1);
      isl.add(peakCap);

      // Palm Grove
      [-8, -2, 6].forEach((px, i) => {
        const palm = this.createPalmTree(4.2 + i * 0.5, 0.22, (i - 1) * 0.9);
        palm.position.set(px, 3.0, 6 - i * 3);
        isl.add(palm);
      });

      group.add(isl);
      addIslandFoam(-95, -125, 36, 28);
    }

    // Island 3: Distant Polynesian Atoll (Far horizon silhouette, leaving center ocean open)
    {
      const isl = new THREE.Group();
      isl.position.set(12, -6.5, -210);

      const sandGeo = new THREE.SphereGeometry(24, 8, 6);
      sandGeo.scale(2.0, 0.15, 1.2);
      const sand = new THREE.Mesh(sandGeo, sandMat);
      sand.position.set(0, 1.5, 0);
      isl.add(sand);

      const vegGeo = new THREE.SphereGeometry(16, 6, 6);
      vegGeo.scale(1.5, 0.28, 1.0);
      const veg = new THREE.Mesh(vegGeo, jungleMat);
      veg.position.set(0, 3.2, 0);
      isl.add(veg);

      // Subtle palms
      [-6, 4].forEach((px, i) => {
        const palm = this.createPalmTree(3.8, 0.2, i * 1.5);
        palm.position.set(px, 2.5, 0);
        isl.add(palm);
      });

      group.add(isl);
      addIslandFoam(12, -210, 38, 22);
    }

    // Island 4: Western Archipelago Ridge
    {
      const isl = new THREE.Group();
      isl.position.set(-140, -6.5, -65);

      const sandGeo = new THREE.SphereGeometry(22, 8, 6);
      sandGeo.scale(1.6, 0.16, 1.2);
      const sand = new THREE.Mesh(sandGeo, sandMat);
      sand.position.set(0, 1.8, 0);
      isl.add(sand);

      const ridgeGeo = new THREE.SphereGeometry(15, 6, 6);
      ridgeGeo.scale(1.4, 0.32, 1.1);
      const ridge = new THREE.Mesh(ridgeGeo, jungleMat);
      ridge.position.set(0, 3.8, 0);
      isl.add(ridge);

      const palm = this.createPalmTree(4.2, 0.25, 0.5);
      palm.position.set(0, 2.8, 0);
      isl.add(palm);

      group.add(isl);
      addIslandFoam(-140, -65, 28, 22);
    }

    // Island 5: Eastern Coral Atoll
    {
      const isl = new THREE.Group();
      isl.position.set(135, -6.5, -60);

      const sandGeo = new THREE.SphereGeometry(20, 8, 6);
      sandGeo.scale(1.6, 0.16, 1.2);
      const sand = new THREE.Mesh(sandGeo, sandMat);
      sand.position.set(0, 1.8, 0);
      isl.add(sand);

      const hillGeo = new THREE.SphereGeometry(14, 6, 6);
      hillGeo.scale(1.3, 0.30, 1.0);
      const hill = new THREE.Mesh(hillGeo, deepJungleMat);
      hill.position.set(0, 3.6, 0);
      isl.add(hill);

      const palm = this.createPalmTree(4.0, 0.22, -0.6);
      palm.position.set(2, 2.8, 1);
      isl.add(palm);

      group.add(isl);
      addIslandFoam(135, -60, 26, 20);
    }

    return group;
  }

  private createBreezeParticles(parent: THREE.Scene) {
    this.breezeParticles = [];
    const leafGeo = new THREE.PlaneGeometry(0.24, 0.36);
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x4ade80,
      roughness: 0.5,
      side: THREE.DoubleSide,
    });

    for (let i = 0; i < 40; i++) {
      const mesh = new THREE.Mesh(leafGeo, leafMat);
      mesh.position.set(
        (Math.random() - 0.5) * 28,
        0.8 + Math.random() * 4.5,
        (Math.random() - 0.5) * 28
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      parent.add(mesh);
      this.breezeParticles.push({
        mesh,
        seed: Math.random() * 10,
        speed: 1.5 + Math.random() * 2.5,
      });
    }
  }

  private createCenterBonfireAltar(): THREE.Group {
    const group = new THREE.Group();
    group.position.set(0, 0, 0);

    // 1. Weathered Basalt Stone Hearth / Brazier Rim
    const stoneHearthGeo = new THREE.CylinderGeometry(2.1, 2.25, 0.28, 24);
    const stoneHearthMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Dark slate / basalt stone
      roughness: 0.9,
      metalness: 0.1,
    });
    const stoneHearth = new THREE.Mesh(stoneHearthGeo, stoneHearthMat);
    stoneHearth.position.y = 0.14;
    stoneHearth.receiveShadow = true;
    group.add(stoneHearth);

    // Inner glowing coal bed / volcanic ember ash with intense heat glow
    const coalGeo = new THREE.CylinderGeometry(1.85, 1.85, 0.1, 24);
    const coalMat = new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      emissive: 0xea580c, // Deep incandescent heat
      emissiveIntensity: 1.3,
      roughness: 0.95,
    });
    const coal = new THREE.Mesh(coalGeo, coalMat);
    coal.position.y = 0.24;
    group.add(coal);

    // 8 Carved Sacred Hearth Stones around the outer rim
    const hearthRimMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.85,
    });
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const rx = Math.cos(angle) * 1.95;
      const rz = Math.sin(angle) * 1.95;
      const stoneGeo = new THREE.BoxGeometry(0.55, 0.22, 0.35);
      const stone = new THREE.Mesh(stoneGeo, hearthRimMat);
      stone.position.set(rx, 0.26, rz);
      stone.rotation.y = -angle;
      group.add(stone);
    }

    // 2. Realistic Charred Timber Logs with Glowing Ember Cracks
    const logMat = new THREE.MeshStandardMaterial({
      color: 0x271a0c,
      emissive: 0x7c2d12,
      emissiveIntensity: 0.5,
      roughness: 0.9,
    });
    [0, Math.PI / 3, (Math.PI * 2) / 3, Math.PI / 6, Math.PI / 2, (Math.PI * 5) / 6].forEach((angle, idx) => {
      const logGeo = new THREE.CylinderGeometry(0.11, 0.14, 2.1, 7);
      logGeo.rotateX(Math.PI / 2);
      logGeo.rotateZ(0.18 * (idx % 2 === 0 ? 1 : -1));
      const log = new THREE.Mesh(logGeo, logMat);
      log.rotation.y = angle;
      log.position.set(0, 0.28, 0);
      group.add(log);
    });

    // 3. Volumetric Additive Flame Billboards (Realistic incandescent fire column)
    this.flameParticles = [];
    const flameTexture = this.createRealisticFlameTexture();
    const flameMat = new THREE.MeshBasicMaterial({
      map: flameTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const flameCount = 36;
    for (let i = 0; i < flameCount; i++) {
      const width = 0.75 + Math.random() * 0.45;
      const height = 1.35 + Math.random() * 0.65;
      const geo = new THREE.PlaneGeometry(width, height);
      const mesh = new THREE.Mesh(geo, flameMat);

      // Distribute in a cylinder around the center embers
      const ang = Math.random() * Math.PI * 2;
      const rad = Math.random() * 0.65;
      const bx = Math.cos(ang) * rad;
      const bz = Math.sin(ang) * rad;
      mesh.position.set(bx, 0.35 + Math.random() * 1.8, bz);
      group.add(mesh);

      this.flameParticles.push({
        mesh,
        baseX: bx,
        baseZ: bz,
        speedY: 1.8 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2,
        scaleBase: 0.85 + Math.random() * 0.35,
      });
    }

    // 4. Realistic Crackling Spark Embers (24 particles)
    this.fireEmbers = [];
    const emberGeo = new THREE.SphereGeometry(0.045, 4, 4);
    const emberMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    for (let i = 0; i < 24; i++) {
      const ember = new THREE.Mesh(emberGeo, emberMat);
      ember.position.set((Math.random() - 0.5) * 0.9, 0.3 + Math.random() * 3.5, (Math.random() - 0.5) * 0.9);
      group.add(ember);
      this.fireEmbers.push({
        mesh: ember,
        seed: Math.random() * 10,
        speed: 2.2 + Math.random() * 2.8,
        life: Math.random() * 2.5,
        maxLife: 2.5,
      });
    }

    // 5. Soft Dissipating Smoke Puffs (10 particles)
    this.fireSmoke = [];
    const smokeGeo = new THREE.SphereGeometry(0.25, 6, 6);
    const smokeMat = new THREE.MeshBasicMaterial({
      color: 0x475569,
      transparent: true,
      opacity: 0.16,
    });
    for (let i = 0; i < 10; i++) {
      const smoke = new THREE.Mesh(smokeGeo, smokeMat);
      smoke.position.set((Math.random() - 0.5) * 0.5, 2.0 + Math.random() * 3.2, (Math.random() - 0.5) * 0.5);
      group.add(smoke);
      this.fireSmoke.push({
        mesh: smoke,
        seed: Math.random() * 10,
        speed: 1.0 + Math.random() * 0.8,
        life: Math.random() * 3.0,
        maxLife: 3.0,
      });
    }

    // 6. Dynamic Campfire PointLight
    this.fireLight = new THREE.PointLight(0xf97316, 2.8, 22);
    this.fireLight.position.set(0, 1.4, 0);
    group.add(this.fireLight);

    return group;
  }

  private createStarClumpGeometry(w: number, h: number): THREE.BufferGeometry {
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    // 3 crossed planes forming a symmetrical star (*) at 0, 60, and 120 degrees
    const angles = [0, Math.PI / 3, (2 * Math.PI) / 3];

    angles.forEach((ang, planeIdx) => {
      const cos = Math.cos(ang) * (w / 2);
      const sin = Math.sin(ang) * (w / 2);
      const baseVertex = planeIdx * 4;

      // 4 vertices per plane (standing upright with root pivot at y = 0)
      // 0: bottom-left
      positions.push(-cos, 0, -sin);
      uvs.push(0, 0);

      // 1: bottom-right
      positions.push(cos, 0, sin);
      uvs.push(1, 0);

      // 2: top-right
      positions.push(cos, h, sin);
      uvs.push(1, 1);

      // 3: top-left
      positions.push(-cos, h, -sin);
      uvs.push(0, 1);

      // 2 triangles per quad (front and back visible with DoubleSide)
      indices.push(
        baseVertex, baseVertex + 1, baseVertex + 2,
        baseVertex, baseVertex + 2, baseVertex + 3
      );
    });

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    return geo;
  }

  private setupGrassShader(material: THREE.MeshStandardMaterial) {
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 };
      shader.uniforms.uCurrentRadius = { value: this.initialRadius };
      material.userData.shader = shader;

      shader.vertexShader = `
        uniform float uTime;
        uniform float uCurrentRadius;
      ` + shader.vertexShader;

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        #ifdef USE_INSTANCING
          vec4 instCenter = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        #else
          vec4 instCenter = modelMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        #endif

        if (length(instCenter.xz) > uCurrentRadius - 0.20) {
          transformed = vec3(0.0);
        } else {
          float heightFactor = clamp(position.y / 0.48, 0.0, 1.0);
          float wave = uTime * 3.2 + instCenter.x * 0.35 + instCenter.z * 0.28;
          float windOffset = (sin(wave) * 0.14 + sin(wave * 2.2) * 0.04) * heightFactor;
          transformed.x += windOffset;
          transformed.z += windOffset * 0.6;
        }
        `
      );
    };
  }

  private createWindGrassAndWildflowers(parent: THREE.Scene) {
    // 1. High-Resolution Botanical Grass Clump Textures (Curved slender blades + wildflowers)
    const grassTex = this.createBotanicalGrassTexture(false);
    const flowerGrassTex = this.createBotanicalGrassTexture(true);

    this.grassMaterial = new THREE.MeshStandardMaterial({
      map: grassTex,
      transparent: true,
      alphaTest: 0.35,
      roughness: 0.55,
      metalness: 0.02,
      side: THREE.DoubleSide,
    });
    this.setupGrassShader(this.grassMaterial);

    this.flowerMaterial = new THREE.MeshStandardMaterial({
      map: flowerGrassTex,
      transparent: true,
      alphaTest: 0.35,
      roughness: 0.55,
      metalness: 0.02,
      side: THREE.DoubleSide,
    });
    this.setupGrassShader(this.flowerMaterial);

    // 2. Pre-merged Star (*) Clump Geometry (3 crossed planes in a single buffer)
    const clumpGeo = this.createStarClumpGeometry(0.72, 0.48);

    // 3. Continuous Blanket Coverage Across the WHOLE BASE
    const totalTufts = 1600;
    const flowerCount = Math.floor(totalTufts * 0.25); // 400 flower tufts
    const grassCount = totalTufts - flowerCount;       // 1200 pure grass tufts

    const grassMesh = new THREE.InstancedMesh(clumpGeo, this.grassMaterial, grassCount);
    grassMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    grassMesh.receiveShadow = true;

    const flowerMesh = new THREE.InstancedMesh(clumpGeo, this.flowerMaterial, flowerCount);
    flowerMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    flowerMesh.receiveShadow = true;

    const rMin = 2.05; // Snug against the center bonfire hearth
    const rMax = this.initialRadius - 0.15; // 12.85m

    const dummy = new THREE.Object3D();
    let grassIdx = 0;
    let flowerIdx = 0;

    for (let i = 0; i < totalTufts; i++) {
      const u = Math.random();
      const r = Math.sqrt(rMin * rMin + u * (rMax * rMax - rMin * rMin));
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;

      const scale = 0.85 + Math.random() * 0.40;
      const rotY = Math.random() * Math.PI * 2;

      dummy.position.set(x, 0, z);
      dummy.rotation.set(0, rotY, 0);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();

      if (i % 4 === 0 && flowerIdx < flowerCount) {
        flowerMesh.setMatrixAt(flowerIdx++, dummy.matrix);
      } else if (grassIdx < grassCount) {
        grassMesh.setMatrixAt(grassIdx++, dummy.matrix);
      }
    }

    grassMesh.instanceMatrix.needsUpdate = true;
    flowerMesh.instanceMatrix.needsUpdate = true;

    parent.add(grassMesh);
    parent.add(flowerMesh);
  }

  private createArena() {
    // 1. Rugged Coastal Island Cliff Base (Descends down into the turquoise ocean)
    const cliffGeo = new THREE.CylinderGeometry(this.initialRadius, this.initialRadius * 0.78, 6.4, 48);
    const cliffMat = new THREE.MeshStandardMaterial({
      color: 0x544738, // Warm weathered limestone cliff rock
      roughness: 0.88,
      metalness: 0.05,
    });
    const cliff = new THREE.Mesh(cliffGeo, cliffMat);
    cliff.position.y = -3.4;
    cliff.receiveShadow = true;
    this.arenaGroup.add(cliff);

    // Upper Cliff Moss Lip Overhang
    const mossRimGeo = new THREE.TorusGeometry(this.initialRadius, 0.35, 8, 64);
    mossRimGeo.rotateX(Math.PI / 2);
    const mossRimMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a1e, // Deep emerald cliff moss
      roughness: 0.80,
    });
    const mossRim = new THREE.Mesh(mossRimGeo, mossRimMat);
    mossRim.position.y = -0.25;
    this.arenaGroup.add(mossRim);

    // 2. Lush Stylized Grass Turf Lawn (Top Fighting Ground)
    const grassTexture = this.createGrassTexture();
    const turfGeo = new THREE.CylinderGeometry(this.initialRadius, this.initialRadius, 0.4, 64);
    const turfMat = new THREE.MeshStandardMaterial({
      map: grassTexture,
      roughness: 0.65,
      metalness: 0.04,
    });
    const arena = new THREE.Mesh(turfGeo, turfMat);
    arena.position.y = -0.18;
    arena.receiveShadow = true;

    // 3. Ancient Sacred Bonfire Altar (Directly added to scene so it never shrinks!)
    this.centerFirePit = this.createCenterBonfireAltar();
    this.scene.add(this.centerFirePit);

    // 4. Carved Ancient Limestone Perimeter Rim & Runes
    const blockCount = 32;
    const blockMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1, // Weathered limestone stone
      roughness: 0.75,
      metalness: 0.1,
    });
    for (let i = 0; i < blockCount; i++) {
      const angle = (i / blockCount) * Math.PI * 2;
      const bx = Math.cos(angle) * (this.initialRadius - 0.22);
      const bz = Math.sin(angle) * (this.initialRadius - 0.22);

      const blockGeo = new THREE.BoxGeometry(1.2, 0.16, 0.38);
      const block = new THREE.Mesh(blockGeo, blockMat);
      block.position.set(bx, 0.04, bz);
      block.rotation.y = -angle;
      this.arenaGroup.add(block);
    }

    // 5. Populate 3D Wind-Swaying Grass Tufts & Wildflowers across the field
    this.createWindGrassAndWildflowers(this.scene);

    return arena;
  }

  private createAimReticle(): THREE.Group {
    const group = new THREE.Group();

    // 1. Dotted / Dashed laser guide on ground
    const shaftGeo = new THREE.PlaneGeometry(0.32, 4.2);
    shaftGeo.rotateX(-Math.PI / 2);
    const shaftMat = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.z = -2.1;
    group.add(shaft);

    // 2. Glowing Arrowhead
    const tipGeo = new THREE.ConeGeometry(0.48, 0.9, 16);
    tipGeo.rotateX(-Math.PI / 2);
    const tipMat = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.9,
    });
    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.position.z = -4.5;
    group.add(tip);

    group.position.y = 0.04;
    group.visible = false;
    return group;
  }

  private setupCharacters() {
    // Player on south side
    const pMesh = createChampionMesh(this.playerChampionId);
    pMesh.group.position.set(0, 0, 6);
    this.scene.add(pMesh.group);

    this.player = {
      mesh: pMesh.group,
      bodyMesh: pMesh.bodyMesh,
      coreMesh: pMesh.coreMesh,
      fists: pMesh.fists,
      legs: pMesh.legs,
      arms: pMesh.arms,
      champData: pMesh,
      pos: pMesh.group.position,
      vel: new THREE.Vector3(0, 0, 0),
      targetAngle: 0,
      currentAngle: 0,
      isDashing: false,
      dashTimer: 0,
      dashPowerPercent: 0,
      chargePercent: 100,
      radius: 0.8,
      isGrounded: true,
      isKnockedOut: false,
      walkCycle: 0,
      isBot: false,
    };

    // Bot on north side
    const bMesh = createChampionMesh(this.botChampionId);
    bMesh.group.position.set(0, 0, -6);
    bMesh.group.rotation.y = Math.PI;
    this.scene.add(bMesh.group);

    this.bot = {
      mesh: bMesh.group,
      bodyMesh: bMesh.bodyMesh,
      coreMesh: bMesh.coreMesh,
      fists: bMesh.fists,
      legs: bMesh.legs,
      arms: bMesh.arms,
      champData: bMesh,
      pos: bMesh.group.position,
      vel: new THREE.Vector3(0, 0, 0),
      targetAngle: Math.PI,
      currentAngle: Math.PI,
      isDashing: false,
      dashTimer: 0,
      dashPowerPercent: 0,
      chargePercent: 100,
      radius: 0.8,
      isGrounded: true,
      isKnockedOut: false,
      walkCycle: 0,
      isBot: true,
    };
  }

  public setPlayerChampion(id: ChampionId) {
    if (this.playerChampionId === id && this.player) return;
    this.playerChampionId = id;
    this.state.playerChampionId = id;
    this.state.playerSkillMaxCooldown = CHAMPIONS[id]?.skill?.cooldown ?? 7;
    this.playerSkillCooldownTimer = 0;

    if (this.player && this.player.mesh) {
      const pos = this.player.pos.clone();
      const rotY = this.player.currentAngle;
      this.scene.remove(this.player.mesh);

      const pMesh = createChampionMesh(id);
      pMesh.group.position.copy(pos);
      pMesh.group.rotation.y = rotY;
      this.scene.add(pMesh.group);

      this.player.mesh = pMesh.group;
      this.player.bodyMesh = pMesh.bodyMesh;
      this.player.coreMesh = pMesh.coreMesh;
      this.player.fists = pMesh.fists;
      this.player.legs = pMesh.legs;
      this.player.arms = pMesh.arms;
      this.player.champData = pMesh;
      this.player.pos = pMesh.group.position;
    }
    this.onStateChange({ ...this.state });
  }

  public setBotChampion(id: ChampionId) {
    if (this.botChampionId === id && this.bot) return;
    this.botChampionId = id;

    if (this.bot && this.bot.mesh) {
      const pos = this.bot.pos.clone();
      const rotY = this.bot.currentAngle;
      this.scene.remove(this.bot.mesh);

      const bMesh = createChampionMesh(id);
      bMesh.group.position.copy(pos);
      bMesh.group.rotation.y = rotY;
      this.scene.add(bMesh.group);

      this.bot.mesh = bMesh.group;
      this.bot.bodyMesh = bMesh.bodyMesh;
      this.bot.coreMesh = bMesh.coreMesh;
      this.bot.fists = bMesh.fists;
      this.bot.legs = bMesh.legs;
      this.bot.arms = bMesh.arms;
      this.bot.champData = bMesh;
      this.bot.pos = bMesh.group.position;
    }
  }

  public setPlayerTrophies(trophies: number) {
    this.playerTrophies = trophies;
  }

  // Input Handling
  private onKeyDown = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = true;
    if (e.code === 'Space' && !this.spaceKeyHeld) {
      this.spaceKeyHeld = true;
      // Start aiming in current movement direction
      this.setAim(true);
    } else if (e.code === 'KeyE' || e.code === 'KeyQ') {
      this.triggerSpecialSkill(true);
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = false;
    if (e.code === 'Space' && this.spaceKeyHeld) {
      this.spaceKeyHeld = false;
      this.triggerDash();
    }
  };

  public setTouchJoystick(x: number, z: number) {
    this.inputVector.x = x;
    this.inputVector.z = z;
    // If aiming with space key, update aim direction with joystick movement
    if (this.spaceKeyHeld) {
      this.setAim(true, x, z);
    }
  }

  // Set 3D Aim Reticle (Option C: Hold & Drag to Aim)
  public setAim(isAiming: boolean, aimX?: number, aimZ?: number) {
    if (this.state.isGameOver || this.state.isPaused || this.player.isKnockedOut) {
      this.aimReticleGroup.visible = false;
      this.state.isAiming = false;
      return;
    }

    if (!isAiming) {
      this.aimReticleGroup.visible = false;
      this.state.isAiming = false;
      this.onStateChange({ ...this.state });
      return;
    }

    this.state.isAiming = true;
    this.aimReticleGroup.visible = true;

    // Determine direction
    let dirX = 0;
    let dirZ = -1; // Default forward into ring

    if (aimX !== undefined && aimZ !== undefined && Math.hypot(aimX, aimZ) > 0.05) {
      const len = Math.hypot(aimX, aimZ);
      dirX = aimX / len;
      dirZ = aimZ / len;
    } else if (Math.hypot(this.inputVector.x, this.inputVector.z) > 0.05) {
      const len = Math.hypot(this.inputVector.x, this.inputVector.z);
      dirX = this.inputVector.x / len;
      dirZ = this.inputVector.z / len;
    } else {
      dirX = -Math.sin(this.player.currentAngle);
      dirZ = -Math.cos(this.player.currentAngle);
    }

    const angle = Math.atan2(-dirX, -dirZ);
    this.state.aimAngle = angle;

    // Update 3D reticle position, rotation & charge length
    this.aimReticleGroup.position.set(this.player.pos.x, 0.04, this.player.pos.z);
    this.aimReticleGroup.rotation.y = angle;

    // Length scales noticeably with charge percent (10% to 100%)
    const ratio = Math.max(0.1, this.player.chargePercent / 100);
    const lengthScale = 0.5 + ratio * 1.5;
    this.aimReticleGroup.scale.set(1, 1, lengthScale);

    // Color reticle based on charge tier
    let colorHex = 0x00f5ff;
    if (ratio >= 0.98) colorHex = 0xff0055;
    else if (ratio >= 0.7) colorHex = 0xf59e0b;
    else if (ratio >= 0.4) colorHex = 0x8b5cf6;

    this.aimReticleGroup.children.forEach((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.material) {
        (mesh.material as THREE.MeshBasicMaterial).color.setHex(colorHex);
      }
    });

    this.onStateChange({ ...this.state });
  }

  // Option C: Tap to dash in movement direction, or drag to aim and release
  public triggerDash(aimX?: number, aimZ?: number) {
    if (this.state.isGameOver || this.state.isPaused || this.player.isKnockedOut || this.state.countdown > 0) return;

    // Minimum 10% charge to activate dash
    if (this.player.chargePercent < 10) return;

    const charge = this.player.chargePercent;
    const ratio = charge / 100; // 0.1 to 1.0

    // Scaled speed & duration: Every percentage is distinct!
    // 10% charge -> speed 14, 40% -> speed 20.0, 50% -> speed 22.0, 100% -> speed 32.0
    const speed = 12 + ratio * 20;
    const duration = 0.16 + ratio * 0.18;

    // Determine direction
    let dirX = 0;
    let dirZ = 0;

    if (aimX !== undefined && aimZ !== undefined && Math.hypot(aimX, aimZ) > 0.05) {
      const len = Math.hypot(aimX, aimZ);
      dirX = aimX / len;
      dirZ = aimZ / len;
      this.player.currentAngle = Math.atan2(-dirX, -dirZ);
      this.player.targetAngle = this.player.currentAngle;
    } else if (Math.hypot(this.inputVector.x, this.inputVector.z) > 0.05) {
      const len = Math.hypot(this.inputVector.x, this.inputVector.z);
      dirX = this.inputVector.x / len;
      dirZ = this.inputVector.z / len;
      this.player.currentAngle = Math.atan2(-dirX, -dirZ);
      this.player.targetAngle = this.player.currentAngle;
    } else {
      dirX = -Math.sin(this.player.currentAngle);
      dirZ = -Math.cos(this.player.currentAngle);
    }

    this.player.isDashing = true;
    this.player.dashTimer = duration;
    this.player.dashPowerPercent = charge;
    this.player.vel.x = dirX * speed;
    this.player.vel.z = dirZ * speed;

    // Sound scaling
    sounds.playDash(charge);

    // Particle visuals & color tiers
    let colorHex = 0x00f5ff;
    if (ratio >= 0.98) colorHex = 0xff0055;
    else if (ratio >= 0.7) colorHex = 0xf59e0b;
    else if (ratio >= 0.4) colorHex = 0x8b5cf6;

    const particleCount = Math.floor(6 + ratio * 18);
    this.spawnDashParticles(this.player.pos, colorHex, particleCount);

    // Camera punch for high-power dashes
    if (ratio >= 0.6) {
      this.triggerScreenShake(0.12 * ratio, 0.25 * ratio);
    }

    // Reset charge and hide reticle
    this.player.chargePercent = 0;
    this.state.playerCharge = 0;
    this.state.isAiming = false;
    this.aimReticleGroup.visible = false;
    this.onStateChange({ ...this.state });
  }

  public setCameraMode(mode: CameraMode) {
    this.state.cameraMode = mode;
    this.onStateChange({ ...this.state });
  }

  public togglePause() {
    this.state.isPaused = !this.state.isPaused;
    this.onStateChange({ ...this.state });
  }

  public resetMatch() {
    if (this.roundTimeoutId) {
      clearTimeout(this.roundTimeoutId);
      this.roundTimeoutId = null;
    }

    this.playerRoundWins = 0;
    this.botRoundWins = 0;
    this.currentRound = 1;
    this.roundHistory = [];
    this.elapsedTime = 0;
    this.warningSoundCooldown = 0;
    this.currentRadius = this.initialRadius;
    this.arenaGroup.scale.set(1, 1, 1);
    this.splashTriggered = { player: false, bot: false };

    this.player.pos.set(0, 0, 6);
    this.player.vel.set(0, 0, 0);
    this.player.isKnockedOut = false;
    this.player.isGrounded = true;
    this.player.mesh.visible = true;
    this.player.currentAngle = 0;
    this.player.targetAngle = 0;
    this.player.chargePercent = 100;
    this.player.mesh.rotation.set(0, 0, 0);

    this.bot.pos.set(0, 0, -6);
    this.bot.vel.set(0, 0, 0);
    this.bot.isKnockedOut = false;
    this.bot.isGrounded = true;
    this.bot.mesh.visible = true;
    this.bot.currentAngle = Math.PI;
    this.bot.targetAngle = Math.PI;
    this.bot.chargePercent = 100;
    this.bot.mesh.rotation.set(0, Math.PI, 0);

    if (this.player.legs) this.player.legs.forEach((l) => l.rotation.set(0, 0, 0));
    if (this.player.arms) this.player.arms.forEach((a) => a.rotation.set(0, 0, 0));
    if (this.bot.legs) this.bot.legs.forEach((l) => l.rotation.set(0, 0, 0));
    if (this.bot.arms) this.bot.arms.forEach((a) => a.rotation.set(0, 0, 0));

    this.state = {
      ...this.state,
      countdown: 3,
      timeRemaining: this.matchDuration,
      arenaRadius: this.initialRadius,
      playerRoundWins: 0,
      botRoundWins: 0,
      currentRound: 1,
      roundHistory: [],
      roundBannerText: null,
      roundBannerType: null,
      playerCharge: 100,
      isAiming: false,
      aimAngle: 0,
      isPaused: false,
      isGameOver: false,
      winner: null,
      warningText: null,
    };
    this.aimReticleGroup.visible = false;
    this.onStateChange({ ...this.state });
  }

  private spawnDashParticles(pos: THREE.Vector3, colorHex: number, count: number = 8) {
    for (let i = 0; i < count; i++) {
      const geo = new THREE.SphereGeometry(0.12, 6, 6);
      const mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.9 });
      const p = new THREE.Mesh(geo, mat);
      p.position.copy(pos);
      p.position.y += 0.8 + (Math.random() - 0.5) * 0.4;
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        Math.random() * 2,
        (Math.random() - 0.5) * 4
      );
      this.scene.add(p);
      this.particles.push({ mesh: p, life: 0, maxLife: 0.35, vel });
    }
  }

  private spawnShockwave(pos: THREE.Vector3, colorHex: number) {
    const ringGeo = new THREE.RingGeometry(0.5, 1.2, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(pos.x, 0.08, pos.z);
    this.scene.add(ring);
    this.particles.push({
      mesh: ring,
      life: 0,
      maxLife: 0.65,
      vel: new THREE.Vector3(0, 0, 0),
    });

    // Expanding spark burst
    for (let i = 0; i < 18; i++) {
      const geo = new THREE.SphereGeometry(0.14, 6, 6);
      const mat = new THREE.MeshBasicMaterial({ color: colorHex });
      const p = new THREE.Mesh(geo, mat);
      p.position.set(pos.x, 0.2, pos.z);
      const ang = (i / 18) * Math.PI * 2;
      const spd = 7 + Math.random() * 5;
      const vel = new THREE.Vector3(Math.cos(ang) * spd, 1.5 + Math.random() * 2, Math.sin(ang) * spd);
      this.scene.add(p);
      this.particles.push({ mesh: p, life: 0, maxLife: 0.5, vel });
    }
  }

  private spawnShieldDome(brawler: Brawler, isPlayer: boolean) {
    if (isPlayer && this.playerShieldMesh) {
      this.scene.remove(this.playerShieldMesh);
    } else if (!isPlayer && this.botShieldMesh) {
      this.scene.remove(this.botShieldMesh);
    }

    const domeGeo = new THREE.IcosahedronGeometry(1.65, 2);
    const domeMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.copy(brawler.pos);
    dome.position.y += 1.0;
    this.scene.add(dome);

    if (isPlayer) {
      this.playerShieldMesh = dome;
    } else {
      this.botShieldMesh = dome;
    }
  }

  private spawnGravityVortex(pos: THREE.Vector3, casterIsPlayer: boolean) {
    if (this.activeVortex) {
      this.scene.remove(this.activeVortex.mesh);
    }
    const vGeo = new THREE.TorusGeometry(1.4, 0.22, 12, 32);
    vGeo.rotateX(Math.PI / 2);
    const vMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e,
      wireframe: true,
      transparent: true,
      opacity: 0.9,
    });
    const vMesh = new THREE.Mesh(vGeo, vMat);
    vMesh.position.copy(pos);
    this.scene.add(vMesh);
    this.activeVortex = {
      pos: pos.clone(),
      timer: 2.4,
      mesh: vMesh,
      casterIsPlayer,
    };
  }

  public triggerSpecialSkill(isPlayer: boolean = true) {
    if (this.state.isGameOver || this.state.isPaused || this.state.countdown > 0) return;

    const brawler = isPlayer ? this.player : this.bot;
    const rival = isPlayer ? this.bot : this.player;
    const champId = isPlayer ? this.playerChampionId : this.botChampionId;

    if (brawler.isKnockedOut || !brawler.isGrounded) return;

    if (isPlayer) {
      if (this.playerSkillCooldownTimer > 0) return;
      const skill = CHAMPIONS[champId].skill;
      this.playerSkillCooldownTimer = skill.cooldown;
      this.playerSkillActiveTimer = 2.5;
      this.state.isPlayerSkillActive = true;
    } else {
      if (this.botSkillCooldownTimer > 0) return;
      const skill = CHAMPIONS[champId].skill;
      this.botSkillCooldownTimer = skill.cooldown;
      this.botSkillActiveTimer = 2.5;
    }

    // Execute character-specific active skill
    switch (champId) {
      case 'leo': {
        // Mega Ground Slam: Radial shockwave blowing rivals off the turf
        this.triggerScreenShake(0.35, 0.85);
        sounds.playBump(2.6);
        this.spawnShockwave(brawler.pos, 0x10b981);

        const dx = rival.pos.x - brawler.pos.x;
        const dz = rival.pos.z - brawler.pos.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 7.0 && dist > 0.01) {
          const force = (1 - dist / 7.5) * 22 + 6;
          const nx = dx / dist;
          const nz = dz / dist;
          rival.vel.x += nx * force;
          rival.vel.z += nz * force;
          this.spawnDashParticles(rival.pos, 0x10b981, 14);
        }
        break;
      }

      case 'kage': {
        // Shadow Blink: Teleports 5m forward through emerald smoke
        sounds.playDash(100);
        this.spawnDashParticles(brawler.pos, 0x34d399, 22);

        const facingX = -Math.sin(brawler.currentAngle);
        const facingZ = -Math.cos(brawler.currentAngle);
        let targetX = brawler.pos.x + facingX * 5.0;
        let targetZ = brawler.pos.z + facingZ * 5.0;

        // Keep inside arena boundary
        const targetDist = Math.hypot(targetX, targetZ);
        if (targetDist > this.currentRadius - 1.0) {
          const scale = (this.currentRadius - 1.5) / targetDist;
          targetX *= scale;
          targetZ *= scale;
        }

        brawler.pos.x = targetX;
        brawler.pos.z = targetZ;
        brawler.vel.set(0, 0, 0);

        this.spawnDashParticles(brawler.pos, 0x34d399, 22);
        this.triggerScreenShake(0.15, 0.4);
        break;
      }

      case 'titan': {
        // Iron Barrier: Impenetrable kinetic armor for 3s
        sounds.playBump(2.2);
        if (isPlayer) {
          this.isPlayerInvulnerable = true;
          this.playerSkillActiveTimer = 3.0;
        } else {
          this.isBotInvulnerable = true;
          this.botSkillActiveTimer = 3.0;
        }
        this.spawnShieldDome(brawler, isPlayer);
        break;
      }

      case 'bolt': {
        // Overcharge Surge: Hyper electric speed burst
        sounds.playDash(100);
        brawler.chargePercent = 100;
        const facingX = -Math.sin(brawler.currentAngle);
        const facingZ = -Math.cos(brawler.currentAngle);
        brawler.vel.x = facingX * 26;
        brawler.vel.z = facingZ * 26;
        brawler.isDashing = true;
        brawler.dashTimer = 0.4;
        brawler.dashPowerPercent = 100;
        this.spawnDashParticles(brawler.pos, 0xeab308, 20);
        this.triggerScreenShake(0.2, 0.5);
        break;
      }

      case 'nova': {
        // Gravity Vortex: Spawns cosmic singularity pulling rival in
        sounds.playWarning();
        this.spawnGravityVortex(new THREE.Vector3(0, 0.5, 0), isPlayer);
        break;
      }

      case 'kai':
      default: {
        // Sonic Shockwave: Blasts cone forward
        sounds.playBump(2.4);
        this.spawnShockwave(brawler.pos, 0x00f5ff);
        const facingX = -Math.sin(brawler.currentAngle);
        const facingZ = -Math.cos(brawler.currentAngle);
        const toRivalX = rival.pos.x - brawler.pos.x;
        const toRivalZ = rival.pos.z - brawler.pos.z;
        const dist = Math.hypot(toRivalX, toRivalZ);
        if (dist < 7.0 && dist > 0.01) {
          const dot = (facingX * toRivalX + facingZ * toRivalZ) / dist;
          if (dot > 0.35) {
            rival.vel.x += (toRivalX / dist) * 18;
            rival.vel.z += (toRivalZ / dist) * 18;
            this.spawnDashParticles(rival.pos, 0x00f5ff, 16);
          }
        }
        break;
      }
    }

    this.onStateChange({ ...this.state });
  }

  // Main Loop
  private loop = () => {
    this.animationId = requestAnimationFrame(this.loop);
    const dt = Math.min(this.clock.getDelta(), 0.05);

    this.updateEnvironment(dt);

    if (!this.state.isPaused) {
      this.update(dt);
    }

    this.updateCamera(dt);
    this.renderer.render(this.scene, this.camera);
  };

  private updateEnvironment(dt: number) {
    // 1. Drifting Procedural Cumulus Clouds across the tropical sky
    this.clouds.forEach((cloud) => {
      cloud.group.position.x += dt * cloud.speed;
      if (cloud.group.position.x > 180) {
        cloud.group.position.x = -180;
      }
    });

    // 2. Dynamic Ocean Shader Uniforms (Wave synthesis, caustics, sun reflection & arena shoreline breakers)
    if (this.oceanMaterial) {
      this.oceanMaterial.uniforms.uTime.value = this.elapsedTime;
      this.oceanMaterial.uniforms.uArenaRadius.value = this.currentRadius;
      this.oceanMaterial.uniforms.uCamPos.value.copy(this.camera.position);
    }

    // 3. Concentric Ocean Wave Foam Rings around the shrinking island cliff base
    this.oceanWaveRings.forEach((wave, idx) => {
      const cycle = Math.sin(this.elapsedTime * 1.8 + idx * Math.PI);
      const targetR = this.currentRadius + (idx === 0 ? 0.7 : 2.8);
      const baseGeoR = idx === 0 ? 14 : 22;
      const s = (targetR + cycle * 0.35) / baseGeoR;
      wave.scale.set(s, 1, s);
      if (wave.material) {
        (wave.material as THREE.MeshBasicMaterial).opacity = 0.35 + (cycle + 1) * 0.15;
      }
    });

    // 4. Distant Island Shoreline Surf Breathing Cycle
    this.islandFoamRings.forEach((foam, idx) => {
      const cycle = Math.sin(this.elapsedTime * 1.5 + idx * 0.8);
      const s = 1.0 + cycle * 0.05;
      foam.scale.set(s, 1, s);
      if (foam.material) {
        (foam.material as THREE.MeshBasicMaterial).opacity = 0.32 + (cycle + 1) * 0.12;
      }
    });

    // 5. Celestial Sun Atmospheric Shimmer & Diffraction
    if (this.sunCoronaSprite) {
      const coronaPuff = 1.0 + Math.sin(this.elapsedTime * 1.8) * 0.035;
      this.sunCoronaSprite.scale.set(65 * coronaPuff, 65 * coronaPuff, 1);
    }
    if (this.sunRaysSprite) {
      this.sunRaysSprite.material.rotation = this.elapsedTime * 0.012;
    }

    // 6. Island Breeze Leaf & Pollen Particles floating in the wind
    this.breezeParticles.forEach((leaf) => {
      leaf.mesh.position.x += dt * leaf.speed;
      leaf.mesh.position.y += Math.sin(this.elapsedTime * 2.4 + leaf.seed) * dt * 0.35;
      leaf.mesh.rotation.y += dt * 1.6;
      leaf.mesh.rotation.z += dt * 1.1;
      if (leaf.mesh.position.x > 18) leaf.mesh.position.x = -18;
    });

    // 4. Realistic Volumetric Flame Billboards (Rising, swirling, tapering, camera-facing)
    const camRot = this.camera.quaternion;
    this.flameParticles.forEach((p) => {
      p.mesh.quaternion.copy(camRot);
      p.mesh.position.y += dt * p.speedY;

      // Swirling turbulent motion
      const y = p.mesh.position.y;
      const progress = Math.min(1.0, Math.max(0, (y - 0.35) / 2.0));
      p.mesh.position.x = p.baseX + Math.sin(this.elapsedTime * 8 + p.phase) * (0.12 + progress * 0.35);
      p.mesh.position.z = p.baseZ + Math.cos(this.elapsedTime * 7 + p.phase) * (0.12 + progress * 0.35);

      // Natural flame taper (broad at base, slender and flickers at the tip)
      const scale = p.scaleBase * (1.1 - progress * 0.55) * (1.0 + Math.sin(this.elapsedTime * 14 + p.phase) * 0.18);
      p.mesh.scale.set(scale, scale * (1.0 + Math.sin(this.elapsedTime * 18 + p.phase) * 0.2), scale);

      // Loop back to base of campfire when reaching top
      if (p.mesh.position.y > 2.4) {
        p.mesh.position.y = 0.35 + Math.random() * 0.25;
      }
    });

    // 5. Realistic Rising Crackling Embers & Sparks
    this.fireEmbers.forEach((ember) => {
      ember.mesh.position.y += dt * ember.speed;
      ember.mesh.position.x += Math.sin(this.elapsedTime * 3.5 + ember.seed) * dt * 0.8;
      ember.mesh.position.z += Math.cos(this.elapsedTime * 3.2 + ember.seed) * dt * 0.8;
      if (ember.mesh.position.y > 4.2) {
        ember.mesh.position.set((Math.random() - 0.5) * 0.7, 0.35, (Math.random() - 0.5) * 0.7);
      }
    });

    // 6. Soft Smoke Drifting with Island Wind
    this.fireSmoke.forEach((smoke) => {
      smoke.mesh.position.y += dt * smoke.speed;
      smoke.mesh.position.x += dt * 0.45; // Drifts with island breeze
      const s = 1.0 + ((smoke.mesh.position.y - 2.0) / 3.5) * 1.8;
      smoke.mesh.scale.set(s, s, s);
      if (smoke.mesh.position.y > 5.5) {
        smoke.mesh.position.set((Math.random() - 0.5) * 0.4, 2.0, (Math.random() - 0.5) * 0.4);
      }
    });

    // 7. Authentic Campfire Multi-frequency Flicker
    if (this.fireLight) {
      this.fireLight.intensity = 2.5 + Math.sin(this.elapsedTime * 17) * 0.45 + Math.sin(this.elapsedTime * 29) * 0.25 + (Math.random() - 0.5) * 0.2;
    }

    // 8. Dynamic Botanical Grass Wind Waves & Shrink Culling (GPU Uniform Updates - Zero CPU Math!)
    if (this.grassMaterial?.userData?.shader) {
      this.grassMaterial.userData.shader.uniforms.uTime.value = this.elapsedTime;
      this.grassMaterial.userData.shader.uniforms.uCurrentRadius.value = this.currentRadius;
    }
    if (this.flowerMaterial?.userData?.shader) {
      this.flowerMaterial.userData.shader.uniforms.uTime.value = this.elapsedTime;
      this.flowerMaterial.userData.shader.uniforms.uCurrentRadius.value = this.currentRadius;
    }
  }

  private spawnOceanSplash(x: number, z: number) {
    // 1. Water droplets bursting upward
    const dropGeo = new THREE.SphereGeometry(0.24, 6, 6);
    const dropMat = new THREE.MeshBasicMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.9 });
    for (let i = 0; i < 28; i++) {
      const drop = new THREE.Mesh(dropGeo, dropMat);
      drop.position.set(x + (Math.random() - 0.5) * 1.5, -6.2, z + (Math.random() - 0.5) * 1.5);
      this.scene.add(drop);
      const ang = Math.random() * Math.PI * 2;
      const spd = 2.2 + Math.random() * 4.5;
      this.particles.push({
        mesh: drop,
        life: 0,
        maxLife: 0.9 + Math.random() * 0.4,
        vel: new THREE.Vector3(Math.cos(ang) * spd, 8.5 + Math.random() * 5.5, Math.sin(ang) * spd),
      });
    }

    // 2. Expanding white water foam ripple
    const rippleGeo = new THREE.RingGeometry(0.8, 1.4, 24);
    rippleGeo.rotateX(-Math.PI / 2);
    const rippleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
    const ripple = new THREE.Mesh(rippleGeo, rippleMat);
    ripple.position.set(x, -6.35, z);
    this.scene.add(ripple);
    this.particles.push({
      mesh: ripple,
      life: 0,
      maxLife: 1.2,
      vel: new THREE.Vector3(0, 0, 0),
    });
  }

  private update(dt: number) {
    // 0. Match Countdown (3... 2... 1... FIGHT!)
    if (this.state.countdown > 0) {
      this.state.countdown -= dt;
      if (this.state.countdown <= 0) {
        this.state.countdown = 0;
        sounds.playBump(1.8);
      }
      this.onStateChange({ ...this.state });
      return;
    }

    // 1. Match Timer & 3-Phase Shrinking Arena Logic (60s total)
    if (!this.state.isGameOver) {
      this.elapsedTime += dt;
      const remaining = Math.max(0, this.matchDuration - this.elapsedTime);
      this.state.timeRemaining = Math.ceil(remaining);

      // Phase 1 (60s to 40s): Stable arena at full radius (13.0m)
      if (this.elapsedTime <= 20) {
        this.currentRadius = this.initialRadius;
        this.state.warningText = null;
      }
      // Phase 2 (40s to 15s): Active collapse from 13.0m down to 6.0m
      else if (this.elapsedTime <= 45) {
        const t = (this.elapsedTime - 20) / 25; // 0.0 to 1.0
        this.currentRadius = 13.0 - t * (13.0 - 6.0);
        this.state.warningText = '⚠️ ARENA COLLAPSING!';
      }
      // Phase 3 (15s to 0s): Sudden Death collapse from 6.0m down to 3.5m micro-ring
      else {
        const t = Math.min(1.0, (this.elapsedTime - 45) / 15); // 0.0 to 1.0
        this.currentRadius = 6.0 - t * (6.0 - 3.5);
        this.state.warningText = '🚨 SUDDEN DEATH: CRITICAL CORE!';

        this.warningSoundCooldown -= dt;
        if (this.warningSoundCooldown <= 0 && remaining > 0) {
          sounds.playWarning();
          this.warningSoundCooldown = 1.3;
        }
      }

      this.state.arenaRadius = this.currentRadius;
      const scale = this.currentRadius / this.initialRadius;
      this.arenaGroup.scale.set(scale, 1, scale);

      // If timer hits 0 and both fighters survived: ROUND DRAW!
      if (remaining <= 0 && !this.state.isGameOver) {
        this.handleRoundFinish('draw');
      }
    }

    // 2. Player Input Vector (Keyboard + Touch Joystick)
    let moveX = 0;
    let moveZ = 0;

    if (this.keys['arrowup'] || this.keys['w']) moveZ -= 1;
    if (this.keys['arrowdown'] || this.keys['s']) moveZ += 1;
    if (this.keys['arrowleft'] || this.keys['a']) moveX -= 1;
    if (this.keys['arrowright'] || this.keys['d']) moveX += 1;

    // Add touch joystick vector
    moveX += this.inputVector.x;
    moveZ += this.inputVector.z;

    const len = Math.hypot(moveX, moveZ);
    if (len > 0.05) {
      moveX /= Math.max(1, len);
      moveZ /= Math.max(1, len);
    }

    // 3. Update Player Physics
    this.updateBrawlerPhysics(this.player, moveX, moveZ, dt);

    // 4. Update Bot AI
    this.updateBotAI(dt);

    // 5. Collision between Player and Bot
    this.handleBrawlerCollision();

    // 6. Ring Out (Fall Off) Detection
    this.checkRingOut(this.player, dt);
    this.checkRingOut(this.bot, dt);

    // 7. Update Continuous Dash Power Charge (0% to 100%)
    if (!this.player.isDashing) {
      this.player.chargePercent = Math.min(100, this.player.chargePercent + dt * 38);
      this.state.playerCharge = this.player.chargePercent;
    }

    // Update 3D Aim Reticle if aiming
    if (this.state.isAiming) {
      this.aimReticleGroup.position.set(this.player.pos.x, 0.04, this.player.pos.z);
      const ratio = Math.max(0.1, this.player.chargePercent / 100);
      this.aimReticleGroup.scale.set(1, 1, 0.5 + ratio * 1.5);
    }

    // 8. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      if (p.mesh.geometry instanceof THREE.RingGeometry) {
        p.mesh.scale.addScalar(dt * 3.6);
      } else if (p.mesh.position.y < 0) {
        p.vel.y -= 22 * dt; // Gravity for water droplets
      }
      (p.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - p.life / p.maxLife);
      if (p.life >= p.maxLife) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
      }
    }

    // 9. Update Special Skill Cooldowns & Timers
    if (this.playerSkillCooldownTimer > 0) {
      this.playerSkillCooldownTimer = Math.max(0, this.playerSkillCooldownTimer - dt);
      this.state.playerSkillCooldown = this.playerSkillCooldownTimer;
    }
    if (this.botSkillCooldownTimer > 0) {
      this.botSkillCooldownTimer = Math.max(0, this.botSkillCooldownTimer - dt);
    }

    if (this.playerSkillActiveTimer > 0) {
      this.playerSkillActiveTimer -= dt;
      if (this.playerSkillActiveTimer <= 0) {
        this.isPlayerInvulnerable = false;
        this.state.isPlayerSkillActive = false;
        if (this.playerShieldMesh) {
          this.scene.remove(this.playerShieldMesh);
          this.playerShieldMesh = null;
        }
      }
    }

    if (this.botSkillActiveTimer > 0) {
      this.botSkillActiveTimer -= dt;
      if (this.botSkillActiveTimer <= 0) {
        this.isBotInvulnerable = false;
        if (this.botShieldMesh) {
          this.scene.remove(this.botShieldMesh);
          this.botShieldMesh = null;
        }
      }
    }

    // Position Shield Domes with fighters
    if (this.playerShieldMesh) {
      this.playerShieldMesh.position.copy(this.player.pos);
      this.playerShieldMesh.position.y += 1.0;
      this.playerShieldMesh.rotation.y += dt * 3.5;
    }
    if (this.botShieldMesh) {
      this.botShieldMesh.position.copy(this.bot.pos);
      this.botShieldMesh.position.y += 1.0;
      this.botShieldMesh.rotation.y += dt * 3.5;
    }

    // Process Gravity Vortex
    if (this.activeVortex) {
      this.activeVortex.timer -= dt;
      this.activeVortex.mesh.rotation.y += dt * 8.0;
      const targetBrawler = this.activeVortex.casterIsPlayer ? this.bot : this.player;

      if (targetBrawler.isGrounded && !targetBrawler.isKnockedOut) {
        const vx = this.activeVortex.pos.x - targetBrawler.pos.x;
        const vz = this.activeVortex.pos.z - targetBrawler.pos.z;
        const vdist = Math.hypot(vx, vz);
        if (vdist > 0.1 && vdist < 10) {
          targetBrawler.vel.x += (vx / vdist) * 9.5 * dt;
          targetBrawler.vel.z += (vz / vdist) * 9.5 * dt;
        }
      }

      if (this.activeVortex.timer <= 0) {
        this.scene.remove(this.activeVortex.mesh);
        this.spawnShockwave(this.activeVortex.pos, 0xf43f5e);
        sounds.playBump(2.2);
        this.triggerScreenShake(0.3, 0.7);
        const targetBrawler = this.activeVortex.casterIsPlayer ? this.bot : this.player;
        const vx = targetBrawler.pos.x - this.activeVortex.pos.x;
        const vz = targetBrawler.pos.z - this.activeVortex.pos.z;
        const vdist = Math.hypot(vx, vz);
        if (vdist < 6.0) {
          targetBrawler.vel.x += (vx / Math.max(0.1, vdist)) * 20;
          targetBrawler.vel.z += (vz / Math.max(0.1, vdist)) * 20;
        }
        this.activeVortex = null;
      }
    }

    this.onStateChange({ ...this.state });
  }

  private updateBrawlerPhysics(b: Brawler, inputX: number, inputZ: number, dt: number) {
    if (b.isKnockedOut) return;

    // Movement speed & acceleration
    const baseSpeed = 9.5;
    const accel = 45;
    const friction = 7.5;

    if (!b.isDashing && b.isGrounded) {
      if (Math.hypot(inputX, inputZ) > 0.1) {
        b.vel.x += inputX * accel * dt;
        b.vel.z += inputZ * accel * dt;

        // Cap speed
        const currentSpeed = Math.hypot(b.vel.x, b.vel.z);
        if (currentSpeed > baseSpeed) {
          b.vel.x = (b.vel.x / currentSpeed) * baseSpeed;
          b.vel.z = (b.vel.z / currentSpeed) * baseSpeed;
        }

        // Target angle (face where moving)
        b.targetAngle = Math.atan2(-inputX, -inputZ);
      } else {
        // Friction dampening
        b.vel.x -= b.vel.x * friction * dt;
        b.vel.z -= b.vel.z * friction * dt;
      }
    } else if (b.isDashing) {
      b.dashTimer -= dt;
      if (b.dashTimer <= 0) {
        b.isDashing = false;
        b.vel.multiplyScalar(0.4);
      }
    }

    // Smooth rotation interpolation
    let angleDiff = b.targetAngle - b.currentAngle;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    b.currentAngle += angleDiff * Math.min(1, dt * 14);
    b.mesh.rotation.y = b.currentAngle;

    // Apply movement
    b.pos.x += b.vel.x * dt;
    b.pos.z += b.vel.z * dt;

    const speed = Math.hypot(b.vel.x, b.vel.z);
    const inputMagnitude = Math.hypot(inputX, inputZ);
    const isWalking = (inputMagnitude > 0.05 || speed > 0.25) && b.isGrounded;
    const hasLimbs = b.legs && b.arms && b.legs.length >= 2 && b.arms.length >= 2;

    if (hasLimbs) {
      if (b.isDashing && b.isGrounded) {
        // High-energy power dash pose (Lead punch & athletic forward stride)
        const punchAmt = 0.95;
        b.arms![1].rotation.x = THREE.MathUtils.lerp(b.arms![1].rotation.x, punchAmt, dt * 18);
        b.arms![0].rotation.x = THREE.MathUtils.lerp(b.arms![0].rotation.x, -0.40, dt * 18);
        b.legs![0].rotation.x = THREE.MathUtils.lerp(b.legs![0].rotation.x, 0.40, dt * 18);
        b.legs![1].rotation.x = THREE.MathUtils.lerp(b.legs![1].rotation.x, -0.40, dt * 18);
        b.mesh.rotation.x = THREE.MathUtils.lerp(b.mesh.rotation.x, 0.20, dt * 18);
        b.mesh.position.y = THREE.MathUtils.lerp(b.mesh.position.y, 0.02, dt * 18);
      } else if (isWalking) {
        const movePower = Math.max(speed, inputMagnitude * 6.5);
        const strideSpeed = Math.max(7.5, Math.min(18, 6.0 + movePower * 1.3));
        b.walkCycle += dt * strideSpeed;
        const swingIntensity = Math.min(1.0, Math.max(0.35, movePower / 4.5));
        const legSwing = Math.sin(b.walkCycle) * 0.65 * swingIntensity;
        const armSwing = Math.sin(b.walkCycle) * 0.52 * swingIntensity;

        // Counter-opposed limb swing (natural brawler sprint gait)
        b.legs![0].rotation.x = legSwing;
        b.legs![1].rotation.x = -legSwing;
        b.arms![0].rotation.x = -armSwing;
        b.arms![1].rotation.x = armSwing;

        // Energetic brawler running bob & subtle forward sprint lean
        b.mesh.position.y = Math.abs(Math.sin(b.walkCycle)) * 0.08 * swingIntensity;
        b.mesh.rotation.x = THREE.MathUtils.lerp(b.mesh.rotation.x, 0.08 * swingIntensity, dt * 10);
      } else if (b.isGrounded) {
        // Smooth return to idle heroic stance
        b.legs![0].rotation.x = THREE.MathUtils.lerp(b.legs![0].rotation.x, 0, dt * 14);
        b.legs![1].rotation.x = THREE.MathUtils.lerp(b.legs![1].rotation.x, 0, dt * 14);
        b.arms![0].rotation.x = THREE.MathUtils.lerp(b.arms![0].rotation.x, 0, dt * 14);
        b.arms![1].rotation.x = THREE.MathUtils.lerp(b.arms![1].rotation.x, 0, dt * 14);
        b.mesh.position.y = THREE.MathUtils.lerp(b.mesh.position.y, 0, dt * 14);
        b.mesh.rotation.x = THREE.MathUtils.lerp(b.mesh.rotation.x, 0, dt * 14);
      }
    } else {
      if (isWalking) {
        b.walkCycle += dt * 14;
        b.bodyMesh.position.y = 1.0 + Math.abs(Math.sin(b.walkCycle)) * 0.18;
        b.fists[0].position.z = 0.3 + Math.sin(b.walkCycle) * 0.28;
        b.fists[1].position.z = 0.3 - Math.sin(b.walkCycle) * 0.28;
      } else if (b.isGrounded) {
        b.bodyMesh.position.y = 1.0;
        b.fists[0].position.z = 0.3;
        b.fists[1].position.z = 0.3;
      }
    }

    // Call procedural sine-wave animation for high-poly character rigs
    if (b.champData) {
      animateChampion(b.champData, this.elapsedTime, isWalking, b.isDashing);
    }
  }

  private updateBotAI(dt: number) {
    if (this.bot.isKnockedOut || !this.bot.isGrounded) return;

    const trophies = this.playerTrophies;
    const isBeginner = trophies < 300;
    const isIntermediate = trophies >= 300 && trophies < 800;
    const isMaster = trophies >= 800;

    // 1. Trophy-scaled power charge speed
    const chargeSpeed = isBeginner ? 22 : isIntermediate ? 34 : 44;
    if (!this.bot.isDashing) {
      this.bot.chargePercent = Math.min(100, this.bot.chargePercent + dt * chargeSpeed);
    }

    // 2. Targeting vector (Beginners wander with jitter; Masters lead predicted velocity)
    let targetX = this.player.pos.x;
    let targetZ = this.player.pos.z;

    if (isMaster) {
      targetX += this.player.vel.x * 0.22;
      targetZ += this.player.vel.z * 0.22;
    } else if (isBeginner) {
      targetX += Math.sin(this.elapsedTime * 1.8) * 1.8;
      targetZ += Math.cos(this.elapsedTime * 1.5) * 1.8;
    }

    const dx = targetX - this.bot.pos.x;
    const dz = targetZ - this.bot.pos.z;
    const distToPlayer = Math.hypot(dx, dz);

    let steerX = dx / Math.max(0.1, distToPlayer);
    let steerZ = dz / Math.max(0.1, distToPlayer);

    // 3. Smart Edge Braking (Safety margin scales with trophy rank)
    const botDistToCenter = Math.hypot(this.bot.pos.x, this.bot.pos.z);
    const safeZoneRatio = isBeginner ? 0.82 : isIntermediate ? 0.65 : 0.52;
    const safeZone = this.currentRadius * safeZoneRatio;

    if (botDistToCenter > safeZone) {
      const toCenterX = -this.bot.pos.x / Math.max(0.1, botDistToCenter);
      const toCenterZ = -this.bot.pos.z / Math.max(0.1, botDistToCenter);
      const brakeWeight = Math.min(1.0, (botDistToCenter - safeZone) / (this.currentRadius - safeZone));
      steerX = steerX * (1 - brakeWeight) + toCenterX * brakeWeight;
      steerZ = steerZ * (1 - brakeWeight) + toCenterZ * brakeWeight;
    }

    // 4. Tactical Special Skill Activation for Bot
    if (this.botSkillCooldownTimer <= 0) {
      if (isMaster) {
        // Counter-skills when player charges or is within slam radius
        if (this.player.isDashing && distToPlayer < 5.0) {
          this.triggerSpecialSkill(false);
        } else if (distToPlayer < 4.2 && Math.random() < 0.05) {
          this.triggerSpecialSkill(false);
        }
      } else if (isIntermediate) {
        if (distToPlayer < 4.5 && Math.random() < 0.02) {
          this.triggerSpecialSkill(false);
        }
      }
    }

    // 5. Bot Executes Power Dash
    const dashChargeThreshold = isBeginner ? 85 : isIntermediate ? 60 : 50;
    const dashDistThreshold = isBeginner ? 3.4 : 4.5;

    if (distToPlayer < dashDistThreshold && botDistToCenter < safeZone && this.bot.chargePercent >= dashChargeThreshold && !this.bot.isDashing) {
      const bRatio = this.bot.chargePercent / 100;
      this.bot.isDashing = true;
      this.bot.dashTimer = 0.16 + bRatio * 0.14;
      this.bot.dashPowerPercent = this.bot.chargePercent;
      const bSpeed = 12 + bRatio * 18;
      this.bot.vel.x = steerX * bSpeed;
      this.bot.vel.z = steerZ * bSpeed;
      sounds.playDash(this.bot.chargePercent);
      this.spawnDashParticles(this.bot.pos, 0xef4444, Math.floor(6 + bRatio * 16));
      this.bot.chargePercent = 0;
    }

    this.updateBrawlerPhysics(this.bot, steerX, steerZ, dt);
  }

  private handleBrawlerCollision() {
    if (this.player.isKnockedOut || this.bot.isKnockedOut) return;
    if (!this.player.isGrounded || !this.bot.isGrounded) return;

    const dx = this.bot.pos.x - this.player.pos.x;
    const dz = this.bot.pos.z - this.player.pos.z;
    const dist = Math.hypot(dx, dz);
    const minDist = this.player.radius + this.bot.radius;

    if (dist < minDist && dist > 0.001) {
      // Normal collision vector
      const nx = dx / dist;
      const nz = dz / dist;

      // Separate them to avoid overlapping
      const overlap = minDist - dist;
      this.player.pos.x -= nx * overlap * 0.5;
      this.player.pos.z -= nz * overlap * 0.5;
      this.bot.pos.x += nx * overlap * 0.5;
      this.bot.pos.z += nz * overlap * 0.5;

      // Elastic knockback impulse - dynamically scaled by exact charge percentage & invulnerability!
      let pImpulse = 8;
      let bImpulse = 8;

      if (this.isPlayerInvulnerable) {
        // Player has Iron Barrier active: immune to knockback, blasts bot away!
        pImpulse = 0;
        bImpulse = 26;
        sounds.playBump(2.6);
        this.triggerScreenShake(0.3, 0.7);
      } else if (this.isBotInvulnerable) {
        // Bot has Iron Barrier active
        bImpulse = 0;
        pImpulse = 26;
        sounds.playBump(2.6);
        this.triggerScreenShake(0.3, 0.7);
      } else if (this.player.isDashing && !this.bot.isDashing) {
        // Player landed power dash!
        const pRatio = Math.max(0.1, this.player.dashPowerPercent / 100);
        bImpulse = 10 + pRatio * 22;
        pImpulse = 3.5;
        this.triggerScreenShake(0.1 + pRatio * 0.3, 0.2 + pRatio * 0.6);
        sounds.playBump(1.0 + pRatio * 1.5);
      } else if (this.bot.isDashing && !this.player.isDashing) {
        // Bot landed power dash!
        const bRatio = Math.max(0.1, this.bot.dashPowerPercent / 100);
        pImpulse = 10 + bRatio * 22;
        bImpulse = 3.5;
        this.triggerScreenShake(0.1 + bRatio * 0.3, 0.2 + bRatio * 0.6);
        sounds.playBump(1.0 + bRatio * 1.5);
      } else if (this.player.isDashing && this.bot.isDashing) {
        // Clash! Higher percentage charge wins the momentum contest!
        const pRatio = Math.max(0.1, this.player.dashPowerPercent / 100);
        const bRatio = Math.max(0.1, this.bot.dashPowerPercent / 100);
        pImpulse = 12 + bRatio * 14 - pRatio * 6;
        bImpulse = 12 + pRatio * 14 - bRatio * 6;
        this.triggerScreenShake(0.35, 0.8);
        sounds.playBump(2.4);
      } else {
        // Normal bump
        sounds.playBump(1.0);
        this.triggerScreenShake(0.08, 0.18);
      }

      this.player.vel.x = -nx * pImpulse;
      this.player.vel.z = -nz * pImpulse;
      this.bot.vel.x = nx * bImpulse;
      this.bot.vel.z = nz * bImpulse;
    }
  }

  private checkRingOut(b: Brawler, dt: number) {
    if (b.isKnockedOut) return;

    const distFromCenter = Math.hypot(b.pos.x, b.pos.z);
    // Exact physical boundary: falls off immediately when center of mass steps beyond the base edge
    if (distFromCenter > this.currentRadius) {
      b.isGrounded = false;
      // Gravity pulls down
      b.vel.y = (b.vel.y || 0) - 38 * dt;
      b.pos.y += b.vel.y * dt;

      // Spin comically as they fall
      b.mesh.rotation.x += dt * 8;
      b.mesh.rotation.z += dt * 6;

      if (b.legs && b.arms) {
        b.legs[0].rotation.x = Math.sin(this.elapsedTime * 18) * 0.6;
        b.legs[1].rotation.x = -Math.sin(this.elapsedTime * 18) * 0.6;
        b.arms[0].rotation.x = Math.sin(this.elapsedTime * 22) * 0.7;
        b.arms[1].rotation.x = -Math.sin(this.elapsedTime * 22) * 0.7;
      }

      if (b.pos.y < -0.5 && !b.isKnockedOut) {
        sounds.playFall();
      }

      // Comic ocean splash when hitting turquoise water at y = -5.8
      if (b.pos.y < -5.8 && !this.splashTriggered[b.isBot ? 'bot' : 'player']) {
        this.splashTriggered[b.isBot ? 'bot' : 'player'] = true;
        sounds.playSplash();
        this.spawnOceanSplash(b.pos.x, b.pos.z);
      }

      // Fully knocked out -> trigger round finish!
      if (b.pos.y < -12) {
        b.isKnockedOut = true;
        b.mesh.visible = false;

        if (b.isBot) {
          this.handleRoundFinish('player');
        } else {
          this.handleRoundFinish('bot');
        }
      }
    }
  }

  private handleRoundFinish(roundWinner: RoundWinner) {
    if (this.state.isGameOver || this.state.roundBannerText) return;

    this.roundHistory.push(roundWinner);
    this.state.roundHistory = [...this.roundHistory];

    if (roundWinner === 'player') {
      this.playerRoundWins++;
    } else if (roundWinner === 'bot') {
      this.botRoundWins++;
    }

    this.state.playerRoundWins = this.playerRoundWins;
    this.state.botRoundWins = this.botRoundWins;

    // 1. Check if either reached 3 round wins immediately (First to 3)
    if (this.playerRoundWins >= this.maxRoundWins) {
      this.triggerMatchVictory();
      return;
    } else if (this.botRoundWins >= this.maxRoundWins) {
      this.triggerMatchDefeat();
      return;
    }

    // 2. Check if all 5 rounds have completed
    if (this.currentRound >= this.maxRounds) {
      if (this.playerRoundWins > this.botRoundWins) {
        this.triggerMatchVictory();
      } else if (this.botRoundWins > this.playerRoundWins) {
        this.triggerMatchDefeat();
      } else {
        this.triggerMatchDraw();
      }
      return;
    }

    // 3. Round ended: display round banner and transition smoothly to next round!
    if (roundWinner === 'draw') {
      this.state.roundBannerText = `ROUND ${this.currentRound}: DRAW!`;
      this.state.roundBannerType = 'draw';
      sounds.playDraw();
      this.spawnDashParticles(new THREE.Vector3(0, 0, 0), 0xffffff, 20);
    } else {
      const winnerName = roundWinner === 'player' ? 'KAI' : 'SHADOWNINJA';
      this.state.roundBannerText = `ROUND ${this.currentRound}: ${winnerName} WINS!`;
      this.state.roundBannerType = roundWinner;
      if (roundWinner === 'player') {
        sounds.playBump(2.2);
      } else {
        sounds.playBump(1.6);
      }
    }

    this.onStateChange({ ...this.state });

    this.roundTimeoutId = window.setTimeout(() => {
      this.startNextRound();
    }, 2200);
  }

  private startNextRound() {
    this.roundTimeoutId = null;
    this.currentRound++;
    this.elapsedTime = 0;
    this.warningSoundCooldown = 0;
    this.currentRadius = this.initialRadius;
    this.arenaGroup.scale.set(1, 1, 1);
    this.splashTriggered = { player: false, bot: false };

    this.player.pos.set(0, 0, 6);
    this.player.vel.set(0, 0, 0);
    this.player.isKnockedOut = false;
    this.player.isGrounded = true;
    this.player.mesh.visible = true;
    this.player.currentAngle = 0;
    this.player.targetAngle = 0;
    this.player.chargePercent = 100;
    this.player.mesh.rotation.set(0, 0, 0);

    this.bot.pos.set(0, 0, -6);
    this.bot.vel.set(0, 0, 0);
    this.bot.isKnockedOut = false;
    this.bot.isGrounded = true;
    this.bot.mesh.visible = true;
    this.bot.currentAngle = Math.PI;
    this.bot.targetAngle = Math.PI;
    this.bot.chargePercent = 100;
    this.bot.mesh.rotation.set(0, Math.PI, 0);

    if (this.player.legs) this.player.legs.forEach((l) => l.rotation.set(0, 0, 0));
    if (this.player.arms) this.player.arms.forEach((a) => a.rotation.set(0, 0, 0));
    if (this.bot.legs) this.bot.legs.forEach((l) => l.rotation.set(0, 0, 0));
    if (this.bot.arms) this.bot.arms.forEach((a) => a.rotation.set(0, 0, 0));

    this.state = {
      ...this.state,
      countdown: 3,
      currentRound: this.currentRound,
      roundHistory: [...this.roundHistory],
      roundBannerText: null,
      roundBannerType: null,
      timeRemaining: this.matchDuration,
      arenaRadius: this.initialRadius,
      playerCharge: 100,
      isAiming: false,
      warningText: null,
    };
    this.aimReticleGroup.visible = false;
    this.onStateChange({ ...this.state });
  }

  private triggerMatchVictory() {
    if (this.state.isGameOver) return;
    this.state.isGameOver = true;
    this.state.winner = 'player';
    this.state.roundBannerText = null;
    this.state.roundBannerType = null;
    sounds.playVictory();

    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
    });

    this.onStateChange({ ...this.state });
  }

  private triggerMatchDefeat() {
    if (this.state.isGameOver) return;
    this.state.isGameOver = true;
    this.state.winner = 'bot';
    this.state.roundBannerText = null;
    this.state.roundBannerType = null;
    sounds.playDefeat();
    this.onStateChange({ ...this.state });
  }

  private triggerMatchDraw() {
    if (this.state.isGameOver) return;
    this.state.isGameOver = true;
    this.state.winner = 'draw';
    this.state.roundBannerText = null;
    this.state.roundBannerType = null;
    sounds.playDraw();

    confetti({
      particleCount: 130,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#ffffff', '#e2e8f0', '#94a3b8', '#38bdf8'],
    });

    this.onStateChange({ ...this.state });
  }

  private triggerScreenShake(duration: number, intensity: number) {
    this.shakeTimer = duration;
    this.shakeIntensity = intensity;
  }

  private updateCamera(dt: number) {
    let targetX = 0;
    let targetY = 10;
    let targetZ = 20;
    let lookTarget = new THREE.Vector3(0, 1, 0);

    if (this.state.cameraMode === 'third_person') {
      // Follows right behind the player at steady elevated angle (no dizziness!)
      targetX = this.player.pos.x * 0.7;
      targetY = Math.max(5.5, this.player.pos.y + 7.5);
      targetZ = Math.max(8.0, this.player.pos.z + 11.5);
      lookTarget = new THREE.Vector3(this.player.pos.x, Math.max(0, this.player.pos.y) + 1.2, this.player.pos.z - 2.5);
    } else if (this.state.cameraMode === 'isometric') {
      // Brawl Stars overhead overview
      targetX = 0;
      targetY = 22;
      targetZ = 16;
      lookTarget = new THREE.Vector3(0, 0, 0);
    } else if (this.state.cameraMode === 'close_action') {
      // Tight third-person action cam
      targetX = this.player.pos.x * 0.85;
      targetY = this.player.pos.y + 4.5;
      targetZ = this.player.pos.z + 7.5;
      lookTarget = new THREE.Vector3(this.player.pos.x, this.player.pos.y + 1.0, this.player.pos.z - 2.0);
    }

    // Screen shake
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      targetX += (Math.random() - 0.5) * this.shakeIntensity;
      targetY += (Math.random() - 0.5) * this.shakeIntensity;
    }

    // Smooth camera damping
    this.camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), Math.min(1, dt * 6.5));
    this.camera.lookAt(lookTarget);
  }

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public destroy() {
    cancelAnimationFrame(this.animationId);
    if (this.roundTimeoutId) {
      clearTimeout(this.roundTimeoutId);
      this.roundTimeoutId = null;
    }
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
