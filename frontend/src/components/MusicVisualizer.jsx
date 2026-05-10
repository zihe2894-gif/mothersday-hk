import React, { useRef, useEffect } from 'react';

// 模拟频率数据 — 视觉上像是对音乐的反应，但实际不会劫持音频输出
function generateBars(time, playing) {
  const bars = 64;
  const result = new Float32Array(bars);
  if (!playing) return result;
  for (let i = 0; i < bars; i++) {
    // 频率区域分布：低频(0-15) 中频(16-47) 高频(48-63)
    const phase = time * (0.5 + i / bars * 1.5) + i * 0.8;
    const envelope = i < 16
      ? 0.5 + 0.5 * Math.sin(time * 0.4 + i * 0.3)
      : 0.3 + 0.7 * Math.sin(time * 0.6 + i * 0.15);
    const peak = Math.max(0, Math.sin(phase));
    result[i] = Math.pow(peak, 2) * envelope * (0.6 + 0.4 * Math.sin(time * 0.2));
  }
  return result;
}

export default function MusicVisualizer({ audioRef }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
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

    function draw() {
      ctx.clearRect(0, 0, w, h);
      ripplePhase.current += 0.02;

      const now = Date.now() / 1000;
      const audio = audioRef?.current;
      const playing = audio ? !audio.paused : false;

      const rawData = generateBars(now, playing);
      if (!smoothData.current.length) {
        smoothData.current = new Float32Array(64);
      }
      for (let i = 0; i < 64; i++) {
        smoothData.current[i] += (rawData[i] - smoothData.current[i]) * 0.2;
      }

      const bars = 64;
      const barW = (w / bars) * 0.7;
      const gap = (w / bars) * 0.3;
      const startX = (w / 2) - (bars / 2) * (barW + gap);
      const centerY = h / 2;

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
    };
  }, [audioRef]);

  return <canvas ref={canvasRef} className="viz-canvas" />;
}
