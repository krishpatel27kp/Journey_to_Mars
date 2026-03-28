/**
 * Section4EDL — "7 MINUTES OF TERROR" Entry, Descent, Landing.
 * Features: 4-phase stepper with labels, detailed SVG illustrations,
 * card flip with backface-visibility, Framer Motion AnimatePresence transitions,
 * phase-specific data line.
 * @module Section4EDL
 */
import { memo, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NARRATIVE_TEXT, EDL_PHASES } from '../../utils/telemetryData';

/** Total number of EDL phases */
const PHASE_COUNT = 4;
/** Number of atmospheric streaks in background */
const ENTRY_STREAK_COUNT = 12;
/** Phase-specific short labels for the stepper bar */
const PHASE_SHORT_TITLES = ['ENTRY', 'CHUTE', 'DESCENT', 'CRANE'];
/** Phase-specific telemetry data lines */
const PHASE_DATA = [
  'ENTRY INTERFACE ALTITUDE: 125 KM · MACH 25',
  'ALTITUDE: 11 KM · VELOCITY: 320 KM/H · MACH 0.8',
  'ALTITUDE: 2.1 KM · VELOCITY: 280 KM/H',
  'ALTITUDE: 20 M · VELOCITY: 2.7 M/S · TOUCHDOWN NOMINAL',
];

/** Heatshield SVG — animated plasma lines */
function HeatshieldSVG() {
  return (
    <svg viewBox="0 0 200 120" className="edl-phase-svg" xmlns="http://www.w3.org/2000/svg">
      {/* Heatshield dome */}
      <ellipse cx="100" cy="80" rx="70" ry="20" fill="#c1440e" opacity="0.3" />
      <path d="M30,80 Q100,10 170,80 Z" fill="#c1440e" opacity="0.7" />
      <path d="M30,80 Q100,10 170,80 Z" fill="none" stroke="#e8813a" strokeWidth="2" />
      {/* Plasma glow lines */}
      <path d="M25,85 Q60,30 100,20" fill="none" stroke="#ff6b35" strokeWidth="1.5" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.2s" repeatCount="indefinite" />
      </path>
      <path d="M175,85 Q140,30 100,20" fill="none" stroke="#ff6b35" strokeWidth="1.5" opacity="0.8">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.2s" repeatCount="indefinite" />
      </path>
      <path d="M50,78 Q100,25 150,78" fill="none" stroke="#ffaa44" strokeWidth="1" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="0.8s" repeatCount="indefinite" />
      </path>
      {/* Capsule body */}
      <ellipse cx="100" cy="70" rx="18" ry="8" fill="#8ca0b8" />
      <rect x="88" y="58" width="24" height="14" rx="4" fill="#8ca0b8" />
    </svg>
  );
}

/** Parachute SVG — with swing animation */
function ParachuteSVG() {
  return (
    <svg viewBox="0 0 200 140" className="edl-phase-svg parachute-swing" xmlns="http://www.w3.org/2000/svg">
      {/* Parachute dome */}
      <path d="M60,70 Q100,10 140,70 Z" fill="#1a6eb5" opacity="0.6" />
      <path d="M60,70 Q100,10 140,70 Z" fill="none" stroke="#4a9ede" strokeWidth="1.5" />
      {/* Suspension lines */}
      <line x1="75" y1="68" x2="95" y2="105" stroke="#8ca0b8" strokeWidth="0.8" />
      <line x1="100" y1="66" x2="100" y2="105" stroke="#8ca0b8" strokeWidth="0.8" />
      <line x1="125" y1="68" x2="105" y2="105" stroke="#8ca0b8" strokeWidth="0.8" />
      {/* Capsule */}
      <rect x="88" y="105" width="24" height="16" rx="4" fill="#8ca0b8" />
      {/* Canopy panels */}
      <path d="M60,70 Q80,40 100,38" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.4" />
      <path d="M140,70 Q120,40 100,38" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.4" />
    </svg>
  );
}

/** Powered Descent SVG — animated retro-rocket flames */
function RocketSVG() {
  return (
    <svg viewBox="0 0 200 140" className="edl-phase-svg" xmlns="http://www.w3.org/2000/svg">
      {/* Rocket body */}
      <rect x="82" y="20" width="36" height="60" rx="6" fill="#8ca0b8" />
      <polygon points="100,10 82,30 118,30" fill="#8ca0b8" />
      {/* Engine nozzles */}
      <polygon points="86,80 82,95 92,95 90,80" fill="#555" />
      <polygon points="114,80 118,95 108,95 110,80" fill="#555" />
      {/* Animated flames */}
      <g className="flame-anim">
        <path d="M84,95 Q87,115 90,108 Q93,120 96,112 Q99,125 100,118" fill="none"
          stroke="#ff6b35" strokeWidth="3" strokeLinecap="round" />
        <path d="M116,95 Q113,115 110,108 Q107,120 104,112 Q101,125 100,118" fill="none"
          stroke="#e8813a" strokeWidth="3" strokeLinecap="round" />
      </g>
      {/* Ground surface */}
      <rect x="20" y="128" width="160" height="4" rx="2" fill="#c1440e" opacity="0.6" />
    </svg>
  );
}

/** Sky Crane SVG — rover + cable descent stage */
function SkyCraneSVG() {
  return (
    <svg viewBox="0 0 200 150" className="edl-phase-svg" xmlns="http://www.w3.org/2000/svg">
      {/* Descent stage body (top) */}
      <rect x="60" y="15" width="80" height="30" rx="4" fill="#8ca0b8" />
      {/* Rocket nozzles */}
      <rect x="67" y="45" width="10" height="14" rx="2" fill="#555" />
      <rect x="123" y="45" width="10" height="14" rx="2" fill="#555" />
      {/* Bridle cables */}
      <line x1="80" y1="59" x2="75" y2="99" stroke="#8ca0b8" strokeWidth="1.2"
        strokeDasharray="3 2" />
      <line x1="120" y1="59" x2="125" y2="99" stroke="#8ca0b8" strokeWidth="1.2"
        strokeDasharray="3 2" />
      <line x1="100" y1="45" x2="100" y2="99" stroke="#8ca0b8" strokeWidth="1.2"
        strokeDasharray="3 2" />
      {/* Rover body (bottom) */}
      <rect x="68" y="99" width="64" height="30" rx="4" fill="#8ca0b8" />
      {/* Rover wheels */}
      <circle cx="76" cy="133" r="7" fill="none" stroke="#8ca0b8" strokeWidth="2" />
      <circle cx="100" cy="133" r="7" fill="none" stroke="#8ca0b8" strokeWidth="2" />
      <circle cx="124" cy="133" r="7" fill="none" stroke="#8ca0b8" strokeWidth="2" />
      {/* Mast/camera */}
      <line x1="100" y1="99" x2="100" y2="83" stroke="#8ca0b8" strokeWidth="1.5" />
      <circle cx="100" cy="82" r="4" fill="#4a9ede" />
      {/* Small flame wisps */}
      <g className="flame-anim">
        <path d="M69,59 Q72,72 75,59" fill="none" stroke="#e8813a" strokeWidth="2" opacity="0.7" />
        <path d="M125,59 Q128,72 131,59" fill="none" stroke="#e8813a" strokeWidth="2" opacity="0.7" />
      </g>
    </svg>
  );
}

const PHASE_SVGS = [HeatshieldSVG, ParachuteSVG, RocketSVG, SkyCraneSVG];

/**
 * Section4EDL — Full EDL interactive section.
 */
function Section4EDL() {
  const [activePhase, setActivePhase] = useState(0);
  const [direction, setDirection] = useState(1);
  const [flippedCards, setFlippedCards] = useState({});

  const goToPhase = useCallback((idx) => {
    setDirection(idx > activePhase ? 1 : -1);
    setActivePhase(idx);
    setFlippedCards({});
  }, [activePhase]);

  const nextPhase = useCallback(() => {
    if (activePhase < PHASE_COUNT - 1) goToPhase(activePhase + 1);
  }, [activePhase, goToPhase]);

  const prevPhase = useCallback(() => {
    if (activePhase > 0) goToPhase(activePhase - 1);
  }, [activePhase, goToPhase]);

  const toggleFlip = useCallback(() => {
    setFlippedCards((prev) => ({ ...prev, [activePhase]: !prev[activePhase] }));
  }, [activePhase]);

  const phase = EDL_PHASES[activePhase];
  const PhaseSVG = PHASE_SVGS[activePhase];

  /* Create entry streaks */
  const streaks = useMemo(() => {
    return Array.from({ length: ENTRY_STREAK_COUNT }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      height: `${30 + Math.random() * 60}vh`,
      animationDuration: `${2 + Math.random() * 4}s`,
      animationDelay: `${Math.random() * 3}s`,
      opacity: 0.05 + Math.random() * 0.1,
    }));
  }, []);

  return (
    <section
      className="section section-edl"
      id="section-edl"
      aria-label="7 Minutes of Terror — Entry, Descent, Landing"
    >
      {/* Re-entry streaks background */}
      <div className="edl-background">
        {streaks.map((s, i) => (
          <div
            key={i}
            className="entry-streak"
            style={{
              left: s.left,
              height: s.height,
              animationDuration: s.animationDuration,
              animationDelay: s.animationDelay,
              opacity: s.opacity,
            }}
          />
        ))}
      </div>

      <div className="edl-content">
        {/* Header */}
        <div className="edl-header">
          <div className="launch-briefing-label">ENTRY · DESCENT · LANDING</div>
          <h2>7 Minutes of Terror</h2>
          <p className="edl-subtitle">{NARRATIVE_TEXT.section4}</p>
        </div>

        {/* Phase stepper bar with labels and progress line */}
        <div className="phase-stepper" role="tablist" aria-label="EDL phases">
          <div className="stepper-track">
            {/* Background track line */}
            <div className="stepper-track-bg" />
            {/* Active progress line */}
            <div
              className="stepper-track-fill"
              style={{ width: `${(activePhase / (PHASE_COUNT - 1)) * 100}%` }}
            />
          </div>
          {EDL_PHASES.map((_, idx) => (
            <button
              key={idx}
              className={`stepper-item ${idx === activePhase ? 'active' : ''} ${idx < activePhase ? 'done' : ''}`}
              onClick={() => goToPhase(idx)}
              role="tab"
              aria-selected={idx === activePhase}
              aria-label={`Phase ${idx + 1}: ${EDL_PHASES[idx].title}`}
              data-hoverable="true"
            >
              <div className="stepper-dot" />
              <span className="stepper-label">{PHASE_SHORT_TITLES[idx]}</span>
            </button>
          ))}
        </div>

        {/* Phase data line (replaces incorrect coordinate display) */}
        <div className="edl-phase-data-line hud-text">
          {PHASE_DATA[activePhase]}
        </div>

        {/* Phase card */}
        <div className="edl-phase-container">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activePhase}
              className="edl-phase"
              initial={{ opacity: 0, x: direction > 0 ? 60 : -60, filter: 'blur(4px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: direction > 0 ? -60 : 60, filter: 'blur(4px)' }}
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className={`edl-card ${flippedCards[activePhase] ? 'flipped' : ''}`}>
                {/* Front */}
                <div className="edl-card-front">
                  <PhaseSVG />
                  <h3 className="edl-phase-title">{phase.title}</h3>
                  <div className="edl-phase-stats">{phase.stats}</div>
                  <p className="edl-phase-desc">{phase.description}</p>
                  <button
                    className="edl-card-toggle"
                    onClick={toggleFlip}
                    aria-label={`Show mission data for ${phase.title}`}
                    data-hoverable="true"
                  >
                    MISSION DATA →
                  </button>
                </div>
                {/* Back */}
                <div className="edl-card-back">
                  <h3 className="edl-phase-title">Engineering Specs</h3>
                  <div className="edl-phase-stats" style={{ textAlign: 'left' }}>
                    {phase.backSpecs.map((spec, i) => (
                      <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid var(--hud-dim)' }}>
                        {spec}
                      </div>
                    ))}
                  </div>
                  <button
                    className="edl-card-toggle"
                    onClick={toggleFlip}
                    aria-label="Return to phase overview"
                    data-hoverable="true"
                  >
                    ← OVERVIEW
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="edl-nav">
          <button
            onClick={prevPhase}
            disabled={activePhase === 0}
            aria-label="Previous phase"
            data-hoverable="true"
            style={{ opacity: activePhase === 0 ? 0.3 : 1 }}
          >
            ← PREV PHASE
          </button>
          <button
            onClick={nextPhase}
            disabled={activePhase === PHASE_COUNT - 1}
            aria-label="Next phase"
            data-hoverable="true"
            style={{ opacity: activePhase === PHASE_COUNT - 1 ? 0.3 : 1 }}
          >
            NEXT PHASE →
          </button>
        </div>
      </div>
    </section>
  );
}

export default memo(Section4EDL);
