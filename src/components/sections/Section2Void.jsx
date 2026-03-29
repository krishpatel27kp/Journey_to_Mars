/**
 * Section2Void — "THE VOID" Deep space transit.
 * Features: Three.js starfield, spacecraft SVG, milestones, distance counter.
 */
import React, { memo, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { NARRATIVE_TEXT, MILESTONES } from '../../utils/telemetryData';
import { formatNumber } from '../../utils/lightSpeedDelay';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';
import { MissionStars } from '../visuals/MissionStars';

gsap.registerPlugin(ScrollTrigger);

const TOTAL_DISTANCE_KM = 225000000;
const STAR_COUNT_DESKTOP = 8000;
const STAR_COUNT_MOBILE = 2000;





/** Generate star positions eagerly — DEPRECATED: use MissionStars utility */

/** Dynamic starfield with warp (stretch) effect based on scroll speed */

/** 
 * GalaxyBackground — Thousands of procedural stars forming a spiral galaxy
 */
function GalaxyBackground({ count = 5000 }) {
  const pointsRef = useRef();
  
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = Math.random() * 80;
      const spin = radius * 0.15;
      const angle = Math.random() * Math.PI * 2 + spin;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * (Math.exp(-radius / 30) * 10);
      
      const idx = i * 3;
      arr[idx] = x;
      arr[idx + 1] = y;
      arr[idx + 2] = z;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0002;
      const time = state.clock.getElapsedTime();
      pointsRef.current.material.opacity = 0.5 + Math.sin(time * 0.5) * 0.2;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial 
        color="#88ccff" 
        size={0.12} 
        transparent 
        opacity={0.6} 
        sizeAttenuation 
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** 
 * HohmannTransferMap — Visualizing the interplanetary journey
 * Features: Sun, all Planets (Mercury thru Neptune) moving in orbits.
 */
function HohmannTransferMap({ scrollProgress }) {
  const sunRef = useRef();
  const shipRef = useRef();
  
  // Radii for planets [Merc, Ven, Earth, Mars, Jup, Sat, Ura, Nep]
  // Earth = 2, Mars = 3
  const orbits = useMemo(() => [6.5, 10, 15, 22.5, 34, 48, 62, 75], []);
  const planetRefs = useRef([]);
  if (planetRefs.current.length === 0) {
    planetRefs.current = orbits.map(() => React.createRef());
  }

  const planetSpecs = useMemo(() => [
    { radius: 0.4, color: '#A5A5A5', name: 'Mercury' },
    { radius: 0.8, color: '#E3BB76', name: 'Venus' },
    { radius: 1.2, color: '#4488ff', name: 'Earth' },
    { radius: 1.0, color: '#ff4422', name: 'Mars' },
    { radius: 2.2, color: '#D39C7E', name: 'Jupiter' },
    { radius: 1.8, color: '#C5AB6E', name: 'Saturn' },
    { radius: 1.4, color: '#BBE1E4', name: 'Uranus' },
    { radius: 1.4, color: '#6081FF', name: 'Neptune' }
  ], []);

  useFrame((state) => {
    const sp = scrollProgress.current || 0;
    const time = state.clock.elapsedTime;
    
    // Sun pulse
    if (sunRef.current) {
      sunRef.current.scale.setScalar(1 + Math.sin(time * 0.8) * 0.05);
      sunRef.current.rotation.y += 0.005;
    }
    
    // Calculate Planet Positions (Mercury to Neptune)
    const currentPlanetPositions = orbits.map((r, i) => {
      const speed = 1.0 / Math.pow(r, 0.5);
      const angle = time * speed + (i * 1.5);
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      if (planetRefs.current[i].current) {
        planetRefs.current[i].current.position.set(x, 0, z);
        planetRefs.current[i].current.rotation.y += 0.02;
      }
      return { x, z, angle };
    });

    // Ship position synchronized with Earth (Start) and Mars (End)
    if (shipRef.current) {
      const earthPos = currentPlanetPositions[2];
      const marsPos = currentPlanetPositions[3];

      // We want the ship to basically travel from where Earth IS to where Mars IS
      const startAngle = earthPos.angle;
      const endAngle = marsPos.angle; // Aim for Mars precisely
      
      const currentAngle = THREE.MathUtils.lerp(startAngle, endAngle, sp);
      const currentR = THREE.MathUtils.lerp(orbits[2], orbits[3], sp);
      
      let x = Math.cos(currentAngle) * currentR;
      let y = 0;
      let z = Math.sin(currentAngle) * currentR;
      let rotY = currentAngle + Math.PI / 2;

      // Local Orbit Phase (Earth)
      if (sp < 0.15) {
        const t = sp / 0.15;
        const orbitRadius = 2.4;
        const orbitAngle = time * 2.5;
        const localX = earthPos.x + Math.cos(orbitAngle) * orbitRadius;
        const localZ = earthPos.z + Math.sin(orbitAngle) * orbitRadius;
        const blend = t * t * (3 - 2 * t);
        x = THREE.MathUtils.lerp(localX, x, blend);
        z = THREE.MathUtils.lerp(localZ, z, blend);
        rotY = THREE.MathUtils.lerp(-orbitAngle, rotY, blend);
      }
      // Local Orbit Phase (Mars)
      else if (sp > 0.85) {
        const t = (sp - 0.85) / 0.15;
        const orbitRadius = 1.9;
        const orbitAngle = time * 2.5;
        const localX = marsPos.x + Math.cos(orbitAngle) * orbitRadius;
        const localZ = marsPos.z + Math.sin(orbitAngle) * orbitRadius;
        const blend = t * t * (3 - 2 * t);
        x = THREE.MathUtils.lerp(x, localX, blend);
        z = THREE.MathUtils.lerp(z, localZ, blend);
        rotY = THREE.MathUtils.lerp(rotY, -orbitAngle, blend);
      }

      shipRef.current.position.set(x, y, z);
      shipRef.current.rotation.y = rotY;
    }
  });

  return (
    <group rotation={[Math.PI / 4, 0, 0]}>
      <mesh ref={sunRef}>
        <sphereGeometry args={[3.2, 32, 32]} />
        <meshBasicMaterial color="#ffcc33" />
        <pointLight intensity={300} distance={1000} color="#ffaa00" />
      </mesh>

      {orbits.map((r, i) => (
        <group key={i}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[r - 0.05, r + 0.05, 128]} />
            <meshBasicMaterial 
              color={i === 2 ? '#4488ff' : (i === 3 ? '#ff4422' : '#ffffff')} 
              transparent opacity={0.12} 
            />
          </mesh>
          <mesh ref={planetRefs.current[i]}>
            <sphereGeometry args={[planetSpecs[i].radius, 32, 32]} />
            <meshStandardMaterial color={planetSpecs[i].color} roughness={0.7} metalness={0.1} />
          </mesh>
        </group>
      ))}

      <group ref={shipRef}>
        <Spacecraft3D scrollProgress={scrollProgress} isMap />
      </group>
    </group>
  );
}

/** Procedural 3D Spacecraft */
function Spacecraft3D({ scrollProgress }) {
  const groupRef = useRef();
  const engineRef = useRef();
  const heatGlowRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    const sp = scrollProgress.current || 0;
    const time = state.clock.elapsedTime;

    // Position: Center-pinned but reacts to warp
    groupRef.current.position.y = Math.sin(time * 2) * 0.05;
    
    // Scale up as we reach Mars
    const s = 1 + sp * 0.4;
    groupRef.current.scale.setScalar(s);

    // Entry Heat Glow (sp > 0.7)
    if (heatGlowRef.current) {
      if (sp > 0.7) {
        const intensity = Math.min(1, (sp - 0.7) * 5);
        heatGlowRef.current.visible = true;
        heatGlowRef.current.material.opacity = intensity * 0.6;
        // Shake removed per user request
      } else {
        heatGlowRef.current.visible = false;
        groupRef.current.position.x = 0;
      }
    }

    // Tilt rocket based on section progress
    groupRef.current.rotation.z = Math.sin(time * 0.5) * 0.02; // Idle sway
    
    // Smooth Flip: tail-first for landing (Starship maneuver)
    if (sp > 0.85) {
      const landingProgress = Math.min(1, (sp - 0.85) / 0.15);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -Math.PI / 1.5, 0.05);
      // Final descent phase: push ship closer to landing plate
      groupRef.current.position.y = Math.sin(time * 0.5) * 0.02 - (landingProgress * 0.2);
    }

    // Engine flicker (Cyan Infographic Theme)
    if (engineRef.current) {
      const isLanding = sp > 0.92;
      engineRef.current.scale.y = (isLanding ? 3 : 1) + Math.sin(time * 25) * 0.3;
      // Use deterministic values instead of Math.random for flicker effect
      const flickerBase = isLanding ? 12 : 2;
      const flickerVariation = Math.sin(time * 50) * 3; // Oscillating value instead of random
      engineRef.current.material.emissiveIntensity = flickerBase + flickerVariation;
      engineRef.current.material.color.set("#00ffff");
      engineRef.current.material.emissive.set("#00ccff");
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 2]}>
      {/* Main Hull — UPGRADED: NASA White */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 1.2, 32]} />
        <meshStandardMaterial color="#ffffff" metalness={0.6} roughness={0.1} />
      </mesh>
      {/* Nose Cone */}
      <mesh position={[0, 0.8, 0]}>
        <coneGeometry args={[0.3, 0.5, 32]} />
        <meshStandardMaterial color="#ffffff" metalness={0.4} />
      </mesh>
      {/* Fins */}
      {[0, 90, 180, 270].map((deg) => (
        <mesh key={deg} rotation={[0, (deg * Math.PI) / 180, 0]} position={[0, -0.4, 0]}>
          <boxGeometry args={[0.6, 0.3, 0.05]} />
          <meshStandardMaterial color="#eeeeee" />
        </mesh>
      ))}
      {/* Engine Nozzle */}
      <mesh position={[0, -0.65, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 0.15, 16]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* Thruster Flame (Starship Blue) */}
      <mesh ref={engineRef} position={[0, -0.9, 0]}>
        <cylinderGeometry args={[0.15, 0.05, 0.4, 16]} />
        <meshStandardMaterial 
          color="#00ffff" 
          emissive="#00ccff"
          emissiveIntensity={4}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}

/** Click particle burst */
function ClickParticles({ bursts }) {
  if (!bursts || bursts.length === 0) return null;
  return (
    <>
      {bursts.map((burst, idx) => (
        <points key={idx}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={burst.positions.length / 3}
              array={burst.positions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial color="#00ff88" size={0.08} transparent opacity={burst.opacity} sizeAttenuation />
        </points>
      ))}
    </>
  );
}

function Section2Void({ active }) {
  const { isMobile } = useDeviceDetect();
  const sectionRef = useRef(null);
  const [scrollPct, setScrollPct] = useState(0);
  const scrollRef = useRef(0);
  const [bursts, setBursts] = useState([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    // Pin Section 2 and track progress via ScrollTrigger
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: '+=60%', // Extremely compressed duration to literally remove all extra scroll space
      pin: true,
      scrub: 1,
      onUpdate: (self) => {
        scrollRef.current = self.progress;
        // Throttle React re-renders to ~10fps (HUD text only)
        if (Math.abs(self.progress - scrollPct) > 0.005) {
          setScrollPct(self.progress);
        }
      },
      onLeave: () => {
        gsap.to(window, {
          scrollTo: "#section-orbit",
          duration: 1.5,
          ease: "power2.inOut"
        });
      }
    });

    return () => {
      st.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Click to emit particles */
  const handleCanvasClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 10 - 5;
    const y = -((e.clientY - rect.top) / rect.height) * 10 + 5;
    const positions = new Float32Array(20 * 3);
    for (let i = 0; i < 20 * 3; i += 3) {
      positions[i] = x + (Math.random() - 0.5) * 2;
      positions[i + 1] = y + (Math.random() - 0.5) * 2;
      positions[i + 2] = (Math.random() - 0.5) * 2;
    }
    const newBurst = { positions, opacity: 1 };
    setBursts((prev) => [...prev.slice(-5), newBurst]);

    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b !== newBurst));
    }, 1000);
  }, []);

  const distanceKm = Math.round(Math.min(1, scrollPct / 0.95) * TOTAL_DISTANCE_KM);
  const pixelRatio = isMobile ? 1 : Math.min(window.devicePixelRatio, 2);

  return (
    <section
      ref={sectionRef}
      className="section section-void"
      id="section-void"
      aria-label="The Void — Deep space transit"
    >
      <div className="void-scene">
        {/* Three.js starfield and Mars Approach — Performance Optimized */}
        <div className="void-canvas" onClick={handleCanvasClick} data-hoverable="true" role="button">
          {active && (
            <React.Suspense fallback={null}>
            <Canvas dpr={pixelRatio} camera={{ position: [0, 30, 25], fov: 60 }} style={{ background: 'transparent' }}>
              {/* Cinematic Space Lighting */}
              <ambientLight intensity={0.5} />
              <pointLight position={[0, 0, 0]} intensity={20} color="#ffcc33" />
              
              <GalaxyBackground count={isMobile ? 3000 : 8000} />
              <MissionStars count={isMobile ? 1200 : 3500} size={0.15} />
              <HohmannTransferMap scrollProgress={scrollRef} />
              <ClickParticles bursts={bursts} />
            </Canvas>
            </React.Suspense>
          )}
        </div>

        {/* Spacecraft HUD Overlay - LEFT: Narrative/Telemetry */}
        <div className="void-hud-panel left">
          <div className="hud-corner-bracket top-left" />
          <div className="hud-corner-bracket bottom-right" />
          <div className="void-narrative">
            <div className="hud-label-small">MISSION LOG // SOL {Math.floor(scrollPct * 180)}</div>
            <h2>The Void</h2>
            <p>{NARRATIVE_TEXT.section2 || 'Navigating deep space transit...'}</p>
          </div>
        </div>

        {/* Removed SVG Spacecraft - Now in 3D Canvas */}

        {/* SINGLE Active Milestone Display */}
        <div className="void-milestones">
          <AnimatePresence mode="wait">
            {MILESTONES.map((m, idx) => {
              // Perfectly span exactly 0.0 to 1.0 (no dead zones before or after)
              const start = idx / MILESTONES.length;
              const nextStart = (idx + 1) / MILESTONES.length;
              const isActive = scrollPct >= start && (idx === MILESTONES.length - 1 ? true : scrollPct < nextStart);
              
              if (!isActive) return null;

              return (
                <motion.div
                  key={m.day}
                  className="milestone-card active-log"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  style={{
                    width: '320px',
                    pointerEvents: 'all'
                  }}
                >
                  <div className="hologram-flicker" />
                  <div className="milestone-day">SOL {m.day} — CURRENT LOG</div>
                  <div className="milestone-title">{m.title}</div>
                  <div className="milestone-log" style={{
                    opacity: 1,
                    maxHeight: 'none',
                    marginTop: '10px'
                  }}>{m.log}</div>
                  <div className="hologram-scanline" />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Spacecraft HUD Overlay - RIGHT: Distance/Status */}
        <div className="void-hud-panel right">
          <div className="hud-corner-bracket top-right" />
          <div className="hud-corner-bracket bottom-left" />
          <div className="void-distance">
            {scrollPct < 0.9 ? (
              <>
                <div className="void-distance-label">TELEMETRY // KM FROM EARTH</div>
                <div className="void-distance-value">{formatNumber(distanceKm)}</div>
                <div className="hud-progress-bar">
                  <div className="hud-progress-fill" style={{ width: `${scrollPct * 100}%` }} />
                </div>
              </>
            ) : (
              <div className="landing-status-nominal">
                <div className="status-glow" />
                <div className="status-text">TOUCHDOWN NOMINAL</div>
                <div className="status-sub">JEZERO CRATER · SOL 000</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(Section2Void);
