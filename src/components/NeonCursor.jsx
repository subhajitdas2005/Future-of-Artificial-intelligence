// @ts-nocheck
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, useAnimation, useSpring, useMotionValue } from 'framer-motion';
import './NeonCursor.css';

/**
 * NeonCursor component
 * Provides a highly aesthetic, interactive neon cursor trail with smoothed spring physics.
 */
const NeonCursor = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for the trailing elements
  const trailX = useSpring(mouseX, { damping: 30, stiffness: 200, mass: 0.8 });
  const trailY = useSpring(mouseY, { damping: 30, stiffness: 200, mass: 0.8 });
  
  const glowX = useSpring(mouseX, { damping: 40, stiffness: 150, mass: 1 });
  const glowY = useSpring(mouseY, { damping: 40, stiffness: 150, mass: 1 });

  const [isClicking, setIsClicking] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  const trailControls = useAnimation();
  const glowControls = useAnimation();

  const handleMouseMove = useCallback((e) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  }, [mouseX, mouseY]);

  const handleMouseDown = () => setIsClicking(true);
  const handleMouseUp = () => setIsClicking(false);

  const handleMouseOver = useCallback(
    (e) => {
      const target = e.target;
      if (target.matches('a, button, input, [data-hover="true"], [role="button"]')) {
        setIsHovering(true);
        void trailControls.start({
          scale: 1.5,
          borderColor: '#b026ff', // Purple theme accent
          borderWidth: '3px',
        });
        void glowControls.start({
          scale: 1.8,
          opacity: 0.8,
        });
      }
    },
    [trailControls, glowControls]
  );

  const handleMouseOut = useCallback(() => {
    setIsHovering(false);
    void trailControls.start({
      scale: 1,
      borderColor: '#00f3ff', // Cyan theme accent
      borderWidth: '2px',
    });
    void glowControls.start({
      scale: 1,
      opacity: 0.4,
    });
  }, [trailControls, glowControls]);

  useEffect(() => {
    // Initial state setup for colors
    void trailControls.set({ borderColor: '#00f3ff' });
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
    };
  }, [handleMouseMove, handleMouseOver, handleMouseOut]);

  return (
    <div className='neon-cursor-container'>
      {/* Outer glow */}
      <motion.div
        className='cursor-glow'
        animate={glowControls}
        style={{
          x: glowX,
          y: glowY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        initial={{ opacity: 0.4, scale: 1 }}
      />

      {/* Trailing circle */}
      <motion.div
        className='cursor-trail'
        animate={trailControls}
        style={{
          x: trailX,
          y: trailY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        initial={{ scale: 1, borderColor: '#00f3ff', borderWidth: '2px' }}
      />

      {/* Main cursor dot */}
      <motion.div
        className='cursor-main'
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isClicking ? 0.8 : isHovering ? 1.2 : 1,
        }}
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 400,
          mass: 0.5,
        }}
      />
    </div>
  );
};

export default NeonCursor;
