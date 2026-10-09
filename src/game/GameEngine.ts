import * as THREE from 'three';
import { sounds } from '../audio/soundManager';
import confetti from 'canvas-confetti';

export type CameraMode = 'third_person' | 'isometric' | 'close_action';

export interface GameState {
  timeRemaining: number;
  arenaRadius: number;
  initialRadius: number;
  playerStocks: number;
  botStocks: number;
  dashCooldownRemaining: number;
  dashCooldownMax: number;
  countdown: number; // 3, 2, 1, 0 (0 = FIGHT!)
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
  dashCooldown: number;
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
      playerStocks: 1,
      botStocks: 1,
      dashCooldownRemaining: 0,
      dashCooldownMax: 2.2,
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
      dashCooldown: 0,
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
      dashCooldown: 2.0,
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
    if (e.code === 'Space') {
      this.triggerDash();
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = false;
  };

  public setTouchJoystick(x: number, z: number) {
    this.inputVector.x = x;
    this.inputVector.z = z;
  }

  public triggerDash() {
    if (this.state.isGameOver || this.state.isPaused) return;
    if (this.player.dashCooldown <= 0 && !this.player.isKnockedOut) {
      this.player.isDashing = true;
      this.player.dashTimer = 0.26;
      this.player.dashCooldown = this.state.dashCooldownMax;

      // Dash impulse in facing direction
      const forwardX = -Math.sin(this.player.currentAngle);
      const forwardZ = -Math.cos(this.player.currentAngle);
      this.player.vel.x = forwardX * 24;
      this.player.vel.z = forwardZ * 24;

      sounds.playDash();
      this.spawnDashParticles(this.player.pos, 0x00f5ff);
    }
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
    this.player.mesh.rotation.set(0, 0, 0);

    this.bot.pos.set(0, 0, -6);
    this.bot.vel.set(0, 0, 0);
    this.bot.isKnockedOut = false;
    this.bot.isGrounded = true;
    this.bot.mesh.visible = true;
    this.bot.currentAngle = Math.PI;
    this.bot.targetAngle = Math.PI;
    this.bot.mesh.rotation.set(0, Math.PI, 0);

    this.state = {
      ...this.state,
      countdown: 3,
      timeRemaining: this.matchDuration,
      arenaRadius: this.initialRadius,
      dashCooldownRemaining: 0,
      isPaused: false,
      isGameOver: false,
      winner: null,
      warningText: null,
    };
    this.onStateChange({ ...this.state });
  }

  private spawnDashParticles(pos: THREE.Vector3, colorHex: number) {
    for (let i = 0; i < 8; i++) {
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
          this.triggerVictory();
        } else {
          this.triggerDefeat();
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

    // 7. Update Dash Cooldown
    if (this.player.dashCooldown > 0) {
      this.player.dashCooldown = Math.max(0, this.player.dashCooldown - dt);
      this.state.dashCooldownRemaining = this.player.dashCooldown;
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

    this.bot.dashCooldown = Math.max(0, this.bot.dashCooldown - dt);

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

    // Only dash if safely within the ring and lined up with the player!
    if (distToPlayer < 4.0 && botDistToCenter < safeZone && this.bot.dashCooldown <= 0 && !this.bot.isDashing) {
      this.bot.isDashing = true;
      this.bot.dashTimer = 0.22;
      this.bot.dashCooldown = 3.0 + Math.random() * 1.0;
      this.bot.vel.x = steerX * 16;
      this.bot.vel.z = steerZ * 16;
      sounds.playDash();
      this.spawnDashParticles(this.bot.pos, 0xef4444);
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

      // Elastic knockback impulse
      let pImpulse = 8;
      let bImpulse = 8;

      if (this.player.isDashing && !this.bot.isDashing) {
        // Player landed heavy dash!
        bImpulse = 18;
        pImpulse = 4;
        this.triggerScreenShake(0.25, 0.5);
        sounds.playBump(2.0);
      } else if (this.bot.isDashing && !this.player.isDashing) {
        // Bot landed heavy dash!
        pImpulse = 18;
        bImpulse = 4;
        this.triggerScreenShake(0.25, 0.5);
        sounds.playBump(2.0);
      } else if (this.player.isDashing && this.bot.isDashing) {
        // Clash rebound!
        pImpulse = 16;
        bImpulse = 16;
        this.triggerScreenShake(0.35, 0.8);
        sounds.playBump(2.5);
      } else {
        // Normal bump
        sounds.playBump(1.0);
        this.triggerScreenShake(0.1, 0.2);
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

      // Fully knocked out
      if (b.pos.y < -12) {
        b.isKnockedOut = true;
        b.mesh.visible = false;

        if (b.isBot) {
          this.triggerVictory();
        } else {
          this.triggerDefeat();
        }
      }
    }
  }

  private triggerVictory() {
    if (this.state.isGameOver) return;
    this.state.isGameOver = true;
    this.state.winner = 'player';
    sounds.playVictory();

    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });

    this.onStateChange({ ...this.state });
  }

  private triggerDefeat() {
    if (this.state.isGameOver) return;
    this.state.isGameOver = true;
    this.state.winner = 'bot';
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
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
