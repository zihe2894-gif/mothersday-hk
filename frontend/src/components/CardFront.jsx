import React, { useMemo } from 'react';
import CoverParticles from './CoverParticles.jsx';
import { COS_BASE } from '../lib/assets.js';

const COVERS = ['c304e4c06b2db7e60458ea102259c59e.jpg', 'ed5c6fa36973d1c2142575495b025245.jpg'];

export default function CardFront() {
  const coverImg = useMemo(() => {
    return COVERS[Math.floor(Math.random() * COVERS.length)];
  }, []);

  return (
    <div className="card-page card-cover flex flex-col items-center justify-center p-0 select-none overflow-hidden relative">
      <img
        src={`${COS_BASE}/${coverImg}`}
        alt="母亲节快乐"
        className="w-full h-full object-contain"
        draggable={false}
      />

      {/* Soft pink-white gradient overlay */}
      <div className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background: 'linear-gradient(0deg, rgba(255,245,248,0.35) 0%, transparent 40%, transparent 60%, rgba(255,245,248,0.15) 100%)',
        }}
      />

      {/* Warm glow at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none z-[1]"
        style={{
          background: 'linear-gradient(0deg, rgba(255,220,235,0.2) 0%, transparent 100%)',
        }}
      />

      {/* Particle overlay */}
      <div className="absolute inset-0 pointer-events-none z-[2]">
        <CoverParticles />
      </div>

      {/* ===== Shimmer click text ===== */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="px-5 py-2 rounded-full backdrop-blur-sm"
          style={{
            border: '1px solid rgba(212,175,55,0.25)',
            background: 'rgba(255,245,248,0.08)',
            boxShadow: '0 0 20px rgba(212,175,55,0.08)',
          }}
        >
          <span className="shimmer-text text-[11px] tracking-[0.35em] font-serif font-bold">
            ✦ 点击打开 ✦
          </span>
        </div>
      </div>

      {/* ===== AR browser notice badge ===== */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
        <div className="px-3 py-1 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,215,220,0.08)',
            backdropFilter: 'blur(2px)',
          }}
        >
          <span className="text-white/20 text-[7px] tracking-[0.15em] font-serif">
            AR · Android Chrome
          </span>
        </div>
      </div>
    </div>
  );
}
