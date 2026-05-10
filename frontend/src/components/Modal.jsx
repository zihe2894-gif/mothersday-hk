import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Modal({ show, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, singleButton }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-[85vw] w-[340px] p-6"
            style={{ border: '1px solid rgba(255,150,200,0.15)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <h3 className="text-center font-serif text-lg text-pink-700 mb-3">{title}</h3>
            )}
            <p className="text-center text-sm text-pink-600/70 font-serif leading-relaxed mb-5">
              {message}
            </p>
            <div className="flex justify-center gap-3">
              {singleButton ? (
                <button onClick={onCancel}
                  className="px-6 py-2 rounded-full text-sm font-serif text-white bg-gradient-to-r from-pink-400 to-pink-300
                    hover:from-pink-500 hover:to-pink-400 transition-all shadow-md"
                >我知道了</button>
              ) : (
                <>
                  <button onClick={onCancel}
                    className="px-5 py-2 rounded-full text-sm font-serif text-pink-400/70 bg-pink-50
                      hover:bg-pink-100 transition-all border border-pink-200/30"
                  >{cancelLabel || '再想想'}</button>
                  <button onClick={onConfirm}
                    className="px-5 py-2 rounded-full text-sm font-serif text-white bg-gradient-to-r from-pink-400 to-pink-300
                      hover:from-pink-500 hover:to-pink-400 transition-all shadow-md"
                  >{confirmLabel || '确认进入'}</button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
