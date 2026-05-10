import { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { ArSession } from '../ar/ArSession.js';
import { SceneSetup } from '../ar/SceneSetup.js';
import { ObjectPlacer } from '../ar/ObjectPlacer.js';

export default function ArPage({ onExit }) {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [objectCount, setObjectCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [surfaceDetected, setSurfaceDetected] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [modelProgress, setModelProgress] = useState(0);

  const engine = useRef({
    arSession: null,
    setup: null,
    placer: null,
    hitTestSource: null,
    refSpace: null,
    lastHitPose: null,
    lastViewerPose: null,
    readyShown: false,
    framesWithoutHit: 0,
    surfaceWasDetected: false,
    starting: false,
    fallbackTimeout: null,
    lastPlaceTime: 0,
  });

  useEffect(() => {
    ArSession.isSupported().then(supported => {
      setStatus(supported ? 'idle' : 'unsupported');
    });
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cleanup() {
    const e = engine.current;
    e.starting = false;
    if (e.fallbackTimeout) { clearTimeout(e.fallbackTimeout); e.fallbackTimeout = null; }
    if (e.placer) { e.placer.dispose(); e.placer = null; }
    if (e.hitTestSource) { try { e.hitTestSource.cancel(); } catch {} e.hitTestSource = null; }
    if (e.setup) { e.setup.dispose(); e.setup = null; }
    if (e.arSession) { e.arSession.end(); e.arSession = null; }
    e.refSpace = null;
    e.lastHitPose = null;
    e.lastViewerPose = null;
    e.readyShown = false;
    e.framesWithoutHit = 0;
    e.surfaceWasDetected = false;
    e.lastPlaceTime = 0;
    setObjectCount(0);
    setErrorMsg('');
    setSurfaceDetected(false);
    setModelReady(false);
    setStatus('idle');
  }

  // ── 点击处理：放置康乃馨（仅模型就绪时）──
  function handleTap() {
    const e = engine.current;
    if (!e.placer || !e.placer.modelReady) return; // 等待模型加载

    const now = Date.now();
    if (now - e.lastPlaceTime < 500) return;
    e.lastPlaceTime = now;

    let pos;
    if (e.lastHitPose) {
      pos = new THREE.Vector3(
        e.lastHitPose.position.x,
        e.lastHitPose.position.y,
        e.lastHitPose.position.z
      );
    } else if (e.lastViewerPose) {
      const vp = e.lastViewerPose;
      const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(
        new THREE.Quaternion(vp.qx, vp.qy, vp.qz, vp.qw)
      );
      pos = new THREE.Vector3(vp.px, vp.py, vp.pz).add(dir.multiplyScalar(1.2));
    } else {
      pos = new THREE.Vector3(0, -0.5, -1.5);
    }

    const placed = e.placer.placeCarnation(pos);
    if (placed) {
      e.placedCount = (e.placedCount || 0) + 1;
      setObjectCount(e.placedCount);
    }
  }

  // ── 启动 AR ──
  const startAr = useCallback(async () => {
    const canvas = canvasRef.current;
    const e = engine.current;
    if (!canvas || e.starting) return;
    e.starting = true;

    setStatus('loading');
    setErrorMsg('');
    setSurfaceDetected(false);

    try {
      const setup = new SceneSetup(canvas);
      setup.init();
      e.setup = setup;

      const arSession = new ArSession();
      const session = await arSession.start(overlayRef.current);
      if (!e.starting) { await session.end(); return; }
      e.arSession = arSession;

      await setup.connectToXr(session);
      if (!e.starting) return;

      const refSpace = setup.getReferenceSpace();
      e.refSpace = refSpace;

      // 物体放置器 — 开始加载 GLB
      const placer = new ObjectPlacer(setup.scene);
      placer.createReticle();
      placer.loadModel(
        () => { setModelReady(true); },
        (pct) => { setModelProgress(pct); }
      );
      e.placer = placer;

      // Hit-test
      let hitTestSource = null;
      if (session.requestHitTestSource && refSpace) {
        try {
          hitTestSource = await session.requestHitTestSource({ space: refSpace });
        } catch (ex) {
          console.warn('Hit-test 不可用:', ex.message);
        }
      }
      e.hitTestSource = hitTestSource;

      if (!hitTestSource) {
        e.fallbackTimeout = setTimeout(() => {
          if (!e.readyShown) {
            e.readyShown = true;
            e.surfaceWasDetected = true;
            setSurfaceDetected(true);
            setStatus('ready');
          }
        }, 3000);
      }

      e.readyShown = false;
      e.framesWithoutHit = 0;
      e.surfaceWasDetected = false;
      e.lastPlaceTime = 0;
      setStatus('scanning');

      // 渲染循环
      setup.startRenderLoop(({ scene, camera, renderer, frame, timestamp }) => {
        if (!frame || !refSpace) return;

        placer.update(timestamp);

        try {
          const vp = frame.getViewerPose(refSpace);
          if (vp) {
            const t = vp.transform;
            e.lastViewerPose = {
              px: t.position.x, py: t.position.y, pz: t.position.z,
              qx: t.orientation.x, qy: t.orientation.y,
              qz: t.orientation.z, qw: t.orientation.w,
            };
            placer.updateReticle(vp);
          }
        } catch {}

        if (hitTestSource) {
          try {
            const hits = frame.getHitTestResults(hitTestSource);
            if (hits?.length > 0) {
              e.framesWithoutHit = 0;
              const pose = hits[0].getPose(refSpace);
              if (pose) {
                const p = pose.transform.position;
                e.lastHitPose = {
                  position: { x: p.x, y: p.y, z: p.z },
                };
                placer.showPreview(new THREE.Vector3(p.x, p.y, p.z));
                if (!e.surfaceWasDetected) {
                  e.surfaceWasDetected = true;
                  setSurfaceDetected(true);
                }
                if (!e.readyShown) {
                  e.readyShown = true;
                  setStatus('ready');
                }
              }
            } else {
              placer.hidePreview();
              if (++e.framesWithoutHit > 90 && !e.readyShown) {
                e.readyShown = true;
                setStatus('ready');
              }
            }
          } catch {}
        }

        renderer.render(scene, camera);
      });
    } catch (err) {
      console.error('AR 启动失败:', err);
      cleanup();
      setErrorMsg(err.message || String(err));
      setStatus('error');
    } finally {
      e.starting = false;
    }
  }, []);

  // ── 事件绑定 ──
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const handler = (e) => {
      if (e.button === 0 && !e.target.closest('button')) {
        handleTap();
      }
    };
    overlay.addEventListener('pointerup', handler);
    return () => overlay.removeEventListener('pointerup', handler);
  }, []);

  const statusText = {
    loading: '启动中...',
    scanning: '移动手机扫描地面',
    ready: surfaceDetected ? (modelReady ? '点击放置康乃馨' : `模型加载中 ${modelProgress}%`) : '寻找平面中...',
    error: errorMsg || '启动失败',
    unsupported: '该设备不支持 AR',
  }[status] || '';

  const statusColor = {
    loading: '#ffc107',
    scanning: '#ffc107',
    ready: '#ff6ba8',
    error: '#ef5350',
    unsupported: '#ef5350',
  }[status] || '#fff';

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: '#000', overflow: 'hidden',
    }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block', position: 'fixed', top: 0, left: 0,
          width: '100%', height: '100%', touchAction: 'none',
        }}
      />

      <div
        ref={overlayRef}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          pointerEvents: 'auto', zIndex: 10,
        }}
      >
        {/* 顶部栏 */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          padding: '12px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%)',
        }}>
          <button
            onClick={() => { cleanup(); onExit?.(); }}
            style={{
              pointerEvents: 'auto',
              background: 'rgba(255,255,255,0.15)',
              border: 'none', color: '#fff',
              padding: '8px 16px', borderRadius: '20px',
              fontSize: '14px', cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              fontFamily: '"Noto Serif SC", serif',
            }}
          >← 返回</button>

          {(status === 'scanning' || status === 'ready') && (
            <span style={{
              fontSize: '13px', fontWeight: 600, color: statusColor,
              textShadow: '0 1px 4px rgba(0,0,0,0.5)',
              fontFamily: '"Noto Serif SC", serif',
            }}>
              ● {statusText}
            </span>
          )}
        </div>

        {/* 启动按钮 */}
        {status === 'idle' && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
          }}>
            <h2 style={{
              color: '#fff', fontSize: 20, fontWeight: 400,
              fontFamily: '"Noto Serif SC", serif',
              textShadow: '0 2px 8px rgba(0,0,0,0.5)', margin: 0,
            }}>母亲节快乐</h2>
            <button onClick={startAr}
              style={{
                pointerEvents: 'auto',
                background: 'linear-gradient(135deg, #ff4466, #ff6ba8)',
                border: 'none', color: '#fff',
                padding: '16px 48px', borderRadius: '32px',
                fontSize: '18px', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 24px rgba(255,50,80,0.4)',
                fontFamily: '"Noto Serif SC", serif', letterSpacing: '2px',
              }}
            >启动 AR</button>
            <p style={{
              color: 'rgba(255,255,255,0.6)', fontSize: '13px',
              fontFamily: '"Noto Serif SC", serif', margin: 0,
            }}>将手机对准地面开始体验</p>
          </div>
        )}

        {/* AR 状态 */}
        {(status === 'scanning' || status === 'ready') && (
          <>
            <div style={{
              position: 'absolute', bottom: '100px',
              left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.6)',
              color: '#fff', padding: '10px 24px', borderRadius: '24px',
              fontSize: '14px', backdropFilter: 'blur(8px)',
              whiteSpace: 'nowrap',
              fontFamily: '"Noto Serif SC", serif',
              pointerEvents: 'none',
            }}>
              {status === 'ready'
                ? (modelReady ? '点击屏幕放置康乃馨' : '模型加载中...')
                : '移动手机扫描地面...'}
            </div>

            {objectCount > 0 && (
              <div style={{
                position: 'absolute', bottom: '148px',
                left: '50%', transform: 'translateX(-50%)',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '12px',
                fontFamily: '"Noto Serif SC", serif',
                pointerEvents: 'none',
              }}>
                已放置 {objectCount} 朵康乃馨
              </div>
            )}
          </>
        )}

        {/* 错误 */}
        {status === 'error' && (
          <div style={{
            position: 'absolute', bottom: '80px',
            left: '20px', right: '20px',
            background: 'rgba(239,83,80,0.95)',
            color: '#fff', padding: '20px', borderRadius: '14px',
            fontSize: '13px', lineHeight: '1.8',
            backdropFilter: 'blur(8px)',
            textAlign: 'left',
            boxShadow: '0 4px 24px rgba(239,83,80,0.3)',
            fontFamily: '"Noto Serif SC", serif',
          }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>启动失败</div>
            <div style={{ fontSize: 12, wordBreak: 'break-word' }}>{errorMsg}</div>
          </div>
        )}

        {/* 不支持 */}
        {status === 'unsupported' && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#fff', textAlign: 'center',
            fontFamily: '"Noto Serif SC", serif',
          }}>
            <p style={{ fontSize: 18, marginBottom: 12 }}>该设备不支持 AR</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
              需要 Android + Chrome + ARCore
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
