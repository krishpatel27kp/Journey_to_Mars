/**
 * ProgressBar — Fixed mission progress bar at top of viewport.
 * Shows scroll progress as gradient fill with a spacecraft icon.
 */
import { memo } from 'react';
import PropTypes from 'prop-types';
import { useScrollProgress } from '../../hooks/useScrollProgress';

const BAR_HEIGHT = 3;

function ProgressBar() {
  const progress = useScrollProgress();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: `${BAR_HEIGHT}px`,
        background: 'var(--void)',
        zIndex: 'var(--z-hud)',
        overflow: 'visible',
      }}
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Mission progress"
    >
      <div
        style={{
          height: '100%',
          width: `${progress * 100}%`,
          background: 'linear-gradient(90deg, var(--earth-blue), var(--mars-rust))',
          transition: 'width 0.1s linear',
          position: 'relative',
        }}
      >
        {/* Spacecraft icon at progress tip */}
        <div
          className="progress-ship"
          style={{
            position: 'absolute',
            right: -6,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 12,
            height: 12,
          }}
        >
          <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" width="12" height="12">
            <path d="M6 0L8 5L12 6L8 7L6 12L4 7L0 6L4 5L6 0Z" fill="var(--star-white)" />
          </svg>
        </div>
      </div>
    </div>
  );
}

ProgressBar.propTypes = {};

export default memo(ProgressBar);
