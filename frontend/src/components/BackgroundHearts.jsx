import React, { useRef, useEffect } from 'react';

class Heart {
  constructor(w, h) { this.reset(w, h); }
  reset(w, h) {
    this.x = Math.random() * w;
    this.y = h + 20 + Math.random() * 200;
    this.size = 10 + Math.random() * 22;
    this.speed = -(0.4 + Math.random() * 0.7);
    this.drift = (Math.random() - 0.5) * 0.3;
    this.phase = Math.random() * Math.PI * 2;
    this.rot = (Math.random() - 0.5) * 0.3;
    this.rotSpd = (Math.random() - 0.5) * 0.003;
    this.op = 0.2 + Math.random() * 0.35;
    const isPurple = Math.random() < 0.3;
    const colors = isPurple
      ? [
          { h: 280, s: 70, l: 65 }, { h: 270, s: 65, l: 60 },
          { h: 290, s: 60, l: 70 }, { h: 275, s: 75, l: 55 },
        ]
      : [
          { h: 330, s: 90, l: 70 }, { h: 340, s: 95, l: 65 },
          { h: 350, s: 85, l: 60 }, { h: 335, s: 90, l: 75 },
          { h: 345, s: 80, l: 55 }, { h: 325, s: 85, l: 70 },
        ];
    const p = colors[Math.floor(Math.random() * colors.length)];
    this.h = p.h + (Math.random() - 0.5) * 8;
    this.s = p.s; this.l = p.l + (Math.random() - 0.5) * 8;
  }
  update(w, h, time) {
    this.y += this.speed;
    this.x += this.drift + Math.sin(time * 0.0005 + this.phase) * 0.15;
    this.rot += this.rotSpd;
    if (this.y < -this.size * 2) { this.reset(w, h); }
  }
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.globalAlpha = this.op;
    const s = this.size;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.3);
    ctx.bezierCurveTo(-s * 0.5, -s * 0.3, -s, s * 0.1, 0, s * 0.8);
    ctx.bezierCurveTo(s, s * 0.1, s * 0.5, -s * 0.3, 0, s * 0.3);
    ctx.closePath();
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 0.8);
    g.addColorStop(0, `hsla(${this.h + 10},${this.s}%,${this.l + 15}%,0.9)`);
    g.addColorStop(0.5, `hsla(${this.h},${this.s}%,${this.l}%,0.7)`);
    g.addColorStop(1, `hsla(${this.h - 5},${this.s}%,${this.l - 10}%,0.2)`);
    ctx.fillStyle = g; ctx.fill();
    ctx.shadowColor = `hsla(${this.h},${this.s}%,${this.l}%,0.4)`;
    ctx.shadowBlur = s * 0.5; ctx.fill();
    ctx.restore();
  }
}

class Sparkle {
  constructor(w, h) { this.reset(w, h); }
  reset(w, h) {
    this.x = Math.random() * w;
    this.y = h + 10 + Math.random() * 300;
    this.size = 1.5 + Math.random() * 2.5;
    this.speed = -(0.15 + Math.random() * 0.35);
    this.drift = (Math.random() - 0.5) * 0.15;
    this.phase = Math.random() * Math.PI * 2;
    this.op = 0.3 + Math.random() * 0.5;
    this.flickerSpeed = 0.002 + Math.random() * 0.004;
  }
  update(w, h, time) {
    this.y += this.speed;
    this.x += this.drift + Math.sin(time * 0.0008 + this.phase) * 0.1;
    const flicker = Math.sin(time * this.flickerSpeed + this.phase);
    this.currentOp = this.op * (0.3 + Math.abs(flicker) * 0.7);
    if (this.y < -10) { this.reset(w, h); }
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.currentOp;
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
    ctx.shadowBlur = this.size * 3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export default function BackgroundHearts() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let anim, w, h, hearts = [], sparkles = [];
    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      hearts = Array.from({ length: Math.floor((w * h) / 10000) }, () => new Heart(w, h));
      sparkles = Array.from({ length: Math.floor((w * h) / 30000) }, () => new Sparkle(w, h));
    }
    resize(); window.addEventListener('resize', resize);
    function animate(time) {
      ctx.clearRect(0, 0, w, h);
      hearts.forEach(h => { h.update(w, h, time); h.draw(ctx); });
      sparkles.forEach(s => { s.update(w, h, time); s.draw(ctx); });
      anim = requestAnimationFrame(animate);
    }
    anim = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(anim); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} className="bg-canvas" />;
}
