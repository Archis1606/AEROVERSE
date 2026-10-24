import React from 'react';
import { VehicleTelemetry } from '../../types/vehicle';
import { SpeedUnit } from '../../types/settings';

interface HelicopterHudProps {
  telemetry: VehicleTelemetry;
  units: SpeedUnit;
  scale?: number;
}

export const HelicopterHud: React.FC<HelicopterHudProps> = ({ telemetry, units, scale = 1 }) => {
  let speedValue = Math.round(telemetry.speedKmh);
  let speedLabel = 'KM/H';
  if (units === 'knots') {
    speedValue = Math.round(telemetry.speedKmh * 0.539957);
    speedLabel = 'KTS';
  } else if (units === 'mph') {
    speedValue = Math.round(telemetry.speedKmh * 0.621371);
    speedLabel = 'MPH';
  }

  const altMeters = Math.max(0, Math.round(telemetry.altitudeM));
  const altFeet = Math.round(altMeters * 3.28084);
  const heading = Math.round((telemetry.headingDeg + 360) % 360);
  const vsi = Math.round(telemetry.verticalSpeedMs * 10) / 10;

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none flex items-center justify-center font-tech text-emerald-400 overflow-hidden"
      style={{ transform: `scale(${scale})` }}
    >
      {/* Top Heading Ring */}
      <div className="absolute top-6 flex flex-col items-center">
        <div className="px-4 py-1 border border-emerald-500/40 bg-emerald-950/40 backdrop-blur-sm text-sm font-bold flex items-center space-x-3">
          <span className="text-emerald-300">HDG:</span>
          <span className="text-white text-base">{heading.toString().padStart(3, '0')}°</span>
        </div>
      </div>

      {/* Center Tactical Crosshair with Hover Drift Rings */}
      <div className="relative w-48 h-48 border border-emerald-500/30 rounded-full flex items-center justify-center">
        {/* Inner Reticle */}
        <div className="w-16 h-16 border border-emerald-400/50 rounded-full flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
        </div>
        {/* Pitch / Roll Cross */}
        <div className="w-36 h-0.5 bg-emerald-500/30 absolute" />
        <div className="w-0.5 h-36 bg-emerald-500/30 absolute" />
      </div>

      {/* Left Collective & Rotor RPM Panel */}
      <div className="absolute left-10 space-y-4">
        {/* Collective Thrust Gauge */}
        <div className="bg-slate-900/80 border border-emerald-500/40 p-3 w-36">
          <div className="text-[10px] text-emerald-300 tracking-wider">COLLECTIVE</div>
          <div className="flex items-baseline space-x-2 my-1">
            <span className="text-2xl font-bold text-white">{Math.round(telemetry.throttlePercent)}%</span>
            <span className="text-xs text-emerald-400">[SHIFT/CTRL]</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 border border-emerald-500/30 overflow-hidden">
            <div
              className="h-full bg-emerald-400 transition-all duration-75"
              style={{ width: `${telemetry.throttlePercent}%` }}
            />
          </div>
        </div>

        {/* Rotor RPM Gauge */}
        <div className="bg-slate-900/80 border border-emerald-500/40 p-3 w-36">
          <div className="text-[10px] text-emerald-300 tracking-wider">ROTOR RPM</div>
          <div className="flex items-baseline space-x-2 my-1">
            <span className="text-xl font-bold text-white">{Math.round(telemetry.rpmPercent)}%</span>
            <span className="text-xs text-emerald-400">100% NOM</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 border border-emerald-500/30 overflow-hidden">
            <div
              className="h-full bg-emerald-400 transition-all duration-75"
              style={{ width: `${Math.min(100, telemetry.rpmPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Right Airspeed, Radar Alt & VSI Panel */}
      <div className="absolute right-10 space-y-4">
        {/* Ground Speed */}
        <div className="bg-slate-900/80 border border-emerald-500/40 p-3 w-36 text-right">
          <div className="text-[10px] text-emerald-300 tracking-wider">GROUND SPEED</div>
          <div className="text-2xl font-bold text-white glow-emerald">{speedValue}</div>
          <div className="text-[10px] text-emerald-400">{speedLabel}</div>
        </div>

        {/* Radar Altimeter (AGL) */}
        <div className="bg-slate-900/80 border border-emerald-500/40 p-3 w-36 text-right">
          <div className="text-[10px] text-emerald-300 tracking-wider">RADAR ALT (AGL)</div>
          <div className="text-2xl font-bold text-white glow-emerald">{altMeters} M</div>
          <div className="text-[10px] text-emerald-400">{altFeet} FT</div>
        </div>

        {/* Vertical Speed (VSI) */}
        <div className="bg-slate-900/80 border border-emerald-500/40 p-2.5 w-36 text-right">
          <div className="text-[10px] text-emerald-300 tracking-wider">VERTICAL SPEED</div>
          <div className="text-lg font-bold text-white">
            {vsi > 0 ? '+' : ''}{vsi} M/S
          </div>
        </div>
      </div>

      {/* Bottom Status Ribbon */}
      <div className="absolute bottom-8 flex items-center space-x-6 text-xs font-hud">
        {/* Hover Assist Toggle Indicator */}
        <div
          className={`px-3 py-1.5 border font-bold text-xs transition-all ${
            telemetry.hoverAssistActive
              ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 glow-emerald'
              : 'border-slate-700 text-slate-500'
          }`}
        >
          HOVER ASSIST: {telemetry.hoverAssistActive ? 'ON [H]' : 'OFF [H]'}
        </div>

        {/* Skid Ground Contact */}
        <div
          className={`px-3 py-1.5 border text-xs ${
            telemetry.isGrounded
              ? 'border-amber-400 bg-amber-500/20 text-amber-300'
              : 'border-emerald-500/30 text-emerald-400'
          }`}
        >
          SKID STATUS: {telemetry.isGrounded ? 'TOUCHDOWN' : 'AIRBORNE'}
        </div>

        {/* Tail Rotor Torque */}
        <div className="px-3 py-1.5 border border-emerald-500/40 bg-emerald-950/40 text-emerald-300">
          TORQUE: NORMAL
        </div>
      </div>
    </div>
  );
};
