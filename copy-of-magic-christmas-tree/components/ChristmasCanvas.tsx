import React, { useRef, useEffect, useState } from 'react';
import { Particle, SnowFlake } from '../types';

interface ChristmasCanvasProps {
  onTreeComplete: () => void;
  onAnimationStart: () => void;
  isPlaying: boolean;
}

// Simple internal type for Shooting Star
interface ShootingStar {
  x: number;
  y: number;
  len: number;
  speed: number;
  active: boolean;
}

const ChristmasCanvas: React.FC<ChristmasCanvasProps> = ({ onTreeComplete, onAnimationStart, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Data Refs
  const particlesRef = useRef<Particle[]>([]);
  const snowRef = useRef<SnowFlake[]>([]);
  const groundSnowRef = useRef<SnowFlake[]>([]); 
  const starRef = useRef<{ alpha: number }>({ alpha: 0 });
  const shootingStarRef = useRef<ShootingStar>({ x: 0, y: 0, len: 0, speed: 0, active: false });
  
  // Animation State Refs
  const timeRef = useRef<number>(0);
  const drawIndexRef = useRef<number>(0); 
  const treeCompletedRef = useRef<boolean>(false);
  
  // Rotation Control Refs
  const autoRotationRef = useRef<number>(0);
  const dragRotationRef = useRef<number>(0); 
  const isDraggingRef = useRef<boolean>(false);
  const lastMouseXRef = useRef<number>(0);

  // Constants - RE-OPTIMIZED FOR QUALITY & ATMOSPHERE
  const TREE_TURNS = 16; 
  // Significantly increased density for a "fuller" look
  const POINTS_PER_TURN = 550; 
  const TOTAL_POINTS = TREE_TURNS * POINTS_PER_TURN; 
  
  // Custom Speed Request
  const DRAW_SPEED = 13; 
  const AUTO_ROTATION_SPEED = 0.002; 
  const DRAG_SENSITIVITY = 0.003; 

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Interaction Handlers (Mouse & Touch) ---
  const handleStart = (clientX: number) => {
    isDraggingRef.current = true;
    lastMouseXRef.current = clientX;
  };

  const handleMove = (clientX: number) => {
    if (!isDraggingRef.current) return;
    const deltaX = clientX - lastMouseXRef.current;
    dragRotationRef.current += deltaX * DRAG_SENSITIVITY;
    lastMouseXRef.current = clientX;
  };

  const handleEnd = () => {
    isDraggingRef.current = false;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMouseDown = (e: MouseEvent) => handleStart(e.clientX);
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onMouseUp = () => handleEnd();
    
    const onTouchStart = (e: TouchEvent) => handleStart(e.touches[0].clientX);
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const onTouchEnd = () => handleEnd();

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);


  const initParticles = (width: number, height: number) => {
    const particles: Particle[] = [];
    const isMobile = width < 800;

    // Taller tree to fill screen
    const treeHeight = height * (isMobile ? 0.85 : 0.8); 
    
    // Wider base
    const maxTreeRadius = isMobile 
        ? width * 0.45 
        : Math.min(width, height) * 0.3;

    for (let i = 0; i < TOTAL_POINTS; i++) {
      const progress = i / TOTAL_POINTS;
      
      const angle = progress * TREE_TURNS * Math.PI * 2;
      
      const yBase = (height * 0.9) - (progress * treeHeight);
      const radiusBase = maxTreeRadius * (1 - progress);

      // FILL LOGIC: Distribute points inside the tree volume, not just on the edge
      // Randomly pull some points closer to the center (trunk)
      const isInnerPoint = Math.random() > 0.7; // 30% of points fill the inside
      const radiusMultiplier = isInnerPoint ? Math.random() * 0.8 : 1.0;

      const spreadFactor = radiusBase * 0.15; // Tighter spread for sharper lines
      
      const randomRadiusOffset = (Math.random() - 0.5) * spreadFactor;
      const randomYOffset = (Math.random() - 0.5) * spreadFactor * 0.5; 
      const randomAngleOffset = (Math.random() - 0.5) * 0.3; 

      const finalRadius = Math.max(0, (radiusBase * radiusMultiplier) + randomRadiusOffset);
      const finalY = yBase + randomYOffset;
      const finalAngle = angle + randomAngleOffset;

      // COLORS: FESTIVE PALETTE
      const rand = Math.random();
      let hue, saturation, lightness, alpha;

      if (rand > 0.95) {
          // Gold ornaments
          hue = 50; saturation = 100; lightness = 60; alpha = 1;
      } else if (rand > 0.6) {
          // Hot Pink / Magenta (User Preference)
          hue = 330 + Math.random() * 20; 
          saturation = 100; lightness = 70; alpha = 0.8;
      } else {
          // Deep Pink / Purple / Green mix for depth
          hue = Math.random() > 0.5 ? 320 : 150; // Mix of Pink and Green for Xmas vibe
          saturation = 80; lightness = 50; alpha = 0.5;
      }
      
      particles.push({
        x: 0,
        y: finalY,
        z: 0,
        // Smaller, sharper particles for "glitter" effect
        radius: Math.random() * (isMobile ? 3.0 : 2.5) + 0.5, 
        color: `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`,
        alpha: alpha,
        targetY: finalY,
        targetRadius: finalRadius,
        angle: finalAngle,
        speed: 0,
        originalY: finalY,
        state: 'settled'
      });
    }
    particlesRef.current = particles;
    treeCompletedRef.current = false;
    drawIndexRef.current = 0;
    starRef.current = { alpha: 0 };
    autoRotationRef.current = 0;
    dragRotationRef.current = 0;
    
    // --- GROUND SNOW ---
    const groundSnow: SnowFlake[] = [];
    const groundSnowCount = isMobile ? 600 : 800; 
    const moundCenter = width / 2;
    
    for (let i = 0; i < groundSnowCount; i++) {
        const isMound = Math.random() > 0.3; 
        let x, y;
        if (isMound) {
            const spread = Math.min(width, height) * 0.5; 
            const r = (Math.random() + Math.random() + Math.random() - 1.5); 
            x = moundCenter + r * spread;
            const distFromCenter = Math.abs(x - moundCenter);
            const normalizedDist = 1 - Math.min(distFromCenter / (spread * 0.8), 1);
            const pileHeight = height * 0.15 * Math.pow(normalizedDist, 1.5); 
            y = (height * 0.95) - (Math.random() * pileHeight);
        } else {
            x = Math.random() * width;
            y = height * 0.92 + Math.random() * (height * 0.08);
        }
        groundSnow.push({
            x: x,
            y: Math.min(y, height - 2),
            radius: Math.random() * 2.0 + 1.0,
            speed: 0,
            wind: 0,
            alpha: Math.random() * 0.7 + 0.3
        });
    }
    groundSnowRef.current = groundSnow;

    // --- FALLING SNOW (HEAVIER) ---
    const snow: SnowFlake[] = [];
    const snowCount = isMobile ? 400 : 800; // Increased significantly
    for(let i = 0; i < snowCount; i++) {
        snow.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2.5 + 1.5, 
            speed: Math.random() * 2.0 + 1.0, // Faster snow
            wind: Math.random() * 1 - 0.5,
            alpha: Math.random() * 0.5 + 0.3
        });
    }
    snowRef.current = snow;
  };

  useEffect(() => {
    if (!canvasRef.current || !isPlaying) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false }); 
    if (!ctx) return;

    // --- HIGH DPI (RETINA) FIX ---
    const dpr = window.devicePixelRatio || 1;
    // Set internal dimensions to match screen density
    canvas.width = windowSize.width * dpr;
    canvas.height = windowSize.height * dpr;
    // Scale all drawing operations by dpr
    ctx.scale(dpr, dpr);
    // -----------------------------

    // Init particles using CSS logic (windowSize)
    initParticles(windowSize.width, windowSize.height);
    onAnimationStart();

    const cx = windowSize.width / 2; // Logic Center

    const animate = () => {
      if (!ctx) return;
      
      // Clear with slight transparency for potential trails (optional, currently solid for performance)
      ctx.fillStyle = '#000000'; // Handled by CSS background mainly, but this clears canvas
      ctx.clearRect(0, 0, windowSize.width, windowSize.height); // Use clearRect for transparent BG if needed

      timeRef.current += 1;
      
      if (!isDraggingRef.current) {
          autoRotationRef.current += AUTO_ROTATION_SPEED;
      }
      const totalRotation = autoRotationRef.current + dragRotationRef.current;

      if (drawIndexRef.current < particlesRef.current.length) {
          drawIndexRef.current += DRAW_SPEED;
      } else if (!treeCompletedRef.current) {
          treeCompletedRef.current = true;
          onTreeComplete();
      }

      // --- Shooting Star ---
      if (!shootingStarRef.current.active) {
         if (Math.random() < 0.02) { // More frequent shooting stars
             shootingStarRef.current = {
                 x: Math.random() * windowSize.width,
                 y: Math.random() * (windowSize.height * 0.4), 
                 len: Math.random() * 100 + 50,
                 speed: Math.random() * 15 + 10,
                 active: true
             };
         }
      } else {
          const s = shootingStarRef.current;
          s.x -= s.speed;
          s.y += s.speed * 0.4;
          
          ctx.globalCompositeOperation = 'lighter';
          ctx.beginPath();
          const gradient = ctx.createLinearGradient(s.x, s.y, s.x + s.len, s.y - s.len * 0.4);
          gradient.addColorStop(0, "rgba(255,255,200,1)");
          gradient.addColorStop(1, "rgba(255,255,255,0)");
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x + s.len, s.y - s.len * 0.4);
          ctx.stroke();
          ctx.globalCompositeOperation = 'source-over';

          if (s.x < -s.len || s.y > windowSize.height) {
              s.active = false;
          }
      }

      // Draw Tree
      ctx.globalCompositeOperation = 'lighter';

      const totalToDraw = Math.min(Math.floor(drawIndexRef.current), particlesRef.current.length);
      const isDrawing = !treeCompletedRef.current;

      for (let i = 0; i < totalToDraw; i++) {
        const p = particlesRef.current[i];
        
        const currentAngle = p.angle + totalRotation;
        const cos = Math.cos(currentAngle);
        const sin = Math.sin(currentAngle);
        
        const x3d = p.targetRadius * cos;
        const z3d = p.targetRadius * sin;
        
        const fov = 400;
        const scale = fov / (fov - z3d); 
        
        const x2d = cx + x3d * scale;
        
        if (scale < 0 || x2d < -50 || x2d > windowSize.width + 50) continue;

        const twinkle = Math.sin(timeRef.current * 0.05 + p.angle * 5) * Math.cos(timeRef.current * 0.1 + i);
        const alphaMod = 0.6 + 0.4 * twinkle;

        ctx.beginPath();
        const drawRadius = p.radius * scale * (0.9 + 0.2 * twinkle); 
        ctx.arc(x2d, p.y, drawRadius, 0, Math.PI * 2);
        
        ctx.fillStyle = p.color;
        
        if (isDrawing && i > totalToDraw - 40) {
           ctx.fillStyle = '#FFFFFF';
           ctx.globalAlpha = 1;
           ctx.shadowColor = '#FFFFFF';
           ctx.shadowBlur = 10;
        } else {
           ctx.globalAlpha = p.alpha * alphaMod; 
           ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0; 

      // Star
      if (treeCompletedRef.current) {
         if (starRef.current.alpha < 1) starRef.current.alpha += 0.02;
         
         const treeTopY = particlesRef.current[particlesRef.current.length - 1].y;
         
         ctx.save();
         ctx.translate(cx, treeTopY - 20); 
         ctx.rotate(timeRef.current * 0.015);
         ctx.globalAlpha = starRef.current.alpha;
         ctx.globalCompositeOperation = 'lighter';
         
         ctx.fillStyle = "#FFD700"; 
         ctx.shadowColor = "#FFD700"; 
         ctx.shadowBlur = 30; 
         
         ctx.beginPath();
         const size = 35;
         ctx.moveTo(0, -size);
         ctx.quadraticCurveTo(3, -3, size, 0);
         ctx.quadraticCurveTo(3, 3, 0, size);
         ctx.quadraticCurveTo(-3, 3, -size, 0);
         ctx.quadraticCurveTo(-3, -3, 0, -size);
         ctx.fill();
         
         ctx.fillStyle = "#FFFFFF";
         ctx.beginPath();
         ctx.arc(0,0, 12, 0, Math.PI*2);
         ctx.fill();

         ctx.restore();
         ctx.shadowBlur = 0;
         ctx.globalCompositeOperation = 'source-over';
      }

      // Ground Snow
      for (let i = 0; i < groundSnowRef.current.length; i++) {
          const flake = groundSnowRef.current[i];
          const gradient = ctx.createRadialGradient(flake.x, flake.y, 0, flake.x, flake.y, flake.radius);
          gradient.addColorStop(0, `rgba(255, 255, 255, ${flake.alpha})`);
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
          ctx.fill();
      }

      // Falling Snow
      for(let i = 0; i < snowRef.current.length; i++) {
          const flake = snowRef.current[i];
          flake.y += flake.speed;
          flake.x += Math.sin(timeRef.current * 0.01 + i) * 0.5 + flake.wind;
          
          if (flake.y > windowSize.height) {
              flake.y = -10;
              flake.x = Math.random() * windowSize.width;
          }
          if (flake.x > windowSize.width) flake.x = 0;
          if (flake.x < 0) flake.x = windowSize.width;

          const gradient = ctx.createRadialGradient(flake.x, flake.y, 0, flake.x, flake.y, flake.radius * 2);
          gradient.addColorStop(0, `rgba(255, 255, 255, ${flake.alpha})`);
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
          ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [windowSize, isPlaying, onTreeComplete, onAnimationStart]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full cursor-move touch-none"
      style={{ touchAction: 'none' }}
    />
  );
};

export default ChristmasCanvas;