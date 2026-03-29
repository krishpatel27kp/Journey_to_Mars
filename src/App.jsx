/**
 * App — Main application component for the Journey to Mars experience.
 * Orchestrates all sections, global UI elements, GSAP ScrollTrigger,
 * accessibility features (skip link, reduced motion), and audio.
 * @module App
 */
import { useState, useEffect, useRef, lazy, Suspense, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

import ProgressBar from './components/ui/ProgressBar';
import HUDLabel from './components/ui/HUDLabel';
import CustomCursor from './components/ui/CustomCursor';
import MissionModal from './components/ui/MissionModal';
import ErrorBoundary from './components/ui/ErrorBoundary';
import SectionLoader from './components/ui/SectionLoader';
import { SECTION_NAMES } from './utils/telemetryData';
import { 
  startSpaceDrone, 
  stopSpaceDrone, 
  resumeAudioContext, 
  playIntroSequence,
  playHUDBlip 
} from './utils/audioEngine';

import './styles/global.css';
import './styles/sections.css';
import './styles/animations.css';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

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


function App() {
  const [showModal, setShowModal] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const [audioMuted, setAudioMuted] = useState(true);
  const audioRef = useRef(null);
  const appRef = useRef(null);

  /** Global Audio Context Resumption & Hover Effects */
  useEffect(() => {
    const handleGlobalInteraction = () => {
      resumeAudioContext();
    };

    const handleMouseOver = (e) => {
      if (e.target.closest('[data-hoverable="true"]')) {
        playHUDBlip(1200, 'sine', 0.02);
      }
    };

    window.addEventListener('click', handleGlobalInteraction);
    window.addEventListener('touchstart', handleGlobalInteraction);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('click', handleGlobalInteraction);
      window.removeEventListener('touchstart', handleGlobalInteraction);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

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
          onEnter: () => {
             setCurrentSection((prev) => (prev !== idx ? idx : prev));
          },
          onEnterBack: () => {
             setCurrentSection((prev) => (prev !== idx ? idx : prev));
          },
          onLeave: () => {
             if (idx === 0) setCurrentSection((prev) => (prev < 1 ? 1 : prev));
          },
          onLeaveBack: () => {
             if (idx === 4) setCurrentSection((prev) => (prev > 3 ? 3 : prev));
          }
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
    if (audioMuted) {
      startSpaceDrone(0.04);
      setAudioMuted(false);
    } else {
      stopSpaceDrone();
      setAudioMuted(true);
    }
  }, [audioMuted]);

  const handleDismissModal = useCallback(() => {
    setShowModal(false);
    resumeAudioContext();
    startSpaceDrone(0.04);
    playIntroSequence();
    setAudioMuted(false);
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

      {/* Audio logic handled by AudioEngine */}

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
        <ErrorBoundary>
          <Suspense fallback={<SectionLoader />}>
            <Section1Launch active={currentSection === 0} showModal={showModal} />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary>
          <Suspense fallback={<SectionLoader />}>
            <Section2Void active={currentSection === 1} showModal={showModal} />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary>
          <Suspense fallback={<SectionLoader />}>
            <Section3Orbit active={currentSection === 2} showModal={showModal} />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary>
          <Suspense fallback={<SectionLoader />}>
            <Section4EDL active={currentSection === 3} showModal={showModal} />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary>
          <Suspense fallback={<SectionLoader />}>
            <Section5Surface active={currentSection === 4} showModal={showModal} />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;
