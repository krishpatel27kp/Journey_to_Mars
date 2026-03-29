/**
 * Section3Orbit — "RED HORIZON" Mars orbit entry.
 * Features: Three.js Mars mesh, orbital HUD, landing zone markers, coordinate tracker.
 */
import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { NARRATIVE_TEXT, LANDING_ZONES } from '../../utils/telemetryData';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';
import { MissionStars } from '../visuals/MissionStars';

const MARS_RADIUS = 2;
const MARS_ROTATION_SPEED = 0.0008;
const MARS_AXIAL_TILT = 25.19 * (Math.PI / 180);
const MARS_TEXTURE_URL = '/textures/mars_2k.jpg';
const ATMOSPHERE_RADIUS = 2.06;
const STAR_COUNT = 1200;



import { useTexture } from '@react-three/drei';

/** Rotating Mars mesh with atmosphere shimmer */
function MarsMesh() {
  const meshRef = useRef();
  
  const texture = useTexture(MARS_TEXTURE_URL);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += MARS_ROTATION_SPEED;
    }
  });

  return (
    <group rotation={[MARS_AXIAL_TILT, 0, 0]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[MARS_RADIUS, 64, 64]} />
        {texture ? (
          <meshStandardMaterial 
            map={texture} 
            roughness={0.8} 
            metalness={0.1}
            emissive="#4a1a0a"
            emissiveIntensity={0.1}
          />
        ) : (
          <meshStandardMaterial color="#c1440e" roughness={0.9} />
        )}
      </mesh>
      {/* Atmosphere shimmer — outer */}
      <mesh>
        <sphereGeometry args={[ATMOSPHERE_RADIUS + 0.05, 64, 64]} />
        <meshBasicMaterial
          color="#c1440e"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
      {/* Atmosphere — inner bright limb */}
      <mesh>
        <sphereGeometry args={[MARS_RADIUS + 0.02, 64, 64]} />
        <meshBasicMaterial
          color="#ff7f50"
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/** Background stars with twinkling */
function OrbitStars() {
  const pointsRef = useRef();
  const [positions] = useState(() => {
    const arr = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT * 3; i += 3) {
      arr[i] = (Math.random() - 0.5) * 80;
      arr[i + 1] = (Math.random() - 0.5) * 80;
      arr[i + 2] = (Math.random() - 0.5) * 80 - 20;
    }
    return arr;
  });

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime;
    pointsRef.current.material.opacity = 0.5 + Math.sin(t * 0.3) * 0.15;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={STAR_COUNT} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#e8e4d8" size={0.04} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function Section3Orbit({ active }) {
  const { isMobile } = useDeviceDetect();
  const sectionRef = useRef(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [marsCoords, setMarsCoords] = useState({ lat: 0, lng: 0, visible: false, x: 0, y: 0 });
  useEffect(() => {
    const observer = new IntersectionObserver(
      () => {
        // Observer logic if needed, currently empty to resolve unused var
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normX = (x / rect.width) * 360 - 180;
    const normY = 90 - (y / rect.height) * 180;
    
    // Throttle React re-renders for cursor coordinates
    setMarsCoords((prev) => {
      const dx = Math.abs(e.clientX + 20 - prev.x);
      const dy = Math.abs(e.clientY - 10 - prev.y);
      if (dx < 5 && dy < 5 && prev.visible) return prev;
      return {
        lat: normY.toFixed(1),
        lng: normX.toFixed(1),
        visible: true,
        x: e.clientX + 20,
        y: e.clientY - 10,
      };
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMarsCoords((prev) => ({ ...prev, visible: false }));
  }, []);

  const pixelRatio = isMobile ? 1 : Math.min(window.devicePixelRatio, 2);

  return (
    <section
      ref={sectionRef}
      className="section section-orbit"
      id="section-orbit"
      aria-label="Red Horizon — Mars orbit entry"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Mars canvas — Performance Optimized */}
      <div className="orbit-canvas">
        {active && (
          <React.Suspense fallback={null}>
            <Canvas dpr={pixelRatio} camera={{ position: [0, 0, 6], fov: 50 }} style={{ background: 'transparent' }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[5, 2, 5]} intensity={2.8} />
              <pointLight position={[-3, 1, 3]} intensity={0.6} color="#e8813a" />
              <React.Suspense fallback={null}>
                <MarsMesh />
              </React.Suspense>
              <MissionStars count={STAR_COUNT} twinkle size={0.05} />
            </Canvas>
          </React.Suspense>
        )}
      </div>

      {/* Orbital path SVG */}
      <svg
        className="orbital-path-svg"
        width="400"
        height="200"
        viewBox="0 0 400 200"
      >
        <ellipse
          cx="200"
          cy="100"
          rx="180"
          ry="60"
          fill="none"
          stroke="var(--hud-green)"
          strokeWidth="1.5"
          strokeDasharray="10 6"
          className="pulsing-orbit-line"
          style={{
            transition: 'stroke-dashoffset 2s ease-out',
            filter: 'drop-shadow(0 0 5px var(--hud-green))'
          }}
        />
      </svg>

      {/* Orbital data HUD */}
      <div className="orbit-hud hud-border">
        <div className="launch-briefing-label">ORBITAL MECHANICS</div>
        <h2>Red Horizon</h2>
        <div className="orbit-data-row">
          <span className="orbit-data-label">Altitude</span>
          <span className="orbit-data-value">400 KM</span>
        </div>
        <div className="orbit-data-row">
          <span className="orbit-data-label">Orbital Period</span>
          <span className="orbit-data-value">1.88 H</span>
        </div>
        <div className="orbit-data-row">
          <span className="orbit-data-label">Inclination</span>
          <span className="orbit-data-value">25.19°</span>
        </div>
        <div className="orbit-data-row">
          <span className="orbit-data-label">Atmosphere</span>
          <span className="orbit-data-value">1% EARTH</span>
        </div>
        <div className="orbit-narrative">
          <p>{NARRATIVE_TEXT.section3}</p>
        </div>
      </div>

      {/* Landing zone markers */}
      <div className="landing-markers">
        {LANDING_ZONES.map((zone) => (
          <button
            key={zone.name}
            className="landing-marker"
            style={{ top: zone.position.top, left: zone.position.left }}
            onClick={() => setSelectedZone(zone)}
            aria-label={`Landing zone: ${zone.name} at ${zone.coords}`}
            data-hoverable="true"
          >
            <div className="landing-marker-dot" />
            <span className="landing-marker-name">{zone.name}</span>
          </button>
        ))}
      </div>

      {/* Mars coordinate tracker */}
      <div
        className={`mars-coords ${marsCoords.visible ? 'visible' : ''}`}
        style={{ left: marsCoords.x, top: marsCoords.y, position: 'fixed' }}
      >
        {marsCoords.lat}°N {marsCoords.lng}°E
      </div>

      {/* Landing zone modal */}
      <AnimatePresence>
        {selectedZone && (
          <motion.div
            className="landing-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedZone(null)}
          >
            <motion.div
              className="landing-modal hud-border"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>{selectedZone.name}</h3>
              <div className="landing-modal-coords">{selectedZone.coords}</div>
              <div className="landing-facts">
                {selectedZone.facts.map((fact, i) => (
                  <div className="landing-fact" key={i}>
                    <p>{fact}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setSelectedZone(null)}
                aria-label="Close landing zone details"
                data-hoverable="true"
              >
                CLOSE
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default memo(Section3Orbit);
