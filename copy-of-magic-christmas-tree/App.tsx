import React, { useState, useRef, useEffect } from 'react';
import { Scan, Sparkles, QrCode } from 'lucide-react';
import ChristmasCanvas from './components/ChristmasCanvas';
import Controls from './components/Controls';
import { AppState } from './types';

function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [showText, setShowText] = useState(false);
  const [showLandingQr, setShowLandingQr] = useState(false);
  
  // Audio Ref attached to the <audio> element
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleStart = () => {
    setAppState('animating');
    
    // DELAY ADDED: Wait 2.5 seconds before starting the text reveal
    setTimeout(() => {
        setShowText(true);
    }, 2500);
    
    if (audioRef.current) {
      // Set volume MAX and play
      audioRef.current.volume = 1.0;
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn("Audio playback prevented:", error);
        });
      }
    }
  };

  const handleTreeComplete = () => {
    setAppState('finished');
  };

  const handleReplay = () => {
    setShowText(false);
    setAppState('landing'); 
    
    // Stop and reset audio
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Merry Christmas',
        text: 'Gửi tặng bạn một món quà Giáng sinh ấm áp!',
        url: window.location.href,
      }).catch(console.error);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans select-none touch-none">
      
      {/* Hidden Audio Element with Multiple Sources for Reliability */}
      <audio ref={audioRef} loop preload="auto">
          {/* Primary Source: Archive.org */}
          <source src="https://ia800501.us.archive.org/23/items/jingle-bells-kevin-mac-leod/Jingle%20Bells%20%28Kevin%20MacLeod%29.mp3" type="audio/mpeg" />
          {/* Fallback Source: Wikimedia Commons */}
          <source src="https://upload.wikimedia.org/wikipedia/commons/e/e9/Jingle_Bells_%28Kevin_MacLeod%29_%28ISRC_USUAN1100187%29.mp3" type="audio/mpeg" />
          Your browser does not support the audio element.
      </audio>

      {/* Background - Updated with Gradient for Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a0b2e_0%,_#000000_100%)] pointer-events-none" />
      
      {/* Static star background */}
      <div className="absolute inset-0 opacity-50 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>

      {/* Main Canvas Animation */}
      {(appState === 'animating' || appState === 'finished') && (
        <ChristmasCanvas 
          isPlaying={appState === 'animating' || appState === 'finished'}
          onTreeComplete={handleTreeComplete}
          onAnimationStart={() => {}}
        />
      )}

      {/* UI Layer */}
      <Controls 
        appState={appState}
        showText={showText}
        onReplay={handleReplay}
        onShare={handleShare}
      />

      {/* Landing Screen */}
      {appState === 'landing' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-transparent">
          
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-pink-900/20 to-transparent pointer-events-none"></div>

          <div className="relative p-8 flex flex-col items-center max-w-sm w-full mx-4">
            
            <div className="w-64 h-64 relative mb-10 group cursor-pointer" onClick={handleStart}>
               <div className="absolute inset-0 bg-pink-500/20 blur-xl rounded-full animate-pulse"></div>
               
               <div className="absolute inset-0 border-2 border-pink-500/40 rounded-2xl animate-[spin_10s_linear_infinite]"></div>
               <div className="absolute inset-4 border border-purple-500/30 rounded-xl animate-[spin_15s_linear_infinite_reverse]"></div>

               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Scan size={48} className="text-pink-400 mx-auto mb-2 animate-bounce" />
                    <span className="text-pink-200 font-light tracking-widest text-sm uppercase">Tap to Open</span>
                  </div>
               </div>
            </div>

            <h2 className="text-4xl font-bold text-white mb-2 text-center" 
                style={{ fontFamily: '"Great Vibes", cursive', textShadow: '0 0 10px #ec4899' }}>
                Merry Christmas
            </h2>
            <p className="text-slate-400 text-center mb-8 font-light">
                Món quà dành riêng cho bạn.
            </p>

            <button 
              onClick={handleStart}
              className="w-full py-4 px-8 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-full transition-all flex items-center justify-center gap-3 group active:scale-95 shadow-lg shadow-pink-900/20"
            >
              <Sparkles className="group-hover:rotate-12 transition-transform" />
              Mở Quà
            </button>
            
            <button 
                onClick={() => setShowLandingQr(!showLandingQr)}
                className="mt-6 text-slate-600 hover:text-slate-400 flex items-center gap-2 text-xs uppercase tracking-wider"
            >
                <QrCode size={14} /> Quét mã để xem trên điện thoại
            </button>
            
            {showLandingQr && (
                <div className="mt-4 p-2 bg-white rounded-lg animate-fade-in">
                    <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                        alt="QR Code"
                        className="w-32 h-32"
                    />
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;