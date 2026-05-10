import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button.jsx';
import toast, { Toaster } from 'react-hot-toast';

const SHARE_TEXT = '🎉 母亲节快乐！来看看我为妈妈准备的惊喜～';

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: '母亲节快乐', text: SHARE_TEXT, url });
        return;
      } catch {}
    }

    // Fallback: copy link
    try {
      await navigator.clipboard.writeText(url);
      toast.success('链接已复制！快去分享给朋友吧 💗', {
        style: {
          borderRadius: '24px',
          background: 'rgba(0,0,0,0.8)',
          color: '#fff',
          fontSize: '14px',
          fontFamily: '"Noto Serif SC", serif'
        },
        duration: 2500
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Final fallback
      prompt('复制这个链接分享给朋友：', url);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.7, type: 'spring' }}
        className="fixed bottom-6 right-20 z-20"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="bg-white/80 backdrop-blur rounded-full shadow-lg border border-pink-200 hover:bg-white gap-2"
        >
          📤 分享
        </Button>
      </motion.div>
    </>
  );
}
