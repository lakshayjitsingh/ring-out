import * as THREE from 'three';
import { sounds } from '../audio/soundManager';
import confetti from 'canvas-confetti';

export type CameraMode = 'third_person' | 'isometric' | 'close_action';

export interface GameState {
  timeRemaining: number;
  arenaRadius: number;
  initialRadius: number;
  playerRoundWins: number; // 0 to 3 (first to 3 wins)
  botRoundWins: number;    // 0 to 3
  currentRound: number;    // 1 to 5
  roundBannerText: string | null; // e.g. "ROUND 1: KAI WINS!"
  playerCharge: number;    // 0 to 100%
  isAiming: boolean;
  aimAngle: number;
  countdown: number;       // 3, 2, 1, 0 (0 = FIGHT!)
  isPaused: boolean;
  isGameOver: boolean;
  winner: 'player' | 'bot' | null;
  cameraMode: CameraMode;
  warningText: string | null;
}

interface Brawler {
  mesh: THREE.Group;
  bodyMesh: THREE.Mesh;
  coreMesh: THREE.Mesh;
  fists: THREE.Mesh[];
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
  private roundTimeoutId: number | null = null;

  // Aim Reticle
  private aimReticleGroup: THREE.Group;

  // Arena
  private arenaGroup: THREE.Group;
  private ringMesh: THREE.Mesh;
  private initialRadius = 13.0;
  private currentRadius = 13.0;
  private matchDuration = 180; // 3 minutes
  private elapsedTime = 0;

  // Characters
  public player!: Brawler;
  public bot!: Brawler;
  private particles: { mesh: THREE.Mesh; life: number; maxLife: number; vel: THREE.Vector3 }[] = [];

  // Inputs
  private inputVector = { x: 0, z: 0 };
  private keys: { [key: string]: boolean } = {};
  private spaceKeyHeld = false;

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
      roundBannerText: null,
      playerCharge: 100, // Starts fully charged at round 1
      isAiming: false,
      aimAngle: 0,
      countdown: 3,
      isPaused: false,
      isGameOver: false,
      winner: null,
      cameraMode: 'third_person',
      warningText: null,
    };

    // 1. Three.js Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060913);
    this.scene.fog = new THREE.FogExp2(0x060913, 0.018);

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

    // 3. Environment & Lights
    this.setupLighting();
    this.setupEnvironment();

    // 4. Arena & Characters
    this.arenaGroup = new THREE.Group();
    const { arena, ring } = this.createArena();
    this.ringMesh = ring;
    this.arenaGroup.add(arena);
    this.arenaGroup.add(ring);
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
    const hemi = new THREE.HemisphereLight(0x70a0ff, 0x101530, 0.7);
    this.scene.add(hemi);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.3);
    dirLight.position.set(15, 28, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 60;
    dirLight.shadow.camera.left = -16;
    dirLight.shadow.camera.right = 16;
    dirLight.shadow.camera.top = 16;
    dirLight.shadow.camera.bottom = -16;
    dirLight.shadow.bias = -0.0005;
    this.scene.add(dirLight);

    const centerGlow = new THREE.PointLight(0x00f0ff, 1.2, 20);
    centerGlow.position.set(0, 2, 0);
    this.scene.add(centerGlow);
  }

  private setupEnvironment() {
    // Starfield particles in the background
    const starGeo = new THREE.BufferGeometry();
    const starCount = 350;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 150;
      starPos[i + 1] = Math.random() * 80 - 20;
      starPos[i + 2] = (Math.random() - 0.5) * 150;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x48bbff,
      size: 0.75,
      transparent: true,
      opacity: 0.6,
    });
    const starField = new THREE.Points(starGeo, starMat);
    this.scene.add(starField);
  }

  private createArena() {
    // Main circular arena slab
    const cylinderGeo = new THREE.CylinderGeometry(this.initialRadius, this.initialRadius * 0.94, 1.2, 64);
    const cylinderMat = new THREE.MeshStandardMaterial({
      color: 0x18223c,
      metalness: 0.5,
      roughness: 0.2,
    });
    const arena = new THREE.Mesh(cylinderGeo, cylinderMat);
    arena.position.y = -0.6;
    arena.receiveShadow = true;

    // Glowing outer perimeter ring
    const ringGeo = new THREE.TorusGeometry(this.initialRadius, 0.25, 16, 64);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x00f5ff,
      emissive: 0x00d5ff,
      emissiveIntensity: 1.5,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.05;

    // Center circular logo/target ring
    const innerRingGeo = new THREE.RingGeometry(2.5, 2.7, 32);
    innerRingGeo.rotateX(-Math.PI / 2);
    const innerRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.position.y = 0.02;
    this.arenaGroup.add(innerRing);

    return { arena, ring };
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

  private createBrawlerMesh(isBot: boolean): { group: THREE.Group; body: THREE.Mesh; core: THREE.Mesh; fists: THREE.Mesh[] } {
    const group = new THREE.Group();

    const mainColor = isBot ? 0x9333ea : 0x00f5ff;
    const accentColor = isBot ? 0xef4444 : 0x3b82f6;

    // Body capsule / torso
    const bodyGeo = new THREE.CapsuleGeometry(0.55, 0.65, 8, 16);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.6,
      roughness: 0.25,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.0;
    body.castShadow = true;
    group.add(body);

    // Glowing core reactor on chest
    const coreGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({ color: mainColor });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.set(0, 1.05, -0.42);
    group.add(core);

    // Head visor / eyes
    const visorGeo = new THREE.BoxGeometry(0.65, 0.16, 0.35);
    const visorMat = new THREE.MeshBasicMaterial({ color: accentColor });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 1.45, -0.32);
    group.add(visor);

    // Fists
    const fistGeo = new THREE.SphereGeometry(0.24, 12, 12);
    const fistMat = new THREE.MeshStandardMaterial({ color: mainColor, metalness: 0.5 });
    const leftFist = new THREE.Mesh(fistGeo, fistMat);
    const rightFist = new THREE.Mesh(fistGeo, fistMat);
    leftFist.position.set(-0.75, 0.9, -0.3);
    rightFist.position.set(0.75, 0.9, -0.3);
    leftFist.castShadow = true;
    rightFist.castShadow = true;
    group.add(leftFist);
    group.add(rightFist);

    return { group, body, core, fists: [leftFist, rightFist] };
  }

  private setupCharacters() {
    // Player on south side
    const pMesh = this.createBrawlerMesh(false);
    pMesh.group.position.set(0, 0, 6);
    this.scene.add(pMesh.group);

    this.player = {
      mesh: pMesh.group,
      bodyMesh: pMesh.body,
      coreMesh: pMesh.core,
      fists: pMesh.fists,
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
    const bMesh = this.createBrawlerMesh(true);
    bMesh.group.position.set(0, 0, -6);
    bMesh.group.rotation.y = Math.PI;
    this.scene.add(bMesh.group);

    this.bot = {
      mesh: bMesh.group,
      bodyMesh: bMesh.body,
      coreMesh: bMesh.core,
      fists: bMesh.fists,
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

  // Input Handling
  private onKeyDown = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = true;
    if (e.code === 'Space' && !this.spaceKeyHeld) {
      this.spaceKeyHeld = true;
      // Start aiming in current movement direction
      this.setAim(true);
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
    this.elapsedTime = 0;
    this.currentRadius = this.initialRadius;
    this.arenaGroup.scale.set(1, 1, 1);

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

    this.state = {
      ...this.state,
      countdown: 3,
      timeRemaining: this.matchDuration,
      arenaRadius: this.initialRadius,
      playerRoundWins: 0,
      botRoundWins: 0,
      currentRound: 1,
      roundBannerText: null,
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

  // Main Loop
  private loop = () => {
    this.animationId = requestAnimationFrame(this.loop);
    const dt = Math.min(this.clock.getDelta(), 0.05);

    if (!this.state.isPaused) {
      this.update(dt);
    }

    this.updateCamera(dt);
    this.renderer.render(this.scene, this.camera);
  };

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

    // 1. Match Timer & Arena Shrink Logic
    if (!this.state.isGameOver) {
      this.elapsedTime += dt;
      const remaining = Math.max(0, this.matchDuration - this.elapsedTime);
      this.state.timeRemaining = Math.ceil(remaining);

      // Arena shrinks progressively down to 0 at 3 minutes!
      const progress = Math.min(1.0, this.elapsedTime / this.matchDuration);
      this.currentRadius = Math.max(0.01, this.initialRadius * (1 - progress));
      this.state.arenaRadius = this.currentRadius;

      // Scale the arena visual
      const scale = this.currentRadius / this.initialRadius;
      this.arenaGroup.scale.set(scale, 1, scale);

      // Warning states
      if (remaining <= 30 && remaining > 15) {
        this.state.warningText = '⚠️ CRITICAL: ARENA COLLAPSE!';
        (this.ringMesh.material as THREE.MeshBasicMaterial).color.setHex(0xff9900);
      } else if (remaining <= 15 && remaining > 0) {
        this.state.warningText = '🚨 SUDDEN DEATH: SHRINKING TO ZERO!';
        const blink = Math.sin(this.elapsedTime * 12) > 0;
        (this.ringMesh.material as THREE.MeshBasicMaterial).color.setHex(blink ? 0xff0033 : 0x550011);
      } else {
        this.state.warningText = null;
        (this.ringMesh.material as THREE.MeshBasicMaterial).color.setHex(0x00f5ff);
      }

      // If timer hits 0 and both survive: Tiebreaker by highest distance to center
      if (remaining <= 0 && !this.state.isGameOver) {
        const pDist = Math.hypot(this.player.pos.x, this.player.pos.z);
        const bDist = Math.hypot(this.bot.pos.x, this.bot.pos.z);
        if (pDist <= bDist) {
          this.handleRoundFinish('player');
        } else {
          this.handleRoundFinish('bot');
        }
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
      (p.mesh.material as THREE.MeshBasicMaterial).opacity = 1 - p.life / p.maxLife;
      if (p.life >= p.maxLife) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
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

    // Running bounce animation
    const speed = Math.hypot(b.vel.x, b.vel.z);
    if (speed > 0.8 && b.isGrounded) {
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

  private updateBotAI(dt: number) {
    if (this.bot.isKnockedOut || !this.bot.isGrounded) return;

    // Bot continuous power charge
    if (!this.bot.isDashing) {
      this.bot.chargePercent = Math.min(100, this.bot.chargePercent + dt * 34);
    }

    const dx = this.player.pos.x - this.bot.pos.x;
    const dz = this.player.pos.z - this.bot.pos.z;
    const distToPlayer = Math.hypot(dx, dz);

    let steerX = dx / Math.max(0.1, distToPlayer);
    let steerZ = dz / Math.max(0.1, distToPlayer);

    // Smart Edge Braking: If bot is getting close to the boundary, steer hard back toward center!
    const botDistToCenter = Math.hypot(this.bot.pos.x, this.bot.pos.z);
    const safeZone = this.currentRadius * 0.65;
    if (botDistToCenter > safeZone) {
      const toCenterX = -this.bot.pos.x / Math.max(0.1, botDistToCenter);
      const toCenterZ = -this.bot.pos.z / Math.max(0.1, botDistToCenter);
      const brakeWeight = Math.min(1.0, (botDistToCenter - safeZone) / (this.currentRadius - safeZone));
      steerX = steerX * (1 - brakeWeight) + toCenterX * brakeWeight;
      steerZ = steerZ * (1 - brakeWeight) + toCenterZ * brakeWeight;
    }

    // Bot executes power dash when in range and sufficiently charged (>= 60%)
    if (distToPlayer < 4.2 && botDistToCenter < safeZone && this.bot.chargePercent >= 60 && !this.bot.isDashing) {
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

      // Elastic knockback impulse - dynamically scaled by exact charge percentage!
      let pImpulse = 8;
      let bImpulse = 8;

      if (this.player.isDashing && !this.bot.isDashing) {
        // Player landed power dash!
        const pRatio = Math.max(0.1, this.player.dashPowerPercent / 100);
        // 40% -> 18.8, 50% -> 21.0, 100% -> 32.0 (noticeable power differences!)
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
    // If center of brawler is beyond the current shrinking arena edge
    if (distFromCenter > this.currentRadius + 0.15) {
      b.isGrounded = false;
      // Gravity pulls down
      b.vel.y = (b.vel.y || 0) - 38 * dt;
      b.pos.y += b.vel.y * dt;

      // Spin comically as they fall
      b.mesh.rotation.x += dt * 8;
      b.mesh.rotation.z += dt * 6;

      if (b.pos.y < -0.5 && !b.isKnockedOut) {
        sounds.playFall();
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

  private handleRoundFinish(roundWinner: 'player' | 'bot') {
    if (this.state.isGameOver || this.state.roundBannerText) return;

    if (roundWinner === 'player') {
      this.playerRoundWins++;
    } else {
      this.botRoundWins++;
    }

    this.state.playerRoundWins = this.playerRoundWins;
    this.state.botRoundWins = this.botRoundWins;

    // Check if entire match is won (First to 3 wins)
    if (this.playerRoundWins >= this.maxRoundWins) {
      this.triggerMatchVictory();
      return;
    } else if (this.botRoundWins >= this.maxRoundWins) {
      this.triggerMatchDefeat();
      return;
    }

    // Round ended: display round banner and transition smoothly to next round!
    const winnerName = roundWinner === 'player' ? 'KAI' : 'SHADOWNINJA';
    this.state.roundBannerText = `ROUND ${this.currentRound}: ${winnerName} WINS!`;
    this.onStateChange({ ...this.state });

    if (roundWinner === 'player') {
      sounds.playBump(2.2);
    } else {
      sounds.playBump(1.6);
    }

    this.roundTimeoutId = window.setTimeout(() => {
      this.startNextRound();
    }, 2000);
  }

  private startNextRound() {
    this.roundTimeoutId = null;
    this.currentRound++;
    this.elapsedTime = 0;
    this.currentRadius = this.initialRadius;
    this.arenaGroup.scale.set(1, 1, 1);

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

    this.state = {
      ...this.state,
      countdown: 3,
      currentRound: this.currentRound,
      roundBannerText: null,
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
    sounds.playDefeat();
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
