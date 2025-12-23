import React, { useState } from 'react';
import { RotateCcw, Share2, QrCode, X } from 'lucide-react';
import { AppState } from '../types';

interface ControlsProps {
  appState: AppState;
  showText: boolean;
  onReplay: () => void;
  onShare: () => void;
}

const Controls: React.FC<ControlsProps> = ({ appState, showText, onReplay, onShare }) => {
  if (appState === 'landing') return null;

  return (
    <>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        
        {/* Text Overlay - Centered and Floating over the tree */}
        <div 
            className={`absolute top-1/3 left-0 right-0 flex flex-col items-center justify-center z-10 transition-all duration-[5000ms] ease-out ${
                showText 
                ? 'opacity-100 blur-0 scale-100 translate-y-0' 
                : 'opacity-0 blur-2xl scale-95 translate-y-8'
            }`}
        >
          <div className="relative">
              {/* Glow behind text for readability */}
              <div className="absolute inset-0 bg-pink-900/30 blur-2xl rounded-full"></div>
              
              <h1 className="relative text-5xl md:text-7xl font-bold text-white mb-2 text-center" 
                  style={{ 
                    fontFamily: '"Great Vibes", cursive',
                    textShadow: '0 0 10px #fff, 0 0 20px #ff00ff, 0 0 40px #ff00ff'
                  }}>
                Merry<br/>Christmas
              </h1>
          </div>
          
          <p className="mt-4 text-lg md:text-2xl text-pink-100 font-bold text-center px-4 max-w-xs md:max-w-md leading-relaxed" 
             style={{ 
                 fontFamily: '"Dancing Script", cursive', 
                 textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(236, 72, 153, 0.5)' 
             }}>
            CHÚC CẬU GIÁNG SINH ẤM ÁP VÀ VUI VẺ
          </p>
        </div>
      </div>
    </>
  );
};

export default Controls;