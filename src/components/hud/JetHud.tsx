import React from 'react';
import { VehicleTelemetry } from '../../types/vehicle';
import { SpeedUnit } from '../../types/settings';

interface JetHudProps {
  telemetry: VehicleTelemetry;
  units: SpeedUnit;
  scale?: number;
}

export const JetHud: React.FC<JetHudProps> = ({ telemetry, units, scale = 1 }) => {
  // Unit conversion
  let speedValue = Math.round(telemetry.speedKmh);
  let speedLabel = 'KM/H';
  if (units === 'knots') {
    speedValue = Math.round(telemetry.speedKmh * 0.539957);
    speedLabel = 'KTS';
  } else if (units === 'mph') {
    speedValue = Math.round(telemetry.speedKmh * 0.621371);
    speedLabel = 'MPH';
  }

  const altMeters = Math.round(telemetry.altitudeM);
  const altFeet = Math.round(telemetry.altitudeM * 3.28084);
  const heading = Math.round((telemetry.headingDeg + 360) % 360);
  const pitch = Math.round(telemetry.pitchDeg);
  const roll = telemetry.rollDeg;

  // Heading compass labels (N, 030, 060, E, 120, etc.)
  const compassOffset = -(heading / 360) * 800;

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none flex items-center justify-center font-tech text-cyan-400 overflow-hidden"
      style={{ transform: `scale(${scale})` }}
    >
      {/* --- TOP HEADING COMPASS TAPE --- */}
      <div className="absolute top-6 flex flex-col items-center">
        {/* Lubber line marker */}
        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-cyan-400 mb-1" />
        <div className="w-72 h-8 border border-cyan-400/40 bg-cyan-950/30 backdrop-blur-sm relative overflow-hidden flex items-center justify-center">
          <div
            className="absolute flex items-center space-x-6 text-xs whitespace-nowrap transition-transform duration-75"
            style={{ transform: `translateX(${compassOffset}px)` }}
          >
            {Array.from({ length: 3 }).map((_, loopIdx) => (
              <React.Fragment key={`compass_loop_${loopIdx}`}>
                <span className="font-bold text-amber-300">N</span>
                <span>030</span>
                <span>060</span>
                <span className="font-bold text-amber-300">E</span>
                <span>120</span>
                <span>150</span>
                <span className="font-bold text-amber-300">S</span>
                <span>210</span>
                <span>240</span>
                <span className="font-bold text-amber-300">W</span>
                <span>300</span>
                <span>330</span>
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="text-xs tracking-widest text-cyan-300 mt-1 font-bold">
          HDG: <span className="text-amber-300">{heading.toString().padStart(3, '0')}°</span>
        </div>
      </div>

      {/* --- LEFT AIRSPEED LADDER TAPE --- */}
      <div className="absolute left-10 w-24 h-64 border-r-2 border-cyan-400/60 flex flex-col justify-between items-end pr-2 text-xs">
        <div className="bg-cyan-950/70 border border-cyan-400/50 px-2 py-1 text-right w-full">
          <div className="text-[10px] text-cyan-300">AIRSPEED</div>
          <div className="text-2xl font-bold text-white glow-cyan">{speedValue}</div>
          <div className="text-[10px] text-cyan-400">{speedLabel}</div>
        </div>

        {/* Speed Tape Marks */}
        <div className="space-y-4 text-[10px] text-cyan-400/70 text-right">
          <div>— {speedValue + 60}</div>
          <div>— {speedValue + 30}</div>
          <div className="text-cyan-300 font-bold">▶ {speedValue}</div>
          <div>— {Math.max(0, speedValue - 30)}</div>
          <div>— {Math.max(0, speedValue - 60)}</div>
        </div>

        {/* G-Force & Stall Status */}
        <div className="space-y-1 w-full text-right">
          <div className="text-xs">
            G: <span className="font-bold text-white">{telemetry.gForce.toFixed(1)}</span>
          </div>
          {telemetry.isStalling && (
            <div className="bg-red-600 text-white font-bold px-1.5 py-0.5 text-[11px] animate-pulse text-center tracking-wider">
              STALL WARNING
            </div>
          )}
        </div>
      </div>

      {/* --- RIGHT ALTITUDE & VSI TAPE --- */}
      <div className="absolute right-10 w-24 h-64 border-l-2 border-cyan-400/60 flex flex-col justify-between items-start pl-2 text-xs">
        <div className="bg-cyan-950/70 border border-cyan-400/50 px-2 py-1 text-left w-full">
          <div className="text-[10px] text-cyan-300">ALTITUDE</div>
          <div className="text-2xl font-bold text-white glow-cyan">{altMeters}</div>
          <div className="text-[10px] text-cyan-400">{altFeet} FT</div>
        </div>

        {/* Altitude Tape Marks */}
        <div className="space-y-4 text-[10px] text-cyan-400/70">
          <div>{altMeters + 100} —</div>
          <div>{altMeters + 50} —</div>
          <div className="text-cyan-300 font-bold">◀ {altMeters}</div>
          <div>{Math.max(0, altMeters - 50)} —</div>
          <div>{Math.max(0, altMeters - 100)} —</div>
        </div>

        {/* Vertical Speed Indicator (VSI) */}
        <div className="w-full space-y-1">
          <div className="text-[10px] text-cyan-300">VSI: {telemetry.verticalSpeedMs > 0 ? '+' : ''}{Math.round(telemetry.verticalSpeedMs)} M/S</div>
          <div className="text-[10px] text-amber-300">
            AoA: {telemetry.aoaDeg !== undefined ? telemetry.aoaDeg.toFixed(1) : '—'}°
          </div>
        </div>
      </div>

      {/* --- CENTER ARTIFICIAL HORIZON & PITCH LADDER --- */}
      <div
        className="relative w-80 h-80 flex items-center justify-center transition-transform duration-75"
        style={{
          transform: `rotate(${-roll}deg) translateY(${pitch * 2.5}px)`
        }}
      >
        {/* Horizon Line */}
        <div className="w-64 h-0.5 bg-cyan-400/80 relative flex items-center justify-between">
          <div className="w-12 h-0.5 bg-cyan-400 absolute -left-14" />
          <div className="w-12 h-0.5 bg-cyan-400 absolute -right-14" />
        </div>

        {/* Pitch Rungs */}
        <div className="absolute top-10 flex items-center space-x-4 text-[10px]">
          <div className="w-8 border-t-2 border-r-2 border-cyan-400/60 h-2" />
          <span>+20</span>
          <div className="w-8 border-t-2 border-l-2 border-cyan-400/60 h-2" />
        </div>
        <div className="absolute top-24 flex items-center space-x-4 text-[10px]">
          <div className="w-12 border-t-2 border-r-2 border-cyan-400/80 h-2" />
          <span>+10</span>
          <div className="w-12 border-t-2 border-l-2 border-cyan-400/80 h-2" />
        </div>
        <div className="absolute bottom-24 flex items-center space-x-4 text-[10px]">
          <div className="w-12 border-b-2 border-r-2 border-cyan-400/80 border-dashed h-2" />
          <span>-10</span>
          <div className="w-12 border-b-2 border-l-2 border-cyan-400/80 border-dashed h-2" />
        </div>
        <div className="absolute bottom-10 flex items-center space-x-4 text-[10px]">
          <div className="w-8 border-b-2 border-r-2 border-cyan-400/60 border-dashed h-2" />
          <span>-20</span>
          <div className="w-8 border-b-2 border-l-2 border-cyan-400/60 border-dashed h-2" />
        </div>
      </div>

      {/* Flight Path Marker (Velocity Vector) Fixed at Center */}
      <div className="absolute flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-amber-300 rounded-full relative">
          <div className="w-3 h-0.5 bg-amber-300 absolute -left-3 top-1.5" />
          <div className="w-3 h-0.5 bg-amber-300 absolute -right-3 top-1.5" />
          <div className="w-0.5 h-2 bg-amber-300 absolute top-[-7px] left-1.5" />
        </div>
      </div>

      {/* --- BOTTOM TELEMETRY SYSTEM STATUS --- */}
      <div className="absolute bottom-8 flex items-center space-x-8 text-xs font-hud">
        {/* Throttle Bar */}
        <div className="flex items-center space-x-2 bg-slate-900/80 px-3 py-1.5 border border-cyan-500/30">
          <span className="text-[11px] text-cyan-300">THR</span>
          <div className="w-24 h-3 bg-slate-800 border border-cyan-500/40 relative overflow-hidden">
            <div
              className={`h-full transition-all duration-75 ${
                telemetry.afterburnerActive ? 'bg-amber-400 glow-amber' : 'bg-cyan-400'
              }`}
              style={{ width: `${telemetry.throttlePercent}%` }}
            />
          </div>
          <span className="w-8 text-right font-bold text-white">{Math.round(telemetry.throttlePercent)}%</span>
        </div>

        {/* Afterburner Status */}
        <div
          className={`px-3 py-1 border font-bold text-xs ${
            telemetry.afterburnerActive
              ? 'border-amber-400 bg-amber-500/20 text-amber-300 glow-amber'
              : 'border-slate-700 text-slate-500'
          }`}
        >
          AB [SPACE]
        </div>

        {/* Landing Gear Status */}
        <div
          className={`px-3 py-1 border font-bold text-xs ${
            telemetry.landingGearDown
              ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
              : 'border-cyan-400 bg-cyan-500/10 text-cyan-300'
          }`}
        >
          GEAR: {telemetry.landingGearDown ? 'DOWN [G]' : 'UP [G]'}
        </div>

        {/* Flight Stabilizer Status */}
        <div className="px-3 py-1 border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 text-xs">
          STAB: AUTO
        </div>

        {/* Surface Type */}
        {telemetry.surfaceType && (
          <div className="px-3 py-1 border border-slate-700 bg-slate-900/60 text-slate-400 text-[10px] uppercase tracking-wider">
            {telemetry.surfaceType}
          </div>
        )}
      </div>

      {/* Right-click hint */}
      <div className="absolute bottom-2 right-4 text-[9px] text-slate-600 pointer-events-none">
        RMB+DRAG to orbit camera
      </div>
    </div>
  );
};
