/**
 * MissionModal — Opening mission briefing modal with typewriter effect.
 * Displayed on first load, dismissable with ACKNOWLEDGE button.
 */
import { memo, useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { MISSION_BRIEFING, MISSION_DATA } from '../../utils/telemetryData';
import { resumeAudioContext, startSpaceDrone, playHUDBlip } from '../../utils/audioEngine';

const CHAR_DELAY_MS = 25;

function MissionModal({ onDismiss }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (indexRef.current < MISSION_BRIEFING.length) {
        setDisplayedText(MISSION_BRIEFING.substring(0, indexRef.current + 1));
        indexRef.current += 1;
      } else {
        clearInterval(intervalRef.current);
        setIsComplete(true);
      }
    }, CHAR_DELAY_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleSkip = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDisplayedText(MISSION_BRIEFING);
    setIsComplete(true);
  }, []);

  const handleAcknowledge = useCallback(() => {
    // Aggressively start audio on user interaction!
    resumeAudioContext();
    startSpaceDrone(0.08); // Increase intensity
    playHUDBlip(1200, 'square', 0.1); 
    onDismiss();
  }, [onDismiss]);

  return (
    <AnimatePresence>
      <motion.div
        className="mission-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="mission-modal hud-border"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="launch-briefing-label">CLASSIFIED · ARES PROGRAM</div>
          <h2>Mission Briefing</h2>
          <div className="mission-modal-content" style={{ maxHeight: '50vh', overflowY: 'auto', paddingRight: '10px', marginBottom: '20px' }}>
            <p style={{ whiteSpace: 'pre-line', textAlign: 'left', fontFamily: 'var(--font-body)' }}>
              {displayedText}
              {!isComplete && <span className="typewriter-cursor" />}
            </p>
          </div>

          <div className="modal-facts">
            <div className="modal-fact">
              <div className="modal-fact-label">Crew</div>
              <div className="modal-fact-value">{MISSION_DATA.crew} astronauts</div>
            </div>
            <div className="modal-fact">
              <div className="modal-fact-label">Distance</div>
              <div className="modal-fact-value">225M km</div>
            </div>
            <div className="modal-fact">
              <div className="modal-fact-label">Transit</div>
              <div className="modal-fact-value">{MISSION_DATA.transitDays} days</div>
            </div>
            <div className="modal-fact">
              <div className="modal-fact-label">Signal Delay</div>
              <div className="modal-fact-value">{MISSION_DATA.signalDelay}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            {!isComplete && (
              <button onClick={handleSkip} aria-label="Skip briefing typewriter animation">
                SKIP
              </button>
            )}
            <button
              className="launch-button"
              onClick={handleAcknowledge}
              aria-label="Acknowledge mission briefing and proceed"
              style={{ opacity: isComplete ? 1 : 0.8 }}
            >
              ACKNOWLEDGE
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

MissionModal.propTypes = {
  onDismiss: PropTypes.func.isRequired,
};

export default memo(MissionModal);
