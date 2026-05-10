import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function MusicPlayer({ audioRef }) {
  const [playing, setPlaying] = useState(
    () => audioRef?.current ? !audioRef.current.paused : false
  );
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 1500);
    return () => clearTimeout(t);
  }, []);

  // Sync state with actual audio on mount (e.g. after AR exit)
  useEffect(() => {
    if (audioRef?.current) {
      setPlaying(!audioRef.current.paused);
    }
  }, [audioRef]);

  const toggle = () => {
    if (!audioRef?.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setPlaying(!playing);
  };

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, type: 'spring' }}
      className="fixed bottom-6 right-6 z-20"
    >
      <div className="relative flex items-center gap-3 bg-white/10 backdrop-blur-xl rounded-full px-4 py-2 pr-5
        shadow-lg"
        style={{
          border: '1px solid rgba(255,200,220,0.12)',
          boxShadow: '0 4px 30px rgba(255,100,160,0.08), 0 0 60px rgba(255,150,200,0.04)',
          cursor: 'pointer',
        }}
        onClick={toggle}
      >
        {/* Animated flower disc */}
        <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0"
          style={{
            animation: playing ? 'spin 3s linear infinite' : 'none',
            boxShadow: playing ? '0 0 15px rgba(255,100,160,0.3)' : 'none',
          }}
        >
          <div className="w-full h-full rounded-full"
            style={{
              background: 'linear-gradient(135deg, #ffd6e4, #ff99c4, #ffb3c9, #ffcce0)',
              backgroundSize: '300% 300%',
              animation: 'gradShift 4s ease infinite',
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <svg viewBox="0 0 16 16" className="w-4 h-4" style={{ opacity: 0.7 }}>
                <path d="M8 14S2 9.5 2 6a3.5 3.5 0 0 1 6-1.5A3.5 3.5 0 0 1 14 6c0 3.5-6 8-6 8z"
                  fill="rgba(255,255,255,0.6)" />
              </svg>
            </div>
          </div>
        </div>

        {/* Text + EQ bars */}
        <div className="flex flex-col">
          <span className="text-xs text-pink-200/70 font-serif leading-tight">MOM</span>
          <span className="text-[9px] text-pink-200/30 font-serif leading-tight">蜡笔小心</span>
        </div>

        {/* Equalizer bars */}
        <div className="flex items-end gap-[2px] h-4 ml-1">
          {[1,2,3,4].map(i => (
            <div key={i} className="w-[2px] rounded-full"
              style={{
                height: playing ? `${30 + Math.random() * 70}%` : '30%',
                background: 'linear-gradient(180deg, #ffcce0, #ff6ba8)',
                animation: playing ? `eqBounce 0.4s ease-in-out infinite ${i * 0.1}s alternate` : 'none',
                transition: 'height 0.1s',
              }}
            />
          ))}
        </div>

        {/* Status dot */}
        <div className={`w-1.5 h-1.5 rounded-full ${playing ? 'bg-pink-300' : 'bg-pink-300/30'}`}
          style={{
            boxShadow: playing ? '0 0 8px rgba(255,100,160,0.6)' : 'none',
            animation: playing ? 'statusPulse 1s ease-in-out infinite' : 'none'
          }}
        />
      </div>
    </motion.div>
  );
}
