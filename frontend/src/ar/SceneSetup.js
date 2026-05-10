import * as THREE from 'three';

/**
 * Three.js 场景 + WebXR 渲染器管理
 */
export class SceneSetup {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
  }

  init() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100);

    const renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType('local-floor');

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer = renderer;

    // 灯光 — 确保 GLB 模型颜色正确显示
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    // 半球光：天光暖色，地光粉色，让花朵颜色更鲜艳
    const hemi = new THREE.HemisphereLight(0xffeef1, 0xffccdd, 0.7);
    this.scene.add(hemi);

    const dl = new THREE.DirectionalLight(0xffffff, 1.0);
    dl.position.set(5, 10, 7);
    this.scene.add(dl);

    const dl2 = new THREE.DirectionalLight(0xffdddd, 0.5);
    dl2.position.set(-3, 2, -4);
    this.scene.add(dl2);
  }

  async connectToXr(xrSession) {
    await this.renderer.xr.setSession(xrSession);
  }

  getReferenceSpace() {
    return this.renderer.xr.getReferenceSpace();
  }

  startRenderLoop(callback) {
    this.renderer.setAnimationLoop((timestamp, frame) => {
      callback({ scene: this.scene, camera: this.camera, renderer: this.renderer, frame, timestamp });
      this.renderer.render(this.scene, this.camera);
    });
  }

  stopRenderLoop() {
    this.renderer.setAnimationLoop(null);
  }

  dispose() {
    this.stopRenderLoop();
    while (this.scene?.children.length) {
      const c = this.scene.children[0];
      if (c.geometry) c.geometry.dispose();
      if (c.material) {
        (Array.isArray(c.material) ? c.material : [c.material]).forEach(m => m.dispose());
      }
      this.scene.remove(c);
    }
    this.scene?.clear();
    this.renderer?.dispose();
    this.scene = null;
    this.camera = null;
    this.renderer = null;
  }
}
