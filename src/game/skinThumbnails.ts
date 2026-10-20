import * as THREE from 'three';
import { type ChampionId, createChampionMesh } from './championModels';

// In-memory cache for rendered skin portraits (PNG Data URLs)
const portraitCache = new Map<string, string>();

let sharedRenderer: THREE.WebGLRenderer | null = null;
let sharedScene: THREE.Scene | null = null;
let sharedCamera: THREE.PerspectiveCamera | null = null;

function initOffscreenRenderer() {
  if (sharedRenderer) return;
  if (typeof document === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 160;

  sharedRenderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance',
  });
  sharedRenderer.setSize(160, 160);
  sharedRenderer.setPixelRatio(1);

  sharedScene = new THREE.Scene();

  // Studio Portrait Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 1.8);
  sharedScene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.6);
  keyLight.position.set(1.5, 3.0, 3.5);
  sharedScene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x7dd3fc, 1.5);
  fillLight.position.set(-2.0, 1.5, 2.0);
  sharedScene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xfde047, 2.0);
  rimLight.position.set(0, 3.0, -3.0);
  sharedScene.add(rimLight);

  // 3/4 Heroic Portrait Camera (Head, Cap/Hair, Eyes, Shoulders & Chest)
  sharedCamera = new THREE.PerspectiveCamera(40, 1, 0.1, 20);
  sharedCamera.position.set(0.18, 1.52, 1.95);
  sharedCamera.lookAt(0, 1.45, 0);
}

/**
 * Returns a high-definition 3D bust portrait of the given champion and skin.
 * Cached in memory so subsequent calls are instantaneous.
 */
export function getSkinPortrait(championId: ChampionId, skinId?: string): string {
  const actualSkinId = skinId || `${championId}_default`;
  const cacheKey = `${championId}_${actualSkinId}`;

  if (portraitCache.has(cacheKey)) {
    return portraitCache.get(cacheKey)!;
  }

  // Check localStorage cache to avoid re-rendering across page refreshes
  try {
    const saved = localStorage.getItem(`skin_portrait_${cacheKey}`);
    if (saved && saved.startsWith('data:image/png')) {
      portraitCache.set(cacheKey, saved);
      return saved;
    }
  } catch {}

  initOffscreenRenderer();
  if (!sharedRenderer || !sharedScene || !sharedCamera) {
    return '';
  }

  try {
    // Instantiate champion mesh with requested skin
    const model = createChampionMesh(championId, actualSkinId);
    model.group.position.set(0, 0, 0);
    // Slight 3/4 turn for dynamic portrait angle
    model.group.rotation.y = -0.22;

    sharedScene.add(model.group);
    sharedRenderer.render(sharedScene, sharedCamera);

    const dataUrl = sharedRenderer.domElement.toDataURL('image/png');

    // Clean up mesh from scene
    sharedScene.remove(model.group);
    model.group.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const m = obj as THREE.Mesh;
        m.geometry?.dispose();
        if (Array.isArray(m.material)) {
          m.material.forEach((mat) => mat.dispose());
        } else {
          m.material?.dispose();
        }
      }
    });

    portraitCache.set(cacheKey, dataUrl);
    try {
      localStorage.setItem(`skin_portrait_${cacheKey}`, dataUrl);
    } catch {}

    return dataUrl;
  } catch (err) {
    console.error('Failed to generate skin portrait:', err);
    return '';
  }
}

/**
 * Preloads portraits for a list of champions/skins.
 */
export function preloadChampionPortraits(champions: ChampionId[]) {
  if (typeof window === 'undefined') return;
  setTimeout(() => {
    champions.forEach((champ) => {
      getSkinPortrait(champ);
    });
  }, 100);
}
