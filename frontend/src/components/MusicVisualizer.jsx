import React, { useRef, useEffect } from 'react';

// 模块级持久引用 — 组件卸载后 AudioContext 连接链不销毁，
// 确保从 BlessingsPage 离开再返回时分析器仍然可用，音乐不会中断
let _ctx = null;
let _analyser = null;
let _dataArray = null;

export default function MusicVisualizer({ audioRef }) {
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const animRef = useRef(null);
  const connectedRef = useRef(false);
  const smoothData = useRef([]);
  const ripplePhase = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;

    function resize() {
      const p = canvas.parentElement;
      w = canvas.width = p.clientWidth * 2;
      h = canvas.height = p.clientHeight * 2;
      canvas.style.width = p.clientWidth + 'px';
      canvas.style.height = p.clientHeight + 'px';
    }
    resize();
    window.addEventListener('resize', resize);

    let audioCtx = null;
    let analyser = null;
    let dataArray = null;

    // 如果从之前挂载恢复了持久连接，直接使用
    if (_analyser) {
      analyser = _analyser;
      dataArray = _dataArray;
      smoothData.current = new Float32Array(64);
      connectedRef.current = true; // 防止 init() 再次尝试创建 MediaElementSource
    }

    function init() {
      if (connectedRef.current) return;
      const audio = audioRef?.current;
      if (!audio || !audio.src) return;
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const src = audioCtx.createMediaElementSource(audio);
        src.connect(analyser);
        analyser.connect(audioCtx.destination);
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        const bars = 64;
        smoothData.current = new Float32Array(bars);
        analyserRef.current = analyser;
        connectedRef.current = true;

        // 持久存储，组件卸载再挂载后仍可用
        _ctx = audioCtx;
        _analyser = analyser;
        _dataArray = dataArray;

        // Auto-resume AudioContext if suspended by browser
        audioCtx.onstatechange = () => {
          if (audioCtx.state === 'suspended') {
            audioCtx.resume();
          }
        };
      } catch (e) { /* ignore */ }
    }

    const audio = audioRef?.current;
    if (audio) {
      audio.addEventListener('play', init);
      const iv = setInterval(() => {
        if (audio && !audio.paused && !connectedRef.current) init();
      }, 600);
      const stop = setInterval(() => {
        if (connectedRef.current) { clearInterval(iv); clearInterval(stop); }
      }, 200);
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      ripplePhase.current += 0.02;

      if (!analyser || !dataArray) {
        // Idle — soft floating rings with ripple
        const cx = w / 2, cy = h / 2;
        for (let ring = 0; ring < 4; ring++) {
          const r = 20 + ring * 18 + Math.sin(Date.now() * 0.001 + ring) * 5;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(340, 70%, 70%, ${0.04 + Math.sin(Date.now() * 0.002 + ring) * 0.02})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
        grad.addColorStop(0, 'rgba(255,150,200,0.04)');
        grad.addColorStop(1, 'rgba(255,150,200,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(cx - 30, cy - 30, 60, 60);
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      analyser.getByteFrequencyData(dataArray);

      const bars = 64;
      const barW = (w / bars) * 0.7;
      const gap = (w / bars) * 0.3;
      const startX = (w / 2) - (bars / 2) * (barW + gap);
      const centerY = h / 2;

      for (let i = 0; i < bars; i++) {
        const raw = dataArray[i] / 255;
        smoothData.current[i] += (raw - smoothData.current[i]) * 0.25;
      }

      for (let i = 0; i < bars; i++) {
        const val = smoothData.current[i];
        const barH = Math.max(1.5, val * h * 0.28);
        const x = startX + i * (barW + gap);
        const hue = 330 + val * 25;
        const bright = 0.4 + val * 0.5;

        const gradT = ctx.createLinearGradient(x, centerY - barH, x, centerY);
        gradT.addColorStop(0, `hsla(${hue}, 90%, 75%, ${bright})`);
        gradT.addColorStop(0.5, `hsla(${hue + 10}, 80%, 65%, ${bright * 0.7})`);
        gradT.addColorStop(1, `hsla(${hue + 20}, 70%, 55%, ${bright * 0.3})`);
        ctx.fillStyle = gradT;
        ctx.beginPath();
        ctx.roundRect(x, centerY - barH, barW, barH, barW * 0.3);
        ctx.fill();

        const gradB = ctx.createLinearGradient(x, centerY, x, centerY + barH);
        gradB.addColorStop(0, `hsla(${hue + 20}, 70%, 55%, ${bright * 0.3})`);
        gradB.addColorStop(1, `hsla(${hue}, 90%, 75%, ${bright})`);
        ctx.fillStyle = gradB;
        ctx.beginPath();
        ctx.roundRect(x, centerY, barW, barH, barW * 0.3);
        ctx.fill();
      }

      // Center ripple
      const cx = w / 2, cy = h / 2;
      for (let r = 1; r <= 3; r++) {
        const radius = 8 + Math.sin(ripplePhase.current + r * 1.5) * 4 + r * 6;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(340, 80%, 75%, ${0.03 + Math.sin(ripplePhase.current + r) * 0.02})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      const gradC = ctx.createLinearGradient(0, centerY - 2, 0, centerY + 2);
      gradC.addColorStop(0, 'rgba(255,150,200,0)');
      gradC.addColorStop(0.5, 'rgba(255,150,200,0.15)');
      gradC.addColorStop(1, 'rgba(255,150,200,0)');
      ctx.fillStyle = gradC;
      ctx.fillRect(0, centerY - 1, w, 2);

      const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 20);
      glowGrad.addColorStop(0, 'rgba(255,150,200,0.06)');
      glowGrad.addColorStop(1, 'rgba(255,150,200,0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(cx - 20, cy - 20, 40, 40);

      animRef.current = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      if (audio) audio.removeEventListener('play', init);
      // 不关闭 audioCtx：关闭会断开音频路由链，导致音乐中断
      // 让 AudioContext 保持存活，返回 BlessingsPage 时 visualizer 直接重连即可
    };
  }, [audioRef]);

  return <canvas ref={canvasRef} className="viz-canvas" />;
}
