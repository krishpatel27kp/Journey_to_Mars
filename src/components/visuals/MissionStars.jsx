/**
 * MissionStars — Reusable, high-performance starfield component.
 * Features: Warping/stretching effect during transit, twinkling stars, and point-size attenuation.
 */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateStarPositions } from '../../utils/stars';

/**
 * Standard Starfield with optional velocity-based stretching.
 */
export function MissionStars({ 
  count = 1500, 
  radius = 100, 
  twinkle = false, 
  scrollProgress = null,
  color = "#ffffff",
  size = 0.08
}) {
  const layerRef = useRef();
  const prevScroll = useRef(0);
  const velocity = useRef(0);
  const points = useMemo(() => generateStarPositions(count, radius), [count, radius]);

  useFrame((state) => {
    if (!layerRef.current) return;
    
    // Constant slow drift
    layerRef.current.rotation.y += 0.0001;
    layerRef.current.rotation.z += 0.00005;

    // Optional: Warp speed stretch (for transit phases)
    if (scrollProgress && scrollProgress.current !== undefined) {
      const sp = scrollProgress.current;
      velocity.current = Math.abs(sp - prevScroll.current) * 50;
      prevScroll.current = sp;

      const scaling = 1 + velocity.current * 1.8;
      layerRef.current.scale.z = THREE.MathUtils.lerp(layerRef.current.scale.z, scaling, 0.1);
      layerRef.current.position.z = sp * 100; // parallax move
    }

    // Optional: Twinkle (opacity pulse)
    if (twinkle) {
      const time = state.clock.elapsedTime;
      layerRef.current.material.opacity = 0.4 + Math.sin(time * 0.5) * 0.2;
    }
  });

  return (
    <points ref={layerRef}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position" 
          count={count} 
          array={points} 
          itemSize={3} 
        />
      </bufferGeometry>
      <pointsMaterial 
        color={color} 
        size={size} 
        transparent 
        opacity={0.6} 
        sizeAttenuation 
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
