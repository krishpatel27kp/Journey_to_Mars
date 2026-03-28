/**
 * App — Main application component for the Journey to Mars experience.
 * Orchestrates all sections, global UI elements, GSAP ScrollTrigger,
 * accessibility features (skip link, reduced motion), and audio.
 * @module App
 */
import { useState, useEffect, useRef, lazy, Suspense, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import ProgressBar from './components/ui/ProgressBar';
import HUDLabel from './components/ui/HUDLabel';
import CustomCursor from './components/ui/CustomCursor';
import MissionModal from './components/ui/MissionModal';
import { SECTION_NAMES } from './utils/telemetryData';

import './styles/global.css';
import './styles/sections.css';
import './styles/animations.css';

gsap.registerPlugin(ScrollTrigger);

/* Lazy load heavy Three.js sections */
const Section1Launch = lazy(() => import('./components/sections/Section1Launch'));
const Section2Void = lazy(() => import('./components/sections/Section2Void'));
const Section3Orbit = lazy(() => import('./components/sections/Section3Orbit'));
const Section4EDL = lazy(() => import('./components/sections/Section4EDL'));
const Section5Surface = lazy(() => import('./components/sections/Section5Surface'));

/** Check if user prefers reduced motion */
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Loading fallback */
function SectionLoader() {
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--void)',
      fontFamily: 'var(--font-display)',
      fontSize: '12px',
      color: 'var(--hud-green)',
      letterSpacing: '0.2em',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '16px', opacity: 0.6 }}>LOADING MISSION DATA</div>
        <div style={{
          width: '120px',
          height: '2px',
          background: 'var(--deep)',
          margin: '0 auto',
          borderRadius: '2px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: '40%',
            height: '100%',
            background: 'var(--hud-green)',
            animation: 'loading-bar 1.5s ease-in-out infinite',
          }} />
        </div>
      </div>
      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </div>
  );
}

function App() {
  const [showModal, setShowModal] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const [audioMuted, setAudioMuted] = useState(true);
  const audioRef = useRef(null);
  const appRef = useRef(null);

  /* Setup ScrollTrigger section detection */
  useEffect(() => {
    if (showModal || prefersReducedMotion) return;

    const sectionIds = ['section-launch', 'section-void', 'section-orbit', 'section-edl', 'section-surface'];
    const triggers = [];

    /* Delay to ensure DOM is ready */
    const timeout = setTimeout(() => {
      sectionIds.forEach((id, idx) => {
        const el = document.getElementById(id);
        if (!el) return;

        const st = ScrollTrigger.create({
          trigger: el,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => setCurrentSection(idx),
          onEnterBack: () => setCurrentSection(idx),
        });
        triggers.push(st);
      });
    }, 500);

    return () => {
      clearTimeout(timeout);
      triggers.forEach((st) => st.kill());
    };
  }, [showModal]);

  /* Audio setup */
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.08;
    }
  }, []);

  const toggleAudio = useCallback(() => {
    if (!audioRef.current) return;
    if (audioMuted) {
      audioRef.current.play().catch(() => {});
      setAudioMuted(false);
    } else {
      audioRef.current.pause();
      setAudioMuted(true);
    }
  }, [audioMuted]);

  const handleDismissModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const sectionData = SECTION_NAMES[currentSection] || SECTION_NAMES[0];

  return (
    <div ref={appRef} className="app">
      {/* Skip-to-content link for accessibility */}
      <a href="#section-launch" className="skip-link">Skip to content</a>

      {/* SVG grain filter */}
      <svg style={{ position: 'fixed', top: 0, left: 0, width: 0, height: 0 }} aria-hidden="true">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feBlend in="SourceGraphic" mode="overlay" />
        </filter>
      </svg>

      {/* Mission briefing modal */}
      {showModal && <MissionModal onDismiss={handleDismissModal} />}

      {/* Global UI */}
      <ProgressBar />
      <HUDLabel
        sectionCode={sectionData.code}
        sectionName={sectionData.name}
        sol={sectionData.sol}
      />
      <CustomCursor />

      {/* Audio */}
      <audio ref={audioRef} loop preload="none">
        <source src="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=" type="audio/wav" />
      </audio>

      {/* Audio toggle */}
      <button
        onClick={toggleAudio}
        aria-label={audioMuted ? 'Unmute ambient audio' : 'Mute ambient audio'}
        data-hoverable="true"
        className="audio-toggle-btn"
      >
        {audioMuted ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--hud-green)" strokeWidth="1.5">
            <path d="M11 5L6 9H2V15H6L11 19V5Z" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--hud-green)" strokeWidth="1.5">
            <path d="M11 5L6 9H2V15H6L11 19V5Z" />
            <path d="M19 12C19 10 18 8.5 16.5 7.5" />
            <path d="M22 12C22 8.5 20 5.5 16.5 4" />
          </svg>
        )}
      </button>

      {/* Sections */}
      <main>
        <Suspense fallback={<SectionLoader />}>
          <Section1Launch />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <Section2Void />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <Section3Orbit />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <Section4EDL />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <Section5Surface />
        </Suspense>
      </main>
    </div>
  );
}

export default App;
