import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { useFrame } from '@react-three/fiber';
import { Airport } from './Airport';
import { City } from './City';
import { Roads } from './Roads';
import { Terrain } from './Terrain';
import { Checkpoints } from './Checkpoints';

interface WorldProps {
  vehiclePosRef: React.RefObject<THREE.Vector3 | null>;
}

// Procedural cloud puff using spheres
const CloudPuff: React.FC<{ position: [number, number, number]; scale: number; opacity: number }> = ({ position, scale, opacity }) => {
  const mat = useMemo(() =>
    new THREE.MeshStandardMaterial({ color: '#e2e8f0', transparent: true, opacity, roughness: 1, metalness: 0, depthWrite: false }),
    [opacity]
  );
  return (
    <mesh position={position} material={mat} castShadow={false} receiveShadow={false}>
      <sphereGeometry args={[scale, 7, 5]} />
    </mesh>
  );
};

// A single cloud composed of several puffs
const Cloud: React.FC<{ x: number; y: number; z: number; size: number }> = ({ x, y, z, size }) => {
  const puffs = useMemo(() => {
    const result = [];
    const count = 5 + Math.floor(size * 2);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = size * 0.6;
      result.push({
        px: Math.cos(angle) * r + (Math.random() - 0.5) * size * 0.6,
        py: (Math.random() - 0.5) * size * 0.3,
        pz: Math.sin(angle) * r * 0.5 + (Math.random() - 0.5) * size * 0.4,
        s: size * (0.6 + Math.random() * 0.7),
        op: 0.55 + Math.random() * 0.25
      });
    }
    // Center puff
    result.push({ px: 0, py: 0, pz: 0, s: size * 1.1, op: 0.7 });
    return result;
  }, [size]);

  return (
    <group position={[x, y, z]}>
      {puffs.map((p, i) => (
        <CloudPuff key={i} position={[p.px, p.py, p.pz]} scale={p.s} opacity={p.op} />
      ))}
    </group>
  );
};

// Cloud layer with gentle drift
const Clouds: React.FC<{ weather: string; timeOfDay: string }> = ({ weather, timeOfDay }) => {
  const groupRef = useRef<THREE.Group>(null);

  const clouds = useMemo(() => {
    const count = weather === 'clear' ? 8 : weather === 'foggy' ? 28 : 18;
    const baseAlt = timeOfDay === 'night' ? 320 : 280;
    const spread = 3000;
    return Array.from({ length: count }).map((_, i) => ({
      x: (Math.random() - 0.5) * spread,
      y: baseAlt + (Math.random() - 0.5) * 120,
      z: (Math.random() - 0.5) * spread,
      size: 40 + Math.random() * 80
    }));
  }, [weather, timeOfDay]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      // Very slow drift
      groupRef.current.position.x += delta * 4;
      if (groupRef.current.position.x > 200) groupRef.current.position.x = -200;
    }
  });

  if (weather === 'clear' && clouds.length < 10 && Math.random() > 0.05) {
    // Sparse clouds in clear weather — only show a subset
  }

  return (
    <group ref={groupRef}>
      {clouds.map((c, i) => (
        <Cloud key={i} x={c.x} y={c.y} z={c.z} size={c.size} />
      ))}
    </group>
  );
};

export const World: React.FC<WorldProps> = ({ vehiclePosRef }) => {
  const timeOfDay = useGameStore(state => state.timeOfDay);
  const weather = useGameStore(state => state.weather);
  const shadowsEnabled = useGameStore(state => state.settings.shadows);

  const { sunColor, sunIntensity, sunPos, ambientColor, ambientIntensity, skyColor, fogColor, fogNear, fogFar, cloudColor } = useMemo(() => {
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
          cloudColor: '#fbbf24'
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
          cloudColor: '#1e293b'
        };
      case 'day':
      default:
        return {
          sunColor: '#fef08a',
          sunIntensity: 2.4,
          sunPos: [800, 1000, 600] as [number, number, number],
          ambientColor: '#93c5fd',
          ambientIntensity: 0.85,
          skyColor: '#38bdf8',
          fogColor: weather === 'foggy' ? '#cbd5e1' : '#7dd3fc',
          fogNear: weather === 'foggy' ? 100 : 500,
          fogFar: weather === 'foggy' ? 1200 : 5500,
          cloudColor: '#f0f9ff'
        };
    }
  }, [timeOfDay, weather]);

  return (
    <group>
      {/* Distance Atmospheric Fog */}
      <fog attach="fog" args={[fogColor, fogNear, fogFar]} />

      {/* Sky Background Color */}
      <color attach="background" args={[skyColor]} />

      {/* Sky Ambient Light */}
      <ambientLight color={ambientColor} intensity={ambientIntensity} />

      {/* Directional Sunlight / Moonlight */}
      <directionalLight
        position={sunPos}
        color={sunColor}
        intensity={sunIntensity}
        castShadow={shadowsEnabled}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={10}
        shadow-camera-far={3000}
        shadow-camera-left={-600}
        shadow-camera-right={600}
        shadow-camera-top={600}
        shadow-camera-bottom={-600}
        shadow-bias={-0.0002}
      />

      {/* Sky Hemisphere Light — sky/ground color blend */}
      <hemisphereLight args={[skyColor, '#0f1a0a', 0.55]} />

      {/* Procedural Cloud Layer */}
      <Clouds weather={weather} timeOfDay={timeOfDay} />

      {/* World Subsystems */}
      <Terrain />
      <Airport />
      <City />
      <Roads />
      <Checkpoints vehiclePosRef={vehiclePosRef} />
    </group>
  );
};
