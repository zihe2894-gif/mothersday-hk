import React, { useRef, useEffect } from 'react';

class Sparkle {
  constructor(w, h) {
    this.reset(w, h);
    this.isHeart = false;
  }
  reset(w, h) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.s = 1 + Math.random() * 2.5;
    this.sy = -(0.15 + Math.random() * 0.4);
    this.sx = (Math.random() - 0.5) * 0.15;
    this.op = 0.1 + Math.random() * 0.5;
    this.ph = Math.random() * Math.PI * 2;
    this.h = 330 + Math.random() * 25;
  }
  update(w, h, t) {
    this.y += this.sy;
    this.x += this.sx + Math.sin(t * 0.002 + this.ph) * 0.15;
    this.op = 0.2 + Math.sin(t * 0.003 + this.ph) * 0.2;
    if (this.y < -5) { this.reset(w, h); }
  }
  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.s, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${this.h}, 80%, 70%, ${this.op})`;
    ctx.fill();
    if (this.s > 1.5) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.s * 3, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.h}, 80%, 70%, ${this.op * 0.12})`;
      ctx.fill();
    }
  }
}

class HeartParticle {
  constructor(w, h) { this.reset(w, h); }
  reset(w, h) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.size = 3 + Math.random() * 5;
    this.speed = -(0.2 + Math.random() * 0.3);
    this.drift = (Math.random() - 0.5) * 0.2;
    this.op = 0.1 + Math.random() * 0.2;
    this.hue = 340 + Math.random() * 15;
    this.phase = Math.random() * Math.PI * 2;
  }
  update(w, h, t) {
    this.y += this.speed;
    this.x += this.drift + Math.sin(t * 0.003 + this.phase) * 0.1;
    this.op = 0.15 + Math.sin(t * 0.004 + this.phase) * 0.08;
    if (this.y < -this.size * 2) { this.reset(w, h); }
  }
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.globalAlpha = this.op;
    const s = this.size;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.3);
    ctx.bezierCurveTo(-s * 0.5, -s * 0.3, -s, s * 0.1, 0, s * 0.8);
    ctx.bezierCurveTo(s, s * 0.1, s * 0.5, -s * 0.3, 0, s * 0.3);
    ctx.closePath();
    ctx.fillStyle = `hsla(${this.hue}, 85%, 70%, 0.5)`;
    ctx.fill();
    ctx.restore();
  }
}

export default function CoverParticles() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let anim, w, h, pts = [], hearts = [];
    function resize() {
      const p = canvas.parentElement;
      w = canvas.width = p.clientWidth * 2; h = canvas.height = p.clientHeight * 2;
      canvas.style.width = p.clientWidth + 'px'; canvas.style.height = p.clientHeight + 'px';
      pts = Array.from({ length: Math.floor((w*h)/35000) }, () => new Sparkle(w, h));
      hearts = Array.from({ length: Math.floor((w*h)/80000) }, () => new HeartParticle(w, h));
    }
    resize(); window.addEventListener('resize', resize);
    function animate(t) {
      ctx.clearRect(0, 0, w, h);
      pts.forEach(p => { p.update(w, h, t); p.draw(ctx); });
      hearts.forEach(h => { h.update(w, h, t); h.draw(ctx); });
      anim = requestAnimationFrame(animate);
    }
    anim = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(anim); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} className="cover-canvas" />;
}
