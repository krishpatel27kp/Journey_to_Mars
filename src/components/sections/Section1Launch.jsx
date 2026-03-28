/**
 * Section1Launch — "T-MINUS ZERO" Earth launch sequence.
 * Features: Three.js Earth globe with atmosphere glow, typewriter text,
 * countdown, rocket liftoff SVG, telemetry ticker, INITIATE LAUNCH button.
 * @module Section1Launch
 */
import { memo, useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NARRATIVE_TEXT, TELEMETRY_ITEMS, MISSION_DATA } from '../../utils/telemetryData';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';

/** Typewriter character delay in milliseconds */
const TYPEWRITER_DELAY_MS = 40;
/** Countdown start number */
const COUNTDOWN_START = 10;
/** Earth sphere radius */
const EARTH_RADIUS = 2;
/** Rotation speed (radians per frame) */
const EARTH_ROTATION_SPEED = 0.001;
/** Earth texture URL — Blue Marble via three.js examples */
const EARTH_TEXTURE_URL = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg';
/** Background star count */
const STAR_COUNT = 1500;
/** Atmosphere glowing shell radius (slightly larger than Earth) */
const ATMOS_RADIUS = 2.12;

/** Generate star positions eagerly */
function generateStarPositions(count) {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i += 3) {
    arr[i] = (Math.random() - 0.5) * 50;
    arr[i + 1] = (Math.random() - 0.5) * 50;
    arr[i + 2] = (Math.random() - 0.5) * 50 - 10;
  }
  return arr;
}

/**
 * Rotating Earth mesh with cloud layer and atmospheric glow.
 * @param {{ onHover: Function, onUnhover: Function }} props
 */
function EarthGlobe({ onHover, onUnhover }) {
  const meshRef = useRef();
  const cloudRef = useRef();
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      EARTH_TEXTURE_URL,
      (tex) => setTexture(tex),
      undefined,
      (err) => console.warn('Earth texture failed to load, falling back to blue color.', err)
    );
  }, []);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += EARTH_ROTATION_SPEED;
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y += EARTH_ROTATION_SPEED * 1.3;
    }
  });

  return (
    <group>
      {/* Main Earth sphere */}
      <mesh
        ref={meshRef}
        onPointerOver={onHover}
        onPointerOut={onUnhover}
      >
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
        {texture ? (
          <meshStandardMaterial map={texture} roughness={0.6} />
        ) : (
          <meshStandardMaterial color="#1a6eb5" roughness={0.6} metalness={0.2} />
        )}
      </mesh>
      {/* Cloud layer — subtle translucent shell */}
      <mesh ref={cloudRef}>
        <sphereGeometry args={[EARTH_RADIUS + 0.02, 64, 64]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </mesh>
      {/* Atmosphere glow (BackSide shader) */}
      <mesh>
        <sphereGeometry args={[ATMOS_RADIUS, 64, 64]} />
        <meshBasicMaterial
          color="#4a9ede"
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

/** Starfield background for Earth scene */
function EarthStars() {
  const positions = useMemo(() => generateStarPositions(STAR_COUNT), []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={STAR_COUNT}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#e8e4d8" size={0.05} sizeAttenuation transparent opacity={0.8} />
    </points>
  );
}

/** Error boundary fallback for canvas */
function CanvasFallback() {
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--deep)', color: 'var(--chrome)',
      fontFamily: 'var(--font-display)', fontSize: '12px',
      letterSpacing: '0.15em',
    }}>
      INITIALIZING EARTH RENDER...
    </div>
  );
}

/**
 * Section1Launch — Full T-Minus Zero launch section.
 */
function Section1Launch() {
  const { isMobile, isTablet } = useDeviceDetect();
  const [displayedText, setDisplayedText] = useState('');
  const [countdown, setCountdown] = useState(COUNTDOWN_START);
  const [countdownDone, setCountdownDone] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [rocketLaunched, setRocketLaunched] = useState(false);
  const indexRef = useRef(0);
  const sectionRef = useRef(null);

  /* Typewriter effect */
  useEffect(() => {
    const text = NARRATIVE_TEXT.section1;
    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.substring(0, indexRef.current + 1));
        indexRef.current += 1;
      } else {
        clearInterval(interval);
      }
    }, TYPEWRITER_DELAY_MS);
    return () => clearInterval(interval);
  }, []);

  /* Countdown timer */
  useEffect(() => {
    if (countdown <= 0) {
      setCountdownDone(true);
      return;
    }
    const timeout = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timeout);
  }, [countdown]);

  const handleLaunch = useCallback(() => {
    setRocketLaunched(true);
    setTimeout(() => {
      window.scrollTo({ top: window.innerHeight * 1.2, behavior: 'smooth' });
    }, 800);
  }, []);

  const handleEarthHover = useCallback(() => setShowTooltip(true), []);
  const handleEarthUnhover = useCallback(() => setShowTooltip(false), []);

  const pixelRatio = isMobile ? 1 : isTablet ? 1.5 : Math.min(window.devicePixelRatio, 2);

  return (
    <section
      ref={sectionRef}
      className="section section-launch"
      id="section-launch"
      aria-label="T-Minus Zero — Earth launch sequence"
    >
      {/* Content */}
      <div className="launch-content">
        <div className="launch-briefing">
          <div className="launch-briefing-label">MISSION CONTROL · KENNEDY SPACE CENTER</div>
          <h1>T-Minus Zero</h1>
          <div className="launch-narrative">
            <p>{displayedText}<span className="typewriter-cursor" /></p>
          </div>
          <div className="launch-countdown" aria-live="polite" aria-label={`Countdown: ${countdown}`}>
            T-{String(countdown).padStart(2, '0')}
          </div>
          {countdownDone && (
            <button
              className="launch-button"
              onClick={handleLaunch}
              aria-label="Initiate launch sequence"
              data-hoverable="true"
            >
              INITIATE LAUNCH
            </button>
          )}
        </div>
      </div>

      {/* Three.js Earth */}
      <div className="launch-canvas">
        <Suspense fallback={<CanvasFallback />}>
          <Canvas
            dpr={pixelRatio}
            camera={{ position: [0, 0, 5], fov: 50 }}
            style={{ background: 'transparent' }}
          >
            <ambientLight intensity={0.3} />
            <directionalLight position={[5, 3, 5]} intensity={2.5} />
            <Suspense fallback={null}>
              <EarthGlobe onHover={handleEarthHover} onUnhover={handleEarthUnhover} />
            </Suspense>
            <EarthStars />
          </Canvas>
        </Suspense>

        {/* Earth tooltip */}
        <div className={`earth-tooltip ${showTooltip ? 'visible' : ''}`}
          style={{ bottom: '60px', right: '60px' }}
        >
          LAUNCH COORDS: {MISSION_DATA.launchCoords}
          <br />
          {MISSION_DATA.launchSite}
        </div>

        {/* Rocket SVG overlay */}
        <svg
          id="rocket-svg"
          className={`rocket-launch-svg ${rocketLaunched ? 'launched' : ''}`}
          viewBox="0 0 60 140"
          width="60"
          height="140"
          aria-hidden="true"
        >
          {/* Body */}
          <rect x="20" y="40" width="20" height="70" rx="4" fill="#8ca0b8" />
          {/* Nose cone */}
          <polygon points="30,5 20,45 40,45" fill="#8ca0b8" />
          {/* Fins */}
          <polygon points="20,95 8,120 20,110" fill="#6a8098" />
          <polygon points="40,95 52,120 40,110" fill="#6a8098" />
          {/* Engine bell */}
          <polygon points="22,110 18,125 42,125 38,110" fill="#555" />
          {/* Window */}
          <circle cx="30" cy="65" r="6" fill="#1a6eb5" opacity="0.8" />
          <circle cx="30" cy="65" r="4" fill="#4a9ede" opacity="0.5" />
          {/* Exhaust */}
          <g className="rocket-exhaust">
            <ellipse cx="30" cy="130" rx="8" ry="5" fill="#ff6b35" opacity="0.9">
              <animate attributeName="ry" values="5;7;5" dur="0.2s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="30" cy="138" rx="5" ry="3" fill="#e8813a" opacity="0.6">
              <animate attributeName="ry" values="3;5;3" dur="0.15s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="30" cy="144" rx="3" ry="2" fill="#ffaa44" opacity="0.4">
              <animate attributeName="ry" values="2;4;2" dur="0.18s" repeatCount="indefinite" />
            </ellipse>
          </g>
        </svg>
      </div>

      {/* Scroll prompt */}
      {countdownDone && !rocketLaunched && (
        <div className="scroll-prompt">
          <span>Scroll to Launch</span>
          <div className="scroll-arrow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 4L12 20M12 20L6 14M12 20L18 14" stroke="var(--hud-green)" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      )}

      {/* Telemetry ticker */}
      <div className="launch-telemetry">
        <div className="telemetry-track">
          {[...TELEMETRY_ITEMS, ...TELEMETRY_ITEMS].map((item, i) => (
            <span className="telemetry-item" key={i}>
              {item.label}:<span className="telemetry-value">{item.value}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(Section1Launch);
