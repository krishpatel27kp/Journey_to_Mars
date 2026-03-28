/**
 * Section2Void — "THE VOID" Deep space transit.
 * Features: Three.js starfield, spacecraft SVG, milestones, distance counter.
 */
import { memo, useState, useRef, useEffect, useCallback, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { NARRATIVE_TEXT, MILESTONES } from '../../utils/telemetryData';
import { formatNumber } from '../../utils/lightSpeedDelay';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';

gsap.registerPlugin(ScrollTrigger);

const TOTAL_DISTANCE_KM = 225000000;
const STAR_COUNT_DESKTOP = 8000;
const STAR_COUNT_MOBILE = 2000;

/** Local Planet Textures (zero network dependency) */
const EARTH_TEXTURE_URL = '/textures/earth_2k.jpg';
const MARS_TEXTURE_URL = '/textures/mars_2k.jpg';



/** Generate star positions eagerly */
function generateStarPositions(num, spread) {
  const arr = new Float32Array(num * 3);
  for (let i = 0; i < num * 3; i += 3) {
    arr[i] = (Math.random() - 0.5) * spread;
    arr[i + 1] = (Math.random() - 0.5) * spread;
    arr[i + 2] = (Math.random() - 0.5) * spread;
  }
  return arr;
}

/** Dynamic starfield with warp (stretch) effect based on scroll speed */
function StarLayers({ scrollProgress, isMobile }) {
  const count = isMobile ? STAR_COUNT_MOBILE : STAR_COUNT_DESKTOP;
  const spread = isMobile ? 80 : 100;
  const layerRef = useRef();
  const prevScroll = useRef(0);
  const velocity = useRef(0);
  const [points] = useState(() => generateStarPositions(count, spread));

  useFrame(() => {
    const sp = scrollProgress.current || 0;
    
    // Calculate scroll velocity for warp stretch
    velocity.current = Math.abs(sp - prevScroll.current) * 50;
    prevScroll.current = sp;
    
    // Constant slow rotation + high speed scroll influence
    layerRef.current.rotation.z += 0.0005;
    layerRef.current.position.z = sp * 100;
    
    // Warp speed stretch: lengthen stars along Z axis
    const scaling = 1 + velocity.current * 2;
    layerRef.current.scale.z = THREE.MathUtils.lerp(layerRef.current.scale.z, scaling, 0.1);
  });

  return (
    <points ref={layerRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={points} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial 
        color="#ffffff" 
        size={0.08} 
        transparent 
        opacity={0.6} 
        sizeAttenuation 
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** Distant Solar System Background — Mercury, Venus, Jupiter, Saturn */
function SolarSystemBackdrop() {
  const groupRef = useRef();
  const planets = useMemo(() => [
    { name: 'MERCURY', pos: [10, 6, -40], color: '#999', size: 0.4, speed: 0.005, emissive: '#444' },
    { name: 'VENUS', pos: [-15, -4, -60], color: '#e3bb76', size: 0.8, speed: 0.003, emissive: '#c18b3d' },
    { name: 'JUPITER', pos: [22, -8, -100], color: '#d39c7e', size: 3.5, speed: 0.0008, emissive: '#8b5d3d' },
    { name: 'SATURN', pos: [-28, 6, -120], color: '#c5ab6e', size: 2.8, speed: 0.0005, emissive: '#8b7d3d' },
  ], []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    groupRef.current.children.forEach((group, i) => {
      const p = planets[i];
      const orbitRadius = Math.sqrt(p.pos[0]**2 + p.pos[1]**2);
      const angle = time * p.speed + (i * Math.PI / 2);
      group.position.x = Math.cos(angle) * orbitRadius;
      group.position.y = Math.sin(angle) * orbitRadius;
      group.rotation.y += 0.005;
    });
  });

    return (
      <group ref={groupRef}>
        {planets.map((p) => (
          <group key={p.name} position={p.pos}>
            {/* Planet Body */}
            <mesh>
              <sphereGeometry args={[p.size, 32, 32]} />
              <meshStandardMaterial color={p.color} emissive={p.emissive} emissiveIntensity={0.5} />
            </mesh>
            
            {/* Saturn's Rings */}
            {p.name === 'SATURN' && (
              <mesh rotation={[Math.PI / 2.5, 0, 0]}>
                <ringGeometry args={[p.size + 0.5, p.size + 2.5, 64]} />
                <meshBasicMaterial color="#a89255" transparent opacity={0.4} side={THREE.DoubleSide} />
              </mesh>
            )}
            
            {/* Planet Label (Point-like) */}
            <pointLight intensity={2} distance={10} color={p.color} />
          </group>
        ))}
      </group>
    );
}

/** Receding Earth — Visualizing the departure from home */
function EarthDeparture({ scrollProgress }) {
  const meshRef = useRef();
  const cloudsRef = useRef();
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(EARTH_TEXTURE_URL, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      setTexture(tex);
    });
  }, []);

  useFrame(() => {
    if (!meshRef.current) return;
    const sp = scrollProgress.current || 0;
    
    // Position Earth dynamically in Z-space
    const departureProgress = Math.min(1, sp / 0.4); // Over 40% of scroll
    meshRef.current.position.z = -departureProgress * 80; // Move far back
    meshRef.current.scale.setScalar(4 * (1 - departureProgress * 0.95)); // Shrink
    meshRef.current.visible = departureProgress < 1;

    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0015;
    }
  });

  return (
    <group ref={meshRef} position={[0, -2, 0]}>
      {/* Planetary Body */}
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial 
          map={texture} 
          color={texture ? '#fff' : '#1a6eb5'} 
          roughness={0.7}
        />
      </mesh>
      {/* Cloud Layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.02, 64, 64]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.2} 
          blending={THREE.AdditiveBlending} 
        />
      </mesh>
      {/* Atmosphere Glow */}
      <mesh scale={1.1}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial 
          color="#1a6eb5" 
          transparent 
          opacity={0.15} 
          side={THREE.BackSide} 
          blending={THREE.AdditiveBlending} 
        />
      </mesh>
    </group>
  );
}

/** Mars approach — Moving toward the destination in Z-space */
function MarsApproach({ scrollProgress }) {
  const groupRef = useRef();
  const meshRef = useRef();
  const cloudsRef = useRef();
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(MARS_TEXTURE_URL, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      setTexture(tex);
    });
  }, []);

  useFrame((state) => {
    if (!groupRef.current || !meshRef.current) return;
    const sp = scrollProgress.current || 0;
    const time = state.clock.elapsedTime;
    
    // We see Mars from afar at the start, and it approaches at the end
    const approachProgress = Math.max(0, (sp - 0.4) / 0.6); // Start approach after 40% scroll
    
    // Move Mars from very far (Z: -200) to close (Z: -5)
    groupRef.current.position.z = -200 + (approachProgress * 195);
    groupRef.current.scale.setScalar(8 + approachProgress * 12);
    
    // Rotate 
    groupRef.current.rotation.y += 0.002;
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.003;
    }

    // Dynamic Dust Storm Flicker (Targeting Mesh Material)
    meshRef.current.material.emissiveIntensity = 0.1 + Math.sin(time * 0.5) * 0.05;
  });

  return (
    <group ref={groupRef}>
      {/* Planetary Body */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial 
          map={texture} 
          color={texture ? '#fff' : '#e8813a'} 
          roughness={0.8}
          metalness={0.1}
          emissive="#c1440e"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Landing Surface Plate — appears when very close */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.01, 0]}>
        <circleGeometry args={[0.08, 64]} />
        <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Cloud/Dust Layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[1.005, 64, 64]} />
        <meshStandardMaterial 
          color="#fad390" 
          transparent 
          opacity={0.15} 
          blending={THREE.AdditiveBlending} 
        />
      </mesh>
      {/* Atmospheric Shells omitted for brevity but remain in file */}

      {/* Atmospheric Glow (Outer) */}
      <mesh scale={1.06}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial 
          color="#ff4e00" 
          transparent 
          opacity={0.1} 
          side={THREE.BackSide} 
          blending={THREE.AdditiveBlending} 
        />
      </mesh>
      
      {/* Atmospheric Glow (Inner) */}
      <mesh scale={1.03}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial 
          color="#ff7f50" 
          transparent 
          opacity={0.15} 
          side={THREE.BackSide} 
          blending={THREE.AdditiveBlending} 
        />
      </mesh>
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
        // Add subtle shake
        groupRef.current.position.x = (Math.random() - 0.5) * 0.02 * intensity;
        groupRef.current.position.y += (Math.random() - 0.5) * 0.02 * intensity;
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
      {/* Main Hull */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 1.2, 32]} />
        <meshStandardMaterial color="#8ca0b8" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Nose Cone */}
      <mesh position={[0, 0.8, 0]}>
        <coneGeometry args={[0.3, 0.5, 32]} />
        <meshStandardMaterial color="#e8e4d8" />
      </mesh>
      {/* Fins */}
      {[0, 90, 180, 270].map((deg) => (
        <mesh key={deg} rotation={[0, (deg * Math.PI) / 180, 0]} position={[0, -0.4, 0]}>
          <boxGeometry args={[0.6, 0.3, 0.05]} />
          <meshStandardMaterial color="#8ca0b8" />
        </mesh>
      ))}
      {/* Engine Nozzle */}
      <mesh position={[0, -0.65, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 0.15, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Thruster Flame */}
      <mesh ref={engineRef} position={[0, -0.9, 0]}>
        <cylinderGeometry args={[0.15, 0.05, 0.4, 16]} />
        <meshStandardMaterial 
          color="#ffaa44" 
          emissive="#ffaa44"
          emissiveIntensity={2}
          transparent
          opacity={0.8}
        />
      </mesh>
      {/* Heat Glow Aura (Managed via Ref to avoid state updates) */}
      <mesh ref={heatGlowRef} position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.45, 0.6, 32]} />
        <meshBasicMaterial color="#ff4e00" transparent opacity={0} side={THREE.DoubleSide} />
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

function Section2Void({ active, showModal }) {
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
      end: '+=300%', // 300% of viewport height (matches 300vh)
      pin: true,
      scrub: 1,
      onUpdate: (self) => {
        scrollRef.current = self.progress;
        // Throttle React re-renders to ~10fps (HUD text only)
        if (Math.abs(self.progress - scrollPct) > 0.005) {
          setScrollPct(self.progress);
        }
      }
    });

    return () => {
      st.kill();
    };
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

  const distanceKm = Math.round(Math.min(1, scrollPct / 0.9) * TOTAL_DISTANCE_KM);
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
            <Suspense fallback={null}>
              <Canvas dpr={pixelRatio} camera={{ position: [0, 0, 5], fov: 60 }}>
                {/* Cinematic Space Lighting */}
                <ambientLight intensity={0.2} />
                <directionalLight position={[10, 5, 2]} intensity={3} color="#ffe5d9" />
                <pointLight position={[-5, -2, -5]} intensity={1.5} color="#44ddff" />
                
                <StarLayers scrollProgress={scrollRef} isMobile={isMobile} />
                <SolarSystemBackdrop />
                <EarthDeparture scrollProgress={scrollRef} />
                <MarsApproach scrollProgress={scrollRef} />
                <Spacecraft3D scrollProgress={scrollRef} />
                <ClickParticles bursts={bursts} />
              </Canvas>
            </Suspense>
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

        {/* Milestones */}
        <div className="void-milestones">
          {MILESTONES.map((m, idx) => {
            const revealed = scrollPct > idx * 0.15 && scrollPct < (idx + 1) * 0.15 + 0.12;
            return (
              <div
                className={`milestone-card ${revealed ? 'revealed' : 'hidden'}`}
                key={m.day}
                style={{
                  opacity: revealed ? 1 : 0,
                  transform: `translateY(${revealed ? 0 : 20}px)`,
                  pointerEvents: revealed ? 'all' : 'none'
                }}
              >
                <div className="hologram-flicker" />
                <div className="milestone-day">DAY {m.day}</div>
                <div className="milestone-title">{m.title}</div>
                <div className="milestone-log">{m.log}</div>
                <div className="hologram-scanline" />
              </div>
            );
          })}
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
