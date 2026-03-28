/**
 * Section5Surface — "SOL 1" Mars surface base.
 * Features: Three.js terrain with rocks, base module cards with hover states,
 * weather HUD, send-message-to-Earth with radio wave animation, dust particles,
 * Mars terrain mountain silhouette, Konami code Easter egg.
 * @module Section5Surface
 */
import { memo, useState, useRef, useEffect, useCallback, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { NARRATIVE_TEXT, BASE_MODULES } from '../../utils/telemetryData';
import { generateWeatherReading, formatTemperature, formatWindSpeed } from '../../utils/marsWeather';
import { calculateSignalDelay } from '../../utils/lightSpeedDelay';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';

/** Number of floating dust particles */
const DUST_PARTICLE_COUNT = 30;
/** Weather update interval in ms */
const WEATHER_UPDATE_INTERVAL_MS = 5000;

/** Mars terrain mesh with rocks */
function MarsTerrain() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[30, 30, 32, 32]} />
        <meshStandardMaterial
          color="#c1440e"
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>
      {/* Some rocks */}
      {[
        { pos: [-3, -0.7, -2], scale: 0.3 },
        { pos: [4, -0.8, -1], scale: 0.2 },
        { pos: [-1, -0.85, 1], scale: 0.15 },
        { pos: [2, -0.75, -3], scale: 0.25 },
        { pos: [-5, -0.82, 0], scale: 0.22 },
        { pos: [6, -0.78, -2], scale: 0.18 },
      ].map((rock, i) => (
        <mesh key={i} position={rock.pos} scale={rock.scale}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#8a2f08" roughness={0.98} />
        </mesh>
      ))}
    </group>
  );
}

/** Mars scene with fog and warm lighting */
function MarsScene() {
  return (
    <>
      <ambientLight intensity={0.25} color="#e8813a" />
      <directionalLight position={[10, 8, 5]} intensity={0.8} color="#f5deb3" />
      <fog attach="fog" args={['#1a0800', 5, 25]} />
      <MarsTerrain />
    </>
  );
}

/** Base module icon SVGs */
const ModuleIcons = {
  Habitat: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--hud-green)" strokeWidth="1.5">
      <path d="M3 21V10L12 3L21 10V21H15V14H9V21H3Z" />
    </svg>
  ),
  'Power Array': () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--hud-green)" strokeWidth="1.5">
      <rect x="3" y="6" width="18" height="12" rx="1" />
      <line x1="8" y1="6" x2="8" y2="18" />
      <line x1="12" y1="6" x2="12" y2="18" />
      <line x1="16" y1="6" x2="16" y2="18" />
      <circle cx="12" cy="3" r="1.5" />
    </svg>
  ),
  Greenhouse: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--hud-green)" strokeWidth="1.5">
      <path d="M12 22V8" />
      <path d="M8 12C8 8 12 6 12 6C12 6 16 8 16 12" />
      <path d="M6 16C6 12 12 8 12 8C12 8 18 12 18 16" />
      <line x1="4" y1="22" x2="20" y2="22" />
    </svg>
  ),
  'Comms Tower': () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--hud-green)" strokeWidth="1.5">
      <line x1="12" y1="22" x2="12" y2="8" />
      <circle cx="12" cy="6" r="2" className="comms-light" fill="var(--mars-rust)" />
      <path d="M8 4C8 4 10 2 12 2C14 2 16 4 16 4" />
      <path d="M6 6C6 6 8 2 12 2C16 2 18 6 18 6" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  ),
};

/**
 * Section5Surface — Full Sol 1 surface section.
 */
function Section5Surface() {
  const { isMobile } = useDeviceDetect();
  const [weather, setWeather] = useState(generateWeatherReading);
  const [selectedModule, setSelectedModule] = useState(null);
  const [message, setMessage] = useState('');
  const [transmitting, setTransmitting] = useState(false);
  const [delivered, setDelivered] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const konamiRef = useRef([]);

  /* Weather updates */
  useEffect(() => {
    const interval = setInterval(() => {
      setWeather(generateWeatherReading());
    }, WEATHER_UPDATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  /* Konami code */
  useEffect(() => {
    const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    const handleKeyDown = (e) => {
      konamiRef.current.push(e.code);
      if (konamiRef.current.length > KONAMI.length) {
        konamiRef.current.shift();
      }
      if (konamiRef.current.join(',') === KONAMI.join(',')) {
        setShowEasterEgg(true);
        setTimeout(() => setShowEasterEgg(false), 5000);
        konamiRef.current = [];
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /* Send message to Earth with radio wave animation */
  const handleSendMessage = useCallback(() => {
    if (!message.trim() || transmitting) return;
    setTransmitting(true);
    setDelivered(false);
    setMessage('');

    // Simulate transmission time
    setTimeout(() => {
      setTransmitting(false);
      setDelivered(true);
      setTimeout(() => setDelivered(false), 6000);
    }, 2500);
  }, [message, transmitting]);

  /* Dust particles */
  const dustParticles = useMemo(() => {
    return Array.from({ length: DUST_PARTICLE_COUNT }, (_, i) => ({
      id: i,
      top: `${10 + Math.random() * 70}%`,
      animationDuration: `${15 + Math.random() * 25}s`,
      animationDelay: `${Math.random() * 15}s`,
      size: `${1 + Math.random() * 2}px`,
      opacity: 0.15 + Math.random() * 0.2,
    }));
  }, []);

  const pixelRatio = isMobile ? 1 : Math.min(window.devicePixelRatio, 2);
  const signalInfo = calculateSignalDelay();

  return (
    <section
      className="section section-surface"
      id="section-surface"
      aria-label="Sol 1 — Mars surface base"
    >
      {/* Sky gradient */}
      <div className="surface-sky" />

      {/* Three.js terrain */}
      <div className="surface-canvas">
        <Suspense fallback={null}>
          <Canvas
            dpr={pixelRatio}
            camera={{ position: [0, 2, 8], fov: 55 }}
            style={{ background: 'transparent' }}
          >
            <MarsScene />
          </Canvas>
        </Suspense>
      </div>

      {/* Mars terrain mountain silhouette (SVG overlay) */}
      <svg
        className="mars-mountain-silhouette"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Distant mountains (back layer) */}
        <path
          d="M0,120 L0,80 L80,55 L160,75 L240,40 L340,65 L420,30 L500,58
             L580,45 L660,70 L740,35 L820,60 L900,42 L980,68 L1060,30
             L1140,55 L1220,45 L1300,70 L1380,50 L1440,65 L1440,120 Z"
          fill="#6b1a0a"
          opacity="0.5"
        />
        {/* Near terrain (front layer) */}
        <path
          d="M0,120 L0,100 L120,88 L240,105 L360,82 L480,98 L600,85
             L720,102 L840,88 L960,105 L1080,82 L1200,95 L1320,88 L1440,100 L1440,120 Z"
          fill="#3d0e04"
          opacity="0.8"
        />
      </svg>

      {/* Dust particles */}
      {dustParticles.map((dp) => (
        <div
          key={dp.id}
          className="dust-particle"
          style={{
            top: dp.top,
            left: '-10px',
            width: dp.size,
            height: dp.size,
            opacity: dp.opacity,
            animation: `dust-float ${dp.animationDuration} linear ${dp.animationDelay} infinite`,
          }}
        />
      ))}

      {/* Narrative */}
      <div className="surface-narrative">
        <div className="launch-briefing-label">MARS SURFACE · JEZERO CRATER</div>
        <h2>Sol 1</h2>
        <p>{NARRATIVE_TEXT.section5}</p>
      </div>

      {/* Weather HUD */}
      <div className="surface-weather hud-border">
        <div className="weather-header">Mars Weather</div>
        <div className="weather-row">
          <span className="weather-label">TEMP</span>
          <span className="weather-value">{formatTemperature(weather.temperature)}</span>
        </div>
        <div className="weather-row">
          <span className="weather-label">WIND</span>
          <span className="weather-value">{formatWindSpeed(weather.windSpeed)}</span>
        </div>
        <div className="weather-row">
          <span className="weather-label">DUST STORM</span>
          <span className="weather-value">{weather.dustProbability}%</span>
        </div>
        <div className="weather-row">
          <span className="weather-label">PRESSURE</span>
          <span className="weather-value">{weather.pressure} kPa</span>
        </div>
      </div>

      {/* Base modules */}
      <div className="surface-modules">
        {BASE_MODULES.map((mod) => {
          const IconComponent = ModuleIcons[mod.name];
          return (
            <button
              key={mod.name}
              className="base-module"
              style={{ top: mod.position.top, left: mod.position.left }}
              onClick={() => setSelectedModule(mod)}
              aria-label={`Base module: ${mod.name} — click for details`}
              data-hoverable="true"
              role="button"
              tabIndex={0}
            >
              <div className="base-module-icon module-icon">
                {IconComponent && <IconComponent />}
              </div>
              <span className="base-module-name">{mod.name}</span>
            </button>
          );
        })}
      </div>

      {/* Message to Earth */}
      <div className="message-panel">
        <div className="hud-text" style={{ marginBottom: '8px', opacity: 0.7 }}>
          SEND MESSAGE TO EARTH
        </div>
        <div className="message-input-wrapper" style={{ position: 'relative' }}>
          <input
            className="message-input"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            maxLength={120}
            aria-label="Message to Earth input"
          />
          <button
            onClick={handleSendMessage}
            aria-label="Send message to Earth"
            data-hoverable="true"
            disabled={!message.trim() || transmitting}
            style={{ opacity: message.trim() && !transmitting ? 1 : 0.3, whiteSpace: 'nowrap' }}
          >
            TRANSMIT
          </button>

          {/* Radio wave rings animation */}
          <AnimatePresence>
            {transmitting && (
              <div className="radio-rings" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="radio-ring"
                    initial={{ scale: 0, opacity: 0.8 }}
                    animate={{ scale: 3, opacity: 0 }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.3,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Transmitting state */}
        <AnimatePresence>
          {transmitting && (
            <motion.div
              className="message-result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ color: 'var(--hud-green)' }}
            >
              TRANSMITTING...
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delivered confirmation */}
        <AnimatePresence>
          {delivered && (
            <motion.div
              className="delivery-confirm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <span className="delivery-icon">✓</span>
              MESSAGE DELIVERED · SIGNAL TRAVEL TIME: {signalInfo.formatted.toUpperCase()}
              <br />
              <small style={{ opacity: 0.6 }}>
                At 225,000,000 km · Speed of light: 299,792 km/s
              </small>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Module detail panel */}
      <AnimatePresence>
        {selectedModule && (
          <motion.div
            className="detail-panel"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="detail-panel-header">
              <h3>{selectedModule.name}</h3>
              <button
                className="detail-panel-close"
                onClick={() => setSelectedModule(null)}
                aria-label={`Close ${selectedModule.name} details`}
                data-hoverable="true"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <line x1="2" y1="2" x2="12" y2="12" stroke="var(--star-white)" strokeWidth="1.5" />
                  <line x1="12" y1="2" x2="2" y2="12" stroke="var(--star-white)" strokeWidth="1.5" />
                </svg>
              </button>
            </div>
            <div className="detail-panel-specs">
              {selectedModule.specs.map((spec, i) => (
                <div className="detail-spec" key={i}>
                  <div className="detail-spec-label">{spec.label}</div>
                  <div className="detail-spec-value">{spec.value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dancing astronaut Easter egg */}
      {showEasterEgg && (
        <div className="dancing-astronaut">
          <svg width="80" height="120" viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Helmet */}
            <circle cx="40" cy="25" r="18" fill="var(--chrome)" stroke="var(--star-white)" strokeWidth="1.5" />
            <circle cx="40" cy="25" r="12" fill="var(--earth-blue)" opacity="0.3" />
            <path d="M34 22 Q40 28 46 22" stroke="var(--hud-green)" strokeWidth="1" fill="none" />
            {/* Body */}
            <rect x="25" y="43" width="30" height="35" rx="8" fill="var(--star-white)" opacity="0.9" />
            {/* Arms */}
            <line x1="25" y1="55" x2="10" y2="40" stroke="var(--star-white)" strokeWidth="5" strokeLinecap="round" />
            <line x1="55" y1="55" x2="70" y2="40" stroke="var(--star-white)" strokeWidth="5" strokeLinecap="round" />
            {/* Legs */}
            <line x1="33" y1="78" x2="28" y2="105" stroke="var(--star-white)" strokeWidth="5" strokeLinecap="round" />
            <line x1="47" y1="78" x2="52" y2="105" stroke="var(--star-white)" strokeWidth="5" strokeLinecap="round" />
            {/* Boots */}
            <rect x="22" y="102" width="12" height="8" rx="3" fill="var(--chrome)" />
            <rect x="46" y="102" width="12" height="8" rx="3" fill="var(--chrome)" />
            {/* Backpack */}
            <rect x="28" y="45" width="8" height="20" rx="3" fill="var(--chrome)" opacity="0.5" />
          </svg>
        </div>
      )}
    </section>
  );
}

export default memo(Section5Surface);
