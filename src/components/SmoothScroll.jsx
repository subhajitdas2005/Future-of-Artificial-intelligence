'use client'

import { ReactLenis } from 'lenis/react'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

/**
 * SmoothScroll Component
 * Integrates Lenis with GSAP ScrollTrigger for a premium smooth scrolling experience.
 */
export default function SmoothScroll({ children }) {
  const lenisRef = useRef()

  useEffect(() => {
    // 1. Register GSAP Plugins
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger)
    }

    // 2. High-performance RAF loop synchronized with GSAP Ticker
    // This ensures Lenis and ScrollTrigger/GSAP animations stay perfectly in sync.
    function update(time) {
      lenisRef.current?.lenis?.raf(time * 1000)
    }

    gsap.ticker.add(update)
    
    // Performance Optimization: Prevent GSAP from jumping on frame drops
    gsap.ticker.lagSmoothing(0)

    // 3. Connect Lenis to ScrollTrigger
    const lenisInstance = lenisRef.current?.lenis
    if (lenisInstance) {
      // Update ScrollTrigger on every Lenis scroll
      lenisInstance.on('scroll', () => {
        ScrollTrigger.update()
      })
      
      // Initial calculation
      ScrollTrigger.refresh()
    }

    // 4. Handle window resize to recalculate ScrollTrigger positions
    const handleResize = () => {
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      gsap.ticker.remove(update)
      window.removeEventListener('resize', handleResize)
      if (lenisInstance) {
        lenisInstance.off('scroll', ScrollTrigger.update)
      }
    }
  }, [])

  return (
    <ReactLenis
      root
      ref={lenisRef}
      autoRaf={false} // Managed by GSAP ticker for frame-perfect sync
      options={{
        lerp: 0.08,        // Premium smoothness (slightly lower for more fluid feel)
        duration: 1.5,     // Premium duration for silky transitions
        smoothWheel: true,
        smoothTouch: false, // Standard mobile UX: let native touch handle momentum
        wheelMultiplier: 1,
        touchMultiplier: 2,
        normalizeWheel: true, // Fix jitter on different trackpads/mice
        infinite: false,
      }}
    >
      {children}
    </ReactLenis>
  )
}
