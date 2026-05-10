import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { COS_BASE } from '../lib/assets.js';

const FLOWER_SCALE = 0.3;

export class ObjectPlacer {
  constructor(scene) {
    this.scene = scene;
    this.placedObjects = [];
    this.onPlaced = null;
    this._reticle = null;
    this._reticleRing = null;
    this._previewFlower = null;
    this._carnationModel = null;
    this.modelReady = false;
    this._disposed = false;
  }

  // ── 加载 GLB 模型 ──

  loadModel(onReady) {
    if (this._carnationModel || this.modelReady) return;
    const loader = new GLTFLoader();
    loader.load(
      `${COS_BASE}/ca250c8259af49ba6308c94637222ab2.glb`,
      (gltf) => {
        this._carnationModel = gltf.scene;
        this.modelReady = true;
        this._createPreviewFlower();
        onReady?.();
      },
      undefined,
      (err) => {
        console.error('GLB 加载失败:', err);
      }
    );
  }

  // ── 屏幕准星（红点）──

  createReticle() {
    const group = new THREE.Group();

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.035, 0.045, 32),
      new THREE.MeshBasicMaterial({
        color: 0xff3344, transparent: true, opacity: 0.5,
        side: THREE.DoubleSide, depthWrite: false,
      })
    );
    ring.rotation.x = -Math.PI / 2;
    group.add(ring);
    this._reticleRing = ring;

    const dot = new THREE.Mesh(
      new THREE.CircleGeometry(0.012, 16),
      new THREE.MeshBasicMaterial({
        color: 0xff2244, transparent: true, opacity: 0.9, depthWrite: false,
      })
    );
    dot.rotation.x = -Math.PI / 2;
    group.add(dot);

    for (let i = 0; i < 4; i++) {
      const line = new THREE.Mesh(
        new THREE.PlaneGeometry(0.025, 0.002),
        new THREE.MeshBasicMaterial({ color: 0xff3344, transparent: true, opacity: 0.3, depthWrite: false })
      );
      line.rotation.x = -Math.PI / 2;
      line.position.x = Math.cos(i * Math.PI / 2) * 0.03;
      line.position.z = Math.sin(i * Math.PI / 2) * 0.03;
      group.add(line);
    }

    group.visible = true;
    this.scene.add(group);
    this._reticle = group;
  }

  updateReticle(viewerPose) {
    if (!this._reticle || !viewerPose) return;
    const p = viewerPose.transform.position;
    const q = viewerPose.transform.orientation;
    const dir = new THREE.Vector3(0, 0, -0.8).applyQuaternion(new THREE.Quaternion(q.x, q.y, q.z, q.w));
    this._reticle.position.set(p.x, p.y, p.z).add(dir);
    this._reticle.lookAt(new THREE.Vector3(p.x, p.y, p.z));

    if (this._reticleRing) {
      const pulse = 0.4 + Math.sin(Date.now() * 0.003) * 0.15;
      this._reticleRing.material.opacity = pulse;
      this._reticleRing.scale.setScalar(1 + Math.sin(Date.now() * 0.003) * 0.1);
    }
  }

  // ── 每帧更新（旋转花朵）──

  update(time) {
    for (const obj of this.placedObjects) {
      obj.rotation.y += 0.005;
    }
  }

  // ── 放置预览 ──

  _createPreviewFlower() {
    if (!this._carnationModel) return;
    if (this._previewFlower) {
      this.scene.remove(this._previewFlower);
    }
    const clone = this._makePinkClone(this._carnationModel);
    clone.scale.setScalar(FLOWER_SCALE);
    clone.visible = false;
    this.scene.add(clone);
    this._previewFlower = clone;
  }

  showPreview(position) {
    if (!this._previewFlower) return;
    this._previewFlower.position.copy(position);
    this._previewFlower.position.y += 0.02;
    this._previewFlower.visible = true;
  }

  hidePreview() {
    if (this._previewFlower) this._previewFlower.visible = false;
  }

  // ── 将模型所有材质替换为粉色 ──

  _makePinkClone(source) {
    const clone = source.clone();
    clone.traverse(child => {
      if (child.isMesh) {
        const isArray = Array.isArray(child.material);
        const list = isArray ? child.material : [child.material];
        const pinkMaterials = list.map(m => {
          const pink = new THREE.MeshStandardMaterial({
            color: 0xff6ba8,
            roughness: 0.3,
            metalness: 0.1,
          });
          if (m.transparent) {
            pink.transparent = true;
            pink.opacity = m.opacity * 0.45;
          }
          return pink;
        });
        child.material = isArray ? pinkMaterials : pinkMaterials[0];
      }
    });
    return clone;
  }

  // ── 放置粉色康乃馨 ──

  placeCarnation(position, scale = FLOWER_SCALE) {
    if (!this._carnationModel) return null;

    const clone = this._makePinkClone(this._carnationModel);

    clone.position.copy(position);
    clone.position.y += 0.02;
    clone.scale.setScalar(0.01);
    clone.rotation.set(0, Math.random() * Math.PI * 2, 0);

    this.scene.add(clone);
    this.placedObjects.push(clone);
    this.hidePreview();

    // 生长动画
    const grow = () => {
      if (this._disposed || !this.placedObjects.includes(clone)) return;
      const s = Math.min(clone.scale.x + 0.06, scale);
      clone.scale.setScalar(s);
      if (s < scale) requestAnimationFrame(grow);
    };
    requestAnimationFrame(grow);

    this._spawnParticles(position);

    if (this.onPlaced) this.onPlaced();
    return clone;
  }

  // ── 粒子特效 ──

  _spawnParticles(position) {
    const count = 20;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const velocities = [];

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 0.05 + Math.random() * 0.1;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      const c = new THREE.Color().setHSL(0.95 + Math.random() * 0.05, 1, 0.5 + Math.random() * 0.3);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      velocities.push({
        x: (Math.random() - 0.5) * 0.5,
        y: Math.random() * 0.5 + 0.2,
        z: (Math.random() - 0.5) * 0.5,
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.02, vertexColors: true, transparent: true,
      opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    points.position.copy(position);
    this.scene.add(points);

    let life = 1;
    const animParticles = () => {
      if (this._disposed) { this.scene.remove(points); geometry.dispose(); material.dispose(); return; }
      life -= 0.02;
      if (life <= 0) {
        this.scene.remove(points);
        geometry.dispose();
        material.dispose();
        return;
      }
      const pos = points.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        pos[i * 3] += velocities[i].x * 0.01;
        pos[i * 3 + 1] += velocities[i].y * 0.01;
        pos[i * 3 + 2] += velocities[i].z * 0.01;
        velocities[i].y -= 0.005;
      }
      points.geometry.attributes.position.needsUpdate = true;
      material.opacity = life * 0.8;
      const s = 1 + (1 - life) * 2;
      points.scale.setScalar(s);
      requestAnimationFrame(animParticles);
    };
    requestAnimationFrame(animParticles);
  }

  // ── 清理 ──

  clearAll() {
    this.placedObjects.forEach(obj => {
      this.scene.remove(obj);
      obj.traverse(c => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) {
          (Array.isArray(c.material) ? c.material : [c.material]).forEach(m => m.dispose());
        }
      });
    });
    this.placedObjects = [];
  }

  dispose() {
    this._disposed = true;
    this.clearAll();
    if (this._previewFlower) {
      this.scene.remove(this._previewFlower);
    }
    if (this._reticle) {
      this.scene.remove(this._reticle);
      this._reticle = null;
      this._reticleRing = null;
    }
    this._carnationModel = null;
    this.modelReady = false;
  }
}
