import React, { useState, useCallback } from 'react';
import { VehicleTelemetry } from '../../types/vehicle';
import { VehicleCategory } from '../../types/vehicle';

interface DevTelemetryProps {
  telemetry: VehicleTelemetry;
  category: VehicleCategory;
}

const fmt = (v: number | undefined, dec = 1) => (v !== undefined ? v.toFixed(dec) : '—');
const fmtKN = (n: number | undefined) => (n !== undefined ? (n / 1000).toFixed(1) + ' kN' : '—');

export const DevTelemetryOverlay: React.FC<DevTelemetryProps> = ({ telemetry, category }) => {
  const [visible, setVisible] = useState(false);

  const toggle = useCallback(() => setVisible(v => !v), []);

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-auto select-none" style={{ fontFamily: 'monospace' }}>
      <button
        onClick={toggle}
        style={{
          background: 'rgba(0,0,0,0.6)',
          border: '1px solid rgba(100,255,100,0.4)',
          color: '#4ade80',
          padding: '3px 10px',
          borderRadius: 6,
          fontSize: 10,
          letterSpacing: '0.1em',
          cursor: 'pointer'
        }}
      >
        {visible ? '▼ TELEMETRY' : '▲ TELEMETRY'}
      </button>

      {visible && (
        <div style={{
          background: 'rgba(0,0,0,0.82)',
          border: '1px solid rgba(100,255,100,0.35)',
          borderRadius: 8,
          padding: '8px 14px',
          marginTop: 4,
          color: '#a3e635',
          fontSize: 11,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2px 18px',
          minWidth: 380
        }}>
          <Row label="Speed" value={fmt(telemetry.speedKmh) + ' km/h  |  ' + fmt(telemetry.speedKnots) + ' kts'} />
          <Row label="Altitude" value={fmt(telemetry.altitudeM) + ' m  |  ' + fmt(telemetry.altitudeFt) + ' ft'} />
          <Row label="Vertical Spd" value={fmt(telemetry.verticalSpeedMs) + ' m/s'} />
          <Row label="Heading" value={fmt(telemetry.headingDeg) + '°'} />
          <Row label="Pitch" value={fmt(telemetry.pitchDeg) + '°'} />
          <Row label="Roll" value={fmt(telemetry.rollDeg) + '°'} />
          <Row label="G-Force" value={fmt(telemetry.gForce) + ' G'} />
          <Row label="Throttle" value={fmt(telemetry.throttlePercent) + '%'} />
          <Row label="Grounded" value={telemetry.isGrounded ? 'YES' : 'no'} highlight={telemetry.isGrounded} />
          <Row label="Surface" value={telemetry.surfaceType || 'terrain'} />

          {category === 'jet' && <>
            <Row label="AoA" value={fmt(telemetry.aoaDeg) + '°'} warn={Math.abs(telemetry.aoaDeg || 0) > 18} />
            <Row label="Thrust" value={fmtKN(telemetry.thrustN)} />
            <Row label="Lift" value={fmtKN(telemetry.liftN)} />
            <Row label="Drag" value={fmtKN(telemetry.dragN)} />
            <Row label="Afterburner" value={telemetry.afterburnerActive ? 'ON' : 'off'} highlight={telemetry.afterburnerActive} />
            <Row label="Landing Gear" value={telemetry.landingGearDown ? 'DOWN' : 'UP'} />
            <Row label="Stalling" value={telemetry.isStalling ? '⚠ STALL' : 'ok'} warn={telemetry.isStalling} />
          </>}

          {category === 'helicopter' && <>
            <Row label="Lift" value={fmtKN(telemetry.liftN)} />
            <Row label="Drag" value={fmtKN(telemetry.dragN)} />
            <Row label="Rotor RPM" value={fmt(telemetry.rpmPercent) + '%'} />
            <Row label="Hover Assist" value={telemetry.hoverAssistActive ? 'ON' : 'off'} highlight={telemetry.hoverAssistActive} />
          </>}

          {category === 'car' && <>
            <Row label="Gear" value={String(telemetry.gear)} />
            <Row label="RPM" value={fmt(telemetry.engineRpm, 0)} />
            <Row label="Drift Angle" value={fmt(telemetry.driftAngleDeg) + '°'} warn={telemetry.driftAngleDeg > 25} />
            <Row label="TCS" value={telemetry.tractionControlActive ? 'ON' : 'off'} highlight={telemetry.tractionControlActive} />
          </>}

          <div style={{ gridColumn: '1/-1', marginTop: 4, borderTop: '1px solid rgba(100,255,100,0.2)', paddingTop: 4, color: '#6b7280', fontSize: 10 }}>
            pos: {fmt(telemetry.posX, 0)}, {fmt(telemetry.altitudeM, 0)}, {fmt(telemetry.posZ, 0)} m
          </div>
        </div>
      )}
    </div>
  );
};

const Row: React.FC<{ label: string; value: string; highlight?: boolean; warn?: boolean }> = ({ label, value, highlight, warn }) => (
  <>
    <span style={{ color: '#64748b', whiteSpace: 'nowrap' }}>{label}:</span>
    <span style={{ color: warn ? '#ef4444' : highlight ? '#22c55e' : '#a3e635', fontWeight: 600 }}>{value}</span>
  </>
);
