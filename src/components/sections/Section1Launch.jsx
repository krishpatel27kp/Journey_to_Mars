/**
 * Section1Launch — "T-MINUS ZERO" Earth launch sequence.
 * Features: Astronaut Crew Manifest on Earth Launchpad.
 * @module Section1Launch
 */
import React, { memo, useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  NARRATIVE_TEXT, 
  MISSION_DATA, 
  TYPEWRITER_DELAY_MS 
} from '../../utils/telemetryData';
import { playTick, playRocketLaunch, resumeAudioContext, startSpaceDrone } from '../../utils/audioEngine';

function Section1Launch({ active, showModal }) {
  const [displayedText, setDisplayedText] = useState('');
  const [rocketLaunched, setRocketLaunched] = useState(false);
  const indexRef = useRef(0);
  const sectionRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  const yOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const scaleImage = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  /* Typewriter effect */
  useEffect(() => {
    const text = NARRATIVE_TEXT.section1;
    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.substring(0, indexRef.current + 1));
        indexRef.current += 1;
        if (!showModal) playTick();
      } else {
        clearInterval(interval);
      }
    }, TYPEWRITER_DELAY_MS);
    return () => clearInterval(interval);
  }, [showModal]);

  /* Simplified Scroll Trigger for Launch Audio */
  useEffect(() => {
    const handleScroll = () => {
      const sp = window.scrollY / (window.innerHeight);
      if (sp > 0.5 && !rocketLaunched) {
        setRocketLaunched(true);
        resumeAudioContext();
        startSpaceDrone(); // Make sure drone is playing
        playRocketLaunch();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [rocketLaunched]);

  return (
    <section
      ref={sectionRef}
      className="section section-launch relative overflow-hidden"
      id="section-launch"
      aria-label="T-Minus Zero — Earth launch sequence"
      style={{ position: 'relative', height: '100vh', background: 'var(--void)' }}
    >
      {/* Cinematic Hero Background - The Astronaut Crew */}
      <motion.div 
        className="launch-hero-bg absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: active ? 1 : 0.5 }}
        transition={{ duration: 2, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          backgroundImage: 'url(/images/ares_crew.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 80%',
          zIndex: 0,
          scale: scaleImage,
          y: yParallax
        }}
      >
        {/* Shadow overlays to merge seamlessly with HUD */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.8) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,5,15,1) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.8) 100%)' }} />
      </motion.div>

      {/* Content */}
      <motion.div className="launch-content" style={{ zIndex: 10, position: 'relative', opacity: yOpacity }}>
        <div className="launch-briefing" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', borderLeft: '2px solid var(--hud-green)', padding: '2rem', marginTop: '10vh' }}>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          >
            <div className="launch-briefing-label">ARES-1 · CREW ON DECK</div>
            <h1>T-Minus Zero</h1>
            <div className="launch-narrative mt-4 text-glow">
              <p>{displayedText}<span className="typewriter-cursor" /></p>
            </div>
            
            <div className="crew-manifest mt-8 border-t border-[var(--hud-green)] pt-4" style={{ opacity: 0.9 }}>
              <span className="text-xs uppercase tracking-[0.2em] text-[var(--hud-green)]" style={{fontFamily: 'var(--font-display)'}}>Primary Objectives:</span>
              <ul className="list-disc pl-5 mt-2 text-sm text-[var(--star-white)]" style={{fontFamily: 'var(--font-mono)', letterSpacing: '0.05em'}}>
                <li style={{marginBottom: '4px'}}>Load 6 Primary Crew Members</li>
                <li style={{marginBottom: '4px'}}>Complete System Integrity Check</li>
                <li style={{marginBottom: '4px'}}>Execute Trans-Martian Injection</li>
                <li>Distance: {MISSION_DATA.distanceKm} KM</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll hint — fades out as user scrolls */}
      <motion.div className="scroll-hint z-10" style={{ position: 'absolute', bottom: '40px', width: '100%', textAlign: 'center', opacity: yOpacity, transition: 'opacity 1s' }}>
        <motion.div 
          animate={{ y: [0, 10, 0] }} 
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="scroll-hint-text font-mono text-xs tracking-widest text-[var(--hud-green)] mb-2" style={{fontFamily: 'var(--font-display)'}}>SCROLL FOR LAUNCH</div>
          <svg className="scroll-hint-chevron mx-auto" style={{margin: '0 auto'}} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--hud-green)" strokeWidth="1.5">
            <path d="M7 10L12 15L17 10" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default memo(Section1Launch);
