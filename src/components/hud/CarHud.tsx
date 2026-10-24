import React from 'react';
import { VehicleTelemetry } from '../../types/vehicle';
import { SpeedUnit } from '../../types/settings';

interface CarHudProps {
  telemetry: VehicleTelemetry;
  units: SpeedUnit;
  scale?: number;
}

export const CarHud: React.FC<CarHudProps> = ({ telemetry, units, scale = 1 }) => {
  let speedValue = Math.round(telemetry.speedKmh);
  let speedLabel = 'KM/H';
  if (units === 'mph') {
    speedValue = Math.round(telemetry.speedKmh * 0.621371);
    speedLabel = 'MPH';
  }

  const gearText =
    telemetry.gear === -1
      ? 'R'
      : telemetry.speedKmh < 1 && telemetry.throttlePercent < 5
      ? 'N'
      : telemetry.gear.toString();

  const rpm = Math.round(telemetry.engineRpm);
  const maxRpm = 8500;
  const rpmPercent = Math.min(100, (rpm / maxRpm) * 100);
  const isRedline = rpm >= 7800;

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none flex flex-col justify-end items-center pb-8 font-tech text-white"
      style={{ transform: `scale(${scale})` }}
    >
      {/* Central Supercar Cluster Dashboard */}
      <div className="relative flex items-end justify-center space-x-6 bg-slate-950/80 border border-sky-500/30 p-5 rounded-2xl backdrop-blur-md shadow-2xl">
        {/* Left: Gear Indicator & Drivetrain Info */}
        <div className="flex flex-col items-center justify-center w-24">
          <div className="text-[11px] font-bold text-sky-400 tracking-wider">GEAR</div>
          <div
            className={`text-5xl font-black font-display my-1 ${
              gearText === 'R'
                ? 'text-amber-400'
                : isRedline
                ? 'text-red-500 animate-pulse'
                : 'text-white'
            }`}
          >
            {gearText}
          </div>
          {/* Handbrake status badge */}
          {telemetry.driftAngleDeg > 12 && (
            <div className="bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider animate-bounce">
              DRIFT {Math.round(telemetry.driftAngleDeg)}°
            </div>
          )}
        </div>

        {/* Center: Digital Speedometer & Curved RPM Arch */}
        <div className="flex flex-col items-center w-52">
          {/* RPM Bar Graph */}
          <div className="w-full flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span>0</span>
            <span>2</span>
            <span>4</span>
            <span>6</span>
            <span className="text-red-400 font-bold">8</span>
          </div>

          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700 flex p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-75 ${
                isRedline
                  ? 'bg-gradient-to-r from-sky-400 via-amber-400 to-red-500 glow-amber'
                  : 'bg-gradient-to-r from-sky-400 to-sky-500'
              }`}
              style={{ width: `${rpmPercent}%` }}
            />
          </div>

          {/* Large Digital Speed Readout */}
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-6xl font-black font-display tracking-tight text-white glow-cyan">
              {speedValue}
            </span>
            <span className="text-sm font-bold text-sky-400">{speedLabel}</span>
          </div>

          {/* RPM Numeric Display */}
          <div className="text-xs text-slate-400 mt-1">
            <span className="font-bold text-slate-200">{rpm}</span> RPM
          </div>
        </div>

        {/* Right: Assists & Dynamic Telemetry */}
        <div className="flex flex-col space-y-2 w-28 text-xs">
          {/* TCS Traction Control Badge */}
          <div
            className={`px-2 py-1 border text-center font-bold text-[11px] rounded transition-all ${
              telemetry.tractionControlActive
                ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                : 'border-slate-800 text-slate-600'
            }`}
          >
            TCS ACTIVE
          </div>

          {/* ABS Badge */}
          <div className="px-2 py-1 border border-slate-800 text-slate-500 text-center text-[11px] rounded">
            ABS READY
          </div>

          {/* G-Force Lateral Ball */}
          <div className="bg-slate-900 border border-slate-800 p-1.5 rounded text-center">
            <div className="text-[10px] text-slate-400">G-FORCE</div>
            <div className="font-bold text-sm text-sky-300">{telemetry.gForce.toFixed(2)} G</div>
          </div>
        </div>
      </div>
    </div>
  );
};
