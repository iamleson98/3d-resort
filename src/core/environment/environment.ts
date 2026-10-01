/**
 * Environment — lighting rig, sky backdrop and shadow tuning.
 *
 * Anti-flicker invariants (the v1 floor bug):
 *  - PCFSoftShadowMap, bias=-0.00035, normalBias=0.04
 *  - tight orthographic shadow frustum sized to the active room
 *  - 2048² shadow map
 *  - no coplanar surfaces (floors are thick slabs built by RoomShell)
 */
import * as THREE from 'three/webgpu';
import { skyTex } from '../../assets/textures/sky';

export interface Environment {
  root: THREE.Group;
  sun: THREE.DirectionalLight;
  hemi: THREE.HemisphereLight;
  ambient: THREE.AmbientLight;
  backdrop: THREE.Mesh;
  envMap: THREE.Texture;
}

export function createEnvironment(scene: THREE.Scene): Environment {
  const root = new THREE.Group();
  root.name = 'environment';

  // Key light — warm tropical sun
  const sun = new THREE.DirectionalLight(0xfff2dd, 3.2);
  sun.position.set(6, 9, 4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 30;
  sun.shadow.camera.left = -12;
  sun.shadow.camera.right = 12;
  sun.shadow.camera.top = 12;
  sun.shadow.camera.bottom = -12;
  sun.shadow.bias = -0.00035;
  sun.shadow.normalBias = 0.04;
  root.add(sun);

  // Sky dome fills the reflection channel
  const envMap = new THREE.CanvasTexture(skyTex({ size: 1024 }));
  envMap.mapping = THREE.EquirectangularReflectionMapping;
  envMap.colorSpace = THREE.SRGBColorSpace;

  const hemi = new THREE.HemisphereLight(0xdfeaf2, 0xcbb59f, 0.75);
  root.add(hemi);

  const ambient = new THREE.AmbientLight(0xffffff, 0.22);
  root.add(ambient);

  // Sky dome backdrop (BackSide sphere so it never occludes)
  const backdrop = new THREE.Mesh(
    new THREE.SphereGeometry(80, 32, 16),
    new THREE.MeshBasicMaterial({ map: envMap, side: THREE.BackSide, depthWrite: false }),
  );
  backdrop.name = 'sky';
  root.add(backdrop);

  scene.add(root);
  scene.environment = envMap;

  return { root, sun, hemi, ambient, backdrop, envMap };
}

/** Fit the shadow frustum to the active room so shadow texel density stays high. */
export function fitShadowToRoom(sun: THREE.DirectionalLight, w: number, d: number, cx = 0, cz = 0): void {
  const half = Math.max(w, d) / 2 + 2;
  sun.position.set(cx + 6, 9, cz + 4);
  sun.target.position.set(cx, 0, cz);
  sun.target.updateMatrixWorld();
  sun.shadow.camera.left = -half;
  sun.shadow.camera.right = half;
  sun.shadow.camera.top = half;
  sun.shadow.camera.bottom = -half;
  sun.shadow.camera.updateProjectionMatrix();
}
