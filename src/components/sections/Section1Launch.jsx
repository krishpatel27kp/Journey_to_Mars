/**
 * Section1Launch — "T-MINUS ZERO" Earth launch sequence.
 * Features: Three.js Earth globe with atmosphere glow, typewriter text,
 * countdown, rocket liftoff SVG, telemetry ticker, INITIATE LAUNCH button.
 * @module Section1Launch
 */
import React, { memo, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NARRATIVE_TEXT, TELEMETRY_ITEMS, MISSION_DATA } from '../../utils/telemetryData';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';
import { MissionStars } from '../visuals/MissionStars';

/** Typewriter character delay in milliseconds */
const TYPEWRITER_DELAY_MS = 40;
/** Countdown start number */
const COUNTDOWN_START = 10;
/** Earth sphere radius */
const EARTH_RADIUS = 2;
/** Rotation speed (radians per frame) */
const EARTH_ROTATION_SPEED = 0.001;
/** Earth texture — Local asset (no network dependency) */
const EARTH_TEXTURE_URL = '/textures/earth_2k.jpg';
const EARTH_NIGHT_TEXTURE_URL = '/textures/earth_night_2k.png';
/** Background star count */
const STAR_COUNT = 1500;
/** Atmosphere glowing shell radius (slightly larger than Earth) */
const ATMOS_RADIUS = 2.05;



/** Rotating Earth mesh with high-fidelity layers */
function EarthGlobe({ onHover, onUnhover }) {
  const meshRef = useRef();
  const cloudRef = useRef();
  const [textures, setTextures] = useState({ day: null, night: null });

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    
    const loadTex = (url) => new Promise((res) => loader.load(url, res));
    
    Promise.all([
      loadTex(EARTH_TEXTURE_URL),
      loadTex(EARTH_NIGHT_TEXTURE_URL)
    ]).then(([day, night]) => {
      day.colorSpace = THREE.SRGBColorSpace;
      night.colorSpace = THREE.SRGBColorSpace;
      setTextures({ day, night });
    }).catch(err => console.warn('Earth textures failed to load', err));
  }, []);

  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.y += EARTH_ROTATION_SPEED;
    if (cloudRef.current) cloudRef.current.rotation.y += EARTH_ROTATION_SPEED * 1.3;
  });

  return (
    <group>
      {/* Main Earth sphere */}
      <mesh ref={meshRef} onPointerOver={onHover} onPointerOut={onUnhover}>
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
        <meshStandardMaterial 
          map={textures.day} 
          emissiveMap={textures.night}
          emissive="#ffffcc"
          emissiveIntensity={textures.night ? 2.5 : 0}
          roughness={0.7} 
          metalness={0.1} 
          color={textures.day ? '#fff' : '#1a6eb5'} 
        />
      </mesh>
      {/* Clouds */}
      <mesh ref={cloudRef}>
        <sphereGeometry args={[EARTH_RADIUS + 0.05, 64, 64]} />
        <meshStandardMaterial color="#fff" transparent opacity={0.3} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* Atmosphere */}
      <mesh>
        <sphereGeometry args={[ATMOS_RADIUS + 0.1, 32, 32]} />
        <meshBasicMaterial color="#4fb2ff" transparent opacity={0.15} blending={THREE.AdditiveBlending} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

/** Grand Solar System Overview — Concentric Rings & Sun */
function SolarSystemOverview() {
  const groupRef = useRef();
  const planets = useMemo(() => [
    { name: 'MERCURY', dist: 8, size: 0.15, color: '#999', speed: 1.6 },
    { name: 'VENUS', dist: 12, size: 0.35, color: '#e3bb76', speed: 1.17 },
    { name: 'EARTH', dist: 18, size: 0.45, color: '#1a6eb5', speed: 1 },
    { name: 'MARS', dist: 25, size: 0.3, color: '#c1440e', speed: 0.8 },
    { name: 'JUPITER', dist: 40, size: 1.2, color: '#d39c7e', speed: 0.4 },
    { name: 'SATURN', dist: 55, size: 1.0, color: '#c5ab6e', speed: 0.3 },
  ], []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime * 0.2;
    groupRef.current.children.forEach((group, i) => {
      if (i === 0) return; // Skip Sun
      const p = planets[i - 1];
      const angle = time * p.speed + (i * 1.5);
      group.position.x = Math.cos(angle) * p.dist;
      group.position.z = Math.sin(angle) * p.dist;
    });
  });

  return (
    <group ref={groupRef}>
      {/* Glowing Sun */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[4, 64, 64]} />
        <meshBasicMaterial color="#ffcc33" />
        <pointLight intensity={10} distance={150} color="#ffcc33" />
      </mesh>
      
      {planets.map((p) => (
        <group key={p.name}>
          {/* Orbital Ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[p.dist - 0.05, p.dist + 0.05, 128]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.15} side={THREE.DoubleSide} />
          </mesh>
          {/* Planet Body */}
          <group>
            <mesh>
              <sphereGeometry args={[p.size, 32, 32]} />
              <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={0.2} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}

/** Starfield background for Earth scene */

/** 
 * Procedural 3D Spacecraft — Shared design for mission continuity
 */
function Spacecraft3D({ launched }) {
  const groupRef = useRef();
  const engineRef = useRef();
  const velocity = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;

    if (launched) {
      // Accelerate upwards smoothly (Starship style)
      velocity.current += delta * 1.2;
      groupRef.current.position.y += velocity.current;
      groupRef.current.position.z -= velocity.current * 0.3; // Clean outward arc
      
// Engine flicker intensity (Cyan Starship flare)
       if (engineRef.current) {
         engineRef.current.scale.y = 1.5 + Math.sin(time * 30) * 0.2;
         // Use deterministic values instead of Math.random for flicker effect
         const flickerBase = 8;
         const flickerVariation = Math.sin(time * 20) * 2; // Oscillating value instead of random
         engineRef.current.material.emissiveIntensity = flickerBase + flickerVariation;
       }
     } else {
       // Pre-launch static state
       if (engineRef.current) {
         engineRef.current.scale.y = 0.5 + Math.sin(time * 15) * 0.1;
         // Use deterministic values instead of Math.random for flicker effect
         const flickerBase = 2;
         const flickerVariation = Math.sin(time * 10); // Oscillating value instead of random
         engineRef.current.material.emissiveIntensity = flickerBase + flickerVariation;
       }
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.45, 3]} scale={0.35}>
      {/* Main Hull */}
      <mesh>
        <cylinderGeometry args={[0.3, 0.4, 1.2, 32]} />
        <meshStandardMaterial color="#c0c0c8" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Nose Cone */}
      <mesh position={[0, 0.8, 0]}>
        <coneGeometry args={[0.3, 0.5, 32]} />
        <meshStandardMaterial color="#c0c0c8" />
      </mesh>
      {/* Fins */}
      {[0, 180].map((deg) => (
        <mesh key={deg} rotation={[0, (deg * Math.PI) / 180, 0]} position={[0, -0.4, 0]}>
          <boxGeometry args={[0.6, 0.3, 0.05]} />
          <meshStandardMaterial color="#444" />
        </mesh>
      ))}
      {/* Exhaust Nozzle */}
      <mesh position={[0, -0.65, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 0.15, 16]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* Cyan Engine Flare (Starship Style) */}
      <mesh ref={engineRef} position={[0, -0.9, 0]}>
        <cylinderGeometry args={[0.15, 0.05, 0.4, 16]} />
        <meshStandardMaterial 
          color="#00ffff" 
          emissive="#00ccff" 
          emissiveIntensity={4} 
          transparent 
          opacity={0.9} 
        />
      </mesh>
    </group>
  );
}

/** Earth Ground Plate & Launch Tower */
function LaunchpadSurface() {
  return (
    <group position={[0, -0.5, 3]}>
      {/* Ground Plate */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <circleGeometry args={[1, 64]} />
        <meshStandardMaterial color="#111" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Launch Tower Pillar */}
      <mesh position={[-0.6, 0.6, -0.2]}>
        <boxGeometry args={[0.1, 1.5, 0.1]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </group>
  );
}

/** 
 * SceneContent — Handles the transition from wide Solar System to detailed Earth
 */
function SceneContent({ introScroll, rocketLaunched, onHover, onUnhover }) {
  useFrame((state) => {
    // Camera Zooming Logic
    const zPos = THREE.MathUtils.lerp(60, 5, introScroll);
    const yPos = THREE.MathUtils.lerp(40, 0, introScroll);
    const xPos = THREE.MathUtils.lerp(30, 0, introScroll);
    
    state.camera.position.set(xPos, yPos, zPos);
    state.camera.lookAt(0, 0, 0);

    // Follow rocket slightly if launched
    if (rocketLaunched) {
      state.camera.position.y += Math.max(0, (state.camera.position.y < 10 ? 0.02 : 0));
    }
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[20, 10, 20]} intensity={3.0} />
      <pointLight position={[-15, 0, -10]} color="#1a6eb5" intensity={1.5} />
      
      <React.Suspense fallback={null}>
            {/* Solar System Overview */}
            <group visible={introScroll < 0.8}>
              <SolarSystemOverview />
            </group>

            {/* Detailed Earth */}
            <group 
              position={[0, -10.5 * (1 - introScroll), -2 * (1 - introScroll)]} 
              scale={1 + introScroll * 4}
            >
              <EarthGlobe onHover={onHover} onUnhover={onUnhover} />
              
              {/* Surface Details appear near the end of zoom */}
              <group visible={introScroll > 0.85}>
                <LaunchpadSurface />
                <Spacecraft3D launched={rocketLaunched} />
              </group>
            </group>
          </React.Suspense>
      <MissionStars count={STAR_COUNT} radius={100} size={0.05} />
    </>
  );
}

/** Error boundary fallback for canvas */
function CanvasFallback() {
  return (
    <div className="canvas-fallback">
      INITIALIZING EARTH RENDER...
    </div>
  );
}

/**
 * Section1Launch — Full T-Minus Zero launch section.
 */
function Section1Launch({ active, showModal }) {
  const { isMobile, isTablet } = useDeviceDetect();
  const [displayedText, setDisplayedText] = useState('');
  const [countdown, setCountdown] = useState(COUNTDOWN_START);
  const [showTooltip, setShowTooltip] = useState(false);
  const [rocketLaunched, setRocketLaunched] = useState(false);
  const indexRef = useRef(0);
  const sectionRef = useRef(null);
  const [introScroll, setIntroScroll] = useState(0);
  const scrollRef = useRef(0);

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
        // Countdown finished
        return;
      }
      const timeout = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timeout);
    }, [countdown]);

  /* Track Scroll for Zoom and Automated Launch */
  useEffect(() => {
    const handleScroll = () => {
      const sp = window.scrollY / (window.innerHeight * 2);
      const progress = Math.max(0, Math.min(1, sp));
      setIntroScroll(progress);
      scrollRef.current = progress;

      // Automated Launch Logic (threshold 0.98)
      if (progress > 0.98 && !rocketLaunched) {
        setRocketLaunched(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [rocketLaunched]);

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
          {/* Countdown and Ascent text removed per user request */}
        </div>
      </div>

      {/* Three.js Scene — Conditional mount for GPU performance */}
      {(active || showModal) && (
        <div className="launch-canvas" style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, opacity: introScroll >= 1 ? 0 : 1, pointerEvents: introScroll >= 1 ? 'none' : 'auto', transition: 'opacity 0.3s' }}>
          <React.Suspense fallback={<CanvasFallback />}>
            <Canvas dpr={pixelRatio} camera={{ position: [20, 30, 50], fov: 45 }}>
              <SceneContent 
                introScroll={introScroll} 
                rocketLaunched={rocketLaunched}
                onHover={handleEarthHover}
                onUnhover={handleEarthUnhover}
              />
            </Canvas>
          </React.Suspense>
        </div>
      )}

      {/* Earth tooltip */}
      <div className={`earth-tooltip ${showTooltip ? 'visible' : ''}`}
        style={{ bottom: '60px', right: '60px' }}
      >
        LAUNCH COORDS: {MISSION_DATA.launchCoords}
        <br />
        {MISSION_DATA.launchSite}
      </div>

      {/* Telemetry ticker */}
      {/* Telemetry ticker removed per user request */}

      {/* Scroll hint — fades out as user scrolls */}
      <div className="scroll-hint" style={{ opacity: introScroll < 0.05 ? 1 : 0, transition: 'opacity 0.6s' }}>
        <div className="scroll-hint-text">SCROLL TO EXPLORE</div>
        <svg className="scroll-hint-chevron" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--hud-green)" strokeWidth="1.5">
          <path d="M7 10L12 15L17 10" />
        </svg>
      </div>
    </section>
  );
}

export default memo(Section1Launch);
