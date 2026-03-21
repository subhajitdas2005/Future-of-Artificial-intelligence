"use client";

import Spline from '@splinetool/react-spline/next';
import { useRef, useState, useEffect } from 'react';
import './page.css';

export default function Home() {
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    if (focusMode) document.body.classList.add('focus-mode-active');
    else document.body.classList.remove('focus-mode-active');
  }, [focusMode]);

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (document.body.classList.contains('focus-mode-active')) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight * 0.55;
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        document.body.style.setProperty('--beam-angle', angle);
      }
    };
    document.addEventListener("mousemove", handleGlobalMouseMove);
    return () => document.removeEventListener("mousemove", handleGlobalMouseMove);
  }, []);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    containerRef.current.style.setProperty('--x', `${e.clientX - rect.left}px`);
    containerRef.current.style.setProperty('--y', `${e.clientY - rect.top}px`);
  };

  return (
    <main>
      <div className="spline-container">
        <Spline
          scene="https://prod.spline.design/ytNb29B-70AARpHr/scene.splinecode" 
          style={{ pointerEvents: 'none', transform: 'scale(1.25) translateX(-12%)' }}
        />
      </div>

      <div className="flashlight-beam"></div>

      <button className="focus-mode-btn" onClick={() => setFocusMode(!focusMode)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18h6"></path>
          <path d="M10 22h4"></path>
          <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>
        </svg>
        Focus Mode
      </button>

      <div className="ui-layer">
        <header className="minimal-header">
          <a href="#machine-learning">Machine Learning</a>
          <a href="#neural-networks">Neural Networks</a>
          <a href="#generative-ai">Generative AI</a>
          <a href="#ai-robotics">AI in Robotics</a>
          <a href="#future-of-ai">Future of AI</a>
        </header>

        <div 
          className={`hero-text-container interactive-text ${isHovered ? 'is-hovered' : ''}`}
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <h1 className="minimal-heading">Experience<br/>Intelligence</h1>
          <p className="minimal-subtext">Designed for the future<br/>Beyond code. Beyond logic.</p>
        </div>

        <div className="system-status">
          <div className="status-dot"></div>
          <div className="status-text">
            <span className="status-label">System State</span>
            <span className="status-value">Neural Engine Online</span>
            <div className="rotating-text-wrapper">
              <div className="rotating-text">
                <span>Analyzing data...</span>
                <span>Generating ideas...</span>
                <span>Building intelligence...</span>
                <span>Transforming the future...</span>
                <span>Analyzing data...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
