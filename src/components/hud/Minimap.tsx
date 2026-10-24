import React from 'react';
import { useGameStore } from '../../store/gameStore';

export const Minimap: React.FC = () => {
  const activeMission = useGameStore(state => state.activeMission);
  const currentCheckpointIdx = useGameStore(state => state.currentCheckpointIdx);
  const isMissionRunning = useGameStore(state => state.isMissionRunning);
  const telemetry = useGameStore(state => state.telemetry);

  const vehicleHeadingDeg = telemetry.headingDeg;
  const posX = telemetry.posX;
  const posZ = telemetry.posZ;

  // Radar map dimensions: radius 70px representing 1500m radius
  const radarScale = 70 / 1200; // 70px = 1200m

  // Compute checkpoint marker on radar
  let cpDot: { x: number; y: number } | null = null;
  if (isMissionRunning && activeMission.checkpoints.length > currentCheckpointIdx) {
    const cp = activeMission.checkpoints[currentCheckpointIdx];
    const dx = cp.position[0] - posX;
    const dz = cp.position[2] - posZ;

    // Rotate relative to vehicle heading
    const headingRad = (vehicleHeadingDeg * Math.PI) / 180;
    const rotX = dx * Math.cos(headingRad) - dz * Math.sin(headingRad);
    const rotY = dx * Math.sin(headingRad) + dz * Math.cos(headingRad);

    const dist = Math.sqrt(rotX * rotX + rotY * rotY);
    const clampedDist = Math.min(62, dist * radarScale);
    const angle = Math.atan2(rotY, rotX);

    cpDot = {
      x: Math.cos(angle) * clampedDist,
      y: Math.sin(angle) * clampedDist
    };
  }

  return (
    <div className="absolute top-6 right-6 pointer-events-none select-none">
      <div className="relative w-36 h-36 rounded-full bg-slate-950/80 border-2 border-cyan-500/40 backdrop-blur-md flex items-center justify-center overflow-hidden shadow-2xl">
        {/* Radar concentric rings */}
        <div className="absolute w-24 h-24 border border-cyan-500/20 rounded-full" />
        <div className="absolute w-12 h-12 border border-cyan-500/20 rounded-full" />
        <div className="absolute w-full h-[1px] bg-cyan-500/20" />
        <div className="absolute h-full w-[1px] bg-cyan-500/20" />

        {/* Airport Runway footprint marker */}
        <div
          className="absolute w-2 h-16 bg-slate-400/40 rounded-sm"
          style={{
            transform: `translate(${-posX * radarScale}px, ${-posZ * radarScale}px) rotate(${vehicleHeadingDeg}deg)`
          }}
        />

        {/* Target Checkpoint waypoint blip */}
        {cpDot && (
          <div
            className="absolute w-3.5 h-3.5 bg-amber-400 border border-white rounded-full animate-ping"
            style={{
              transform: `translate(${cpDot.x}px, ${cpDot.y}px)`
            }}
          />
        )}
        {cpDot && (
          <div
            className="absolute w-2.5 h-2.5 bg-amber-400 border border-black rounded-full"
            style={{
              transform: `translate(${cpDot.x}px, ${cpDot.y}px)`
            }}
          />
        )}

        {/* Player vehicle center chevron */}
        <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[10px] border-b-cyan-400 shadow-md" />

        {/* Radar Range Label */}
        <div className="absolute bottom-1 text-[9px] text-cyan-400 font-tech font-bold">1.2 KM</div>
      </div>
    </div>
  );
};
