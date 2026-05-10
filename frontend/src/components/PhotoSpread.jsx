import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PHOTOS = [
  'pexels-nguyen-ngoc-tien-1321490019-32071930.jpg',
  'pexels-mark-chen-1620501959-30808588.jpg',
  'pexels-mysara-hassan-116278479-32914240.jpg',
  'pexels-vadim-koza-10955817.jpg',
  'pexels-change-c-c-974768353-32149258.jpg',
  'pexels-teresa-wang-2156262362-34236800.jpg',
];

export default function PhotoSpread({ visible }) {
  const [loaded, setLoaded] = useState({});
  const [enlarged, setEnlarged] = useState(null);

  useEffect(() => {
    if (enlarged == null) return;
    const handler = (e) => { if (e.key === 'Escape') setEnlarged(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enlarged]);

  const openEnlarge = useCallback((i, e) => { e.stopPropagation(); setEnlarged(i); }, []);
  const closeEnlarge = useCallback((e) => { if (e) e.stopPropagation(); setEnlarged(null); }, []);

  return (
    <div className="h-full w-full p-3 select-none flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #fff5f8 0%, #ffe0ec 50%, #fff5f8 100%)',
      }}
    >
      {/* Title */}
      <div className="text-center mb-2 flex-shrink-0">
        <span className="text-xs tracking-[0.3em] font-serif"
          style={{
            background: 'linear-gradient(90deg, #d4af37, #ff99c4, #d4af37)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          — 我对你的印象 —
        </span>
      </div>

      {/* Grid: 2 cols × 3 rows, compact tiles */}
      <div className="flex-1 flex items-start justify-center pt-1">
        <div className="grid grid-cols-2 gap-2 w-[78%] max-w-[260px]">
          {PHOTOS.map((file, i) => (
            <div key={i}
              className="cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
              style={{
                opacity: visible && loaded[i] ? 1 : 0,
                transition: `opacity 0.5s ease-out ${0.15 + i * 0.1}s, transform 0.3s ease`,
                transform: i % 2 === 0 ? 'rotate(-0.5deg)' : 'rotate(0.5deg)',
              }}
              onClick={(e) => openEnlarge(i, e)}
            >
              <div className="rounded-lg shadow-sm overflow-hidden"
                style={{
                  padding: '2px',
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(255,150,200,0.1), rgba(212,175,55,0.2))',
                }}
              >
                <div className="rounded-md overflow-hidden" style={{ background: '#fef8f5', aspectRatio: '1' }}>
                  <img
                    src={`/photos/${file}`}
                    alt={`photo ${i + 1}`}
                    className="w-full h-full object-contain"
                    draggable={false}
                    onLoad={() => setLoaded(prev => ({ ...prev, [i]: true }))}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enlarged modal */}
      <AnimatePresence>
        {enlarged != null && (
          <motion.div key="enlarged" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={closeEnlarge}
          >
            <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }}
              className="relative max-w-[88vw] max-h-[88vh] rounded-2xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur cursor-pointer"
              style={{ padding: '6px' }}
              onClick={closeEnlarge}
            >
              <img src={`/photos/${PHOTOS[enlarged]}`} alt="enlarged"
                className="w-auto h-auto max-w-full max-h-[82vh] object-contain rounded-xl" />
              {/* Bottom close button */}
              <button
                className="absolute bottom-4 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full text-xs font-serif tracking-wider text-white
                  bg-gradient-to-r from-pink-400/80 to-pink-300/80 backdrop-blur-sm shadow-lg
                  hover:from-pink-400 hover:to-pink-300 active:scale-95 transition-all"
                onClick={closeEnlarge}
              >关闭</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
