/**
 * Section2Void — "THE VOID" Deep space transit.
 * Features: Three.js starfield, spacecraft SVG, milestones, distance counter.
 */
import { memo, useState, useRef, useEffect, useCallback, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NARRATIVE_TEXT, MILESTONES } from '../../utils/telemetryData';
import { formatNumber } from '../../utils/lightSpeedDelay';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';

const TOTAL_DISTANCE_KM = 225000000;
const STAR_COUNT_DESKTOP = 8000;
const STAR_COUNT_MOBILE = 2000;

/** Generate star positions eagerly */
function generateStarPositions(num, spread) {
  const arr = new Float32Array(num * 3);
  for (let i = 0; i < num * 3; i += 3) {
    arr[i] = (Math.random() - 0.5) * 80;
    arr[i + 1] = (Math.random() - 0.5) * 80;
    arr[i + 2] = (Math.random() - 0.5) * spread;
  }
  return arr;
}

/** Parallax starfield with three depth layers */
function StarLayers({ scrollProgress, isMobile }) {
  const count = isMobile ? STAR_COUNT_MOBILE : STAR_COUNT_DESKTOP;
  const layerCount = Math.floor(count / 3);

  const layer1Ref = useRef();
  const layer2Ref = useRef();
  const layer3Ref = useRef();

  const pos1 = useMemo(() => generateStarPositions(layerCount, 40), [layerCount]);
  const pos2 = useMemo(() => generateStarPositions(layerCount, 60), [layerCount]);
  const pos3 = useMemo(() => generateStarPositions(layerCount, 80), [layerCount]);

  useFrame(() => {
    const sp = scrollProgress.current || 0;
    if (layer1Ref.current) layer1Ref.current.rotation.y = sp * 0.1;
    if (layer2Ref.current) layer2Ref.current.rotation.y = sp * 0.2;
    if (layer3Ref.current) layer3Ref.current.rotation.y = sp * 0.3;
  });

  return (
    <>
      <points ref={layer1Ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={layerCount} array={pos1} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial color="#e8e4d8" size={0.06} transparent opacity={0.4} sizeAttenuation />
      </points>
      <points ref={layer2Ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={layerCount} array={pos2} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial color="#e8e4d8" size={0.04} transparent opacity={0.6} sizeAttenuation />
      </points>
      <points ref={layer3Ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={layerCount} array={pos3} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial color="#aab8d0" size={0.03} transparent opacity={0.8} sizeAttenuation />
      </points>
    </>
  );
}

/** Click particle burst */
function ClickParticles({ bursts }) {
  return bursts.map((burst, idx) => (
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
  ));
}

function Section2Void() {
  const { isMobile } = useDeviceDetect();
  const sectionRef = useRef(null);
  const [scrollPct, setScrollPct] = useState(0);
  const scrollRef = useRef(0);
  const [bursts, setBursts] = useState([]);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionHeight = sectionRef.current.offsetHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / sectionHeight));
      setScrollPct(progress);
      scrollRef.current = progress;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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

  const distanceKm = Math.round(scrollPct * TOTAL_DISTANCE_KM);
  const pixelRatio = isMobile ? 1 : Math.min(window.devicePixelRatio, 2);

  return (
    <section
      ref={sectionRef}
      className="section section-void"
      id="section-void"
      aria-label="The Void — Deep space transit"
    >
      {/* Three.js starfield */}
      <div className="void-canvas" onClick={handleCanvasClick} data-hoverable="true" role="button" aria-label="Click to emit particles in the starfield">
        <Suspense fallback={null}>
          <Canvas dpr={pixelRatio} camera={{ position: [0, 0, 5], fov: 60 }} style={{ background: 'transparent' }}>
            <StarLayers scrollProgress={scrollRef} isMobile={isMobile} />
            <ClickParticles bursts={bursts} />
          </Canvas>
        </Suspense>
      </div>

      {/* Spacecraft */}
      <div className="spacecraft-container">
        <svg className="spacecraft-svg" viewBox="0 0 60 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M30 5L40 35L42 80L38 95L22 95L18 80L20 35L30 5Z" fill="var(--chrome)" stroke="var(--star-white)" strokeWidth="0.5" opacity="0.8" />
          <path d="M30 5L35 25L25 25L30 5Z" fill="var(--star-white)" opacity="0.4" />
          <path d="M18 70L5 90L18 85Z" fill="var(--chrome)" opacity="0.6" />
          <path d="M42 70L55 90L42 85Z" fill="var(--chrome)" opacity="0.6" />
          <rect x="25" y="95" width="4" height="8" fill="var(--mars-rust)" opacity="0.8" rx="1" />
          <rect x="31" y="95" width="4" height="8" fill="var(--mars-rust)" opacity="0.8" rx="1" />
          <circle cx="30" cy="30" r="3" fill="var(--earth-blue)" opacity="0.6" />
        </svg>
        <div className="thruster-glow" />
      </div>

      {/* Narrative */}
      <div className="void-narrative">
        <h2>The Void</h2>
        <p>{NARRATIVE_TEXT.section2}</p>
      </div>

      {/* Milestones */}
      <div className="void-milestones">
        {MILESTONES.map((m, idx) => {
          const revealed = scrollPct > idx * 0.2;
          return (
            <div
              className={`milestone-card ${revealed ? 'revealed' : 'hidden'}`}
              key={m.day}
              aria-label={`Day ${m.day}: ${m.title}`}
              data-hoverable="true"
            >
              <div className="milestone-day">DAY {m.day}</div>
              <div className="milestone-title">{m.title}</div>
              <div className="milestone-log">{m.log}</div>
            </div>
          );
        })}
      </div>

      {/* Distance counter */}
      <div className="void-distance">
        <div className="void-distance-label">DISTANCE FROM EARTH</div>
        <div className="void-distance-value">{formatNumber(distanceKm)}</div>
        <div className="void-distance-unit">KM</div>
      </div>
    </section>
  );
}

export default memo(Section2Void);
