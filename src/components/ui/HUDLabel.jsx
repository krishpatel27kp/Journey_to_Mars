/**
 * HUDLabel — Fixed bottom HUD bar with expanded telemetry items.
 * Displays current section, location, sol, vehicle, transit, signal delay, and mission name.
 * @module HUDLabel
 */
import { memo } from 'react';
import PropTypes from 'prop-types';

/** All HUD telemetry items */
const STATIC_ITEMS = [
  { label: 'VEHICLE', value: 'STARSHIP' },
  { label: 'TRANSIT', value: '253 DAYS' },
  { label: 'LAUNCH SITE', value: 'KSC, FL' },
  { label: 'SIGNAL DELAY', value: '12M 32S' },
  { label: 'MISSION', value: 'ARES-1' },
];

function HUDLabel({ sectionCode, sectionName, sol }) {
  return (
    <div
      className="hud-bottom-bar"
      aria-live="polite"
      aria-label={`Section ${sectionCode} of 05, ${sectionName}, Sol ${sol}`}
    >
      <div className="hud-item">
        <span className="hud-item-label">SECTION</span>
        <span className="hud-item-value">{sectionCode} / 05</span>
      </div>
      <div className="hud-item">
        <span className="hud-item-label">LOCATION</span>
        <span className="hud-item-value">{sectionName}</span>
      </div>
      <div className="hud-item">
        <span className="hud-item-label">SOL</span>
        <span className="hud-item-value">{sol}</span>
      </div>
      {STATIC_ITEMS.map((item) => (
        <div className="hud-item" key={item.label}>
          <span className="hud-item-label">{item.label}</span>
          <span className="hud-item-value">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

HUDLabel.propTypes = {
  sectionCode: PropTypes.string.isRequired,
  sectionName: PropTypes.string.isRequired,
  sol: PropTypes.string.isRequired,
};

export default memo(HUDLabel);
