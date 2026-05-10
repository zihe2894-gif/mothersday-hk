/**
 * WebXR AR 会话管理
 */
export class ArSession {
  constructor() {
    this.session = null;
    this.onSessionEnded = null;
  }

  static async isSupported() {
    if (!navigator.xr) return false;
    try {
      return await navigator.xr.isSessionSupported('immersive-ar');
    } catch {
      return false;
    }
  }

  async start(overlayRoot) {
    if (!navigator.xr) throw new Error('WebXR not available');

    const supported = await navigator.xr.isSessionSupported('immersive-ar');
    if (!supported) throw new Error('immersive-ar not supported');

    const options = {
      requiredFeatures: ['local'],
      optionalFeatures: ['local-floor', 'hit-test', 'plane-detection', 'dom-overlay', 'light-estimation'],
    };
    if (overlayRoot) options.domOverlay = { root: overlayRoot };

    this.session = await navigator.xr.requestSession('immersive-ar', options);

    this.session.addEventListener('end', () => {
      this.session = null;
      if (this.onSessionEnded) this.onSessionEnded();
    });

    return this.session;
  }

  async end() {
    if (this.session) {
      try { await this.session.end(); } catch {}
      this.session = null;
    }
  }
}
