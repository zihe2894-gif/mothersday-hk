import React, { useState, useEffect } from 'react';
import MusicVisualizer from './MusicVisualizer.jsx';

const LINES = [
  '亲爱的妈妈，',
  '您是我生命中最温柔的光。',
  '您的怀抱，是我永远的港湾。',
  '岁月悠悠，您的爱如星河长明。',
  '愿您被全世界温柔以待，',
  '愿幸福如花般在您心间绽放。',
  '妈妈，我爱您。❤',
];

export default function BlessingsPage({ visible, audioRef, onEnterAR, arSupported }) {
  const [textIdx, setTextIdx] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(0);

  // Typewriter
  useEffect(() => {
    if (!visible) { setTextIdx(0); setShowHint(false); return; }
    if (textIdx < LINES.length) {
      const t = setTimeout(() => setTextIdx(i => i + 1), 450 + Math.random() * 200);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setShowHint(true), 600);
      return () => clearTimeout(t);
    }
  }, [visible, textIdx]);

  // Gentle glow pulse
  useEffect(() => {
    const iv = setInterval(() => {
      setGlowIntensity(0.3 + Math.sin(Date.now() * 0.003) * 0.2);
    }, 50);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="card-page flex flex-col items-center justify-center p-6 md:p-8 select-none"
      onClick={(e) => { if (showHint && arSupported) { e.stopPropagation(); onEnterAR(); } }}
      style={{
        cursor: showHint ? 'pointer' : 'default',
        background: 'linear-gradient(180deg, #fff5f8 0%, #ffd6e4 30%, #ffb3c9 60%, #fff5f8 100%)',
      }}
    >
      {/* Music visualizer fills the background */}
      {visible && <MusicVisualizer audioRef={audioRef} />}

      {/* Dreamy overlay gradient */}
      <div className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, rgba(255,100,160,0.06) 0%, transparent 60%)',
        }}
      />

      {/* Maternal light orbs - enhanced */}
      {visible && [0, 1, 2].map(i => (
        <div key={i} className="absolute rounded-full pointer-events-none"
          style={{
            width: `${60 + i * 50}px`,
            height: `${60 + i * 50}px`,
            left: `${25 + i * 25}%`,
            top: `${15 + i * 18}%`,
            background: i === 1
              ? `radial-gradient(circle, rgba(212,175,55,${0.03 + i * 0.01}) 0%, transparent 70%)`
              : `radial-gradient(circle, rgba(255,150,200,${0.03 + i * 0.02}) 0%, transparent 70%)`,
            animation: `float ${6 + i * 2}s ease-in-out infinite ${i * 1.5}s`,
            zIndex: 1,
          }}
        />
      ))}

      {/* Feather light spots */}
      {visible && [0, 1].map(i => (
        <div key={`feather-${i}`} className="absolute pointer-events-none rounded-full"
          style={{
            width: `${20 + i * 30}px`,
            height: `${60 + i * 40}px`,
            left: `${10 + i * 60}%`,
            top: `${50 + i * 20}%`,
            background: 'radial-gradient(ellipse, rgba(255,200,220,0.04) 0%, transparent 70%)',
            animation: `float ${8 + i * 3}s ease-in-out infinite ${i * 2}s`,
            zIndex: 1,
            transform: `rotate(${i * 45}deg)`,
          }}
        />
      ))}

      <div className="ornate tl" style={{ borderColor: 'rgba(255,150,200,0.08)' }} />
      <div className="ornate tr" style={{ borderColor: 'rgba(255,150,200,0.08)' }} />
      <div className="ornate bl" style={{ borderColor: 'rgba(255,150,200,0.08)' }} />
      <div className="ornate br" style={{ borderColor: 'rgba(255,150,200,0.08)' }} />

      <div className="relative z-[2] flex flex-col items-center justify-center h-full w-full">
        {/* Title with maternal glow */}
        <div className="mb-4 relative">
          <div className="absolute inset-0 blur-xl"
            style={{
              background: `radial-gradient(circle, rgba(255,100,160,${0.15 * glowIntensity}) 0%, transparent 70%)`,
            }}
          />
          <h2 className="relative font-serif text-2xl md:text-3xl pink-grad"
            style={{ filter: `drop-shadow(0 0 ${20 * glowIntensity}px rgba(255,100,160,${0.3 * glowIntensity}))` }}
          >
            给母亲
          </h2>
        </div>

        {/* Blessings - pink-gold gradient text */}
        <div className="text-center space-y-2.5 px-4">
          {LINES.slice(0, textIdx).map((line, i) => (
            <p key={i}
              className={`font-serif text-sm md:text-base leading-relaxed transition-all duration-700 ${
                i === LINES.length - 1 ? 'font-bold' : 'text-pink-800/60'
              }`}
              style={{
                animation: 'fadeUp 0.6s ease-out forwards',
                textShadow: i === LINES.length - 1 ? '0 0 20px rgba(255,100,160,0.3)' : 'none',
                background: i === LINES.length - 1
                  ? 'linear-gradient(90deg, #d4af37, #ff6ba8, #d4af37)'
                  : 'none',
                WebkitBackgroundClip: i === LINES.length - 1 ? 'text' : 'unset',
                WebkitTextFillColor: i === LINES.length - 1 ? 'transparent' : 'unset',
                backgroundClip: i === LINES.length - 1 ? 'text' : 'unset',
                backgroundSize: i === LINES.length - 1 ? '200% auto' : 'unset',
              }}
            >
              {line}
            </p>
          ))}
        </div>

        {/* Maternal quote */}
        {textIdx >= LINES.length - 2 && (
          <p className="mt-3 text-[10px] text-pink-200/20 font-serif tracking-[0.2em] italic"
            style={{ animation: 'fadeUp 0.8s ease-out forwards' }}
          >
            — 世上只有妈妈好 —
          </p>
        )}

        {/* AR hint - pulsating glow */}
        {showHint && arSupported && (
          <div className="relative z-[2] mt-4 px-6 py-2.5 rounded-full"
            style={{
              border: '1px solid rgba(255,150,200,0.12)',
              background: 'rgba(255,100,160,0.04)',
              backdropFilter: 'blur(8px)',
              animation: 'fadeUp 0.5s ease-out forwards, heartBeat 2s ease-in-out infinite 1s',
              cursor: 'pointer',
            }}
          >
            <p className="text-pink-300/40 text-xs tracking-wider font-serif">
              ✦ 轻触进入 AR 模式 ✦
            </p>
          </div>
        )}

        {showHint && !arSupported && (
          <p className="relative z-[2] mt-4 text-pink-300/30 text-[10px] font-serif tracking-wider">
            AR 仅支持 Android Chrome
          </p>
        )}
      </div>
    </div>
  );
}
