import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CardFront from './CardFront.jsx';
import PhotoSpread from './PhotoSpread.jsx';
import BlessingsPage from './BlessingsPage.jsx';

const pageVariants = {
  enter: { opacity: 0, scale: 0.96 },
  center: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.04 },
};

const slideVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

export default function GreetingCard({ onOpen, onStartAR, arSupported, audioRef }) {
  const [page, setPage] = useState(0);

  const goNext = useCallback(() => {
    if (page === 0) { setPage(1); onOpen(); }
    else if (page === 1) setPage(2);
  }, [page, onOpen]);

  const goPrev = useCallback(() => {
    if (page === 1) setPage(0);
    else if (page === 2) setPage(1);
  }, [page]);

  const handleClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) { if (page > 0) goPrev(); }
    else { if (page < 2) goNext(); }
  }, [page, goNext, goPrev]);

  return (
    <div className="card-perspective w-full max-w-[420px] aspect-[5/7] max-h-[700px] select-none"
      onClick={handleClick}
      style={{
        background: 'linear-gradient(180deg, #fff5f8 0%, #ffe0ec 50%, #fff5f8 100%)',
        padding: '3px',
        borderRadius: '1.3rem',
        boxShadow: '0 0 60px rgba(255,100,160,0.06), 0 0 120px rgba(255,50,130,0.03)',
      }}
    >
      {/* Gold corners + edges */}
      <div className="gold-corner tl" /><div className="gold-corner tr" />
      <div className="gold-corner bl" /><div className="gold-corner br" />
      <div className="gold-edge top" /><div className="gold-edge bottom" />
      <div className="gold-edge left" /><div className="gold-edge right" />

      {/* Nav arrows */}
      {page > 0 && (
        <motion.div className="nav-arrow" style={{ left: '4px' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >‹</motion.div>
      )}
      {page < 2 && (
        <motion.div className="nav-arrow" style={{ right: '4px' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >›</motion.div>
      )}

      <div className="relative w-full h-full rounded-xl overflow-hidden" style={{ transformStyle: 'preserve-3d' }}>
        {/* Page dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-2.5 pointer-events-none">
          {[0, 1, 2].map(i => (
            <div key={i}
              className="rounded-full transition-all duration-500"
              style={{
                width: page === i ? '18px' : '6px',
                height: '6px',
                background: page === i
                  ? 'linear-gradient(90deg, rgba(212,175,55,0.6), rgba(212,175,55,0.3))'
                  : 'rgba(255,150,200,0.2)',
              }}
            />
          ))}
        </div>

        {/* Page transitions - single AnimatePresence for all pages */}
        <AnimatePresence mode="wait">
          {page === 0 && (
            <motion.div key="cover" variants={pageVariants} initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.35 }} className="absolute inset-0"
            >
              <CardFront />
            </motion.div>
          )}
          {page === 1 && (
            <motion.div key="photos" variants={slideVariants} initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.3 }} className="absolute inset-0"
            >
              <PhotoSpread visible />
            </motion.div>
          )}
          {page === 2 && (
            <motion.div key="blessings" variants={slideVariants} initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.3 }} className="absolute inset-0"
            >
              <BlessingsPage visible={page === 2} audioRef={audioRef} onEnterAR={onStartAR} arSupported={arSupported} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
