import React, { useRef, useEffect } from 'react';

class Petal {
  constructor(w, h) { this.reset(w, h); }
  reset(w, h) {
    this.x = Math.random() * w;
    this.y = -20 - Math.random() * 100;
    this.size = 3 + Math.random() * 7;
    this.speed = 0.3 + Math.random() * 0.6;
    this.drift = (Math.random() - 0.5) * 0.2;
    this.rot = Math.random() * Math.PI * 2;
    this.rotSpd = (Math.random() - 0.5) * 0.02;
    this.phase = Math.random() * Math.PI * 2;
    this.op = 0.08 + Math.random() * 0.15;
    this.hue = 340 + Math.random() * 20;
  }
  update(w, h, time) {
    this.y += this.speed;
    this.x += this.drift + Math.sin(time * 0.002 + this.phase) * 0.3;
    this.rot += this.rotSpd;
    if (this.y > h + 20) { this.reset(w, h); }
  }
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.globalAlpha = this.op;
    const s = this.size;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.5, s, 0, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${this.hue}, 80%, 75%, 0.5)`;
    ctx.fill();
    ctx.restore();
  }
}

export default function Petals() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let anim, w, h, petals = [];
    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      petals = Array.from({ length: Math.floor((w * h) / 40000) }, () => new Petal(w, h));
    }
    resize(); window.addEventListener('resize', resize);
    function animate(time) {
      ctx.clearRect(0, 0, w, h);
      petals.forEach(p => { p.update(w, h, time); p.draw(ctx); });
      anim = requestAnimationFrame(animate);
    }
    anim = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(anim); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} className="bg-canvas" style={{ zIndex: 2, opacity: 0.8 }} />;
}
