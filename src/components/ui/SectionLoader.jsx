/**
 * SectionLoader — Cinematic telemetry-style loading screen.
 * Features: Typewriter text, scanning line, progress dots, HUD aesthetics.
 */
import { useEffect, useState } from 'react';
import './SectionLoader.css';

const LOADING_MESSAGES = [
  'INITIALIZING SUBSYSTEMS...',
  'ESTABLISHING TELEMETRY LINK...',
  'SYNCING ORBITAL COORDINATES...',
  'CALIBRATING ENTRY INTERFACE...',
  'LOADING MARS SURFACE DATA...',
];

function SectionLoader() {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="section-loader">
      <div className="loader-scanning-line" />
      <div className="loader-content">
        <div className="loader-hud-label">MISSION STATUS // STANDBY</div>
        <div className="loader-message typewriter">{LOADING_MESSAGES[msgIdx]}</div>
        <div className="loader-progress-bar">
          <div className="loader-progress-fill" />
        </div>
        <div className="loader-telemetry-grid">
          <div>LAT: 18.65°N</div>
          <div>LON: 226.2°E</div>
          <div>ALT: -- KM</div>
          <div>SPD: -- KM/S</div>
        </div>
      </div>
    </div>
  );
}

export default SectionLoader;
