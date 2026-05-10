import React, { useState, useRef, useEffect } from 'react';
import ArPage from './pages/ArPage.jsx';
import GreetingCard from './components/GreetingCard.jsx';
import BackgroundHearts from './components/BackgroundHearts.jsx';
import Petals from './components/Petals.jsx';
import MusicPlayer from './components/MusicPlayer.jsx';
import ShareButton from './components/ShareButton.jsx';
import { COS_BASE } from './lib/assets.js';

export default function App() {
  const [mode, setMode] = useState('entry'); // entry | card | ar
  const audioRef = useRef(null);
  const [arSupported, setArSupported] = useState(false);
  const [musicStarted, setMusicStarted] = useState(false);

  // 检测 AR 支持
  useEffect(() => {
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-ar').then(setArSupported).catch(() => {});
    }
  }, []);

  // 三个模式的公共背景图
  const bgImg = `url(${COS_BASE}/pexels-trung-nguyen-2147535019-35667488.jpg)`;

  // 渲染当前模式的内容
  let view;
  if (mode === 'ar') {
    view = (
      <div className="fixed inset-0 z-50">
        <ArPage onExit={() => setMode('card')} />
      </div>
    );
  } else if (mode === 'card') {
    view = (
      <div className="fixed inset-0 z-10" style={{ background: '#1a0510' }}>
        <div className="fixed inset-0 z-0"
          style={{ backgroundImage: bgImg, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }}
        />
        <BackgroundHearts />
        <Petals />
        <div className="fixed inset-0 flex items-center justify-center z-10 p-4"
          style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(255,100,150,0.08) 0%, transparent 60%)' }}
        >
          <GreetingCard
            onOpen={() => {
              if (!musicStarted) {
                setMusicStarted(true);
                audioRef.current?.play().catch(() => {});
              }
            }}
            onStartAR={() => setMode('ar')}
            arSupported={arSupported}
            audioRef={audioRef}
          />
        </div>
        <ShareButton />
        <button
          onClick={() => { setMode('entry'); }}
          style={{
            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            zIndex: 20,
            background: 'rgba(255,255,255,0.08)', border: 'none',
            color: 'rgba(255,255,255,0.3)', padding: '6px 20px', borderRadius: 999,
            fontSize: 12, cursor: 'pointer', fontFamily: '"Noto Serif SC", serif',
            backdropFilter: 'blur(4px)',
          }}
        >← 返回首页</button>
      </div>
    );
  } else {
    view = (
      <div className="relative w-screen h-screen overflow-hidden">
        <div className="fixed inset-0 z-0"
          style={{ backgroundImage: bgImg, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.12 }}
        />
        <div className="fixed inset-0 flex flex-col items-center justify-center z-10 p-6"
          style={{ background: 'linear-gradient(180deg, #1a0510 0%, #2a0a1a 40%, #1a0510 100%)' }}>
          <div style={{
            position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
            background: `
              radial-gradient(ellipse 60% 40% at 50% 25%, rgba(255,50,80,0.12) 0%, transparent 60%),
              radial-gradient(ellipse 40% 30% at 70% 70%, rgba(255,100,150,0.08) 0%, transparent 50%)
            `,
          }} />
          <div className="relative z-10 flex flex-col items-center">
            <h1 className="font-serif text-4xl shimmer-text mb-3" style={{ fontSize: 42 }}>
              母亲节快乐
            </h1>
            <p className="text-pink-300/50 text-sm font-serif mb-2 tracking-wider">送给最爱的妈妈</p>
            <div className="gold-line w-48 my-6" />
            <p className="text-pink-400/40 text-xs font-serif mb-8 text-center leading-relaxed">
              点击打开贺卡<br />看完后在最后一页进入 AR 空间
            </p>
            <button onClick={() => setMode('card')}
              style={{
                padding: '16px 52px', fontSize: '20px', borderRadius: '999px',
                background: 'linear-gradient(135deg, #ff4466, #ff6ba8)',
                color: 'white', border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 30px rgba(255,50,80,0.4)',
                fontFamily: '"Noto Serif SC", serif', touchAction: 'manipulation', letterSpacing: '2px',
              }}
              onMouseEnter={e => { e.target.style.transform = 'scale(1.05)'; e.target.style.boxShadow = '0 6px 40px rgba(255,50,80,0.6)'; }}
              onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 4px 30px rgba(255,50,80,0.4)'; }}
            >打开贺卡 ✦</button>
            <p className="text-pink-400/20 text-[10px] font-serif mt-6">AR 功能需 Android Chrome / iOS Safari 15+</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {view}
      {/* audio 始终挂载，模式切换时永不销毁，音乐连续播放 */}
      <audio ref={audioRef} src={`${COS_BASE}/background.mp3`} loop preload="auto" />
      <MusicPlayer audioRef={audioRef} />
    </>
  );
}
