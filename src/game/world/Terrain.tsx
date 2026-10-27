import React, { useMemo } from 'react';
import * as THREE from 'three';

interface MountainDef {
  x: number;
  z: number;
  radius: number;
  height: number;
  segments?: number;
}

const MOUNTAINS: MountainDef[] = [
  // North Mountain Range
  { x: -700, z: -1100, radius: 320, height: 280, segments: 14 },
  { x: -300, z: -1250, radius: 380, height: 360, segments: 16 },
  { x: 150, z: -1300, radius: 340, height: 310, segments: 14 },
  { x: 600, z: -1150, radius: 300, height: 250, segments: 12 },

  // West Canyon Wall
  { x: -950, z: -600, radius: 280, height: 220, segments: 12 },
  { x: -1050, z: -150, radius: 310, height: 260, segments: 12 },
  { x: -900, z: 350, radius: 270, height: 210, segments: 11 },
  { x: -800, z: 750, radius: 250, height: 180, segments: 10 },

  // East Scenic Peaks
  { x: 900, z: -800, radius: 280, height: 240, segments: 12 },
  { x: 1050, z: -300, radius: 320, height: 290, segments: 13 },
  { x: 950, z: 200, radius: 260, height: 200, segments: 11 },

  // Foothills (smaller, near airport area)
  { x: -400, z: -700, radius: 160, height: 90, segments: 8 },
  { x: 350, z: -900, radius: 140, height: 80, segments: 8 },
  { x: -600, z: 400, radius: 130, height: 70, segments: 8 },
];

// Secondary small hills (rolling terrain for approach)
const HILLS = [
  { x: -200, z: 400, r: 120, h: 30 },
  { x: 200, z: 600, r: 100, h: 25 },
  { x: -300, z: 200, r: 90, h: 20 },
  { x: 400, z: 100, r: 110, h: 18 },
];

export const Terrain: React.FC = () => {
  const groundMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1a2e1a',   // Dark green grass
        roughness: 0.95,
        metalness: 0.02
      }),
    []
  );

  const runwayAreaMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1c2030',   // Slightly blue-grey near airport
        roughness: 0.9,
        metalness: 0.05
      }),
    []
  );

  const mountainMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#3d4a3d',
        roughness: 0.92,
        metalness: 0.08,
        flatShading: true
      }),
    []
  );

  const mountainDarkMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#2a3529',
        roughness: 0.95,
        metalness: 0.05,
        flatShading: true
      }),
    []
  );

  const snowMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f0f4ff',
        roughness: 0.35,
        metalness: 0.15,
        flatShading: true
      }),
    []
  );

  const rockMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#5a5a52',
        roughness: 0.98,
        metalness: 0.05,
        flatShading: true
      }),
    []
  );

  const waterMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0c4a6e',
        roughness: 0.05,
        metalness: 0.8,
        transparent: true,
        opacity: 0.9
      }),
    []
  );

  const shallowWaterMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#155e75',
        roughness: 0.1,
        metalness: 0.7,
        transparent: true,
        opacity: 0.85
      }),
    []
  );

  const hillMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#2d4a2d',
        roughness: 0.9,
        metalness: 0.02,
        flatShading: true
      }),
    []
  );

  return (
    <group>
      {/* Main Island Ground Base (4500m x 4500m) — green terrain */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} material={groundMaterial} receiveShadow>
        <planeGeometry args={[4500, 4500, 64, 64]} />
      </mesh>

      {/* Airport area slightly different tone */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} material={runwayAreaMaterial} receiveShadow>
        <planeGeometry args={[600, 1600]} />
      </mesh>

      {/* Surrounding Ocean — deep blue */}
      <mesh position={[0, -0.8, 0]} rotation={[-Math.PI / 2, 0, 0]} material={waterMaterial} receiveShadow>
        <planeGeometry args={[16000, 16000, 4, 4]} />
      </mesh>

      {/* Coastal shallow water ring */}
      <mesh position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]} material={shallowWaterMaterial} receiveShadow>
        <planeGeometry args={[6000, 6000, 4, 4]} />
      </mesh>

      {/* Rolling Hills (gentle terrain) */}
      {HILLS.map((h, idx) => (
        <mesh key={`hill_${idx}`} position={[h.x, h.h / 2, h.z]} material={hillMaterial} castShadow receiveShadow>
          <sphereGeometry args={[h.r, 12, 6]} />
        </mesh>
      ))}

      {/* Mountain Peaks & Canyons */}
      {MOUNTAINS.map((m, idx) => (
        <group key={`mountain_${idx}`} position={[m.x, 0, m.z]}>
          {/* Rocky Mountain Base — wide dark base for visual weight */}
          <mesh
            position={[0, m.height * 0.1, 0]}
            material={mountainDarkMaterial}
            castShadow
            receiveShadow
          >
            <coneGeometry args={[m.radius * 1.15, m.height * 0.25, m.segments || 12]} />
          </mesh>

          {/* Main Rocky Mountain Cone */}
          <mesh
            position={[0, m.height / 2 + m.height * 0.05, 0]}
            material={mountainMaterial}
            castShadow
            receiveShadow
          >
            <coneGeometry args={[m.radius, m.height, m.segments || 12]} />
          </mesh>

          {/* Rocky Band (mid-elevation, exposed rock stratum) */}
          {m.height > 150 && (
            <mesh
              position={[0, m.height * 0.62, 0]}
              material={rockMaterial}
              castShadow
            >
              <coneGeometry args={[m.radius * 0.55, m.height * 0.22, m.segments || 12]} />
            </mesh>
          )}

          {/* Snow-Capped Peak on High Elevations */}
          {m.height > 200 && (
            <mesh
              position={[0, m.height - m.height * 0.12, 0]}
              material={snowMaterial}
              castShadow
            >
              <coneGeometry args={[m.radius * 0.26, m.height * 0.26, m.segments || 12]} />
            </mesh>
          )}
        </group>
      ))}

      {/* Mountain Airstrip Terrain Plateau (flat area at elevation 35m) */}
      <group position={[-800, 35, -900]} rotation={[0, 0.4, 0]}>
        <mesh position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]} material={runwayAreaMaterial} receiveShadow>
          <planeGeometry args={[200, 900]} />
        </mesh>
      </group>

      {/* Coastal cliff edges (flat plateau drop off) */}
      <mesh position={[-500, -0.5, 1600]} rotation={[-Math.PI / 2, 0, 0]} material={rockMaterial} castShadow receiveShadow>
        <planeGeometry args={[800, 200]} />
      </mesh>
      <mesh position={[700, -0.5, 1400]} rotation={[-Math.PI / 2, 0, 0]} material={rockMaterial} castShadow receiveShadow>
        <planeGeometry args={[600, 180]} />
      </mesh>
    </group>
  );
};
