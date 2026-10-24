import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { Airport } from './Airport';
import { City } from './City';
import { Roads } from './Roads';
import { Terrain } from './Terrain';
import { Checkpoints } from './Checkpoints';

interface WorldProps {
  vehiclePosRef: React.RefObject<THREE.Vector3 | null>;
}

export const World: React.FC<WorldProps> = ({ vehiclePosRef }) => {
  const timeOfDay = useGameStore(state => state.timeOfDay);
  const weather = useGameStore(state => state.weather);
  const shadowsEnabled = useGameStore(state => state.settings.shadows);

  // Lighting configuration based on time of day
  const { sunColor, sunIntensity, sunPos, ambientColor, ambientIntensity, skyColor, fogColor, fogNear, fogFar } = useMemo(() => {
    switch (timeOfDay) {
      case 'sunset':
        return {
          sunColor: '#f97316',
          sunIntensity: 2.2,
          sunPos: [-1200, 250, -800] as [number, number, number],
          ambientColor: '#7c2d12',
          ambientIntensity: 0.6,
          skyColor: '#1e1b4b',
          fogColor: weather === 'foggy' ? '#431407' : '#2e1065',
          fogNear: weather === 'foggy' ? 80 : 250,
          fogFar: weather === 'foggy' ? 900 : 2800,
        };
      case 'night':
        return {
          sunColor: '#38bdf8',
          sunIntensity: 0.4,
          sunPos: [600, 600, 400] as [number, number, number],
          ambientColor: '#0f172a',
          ambientIntensity: 0.35,
          skyColor: '#020617',
          fogColor: '#020617',
          fogNear: weather === 'foggy' ? 50 : 200,
          fogFar: weather === 'foggy' ? 600 : 2200,
        };
      case 'day':
      default:
        return {
          sunColor: '#fef08a',
          sunIntensity: 2.4,
          sunPos: [800, 1000, 600] as [number, number, number],
          ambientColor: '#93c5fd',
          ambientIntensity: 0.8,
          skyColor: '#38bdf8',
          fogColor: weather === 'foggy' ? '#cbd5e1' : '#7dd3fc',
          fogNear: weather === 'foggy' ? 100 : 400,
          fogFar: weather === 'foggy' ? 1200 : 4500,
        };
    }
  }, [timeOfDay, weather]);

  return (
    <group>
      {/* Distance Atmospheric Fog */}
      <fog attach="fog" args={[fogColor, fogNear, fogFar]} />

      {/* Sky Ambient Light */}
      <ambientLight color={ambientColor} intensity={ambientIntensity} />

      {/* Directional Sunlight / Moonlight with Fast Optimized Shadows */}
      <directionalLight
        position={sunPos}
        color={sunColor}
        intensity={sunIntensity}
        castShadow={shadowsEnabled}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={10}
        shadow-camera-far={2500}
        shadow-camera-left={-400}
        shadow-camera-right={400}
        shadow-camera-top={400}
        shadow-camera-bottom={-400}
        shadow-bias={-0.0003}
      />

      {/* Sky Hemisphere Light */}
      <hemisphereLight args={[skyColor, '#1e293b', 0.5]} />

      {/* World Subsystems */}
      <Terrain />
      <Airport />
      <City />
      <Roads />
      <Checkpoints vehiclePosRef={vehiclePosRef} />
    </group>
  );
};
