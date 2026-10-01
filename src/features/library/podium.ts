/** Library display podium — turntable stage for model inspection. */
import * as THREE from 'three/webgpu';
import { getMaterial } from '../../assets/materials';
import { mesh } from '../../catalog/builders/shared/primitives';

export function buildPodium(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'podium';
  // travertine drum
  const drum = mesh(new THREE.CylinderGeometry(1.5, 1.6, 0.18, 48), getMaterial('travertine'), 0, -0.09, 0);
  drum.castShadow = false;
  g.add(drum);
  // brass ring inlay
  const ring = mesh(new THREE.TorusGeometry(1.5, 0.015, 10, 64), getMaterial('metal_brass'), 0, 0.005, 0);
  ring.rotation.x = Math.PI / 2;
  ring.castShadow = false;
  g.add(ring);
  return g;
}
