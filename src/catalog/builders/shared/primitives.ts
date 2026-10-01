/**
 * Mesh primitive factory — every builder assembles models from these.
 * All meshes cast & receive shadows by default (anti-flicker invariant).
 */
import * as THREE from 'three/webgpu';

export function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function box(w: number, h: number, d: number, mat: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh {
  return mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z);
}

export function boxRot(w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number, rx: number, ry: number, rz: number): THREE.Mesh {
  const m = box(w, h, d, mat, x, y, z);
  m.rotation.set(rx, ry, rz);
  return m;
}

/** Rounded box — cushions, pads, tabletops (beveled edges, no sharp z-fight planes). */
export function roundedBox(w: number, h: number, d: number, r: number, mat: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh {
  const rr = Math.max(0.001, Math.min(r, w / 2.01, h / 2.01, d / 2.01));
  const shape = new THREE.Shape();
  const hw = w / 2 - rr;
  const hh = h / 2 - rr;
  shape.moveTo(-hw - rr, -hh);
  shape.lineTo(hw, -hh);
  shape.quadraticCurveTo(hw + rr, -hh, hw + rr, -hh + rr);
  shape.lineTo(hw + rr, hh);
  shape.quadraticCurveTo(hw + rr, hh + rr, hw, hh + rr);
  shape.lineTo(-hw, hh + rr);
  shape.quadraticCurveTo(-hw - rr, hh + rr, -hw - rr, hh);
  shape.lineTo(-hw - rr, -hh + rr);
  shape.quadraticCurveTo(-hw - rr, -hh, -hw, -hh);
  const depth = Math.max(d - rr * 2, 0.001);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: rr,
    bevelSize: rr,
    bevelSegments: 2,
    curveSegments: 4,
  });
  geo.translate(0, 0, -depth / 2);
  geo.computeVertexNormals();
  return mesh(geo, mat, x, y, z);
}

export function cyl(rTop: number, rBot: number, h: number, mat: THREE.Material, x = 0, y = 0, z = 0, seg = 24): THREE.Mesh {
  return mesh(new THREE.CylinderGeometry(rTop, rBot, h, seg), mat, x, y, z);
}

export function cylX(rTop: number, rBot: number, h: number, mat: THREE.Material, x = 0, y = 0, z = 0, seg = 24): THREE.Mesh {
  const m = cyl(rTop, rBot, h, mat, x, y, z, seg);
  m.rotation.z = Math.PI / 2;
  return m;
}

export function cylZ(rTop: number, rBot: number, h: number, mat: THREE.Material, x = 0, y = 0, z = 0, seg = 24): THREE.Mesh {
  const m = cyl(rTop, rBot, h, mat, x, y, z, seg);
  m.rotation.x = Math.PI / 2;
  return m;
}

export function sphere(r: number, mat: THREE.Material, x = 0, y = 0, z = 0, seg = 20): THREE.Mesh {
  return mesh(new THREE.SphereGeometry(r, seg, Math.max(8, Math.floor(seg / 2))), mat, x, y, z);
}

export function halfSphere(r: number, mat: THREE.Material, x = 0, y = 0, z = 0, seg = 20): THREE.Mesh {
  return mesh(new THREE.SphereGeometry(r, seg, Math.max(8, Math.floor(seg / 2)), 0, Math.PI * 2, 0, Math.PI / 2), mat, x, y, z);
}

export function torus(r: number, t: number, mat: THREE.Material, x = 0, y = 0, z = 0, arc = Math.PI * 2): THREE.Mesh {
  return mesh(new THREE.TorusGeometry(r, t, 12, 40, arc), mat, x, y, z);
}

/** Tube along a CatmullRom curve through [x,y,z] points — chair frames, lamp arcs. */
export function tube(points: ReadonlyArray<readonly [number, number, number]>, radius: number, mat: THREE.Material, closed = false, seg = 48): THREE.Mesh {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(p[0], p[1], p[2])), closed);
  return mesh(new THREE.TubeGeometry(curve, seg, radius, 10, closed), mat);
}

/** Lathe from [radius, y] profile — vases, ceramic bodies. */
export function lathe(profile: ReadonlyArray<readonly [number, number]>, mat: THREE.Material, seg = 40, x = 0, y = 0, z = 0): THREE.Mesh {
  const pts = profile.map(([r, yy]) => new THREE.Vector2(r, yy));
  return mesh(new THREE.LatheGeometry(pts, seg), mat, x, y, z);
}

/** Double-sided leaf plane with a bezier silhouette. */
export function leafShape(length: number, width: number, mat: THREE.Material): THREE.Mesh {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(width * 0.5, length * 0.25, width * 0.55, length * 0.7, 0, length);
  shape.bezierCurveTo(-width * 0.55, length * 0.7, -width * 0.5, length * 0.25, 0, 0);
  const geo = new THREE.ShapeGeometry(shape, 6);
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  return m;
}

export function group(children: THREE.Object3D[], x = 0, y = 0, z = 0): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  for (const c of children) g.add(c);
  return g;
}

/**
 * Soft fake contact shadow — grounds furniture visually without
 * shadow-map acne on large receivers. depthWrite:false + fixed renderOrder
 * (anti-flicker invariant: never z-fights the floor).
 * Falls back to a stub image in non-DOM environments (Node unit tests).
 */
export function contactShadow(w: number, d: number, x = 0, z = 0, opacity = 0.32): THREE.Mesh {
  let image: HTMLCanvasElement | { width: number; height: number };
  if (typeof document !== 'undefined') {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(64, 64, 8, 64, 64, 62);
    g.addColorStop(0, `rgba(0,0,0,${opacity})`);
    g.addColorStop(0.6, `rgba(0,0,0,${opacity * 0.45})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    image = c;
  } else {
    image = { width: 128, height: 128 };
  }
  const tex = new THREE.CanvasTexture(image as HTMLCanvasElement);
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, d),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }),
  );
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, 0.006, z);
  m.renderOrder = 2;
  m.userData.overlay = true; // decal — never casts shadows
  return m;
}

/** Count meshes / triangles under an object (used by tests + stats). */
export function objectStats(root: THREE.Object3D): { meshes: number; triangles: number } {
  let meshes = 0;
  let triangles = 0;
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh && m.geometry) {
      meshes += 1;
      const g = m.geometry as THREE.BufferGeometry;
      const pos = g.getAttribute('position');
      if (pos) {
        const tri = g.index ? g.index.count / 3 : pos.count / 3;
        triangles += tri;
      }
    }
  });
  return { meshes, triangles };
}
