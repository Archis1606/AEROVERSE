import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/gameStore';
import { soundSystem } from '../audio/SoundSystem';

interface CheckpointsProps {
  vehiclePosRef: React.RefObject<THREE.Vector3 | null>;
}

export const Checkpoints: React.FC<CheckpointsProps> = ({ vehiclePosRef }) => {
  const activeMission = useGameStore(state => state.activeMission);
  const isMissionRunning = useGameStore(state => state.isMissionRunning);
  const currentCheckpointIdx = useGameStore(state => state.currentCheckpointIdx);
  const advanceCheckpoint = useGameStore(state => state.advanceCheckpoint);

  const ringPulsateRef = useRef<THREE.Group>(null);

  // Check collision with the current active checkpoint
  useFrame((_, delta) => {
    if (!isMissionRunning || !activeMission.checkpoints.length) return;
    if (currentCheckpointIdx >= activeMission.checkpoints.length) return;
    if (!vehiclePosRef.current) return;

    const targetCp = activeMission.checkpoints[currentCheckpointIdx];
    const cpPos = new THREE.Vector3(...targetCp.position);
    const dist = vehiclePosRef.current.distanceTo(cpPos);

    if (dist <= targetCp.radius) {
      // Checkpoint achieved!
      soundSystem.playCheckpointDing();
      advanceCheckpoint();
    }

    if (ringPulsateRef.current) {
      ringPulsateRef.current.rotation.z += delta * 0.8;
    }
  });

  if (!isMissionRunning || !activeMission.checkpoints.length) return null;

  return (
    <group>
      {activeMission.checkpoints.map((cp, idx) => {
        const isCurrent = idx === currentCheckpointIdx;
        const isCompleted = idx < currentCheckpointIdx;
        if (isCompleted) return null; // Don't render passed checkpoints

        const pos = cp.position;
        const ringColor = isCurrent ? '#22d3ee' : '#334155';
        const emissiveColor = isCurrent ? '#06b6d4' : '#000000';
        const emissiveIntensity = isCurrent ? 0.9 : 0;

        if (cp.type === 'ring') {
          return (
            <group key={cp.id} position={pos} ref={isCurrent ? ringPulsateRef : undefined}>
              {/* Aerobatic Glowing Ring */}
              <mesh>
                <torusGeometry args={[cp.radius, 0.7, 12, 32]} />
                <meshStandardMaterial
                  color={ringColor}
                  emissive={emissiveColor}
                  emissiveIntensity={emissiveIntensity}
                  roughness={0.2}
                />
              </mesh>
              {/* Inner Crosshair / Waypoint Indicator for Current */}
              {isCurrent && (
                <group>
                  <pointLight color="#22d3ee" intensity={3} distance={cp.radius * 3} />
                  <mesh>
                    <sphereGeometry args={[1.2, 12, 12]} />
                    <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
                  </mesh>
                </group>
              )}
            </group>
          );
        }

        if (cp.type === 'gate') {
          return (
            <group key={cp.id} position={pos}>
              {/* Left Pillar */}
              <mesh position={[-cp.radius, cp.radius, 0]}>
                <cylinderGeometry args={[0.5, 0.5, cp.radius * 2, 8]} />
                <meshStandardMaterial color={ringColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
              </mesh>
              {/* Right Pillar */}
              <mesh position={[cp.radius, cp.radius, 0]}>
                <cylinderGeometry args={[0.5, 0.5, cp.radius * 2, 8]} />
                <meshStandardMaterial color={ringColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
              </mesh>
              {/* Top Bar */}
              <mesh position={[0, cp.radius * 2, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.4, 0.4, cp.radius * 2, 8]} />
                <meshStandardMaterial color={ringColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
              </mesh>
            </group>
          );
        }

        if (cp.type === 'helipad' || cp.type === 'runway_box') {
          return (
            <group key={cp.id} position={[pos[0], pos[1] + 0.1, pos[2]]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[cp.radius * 0.8, cp.radius, 32]} />
                <meshBasicMaterial color={isCurrent ? '#10b981' : '#334155'} side={THREE.DoubleSide} />
              </mesh>
              {isCurrent && (
                <pointLight position={[0, 2, 0]} color="#10b981" intensity={3} distance={cp.radius * 2} />
              )}
            </group>
          );
        }

        return null;
      })}
    </group>
  );
};
