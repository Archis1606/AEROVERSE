import React, { useMemo } from 'react';
import * as THREE from 'three';

interface MountainDef {
  x: number;
  z: number;
  radius: number;
  height: number;
}

const MOUNTAINS: MountainDef[] = [
  // North Mountain Range
  { x: -700, z: -1100, radius: 320, height: 280 },
  { x: -300, z: -1250, radius: 380, height: 360 },
  { x: 150, z: -1300, radius: 340, height: 310 },
  { x: 600, z: -1150, radius: 300, height: 250 },

  // West Canyon Wall
  { x: -950, z: -600, radius: 280, height: 220 },
  { x: -1050, z: -150, radius: 310, height: 260 },
  { x: -900, z: 350, radius: 270, height: 210 },
  { x: -800, z: 750, radius: 250, height: 180 },

  // East Scenic Peaks
  { x: 900, z: -800, radius: 280, height: 240 },
  { x: 1050, z: -300, radius: 320, height: 290 },
  { x: 950, z: 200, radius: 260, height: 200 },
];

export const Terrain: React.FC = () => {
  const groundMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1e293b',
        roughness: 0.95,
        metalness: 0.05
      }),
    []
  );

  const mountainMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#334155',
        roughness: 0.9,
        metalness: 0.15,
        flatShading: true
      }),
    []
  );

  const snowMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#e2e8f0',
        roughness: 0.4,
        metalness: 0.2,
        flatShading: true
      }),
    []
  );

  const waterMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0369a1',
        roughness: 0.1,
        metalness: 0.6,
        transparent: true,
        opacity: 0.88
      }),
    []
  );

  return (
    <group>
      {/* Main Island Ground Base (4000m x 4000m) */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} material={groundMaterial} receiveShadow>
        <planeGeometry args={[4500, 4500]} />
      </mesh>

      {/* Surrounding Ocean Plane */}
      <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]} material={waterMaterial} receiveShadow>
        <planeGeometry args={[14000, 14000]} />
      </mesh>

      {/* Mountain Peaks & Canyons */}
      {MOUNTAINS.map((m, idx) => (
        <group key={`mountain_${idx}`} position={[m.x, 0, m.z]}>
          {/* Rocky Mountain Cone */}
          <mesh position={[0, m.height / 2, 0]} material={mountainMaterial} castShadow receiveShadow>
            <coneGeometry args={[m.radius, m.height, 12]} />
          </mesh>

          {/* Snow-Capped Peak on High Elevations */}
          {m.height > 230 && (
            <mesh position={[0, m.height - m.height * 0.14, 0]} material={snowMaterial} castShadow>
              <coneGeometry args={[m.radius * 0.28, m.height * 0.28, 12]} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
};
