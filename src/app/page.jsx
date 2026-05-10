"use client";

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './page.css';
import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== "undefined") {
  gsap.registerPlugin(MotionPathPlugin, ScrollTrigger, ScrollToPlugin);
  
  // Performance-optimized global GSAP configuration
  gsap.config({ 
    force3D: true, 
    nullTargetWarn: false,
    units: { left: "px", top: "px", width: "px", height: "px" }
  });
  
  // Batch all writes to prevent layout thrashing
  gsap.defaults({ 
    lazy: true,
    overwrite: "auto"
  });
}

const ORBIT_RATIO = 0.44;
const planetsData = [
  { id: 'text', name: 'Text', rx: 200, ry: 200 * ORBIT_RATIO, dur: 12, color: '#00f3ff', angle: -8 },
  { id: 'image', name: 'Image', rx: 280, ry: 280 * ORBIT_RATIO, dur: 16, color: '#b56cff', angle: -8 },
  { id: 'audio', name: 'Audio', rx: 360, ry: 360 * ORBIT_RATIO, dur: 20, color: '#ff006e', angle: -8 },
  { id: 'video', name: 'Video', rx: 440, ry: 440 * ORBIT_RATIO, dur: 24, color: '#00ffcc', angle: -8 },
  { id: 'code', name: 'Code', rx: 520, ry: 520 * ORBIT_RATIO, dur: 28, color: '#4d9fff', angle: -8 }
];

function Typewriter({ text, speed = 30, delay = 0 }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setIsFinished(false);

    let timeout;
    const startTyping = () => {
      let i = 0;
      const type = () => {
        if (i < text.length) {
          setDisplayedText(text.substring(0, i + 1));
          i++;
          timeout = setTimeout(type, speed);
        } else {
          setIsFinished(true);
        }
      };
      type();
    };


    const initialDelay = setTimeout(startTyping, delay);
    return () => {
      clearTimeout(initialDelay);
      clearTimeout(timeout);
    };
  }, [text, speed, delay]);

  return (
    <span className="typewriter-container">
      {displayedText}
      {!isFinished && <span className="typewriter-cursor">|</span>}
    </span>
  );
}

function VoiceGenerator({ text, color }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const barsRef = useRef(null);
  const requestRef = useRef();
  const lastFrameTime = useRef(0);
  const barCount = 40;

  const animate = (time) => {
    // Throttle for visual variance while keeping rendering load minimal
    if (time - lastFrameTime.current < 66) {
      requestRef.current = requestAnimationFrame(animate);
      return;
    }
    lastFrameTime.current = time;

    if (barsRef.current) {
      const bars = Array.from(barsRef.current.children);
      // Create a cache of setters for each bar to avoid repeated lookups
      if (!barsRef.current._setters) {
        barsRef.current._setters = bars.map(bar => ({
          scaleY: gsap.quickSetter(bar, "scaleY"),
          opacity: gsap.quickSetter(bar, "opacity")
        }));
      }

      for (let i = 0; i < bars.length; i++) {
        const h = 0.5 + Math.random() * 2;
        const setters = barsRef.current._setters[i];
        setters.scaleY(h);
        setters.opacity(0.4 + (h * 0.3));
      }
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isSpeaking) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(requestRef.current);
      // Reset bars
      if (barsRef.current) {
        const bars = barsRef.current.children;
        for (let i = 0; i < bars.length; i++) {
          bars[i].style.transform = 'scaleY(1)';
          bars[i].style.opacity = '0.2';
        }
      }
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isSpeaking]);

  const speak = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.pitch = 0.5;
    utterance.rate = 0.85;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const timer = setTimeout(speak, 800);
    return () => {
      window.speechSynthesis.cancel();
      clearTimeout(timer);
    };
  }, [text]);

  return (
    <>
      <div className="voice-generator-container full-area">
        <div className={`waveform-visualizer ${isSpeaking ? 'is-speaking' : ''}`} style={{ '--wave-color': color }} ref={barsRef}>
          {Array.from({ length: barCount }).map((_, i) => (
            <div
              key={i}
              className="wave-line"
              style={{
                '--idx': i,
                transform: 'scaleY(1)',
                opacity: 0.2
              }}
            ></div>
          ))}
        </div>
      </div>
      <button className="voice-action-btn outside-btn" onClick={speak} style={{ '--btn-color': color }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
        Replay Audio Synthesis
      </button>
    </>
  );
}

function VisualGenerator({ text, color, fontSize = "5rem" }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="visual-generator-container">
      <div className="visual-canvas">
        <div className="noise-overlay" style={{ opacity: 1 - progress / 100 }}></div>
        <div className="resolved-content" style={{ opacity: progress / 100, color: color, fontSize: fontSize }}>
          {text}
        </div>
        <div className="scan-line"></div>
      </div>
      <div className="gen-progress-bar">
        <div className="gen-progress-fill" style={{ width: `${progress}%`, background: color }}></div>
      </div>
      <div className="gen-stats">
        <span>SAMPLING: {progress}%</span>
        <span>LATENT SPACE: RESOLVING</span>
      </div>
    </div>
  );
}

function VideoGenerator({ color }) {
  const [progress, setProgress] = useState(0);
  const [isResolved, setIsResolved] = useState(false);
  const [activeFrame, setActiveFrame] = useState(0);
  const totalFrames = 24;

  useEffect(() => {
    let interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsResolved(true);
          return 100;
        }
        return prev + 1;
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isResolved) {
      let frameInterval = setInterval(() => {
        setActiveFrame(prev => (prev + 1) % totalFrames);
      }, 50);
      return () => clearInterval(frameInterval);
    } else {
      let frameInterval = setInterval(() => {
        setActiveFrame(prev => (prev + 1) % totalFrames);
      }, 100);
      return () => clearInterval(frameInterval);
    }
  }, [isResolved, totalFrames]);

  const progressRatio = activeFrame / (totalFrames - 1 || 1);
  // Starts off-screen left (-350px) and moves to off-screen right (+350px)
  const xPos = -350 + (progressRatio * 700);
  // Bounces 4 times across the screen
  const yPos = -Math.abs(Math.sin(progressRatio * Math.PI * 4)) * 60;

  return (
    <div className="video-generator-container">
      <div className="video-main-screen" style={{ '--theme-color': color }}>
        <div className="video-overlay" style={{ opacity: isResolved ? 0 : 0.8 }}></div>
        <div className="video-content" style={{ opacity: isResolved ? 1 : 0.3 }}>
          <motion.div 
            className="animated-subject"
            animate={{
              x: xPos,
              y: yPos,
              scale: 1 + (yPos / -60) * 0.2
            }}
            transition={{
              duration: activeFrame === 0 ? 0 : 0.05,
              ease: "linear"
            }}
            style={{ willChange: 'transform' }}
          >
            <div className="subject-core" style={{ background: color, boxShadow: `0 0 12px ${color}` }}></div>
            <div className="subject-ring" style={{ borderColor: color }}></div>
          </motion.div>
        </div>
        {!isResolved && (
          <div className="rendering-status">
            <span>GENERATING TENSORS</span>
            <div className="loading-bar">
              <div className="loading-fill" style={{ width: `${progress}%`, background: color }}></div>
            </div>
          </div>
        )}
      </div>

      <div className="video-timeline">
        {Array.from({ length: totalFrames }).map((_, idx) => {
          const idxRatio = idx / (totalFrames - 1 || 1);
          const dotY = -Math.abs(Math.sin(idxRatio * Math.PI * 3)) * 10;
          return (
            <div
              key={idx}
              className={`timeline-frame ${activeFrame === idx ? 'active' : ''}`}
              style={{
                '--frame-color': color,
                borderColor: activeFrame === idx ? color : 'rgba(255, 255, 255, 0.1)',
                background: activeFrame === idx ? `${color}20` : 'transparent'
              }}
            >
              <div className="frame-inner" style={{ opacity: isResolved ? 1 : 0.2 }}>
                <div className="frame-dot" style={{
                  transform: `translateY(${dotY}px)`,
                  background: color
                }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CodeGenerator({ color }) {
  const codeLines = [
    "export class AIGenerator {",
    "  public async generate(prompt: string) {",
    "    const tensor = Neural.encode(prompt);",
    "    const logic = await Core.predict(tensor);",
    "    return Decoder.parse(logic);",
    "  }",
    "}"
  ];

  const [visibleLines, setVisibleLines] = useState(0);
  const [currentChars, setCurrentChars] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (isDone) return;

    let timeout;
    if (visibleLines < codeLines.length) {
      const currentLine = codeLines[visibleLines];
      if (currentChars < currentLine.length) {
        timeout = setTimeout(() => {
          setCurrentChars(prev => prev + 1);
        }, 15);
      } else {
        timeout = setTimeout(() => {
          setVisibleLines(prev => prev + 1);
          setCurrentChars(0);
        }, 80);
      }
    } else {
      setIsDone(true);
    }

    return () => clearTimeout(timeout);
  }, [visibleLines, currentChars, isDone, codeLines]);

  return (
    <div className="code-generator-container">
      <div className="code-window">
        <div className="code-content" style={{ '--theme-color': color }}>
          {codeLines.map((line, idx) => {
            if (idx > visibleLines) return null;

            const isCurrentLine = idx === visibleLines;
            const textToShow = isCurrentLine ? line.substring(0, currentChars) : line;

            return (
              <div key={idx} className="code-line">
                <span className="line-number">{idx + 1}</span>
                <span className="line-text">
                  {textToShow}
                  {isCurrentLine && !isDone && <span className="code-cursor">|</span>}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const MODALITY_ICONS = {
  text: <path d="M4 6h16M4 12h16M4 18h10" />,
  image: <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21" />,
  audio: <><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" /></>,
  video: <><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" /></>,
  code: <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>
};

const handleCardTilt = (e) => {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const rotateX = ((y - centerY) / centerY) * -10; // Max 10 degrees
  const rotateY = ((x - centerX) / centerX) * 10; // Max 10 degrees

  gsap.to(card, {
    rotateX: rotateX,
    rotateY: rotateY,
    scale: 1.02,
    duration: 0.5,
    ease: "power2.out",
    force3D: true,
    transformPerspective: 1000
  });
};

const resetCardTilt = (e) => {
  const card = e.currentTarget;
  gsap.to(card, {
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    duration: 0.5,
    ease: "power2.out"
  });
};


function ParticlesBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let particles = [];
    const particleCount = 65;
    const connectionDistance = 110;
    const colors = ['#ffffff'];

    let mouse = { x: null, y: null, radius: 160 };
    let targetMoveX = 0;
    let targetMoveY = 0;
    let currentMoveX = 0;
    let currentMoveY = 0;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      const radius = Math.random() * 1.2 + 0.6; // 0.6 to 1.8px
      const normalizedRadius = (radius - 1) / 2; // 0 to 1
      const depth = normalizedRadius * 2 - 1; // -1 (far background) to 1 (near foreground)

      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: radius,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: radius > 2 ? Math.random() * 0.4 + 0.4 : Math.random() * 0.3 + 0.2, // larger are brighter
        parallaxX: depth * (depth > 0 ? 40 : 25), // foreground shifts up to +40px, background shifts up to -25px
        parallaxY: depth * (depth > 0 ? 25 : 15)  // foreground shifts up to +25px, background shifts up to -15px
      });
    }

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      targetMoveX = (mouse.x - centerX) / centerX; // -1 to 1
      targetMoveY = (mouse.y - centerY) / centerY; // -1 to 1
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
      targetMoveX = 0;
      targetMoveY = 0;
    };

    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener('mousemove', handleMouseMove);
      parent.addEventListener('mouseleave', handleMouseLeave);
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Butter-smooth interpolation (easing) for 3D parallax offsets
      currentMoveX += (targetMoveX - currentMoveX) * 0.08;
      currentMoveY += (targetMoveY - currentMoveY) * 0.08;

      // Update & Draw Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        // Boundary collision / wrap around
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        if (p.x < 0) p.x = 0;
        if (p.x > canvas.width) p.x = canvas.width;
        if (p.y < 0) p.y = 0;
        if (p.y > canvas.height) p.y = canvas.height;

        // Calculate parallax-adjusted drawing coordinates
        p.drawX = p.x + currentMoveX * p.parallaxX;
        p.drawY = p.y + currentMoveY * p.parallaxY;

        ctx.beginPath();
        ctx.arc(p.drawX, p.drawY, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      }

      // Draw Connection Lines
      ctx.globalAlpha = 1;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];

          // Draw connections using parallax-adjusted drawing positions
          const dx = p1.drawX - p2.drawX;
          const dy = p1.drawY - p2.drawY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p1.drawX, p1.drawY);
            ctx.lineTo(p2.drawX, p2.drawY);
            
            const grad = ctx.createLinearGradient(p1.drawX, p1.drawY, p2.drawX, p2.drawY);
            grad.addColorStop(0, p1.color);
            grad.addColorStop(1, p2.color);
            
            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.8;
            ctx.globalAlpha = alpha;
            ctx.stroke();
          }
        }

        // Draw connections to Mouse
        if (mouse.x !== null && mouse.y !== null) {
          const dx = p1.drawX - mouse.x;
          const dy = p1.drawY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            const alpha = (1 - dist / mouse.radius) * 0.22;
            ctx.beginPath();
            ctx.moveTo(p1.drawX, p1.drawY);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = p1.color;
            ctx.lineWidth = 0.9;
            ctx.globalAlpha = alpha;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      if (parent) {
        parent.removeEventListener('mousemove', handleMouseMove);
        parent.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="particles-canvas"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}
    />
  );
}


function GenerativeAISection({ isLoaded }) {
  const containerRef = useRef(null);
  const coreRef = useRef(null);
  const planetsRef = useRef([]);
  const pathsRef = useRef([]);
  const [activeModality, setActiveModality] = useState(null);
  const [hoveredModality, setHoveredModality] = useState(null);
  const animationsRef = useRef({});

  useEffect(() => {
    if (!containerRef.current || !isLoaded) return;

    // Manually trigger reveal for headers to be ready before visiting
    containerRef.current.querySelectorAll('[data-reveal]').forEach(el => {
      el.classList.add('reveal-active');
    });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      gsap.set(planetsRef.current, { scale: 0 });
      gsap.set(coreRef.current, { scale: 0 });

      tl.to(coreRef.current, {
        scale: 1,
        autoAlpha: 1,
        duration: 0.5,
        ease: "back.out(2)",
        force3D: true
      })
        .to(planetsRef.current, {
          scale: 1,
          autoAlpha: 1,
          duration: 0.5,
          ease: "power2.out",
          force3D: true,
          stagger: {
            each: 0.08,
            onComplete: function () {
              const el = this.targets()[0];
              const i = planetsRef.current.indexOf(el);
              const planet = planetsData[i];
              const pathEl = pathsRef.current[i];

              if (el && pathEl) {
                const orbit = gsap.to(el, {
                  motionPath: {
                    path: pathEl,
                    align: pathEl,
                    alignOrigin: [0.5, 0.5]
                  },
                  duration: planet.dur,
                  ease: "none",
                  repeat: -1,
                  force3D: true
                });
                animationsRef.current[planet.id] = orbit;
              }
            }
          }
        }, "-=0.3");
    }, containerRef);
    return () => ctx.revert();
  }, [isLoaded]);

  useEffect(() => {
    planetsData.forEach((planet) => {
      const anim = animationsRef.current[planet.id];
      if (anim) {
        if (activeModality) {
          gsap.to(anim, { timeScale: 0, duration: 0.5 });
        } else if (hoveredModality === planet.id) {
          gsap.to(anim, { timeScale: 0.2, duration: 0.5 });
        } else {
          gsap.to(anim, { timeScale: 1, duration: 0.5 });
        }
      }
    });
  }, [hoveredModality, activeModality]);

  const handlePlanetClick = (id) => {
    setActiveModality(id);
  };

  const getArtifactContent = (id) => {
    switch (id) {
      case 'text': return (
        <div className="artifact-text">
          <p style={{ marginBottom: '1rem' }}>
            <Typewriter text="USER: How do you generate text?" speed={30} />
          </p>
          <p style={{ color: '#00f3ff', lineHeight: '1.8' }}>
            <Typewriter text="AI: I analyze the context of your request and navigate a multi-dimensional map of language to find the most coherent path forward. Every letter you see is a mathematical prediction." speed={30} delay={1500} />
          </p>
        </div>
      );
      case 'image': return (
        <div className="artifact-image">
          <VisualGenerator text="HELLO WORLD" color="#b56cff" fontSize="2.5rem" />
          <p style={{ marginTop: '1rem' }}>
            <Typewriter text="Converting noise to semantic structure..." speed={40} />
            <br />
            <Typewriter text="> Denoising diffusion process active" speed={40} delay={1500} />
          </p>
        </div>
      );
      case 'audio': return (
        <div className="artifact-audio">
          <VoiceGenerator text="Welcome to the Neural Nexus. I am the voice of the architecture. I translate complex data into the frequencies of human understanding." color="#ff006e" />
          <p style={{ marginTop: '1.5rem' }}>
            <Typewriter text="Frequency modulation in progress..." speed={40} />
            <br />
            <Typewriter text="> Adaptive vocoder active" speed={40} delay={1500} />
          </p>
        </div>
      );
      case 'video': return (
        <div className="artifact-video">
          <VideoGenerator color="#00ffcc" />
          <p style={{ marginTop: '1.5rem' }}>
            <Typewriter text="Synthesizing temporal sequences..." speed={40} />
            <br />
            <Typewriter text="> Frame interpolation active" speed={40} delay={1500} />
          </p>
        </div>
      );
      case 'code': return (
        <div className="artifact-code">
          <CodeGenerator color="#ffcc00" />
          <p style={{ marginTop: '1.5rem' }}>
            <Typewriter text="Compiling logic pathways..." speed={40} />
            <br />
            <Typewriter text="> Syntax optimized" speed={40} delay={3000} />
          </p>
        </div>
      );
      default: return null;
    }
  };

  return (
    <section className="gen-ai-section" id="generative-ai" ref={containerRef}>
      <ParticlesBackground />

      <div className="gen-ai-header-bar">
        <h2 className="gen-ai-label" data-reveal="up">GEN AI</h2>
        <p className="gen-ai-subtext" data-reveal="up">
          Multi-modal neural synthesis across<br />text, image, audio, video &amp; code
        </p>
      </div>

      <div className="orbital-system">
        <svg className="orbits-svg" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(0, 243, 255, 0.4)" />
              <stop offset="100%" stopColor="rgba(0, 243, 255, 0)" />
            </radialGradient>
          </defs>



          {planetsData.map((planet, i) => {
            // Calculate rotated endpoints to ensure GSAP follows the tilted path correctly
            const rad = (planet.angle * Math.PI) / 180;
            const sinA = Math.sin(rad);
            const cosA = Math.cos(rad);

            // Top point (relative to 600, 300)
            const tx = 0;
            const ty = -planet.ry;
            const rx1 = 600 + (tx * cosA - ty * sinA);
            const ry1 = 300 + (tx * sinA + ty * cosA);

            // Bottom point (relative to 600, 300)
            const bx = 0;
            const by = planet.ry;
            const rx2 = 600 + (bx * cosA - by * sinA);
            const ry2 = 300 + (bx * sinA + by * cosA);

            return (
              <path
                key={`orbit-${planet.id}`}
                id={`orbit-${planet.id}`}
                ref={el => pathsRef.current[i] = el}
                d={`M ${rx1},${ry1} A ${planet.rx},${planet.ry} ${planet.angle} 1,0 ${rx2},${ry2} A ${planet.rx},${planet.ry} ${planet.angle} 1,0 ${rx1},${ry1}`}
                className={`orbit-path ${hoveredModality === planet.id ? 'highlighted' : ''}`}
                style={{
                  '--orbit-color': planet.color
                }}
              />
            );
          })}
        </svg>

        <div className="synthesis-core" ref={coreRef}>
          <div className="core-inner"></div>
          <div className="core-halo"></div>
          <div className="core-label">SYNTHESIS CORE</div>
        </div>

        {planetsData.map((planet, i) => (
          <div
            key={planet.id}
            className={`modality-planet ${activeModality === planet.id ? 'active' : ''} ${activeModality && activeModality !== planet.id ? 'dimmed' : ''}`}
            ref={el => planetsRef.current[i] = el}
            onMouseEnter={() => setHoveredModality(planet.id)}
            onMouseLeave={() => setHoveredModality(null)}
            onClick={() => handlePlanetClick(planet.id)}
            style={{
              '--planet-color': planet.color
            }}
          >
            {/* Framer Motion morph background anchor */}
            <motion.div
              className="planet-morph-bg"
              layoutId={`planet-${planet.id}-bg`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: '50%',
                background: 'transparent',
                pointerEvents: 'none'
              }}
            />
            <div className="planet-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {MODALITY_ICONS[planet.id]}
              </svg>
            </div>
            <div className="planet-label">{planet.name}</div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {activeModality && (
          <div className="artifact-card-modal-wrapper">
            <motion.div 
              className="artifact-card-backdrop" 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModality(null)} 
            />
            <motion.div 
              className="artifact-card-wrapper"
              layoutId={`planet-${activeModality}-bg`}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              style={{ '--planet-accent-color': planetsData.find(p => p.id === activeModality)?.color }}
            >
              <div className="artifact-card glassmorphic" onMouseMove={handleCardTilt} onMouseLeave={resetCardTilt}>
                <button className="close-btn" onClick={() => setActiveModality(null)} aria-label="Close modal">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
                <div className="artifact-content">
                  <div className="artifact-header" style={{ color: 'var(--planet-accent-color)' }}>
                    <h3>{planetsData.find(p => p.id === activeModality)?.name} Modality</h3>
                  </div>
                  <div className="artifact-body">
                    {getArtifactContent(activeModality)}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default function Home() {
  const containerRef = useRef(null);
  const parallaxWrapperRef = useRef(null);
  const parallaxTimelineRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [activeMLPill, setActiveMLPill] = useState(null);
  const [isSystemLoading, setIsSystemLoading] = useState(false);

  const scrollToSection = (e, targetId) => {
    if (e) e.preventDefault();
    
    // 1. Purge any conflicting scrolls/tweens for exclusive control
    gsap.killTweensOf(window);
    
    // 2. Initialize parameters for high-velocity snappy navigation
    let scrollTarget = null;
    let ease = "power2.out";
    let duration = 0.55;

    // 3. Close any active modal states to prevent UI layering conflicts
    if (typeof setActiveMLPill === 'function') setActiveMLPill(null);

    // 4. Determine high-precision scroll destination
    if (parallaxTimelineRef.current && (targetId === 'machine-learning' || targetId === 'neural-networks')) {
      // Pinned Timeline Navigation: target specific rendering labels
      const label = targetId === 'machine-learning' ? "ml-revealed" : "nn-revealed";
      scrollTarget = parallaxTimelineRef.current.scrollTrigger.labelToScroll(label);
      
      if (targetId === 'neural-networks') {
        ease = "expo.out"; // Bypass "dead zones" in the scroll path
        duration = 0.5;
      }
    } else {
      // Standard Section Navigation
      const target = document.getElementById(targetId);
      if (target) {
        scrollTarget = target;
        if (targetId === 'generative-ai') {
          ease = "expo.out";
          duration = 0.6;
        }
      }
    }

    // 5. Execute smooth scroll with Exclusive Control
    if (scrollTarget !== null) {
      gsap.to(window, {
        scrollTo: { y: scrollTarget, autoKill: false },
        duration: duration,
        ease: ease,
        overwrite: true, // Tweens killing for exclusive control
        onComplete: () => {
          // 6. Verify "Fully Loaded" State: Force reveal classes for instant arrival perception
          const section = document.getElementById(targetId);
          if (section) {
            section.querySelectorAll('[data-reveal]').forEach(el => {
              el.classList.add('reveal-active');
            });
          }
        }
      });
    }
  };

  const handleCardTilt = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    gsap.to(card, {
      rotateX: rotateX,
      rotateY: rotateY,
      transformPerspective: 1000,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const resetCardTilt = (e) => {
    const card = e.currentTarget;
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      transformPerspective: 1000,
      duration: 0.5,
      ease: "power2.out"
    });
  };

  // Pre-calculate rect to avoid layout thrashing on mouse move
  const containerRect = useRef(null);
  useEffect(() => {
    const updateRect = () => {
      if (containerRef.current) containerRect.current = containerRef.current.getBoundingClientRect();
    };
    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, []);

  const handleMouseMove = (e) => {
    // 1. Existing gradient logic for text - Optimized with cached rect
    if (containerRef.current && containerRect.current) {
      const x = e.clientX - containerRect.current.left;
      const y = e.clientY - containerRect.current.top;
      
      gsap.to(containerRef.current, {
        "--x": `${x}px`,
        "--y": `${y}px`,
        duration: 0.2,
        ease: "power2.out"
      });
    }

    // 2. Mouse Parallax Logic - Fully Hardware Accelerated
    const { clientX, clientY } = e;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const moveX = (clientX - centerX) / centerX;
    const moveY = (clientY - centerY) / centerY;

    gsap.to(".cyborg-near", {
      x: moveX * 50,
      y: moveY * 30,
      duration: 1,
      ease: "power2.out",
      force3D: true
    });

    gsap.to(".bg-far", {
      x: moveX * -30,
      y: moveY * -20,
      duration: 1,
      ease: "power2.out",
      force3D: true
    });
  };

  useEffect(() => {
    
    const entranceTl = gsap.timeline({
      defaults: { ease: "power3.out", duration: 3 }
    });

    // 1. Background settles (Zooms out and clears blur)
    entranceTl.fromTo(".bg-far",
      { scale: 1.5, opacity: 0, filter: "blur(20px) brightness(0.4)" },
      { scale: 1, opacity: 1, filter: "blur(0px) brightness(1)", duration: 3 },
      0
    );

    // 2. Cyborg emerges (Zooms in)
    entranceTl.fromTo(".cyborg-near",
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1 },
      0.3
    );

    // 3. UI Elements fade in (Slower and staggered)
    entranceTl.fromTo(".minimal-header",
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 2, ease: "power2.out" },
      1.0
    );

    entranceTl.fromTo(".minimal-heading",
      { opacity: 0, y: 30, filter: "blur(8px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 2.5, ease: "power2.out" },
      1.5
    );

    entranceTl.fromTo(".minimal-subtext",
      { opacity: 0, y: 20, filter: "blur(4px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 2.5, ease: "power2.out" },
      1.8 // Staggered by 0.3s
    );

    entranceTl.fromTo(".system-status",
      { opacity: 0, x: 30, filter: "blur(4px)" },
      { opacity: 1, x: 0, filter: "blur(0px)", duration: 3, ease: "power2.out" },
      2.1 // Staggered later
    );

    // 4. Consolidate: Fade out the near layer to leave the crisp background
    entranceTl.to(".cyborg-near", { 
      opacity: 0, 
      duration: 1,
      force3D: true 
    }, "-=0.5");

    return () => entranceTl.kill();
  }, [isSystemLoading]);




  // Parallax Scrolling Effects
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Cinematic Hero Parallax Scroll Transition
      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: "#hero",
          start: "top top",
          end: "+=100%", // Pin for exactly 100vh of scrolling
          pin: true,
          pinSpacing: false, // Essential: allows ML section to slide up and overlap
          scrub: 1, // Smooth butter scrubbing (60 FPS feel)
        }
      });

      // Move text up perfectly in sync with the second page (ML section) over the full scroll duration
      heroTl.to(".ui-layer", {
        y: "-100vh", // Matches the exact 100vh scroll
        ease: "none", // Must be "none" to stay perfectly synced with linear browser scrolling
        duration: 1
      }, 0);

      // Fade out text completely by 50% of the scroll, so it's entirely invisible before leaving the screen
      heroTl.to(".ui-layer", {
        opacity: 0,
        ease: "power2.out", // Eases the fade out
        duration: 0.5 // Takes only the first half of the scroll distance
      }, 0);

      // Hero background translates up simultaneously over the entire scroll duration
      heroTl.to(".hero-mouse-parallax", {
        yPercent: -50, // Move background up to create strong parallax with the rising ML section
        ease: "none", // Keeps parallax consistent and linear
        duration: 1
      }, 0);

      // ML Section Orbs Parallax
      document.querySelectorAll('.ml-bg-orb').forEach(orb => {
        const speed = parseFloat(getComputedStyle(orb).getPropertyValue('--parallax-offset')) || 50;
        gsap.to(orb, {
          y: speed,
          ease: "none",
          scrollTrigger: {
            trigger: orb.closest('section'),
            start: "top bottom",
            end: "bottom top",
            scrub: 1, // Increased scrub for smoother interpolation
            force3D: true
          }
        });
      });
    });

    return () => ctx.revert();
  }, []);

  // Optimized Cinematic Scroll Management
  useEffect(() => {
    const sections = document.querySelectorAll('.ml-section, .nn-section');
    if (!sections.length || !window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        } else {
          entry.target.classList.remove('active');
        }
      });
    }, { threshold: 0, rootMargin: '100px' });

    sections.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Enhanced Scroll Observer for Individual Elements (Bi-directional)
  useEffect(() => {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Toggle class based on intersection for bi-directional animation
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
        } else {
          entry.target.classList.remove('reveal-active');
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: '0px 0px -10% 0px'
    });

    // Initial setup for staggered elements
    const setupStaggers = () => {
      document.querySelectorAll('.stagger-root').forEach(root => {
        const children = root.querySelectorAll('[data-reveal], .mask-reveal');
        children.forEach((child, index) => {
          child.style.setProperty('--reveal-delay', `${index * 80}ms`); // Reduced delay for snappier feel
        });
      });
    };

    setupStaggers();
    document.querySelectorAll('[data-reveal], .mask-reveal').forEach(el => revealObserver.observe(el));

    return () => {
      revealObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('[data-count]').forEach(el => {
            if (el.dataset.running) return;
            el.dataset.running = 'true';

            const target = parseFloat(el.getAttribute('data-count'));
            const isFloat = target % 1 !== 0;
            const duration = 1500; // Snappier count
            const start = performance.now();

            function update(now) {
              const elapsed = now - start;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 4); // Quart eased
              const current = eased * target;
              el.textContent = isFloat ? current.toFixed(1) : Math.floor(current);
              if (progress < 1) {
                requestAnimationFrame(update);
              } else {
                delete el.dataset.running;
              }
            }
            requestAnimationFrame(update);
          });
        } else {
          // Reset numbers when leaving viewport for bi-directional experience
          entry.target.querySelectorAll('[data-count]').forEach(el => {
            el.textContent = '0';
            delete el.dataset.running;
          });
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.ml-stats, .nn-stats-block-tl, .nn-metrics-block').forEach(el => statsObserver.observe(el));
    return () => statsObserver.disconnect();
  }, []);



  // ML -> NN Parallax Scroll Transition
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!parallaxWrapperRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: parallaxWrapperRef.current,
          start: "top top",
          end: "+=1800", 
          pin: true,
          scrub: 0.5,
          anticipatePin: 1
        },
        defaults: { force3D: true, ease: "none" }
      });

      parallaxTimelineRef.current = tl;

      // 1. Initial states
      gsap.set(".ml-reveal", { y: 40, autoAlpha: 0, filter: "blur(10px)", scale: 0.92 });
      gsap.set(".nn-distributed", { autoAlpha: 0 });
      gsap.set(".nn-background-wrapper", { y: 50, scale: 1.1 });
      gsap.set(".nn-header-block", { x: -40, autoAlpha: 0 });
      gsap.set(".nn-stats-block-tl", { y: -40, autoAlpha: 0 });
      gsap.set(".nn-info-block", { x: 40, autoAlpha: 0 });
      gsap.set(".nn-metrics-block", { y: 40, autoAlpha: 0 });
      gsap.set([".nn-sub-dist", ".nn-divider-h", ".nn-desc-dist", ".nn-cap-tag"], { autoAlpha: 0, y: 20 });

      // 2. ML Entrance (Staggered reveal)
      tl.to(".ml-reveal", {
        y: 0,
        scale: 1,
        autoAlpha: 1,
        filter: "blur(0px)",
        duration: 0.8,
        ease: "back.out(1.7)",
        stagger: 0.1
      }, 0);

      // Pause briefly for user to view ML section
      tl.addLabel("ml-revealed").to({}, { duration: 0.4 });

      // 3. ML exits upward completely
      tl.to(".ml-container", {
        y: -150,
        autoAlpha: 0,
        duration: 0.4,
        ease: "power2.out"
      }, "ml-revealed");

      // 4. NN Distributed entries
      tl.to(".nn-distributed", {
        autoAlpha: 1,
        duration: 0.4,
      }, "ml-revealed+=0.4");

      // Background immersion + Parallax
      tl.to(".nn-background-wrapper", {
        y: -100,
        duration: 2.6, // Synced with the content reveal duration (from 8 down to 2.6)
        ease: "none"
      }, "ml-revealed");

      tl.to(".nn-neural-web", {
        autoAlpha: 0.25,
        duration: 1.0,
        ease: "power2.out"
      }, "ml-revealed+=0.4");

      tl.to(".nn-phi-spiral-large", {
        autoAlpha: 0.12,
        scale: 1,
        duration: 1.2,
        ease: "power2.out"
      }, "ml-revealed+=0.4");

      // Q1: Header
      tl.to(".nn-header-block", {
        x: 0,
        autoAlpha: 1,
        duration: 0.8,
        ease: "power2.out"
      }, "ml-revealed+=0.4");

      tl.to(".nn-h-line", {
        y: 0,
        autoAlpha: 1,
        stagger: 0.2,
        duration: 0.6,
        ease: "power2.out"
      }, "<");

      // Q2: Large Stat (Top Right)
      tl.to(".nn-stats-block-tl", {
        y: 0,
        autoAlpha: 1,
        duration: 0.8,
        ease: "power2.out"
      }, "ml-revealed+=0.6");

      // Q2: Large Stat (Top Right)
      tl.to(".nn-stats-block-tl", {
        y: 0,
        autoAlpha: 1,
        duration: 0.8,
        ease: "power2.out"
      }, "ml-revealed+=0.6");

      // Q3: Bottom Right Info
      tl.to(".nn-info-block", {
        x: 0,
        autoAlpha: 1,
        duration: 0.8,
        ease: "power2.out"
      }, "ml-revealed+=0.8");

      tl.to([".nn-sub-dist", ".nn-divider-h", ".nn-desc-dist", ".nn-cap-tag"], {
        autoAlpha: 1,
        y: 0,
        stagger: 0.1,
        duration: 0.6
      }, "<");

      // Q4: Metrics (Bottom Left)
      tl.to(".nn-metrics-block", {
        y: 0,
        autoAlpha: 1,
        duration: 0.8,
        ease: "power2.out"
      }, "ml-revealed+=1.0");

      // Q4: Metrics (Bottom Left)
      tl.to(".nn-metrics-block", {
        y: 0,
        autoAlpha: 1,
        duration: 0.8,
        ease: "power2.out"
      }, "ml-revealed+=1.0");

      tl.addLabel("nn-revealed");

      // Final pause before unpinning
      tl.to({}, { duration: 0.1 });

    }, parallaxWrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <main>
        <section className="hero-section" id="hero" onMouseMove={handleMouseMove}>
          <div className="hero-mouse-parallax">
            {/* Multi-layered background for 3D emergence effect */}
            <div className="hero-bg bg-far"></div>
            <div className="hero-bg cyborg-near"></div>
          </div>


          <div className="ui-layer">
            <header className="minimal-header">
              <a href="#machine-learning" onClick={(e) => scrollToSection(e, 'machine-learning')}>Machine Learning</a>
              <a href="#neural-networks" onClick={(e) => scrollToSection(e, 'neural-networks')}>Neural Networks</a>
              <a href="#generative-ai" onClick={(e) => scrollToSection(e, 'generative-ai')}>Generative AI</a>
              <a href="#ai-robotics" onClick={(e) => scrollToSection(e, 'ai-robotics')}>AI in Robotics</a>
              <a href="#future-of-ai" onClick={(e) => scrollToSection(e, 'future-of-ai')}>Future of AI</a>
            </header>

            <div
              className={`hero-text-container interactive-text ${isHovered ? 'is-hovered' : ''}`}
              ref={containerRef}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <h1 className="minimal-heading interactive-text" data-reveal="fade-up">
                NEURAL CORE
              </h1>
              <p className="minimal-subtext">Designed for the future<br />Beyond code. Beyond logic.</p>
            </div>

            <div className="system-status-wrapper">
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
          </div>
        </section>

        <div className="parallax-ml-nn-wrapper" ref={parallaxWrapperRef}>
          <div className="parallax-shared-bg"></div>

          <section className="ml-section parallax-section" id="machine-learning">
            <motion.div
              className="ml-bg-orb orb-1"
              animate={{
                x: [0, 80, -60, 40, -80, 0],
                y: [0, -50, 70, -30, 50, 0],
                scale: [1, 1.15, 0.9, 1.1, 0.95, 1],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="ml-bg-orb orb-2"
              animate={{
                x: [0, -70, 50, -40, 60, 0],
                y: [0, 60, -80, 40, -60, 0],
                scale: [1, 0.9, 1.2, 0.85, 1.1, 1],
              }}
              transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="ml-bg-orb orb-3"
              animate={{
                x: [0, 50, -90, 70, -50, 0],
                y: [0, -70, 30, -60, 80, 0],
                scale: [1, 1.1, 0.95, 1.2, 0.9, 1],
              }}
              transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="ml-container">
              <div className="ml-statement">
                <h2 className="ml-statement-heading ml-reveal">
                  MACHINE<br />LEARNING
                </h2>
                <p className="ml-statement-subtext ml-reveal">
                  Algorithms that learn. Systems that evolve.
                </p>

                <div className="ml-statement-stats ml-stats ml-reveal">
                  <div className="ml-statement-stat">
                    <div className="ml-statement-stat-top">
                      <span className="ml-statement-stat-value" data-count="175">0</span>
                      <span className="ml-statement-stat-unit">B</span>
                    </div>
                    <span className="ml-statement-stat-label">Parameters</span>
                  </div>
                  <div className="ml-statement-stat">
                    <div className="ml-statement-stat-top">
                      <span className="ml-statement-stat-value" data-count="99.7">0</span>
                      <span className="ml-statement-stat-unit">%</span>
                    </div>
                    <span className="ml-statement-stat-label">Accuracy</span>
                  </div>
                  <div className="ml-statement-stat">
                    <div className="ml-statement-stat-top">
                      <span className="ml-statement-stat-value" data-count="50">0</span>
                      <span className="ml-statement-stat-unit">ms</span>
                    </div>
                    <span className="ml-statement-stat-label">Inference</span>
                  </div>
                </div>

                <div className="ml-pills ml-reveal">
                  <button
                    className={`ml-pill ${activeMLPill === 'supervised' ? 'active' : ''}`}
                    onClick={() => setActiveMLPill(activeMLPill === 'supervised' ? null : 'supervised')}
                    aria-expanded={activeMLPill === 'supervised'}
                    style={{ '--pill-accent': '#00f3ff', '--pill-accent-bg': 'rgba(0,243,255,0.08)' }}
                  >
                    <motion.span className="ml-pill-bg" layoutId="supervised-bg" />
                    <span className="ml-pill-inner">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                      </svg>
                      <span>Supervised</span>
                    </span>
                  </button>
                  <button
                    className={`ml-pill ${activeMLPill === 'unsupervised' ? 'active' : ''}`}
                    onClick={() => setActiveMLPill(activeMLPill === 'unsupervised' ? null : 'unsupervised')}
                    aria-expanded={activeMLPill === 'unsupervised'}
                    style={{ '--pill-accent': '#b56cff', '--pill-accent-bg': 'rgba(181,108,255,0.08)' }}
                  >
                    <motion.span className="ml-pill-bg" layoutId="unsupervised-bg" />
                    <span className="ml-pill-inner">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" /><path d="M12 1v4" /><path d="M12 19v4" /><path d="M4.22 4.22l2.83 2.83" /><path d="M16.95 16.95l2.83 2.83" /><path d="M1 12h4" /><path d="M19 12h4" /><path d="M4.22 19.78l2.83-2.83" /><path d="M16.95 7.05l2.83-2.83" />
                      </svg>
                      <span>Unsupervised</span>
                    </span>
                  </button>
                  <button
                    className={`ml-pill ${activeMLPill === 'reinforcement' ? 'active' : ''}`}
                    onClick={() => setActiveMLPill(activeMLPill === 'reinforcement' ? null : 'reinforcement')}
                    aria-expanded={activeMLPill === 'reinforcement'}
                    style={{ '--pill-accent': '#ff006e', '--pill-accent-bg': 'rgba(255,0,110,0.08)' }}
                  >
                    <motion.span className="ml-pill-bg" layoutId="reinforcement-bg" />
                    <span className="ml-pill-inner">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="M9 9l6 6" /><path d="M15 9l-6 6" />
                      </svg>
                      <span>Reinforcement</span>
                    </span>
                  </button>
                </div>


              </div>
            </div>
          </section>

          <section className="nn-section parallax-section" id="neural-networks">
            <div className="nn-distributed">
              {/* Immersive Neural Web — Background filling */}
              <div className="nn-background-wrapper">
                <svg className="nn-neural-web" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
                  <defs>
                    <radialGradient id="node-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#00f3ff" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#00f3ff" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  {/* Neural Path Connections — procedurally inspired connections */}
                  <path d="M100,200 L300,150 L500,250 L700,200 L900,300" className="nn-path" />
                  <path d="M50,400 L250,450 L450,400 L650,450 L850,400" className="nn-path" />
                  <path d="M150,600 L350,550 L550,650 L750,600 L950,700" className="nn-path" />
                  <path d="M200,100 L250,300 L200,500 L250,700 L200,900" className="nn-path" />
                  <path d="M500,50 L550,250 L500,450 L550,650 L500,850" className="nn-path" />
                  <path d="M800,100 L850,300 L800,500 L850,700 L800,900" className="nn-path" />

                  {/* Neural Nodes — scattered active points */}
                  <circle cx="100" cy="200" r="3" fill="url(#node-glow)" className="nn-node pulse-1" />
                  <circle cx="300" cy="150" r="2.5" fill="url(#node-glow)" className="nn-node pulse-2" />
                  <circle cx="500" cy="250" r="4" fill="url(#node-glow)" className="nn-node pulse-3" />
                  <circle cx="700" cy="200" r="2.5" fill="url(#node-glow)" className="nn-node pulse-1" />
                  <circle cx="900" cy="300" r="3" fill="url(#node-glow)" className="nn-node pulse-2" />
                  <circle cx="250" cy="450" r="3.5" fill="url(#node-glow)" className="nn-node pulse-3" />
                  <circle cx="650" cy="450" r="3" fill="url(#node-glow)" className="nn-node pulse-1" />
                  <circle cx="550" cy="650" r="4" fill="url(#node-glow)" className="nn-node pulse-2" />
                  <circle cx="850" cy="700" r="3" fill="url(#node-glow)" className="nn-node pulse-3" />
                </svg>

                <svg className="nn-phi-spiral-large" viewBox="0 0 800 500" fill="none">
                  <path d="M 494 494 A 494 494 0 0 1 0 0" stroke="rgba(0,243,255,0.15)" strokeWidth="0.5" fill="none" />
                  <path d="M 494 0 A 306 306 0 0 1 800 306" stroke="rgba(181,108,255,0.1)" strokeWidth="0.5" fill="none" />
                </svg>
              </div>

              <div className="nn-ambient-glow-distributed"></div>

              {/* Quadrant 1: The Identity (Top Left) */}
              <div className="nn-block nn-header-block">
                <div className="nn-accent-line-v"></div>
                <h2 className="nn-headline-dist">
                  <span className="nn-h-line">NEURAL</span>
                  <span className="nn-h-line">NETWORKS</span>
                </h2>
                <div className="nn-phi-label">STRUCTURE φ 1.618</div>
              </div>

              {/* Quadrant 2: The Core Stats (Top Right) */}
              <div className="nn-block nn-stats-block-tl">
                <div className="nn-stat-v">
                  <span className="nn-sv-val" data-count="350">0</span>
                  <span className="nn-sv-unit">GB</span>
                  <span className="nn-sv-label">MODEL SIZE</span>
                </div>
              </div>

              {/* Quadrant 3: The Narrative (Bottom Right) */}
              <div className="nn-block nn-info-block">
                <p className="nn-sub-dist">Every connection, a decision. Every layer, a refinement.</p>
                <div className="nn-divider-h"></div>
                <p className="nn-desc-dist">
                  Inspired by biological architecture, our networks are layered systems of
                  interconnected nodes that transform raw data into deep understanding.
                  Signal propagation through 8.6B parameters achieves state-of-the-art
                  pattern recognition.
                </p>
                <div className="nn-caps-dist">
                  <span className="nn-cap-tag">Transformer</span>
                  <span className="nn-cap-tag">Attention</span>
                  <span className="nn-cap-tag">Gradient</span>
                </div>
              </div>

              {/* Quadrant 4: Secondary Metrics (Bottom Left) */}
              <div className="nn-block nn-metrics-block">
                <div className="nn-mini-stat">
                  <span className="nn-ms-val" data-count="500">0</span><span className="nn-ms-unit">K</span>
                  <span className="nn-ms-label">EPOCHS</span>
                </div>
                <div className="nn-mini-stat">
                  <span className="nn-ms-val" data-count="8.6">0</span><span className="nn-ms-unit">B</span>
                  <span className="nn-ms-label">NEURONS</span>
                </div>
              </div>

            </div>
          </section>
        </div>

        <GenerativeAISection isLoaded={true} />
        
        <AnimatePresence>
          {activeMLPill && (
            <div className="ml-modal-overlay">
              <motion.div 
                className="ml-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveMLPill(null)}
              />
              <motion.div 
                className="ml-modal-card-wrapper"
                layoutId={`${activeMLPill}-bg`}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                style={{ '--expand-accent': activeMLPill === 'supervised' ? '#00f3ff' : activeMLPill === 'unsupervised' ? '#b56cff' : '#ff006e' }}
              >
                <div 
                  className="ml-modal-card"
                  onMouseMove={handleCardTilt}
                  onMouseLeave={resetCardTilt}
                >
                  <button className="ml-expansion-close" onClick={() => setActiveMLPill(null)} aria-label="Close details">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                  <div className="ml-expansion-content">
                    <span className="ml-expansion-tag">
                      {activeMLPill === 'supervised' && 'CLASSIFICATION \u2022 REGRESSION'}
                      {activeMLPill === 'unsupervised' && 'CLUSTERING \u2022 DIMENSIONALITY'}
                      {activeMLPill === 'reinforcement' && 'AGENTS \u2022 REWARDS'}
                    </span>
                    <h4 className="ml-expansion-title">
                      {activeMLPill === 'supervised' && 'Supervised Learning'}
                      {activeMLPill === 'unsupervised' && 'Unsupervised Learning'}
                      {activeMLPill === 'reinforcement' && 'Reinforcement Learning'}
                    </h4>
                    <div className="ml-expansion-desc">
                      <Typewriter
                        text={
                          activeMLPill === 'supervised'
                            ? 'Trained on labeled datasets, supervised learning maps inputs to known outputs. From predicting stock prices to classifying medical images \u2014 it finds the pattern in the noise.'
                            : activeMLPill === 'unsupervised'
                              ? 'No labels, no guidance. Unsupervised learning discovers hidden structure in raw data \u2014 grouping galaxies by shape, segmenting customers by behavior, finding order in chaos.'
                              : 'An agent learns by doing. Through trial, error, and reward signals, reinforcement learning masters complex strategies \u2014 from playing Go to controlling robotic arms.'
                        }
                        speed={20}
                        key={activeMLPill}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
