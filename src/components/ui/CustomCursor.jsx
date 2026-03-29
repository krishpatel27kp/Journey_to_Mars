import { memo, useEffect, useRef, useState } from 'react';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';
import { playHUDBlip } from '../../utils/audioEngine';

const CURSOR_SIZE = 24;
const LERP_FACTOR = 0.15;

function CustomCursor() {
  const { isTouch } = useDeviceDetect();
  const cursorRef = useRef(null);
  const mousePos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const rafRef = useRef(null);

  useEffect(() => {
    if (isTouch) return;

    const onMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const isInteractive = (target) => {
      if (!target) return false;
      return (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.dataset?.hoverable === 'true'
      );
    };

    const onMouseOver = (e) => {
      if (isInteractive(e.target)) {
        setIsHovering(true);
        playHUDBlip(880, 'sine', 0.05);
      }
    };

    const onMouseOut = (e) => {
      if (isInteractive(e.target)) {
        setIsHovering(false);
      }
    };

    const onClick = (e) => {
      if (isInteractive(e.target)) {
        playHUDBlip(440, 'triangle', 0.1);
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseover', onMouseOver, { passive: true });
    document.addEventListener('mouseout', onMouseOut, { passive: true });
    document.addEventListener('click', onClick, { passive: true });

    const animate = () => {
      currentPos.current.x += (mousePos.current.x - currentPos.current.x) * LERP_FACTOR;
      currentPos.current.y += (mousePos.current.y - currentPos.current.y) * LERP_FACTOR;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${currentPos.current.x - CURSOR_SIZE / 2}px, ${currentPos.current.y - CURSOR_SIZE / 2}px)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
      document.removeEventListener('click', onClick);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isTouch]);

  if (isTouch) return null;

  const scale = isHovering ? 2 : 1;
  const color = isHovering ? 'var(--mars-dust)' : 'var(--hud-green)';

  return (
    <div
      ref={cursorRef}
      id="cursor"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: `${CURSOR_SIZE}px`,
        height: `${CURSOR_SIZE}px`,
        zIndex: 'var(--z-cursor)',
        pointerEvents: 'none',
        willChange: 'transform',
        transition: 'width 0.2s, height 0.2s',
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width={CURSOR_SIZE * scale}
        height={CURSOR_SIZE * scale}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          transition: 'width 0.2s, height 0.2s, color 0.2s',
        }}
      >
        {/* Top line */}
        <line x1="12" y1="2" x2="12" y2="9" stroke={color} strokeWidth="1.5" />
        {/* Bottom line */}
        <line x1="12" y1="15" x2="12" y2="22" stroke={color} strokeWidth="1.5" />
        {/* Left line */}
        <line x1="2" y1="12" x2="9" y2="12" stroke={color} strokeWidth="1.5" />
        {/* Right line */}
        <line x1="15" y1="12" x2="22" y2="12" stroke={color} strokeWidth="1.5" />
        {/* Center dot */}
        <circle cx="12" cy="12" r="1" fill={color} />
      </svg>
    </div>
  );
}

export default memo(CustomCursor);
