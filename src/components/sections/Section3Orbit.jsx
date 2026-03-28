/**
 * Section3Orbit — "RED HORIZON" Mars orbit entry.
 * Features: Three.js Mars mesh, orbital HUD, landing zone markers, coordinate tracker.
 */
import { memo, useState, useRef, useEffect, useCallback, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { NARRATIVE_TEXT, LANDING_ZONES } from '../../utils/telemetryData';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';

const MARS_RADIUS = 2;
const MARS_ROTATION_SPEED = 0.0008;
const MARS_AXIAL_TILT = 25.19 * (Math.PI / 180);
const MARS_TEXTURE_URL = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/textures/planets/mars_1k_color.jpg';
const ATMOSPHERE_RADIUS = 2.06;
const STAR_COUNT = 1200;

/** Generate star positions eagerly */
function generateStarPositions(count) {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i += 3) {
    arr[i] = (Math.random() - 0.5) * 80;
    arr[i + 1] = (Math.random() - 0.5) * 80;
    arr[i + 2] = (Math.random() - 0.5) * 80 - 20;
  }
  return arr;
}

/** Rotating Mars mesh with atmosphere shimmer */
function MarsMesh() {
  const meshRef = useRef();
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    new THREE.TextureLoader().load(
      MARS_TEXTURE_URL,
      (tex) => setTexture(tex),
      undefined,
      (err) => console.warn('Mars texture failed to load, falling back to rust color.', err)
    );
  }, []);

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
          <meshStandardMaterial map={texture} roughness={0.85} />
        ) : (
          <meshStandardMaterial color="#c1440e" roughness={0.9} />
        )}
      </mesh>
      {/* Atmosphere shimmer */}
      <mesh>
        <sphereGeometry args={[ATMOSPHERE_RADIUS, 32, 32]} />
        <meshBasicMaterial
          color="#c1440e"
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

/** Background stars */
function OrbitStars() {
  const positions = useMemo(() => generateStarPositions(STAR_COUNT), []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={STAR_COUNT} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#e8e4d8" size={0.04} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function Section3Orbit() {
  const { isMobile } = useDeviceDetect();
  const sectionRef = useRef(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [marsCoords, setMarsCoords] = useState({ lat: 0, lng: 0, visible: false, x: 0, y: 0 });
  const [orbitalDrawn, setOrbitalDrawn] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOrbitalDrawn(true);
        }
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
    setMarsCoords({
      lat: normY.toFixed(1),
      lng: normX.toFixed(1),
      visible: true,
      x: e.clientX + 20,
      y: e.clientY - 10,
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
      {/* Mars canvas */}
      <div className="orbit-canvas">
        <Suspense fallback={null}>
          <Canvas dpr={pixelRatio} camera={{ position: [0, 0, 6], fov: 50 }} style={{ background: 'transparent' }}>
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 2, 5]} intensity={1.8} />
            <Suspense fallback={null}>
              <MarsMesh />
            </Suspense>
            <OrbitStars />
          </Canvas>
        </Suspense>
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
          stroke="var(--hud-dim)"
          strokeWidth="1"
          strokeDasharray="8 4"
          strokeDashoffset={orbitalDrawn ? 0 : 600}
          style={{
            transition: 'stroke-dashoffset 2s ease-out',
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
