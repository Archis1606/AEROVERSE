import React, { useMemo } from 'react';
import * as THREE from 'three';

interface BuildingDef {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  hasHelipad?: boolean;
  hasSpire?: boolean;
  color?: string;
}

const BUILDINGS: BuildingDef[] = [
  // Financial District Center (Towers)
  { x: 450, z: -300, w: 60, d: 60, h: 220, hasHelipad: true, hasSpire: true, color: '#0f172a' },
  { x: 550, z: -320, w: 50, d: 50, h: 280, hasSpire: true, color: '#0284c7' },
  { x: 380, z: -380, w: 55, d: 45, h: 170, color: '#1e293b' },
  { x: 480, z: -420, w: 65, d: 55, h: 240, hasHelipad: true, color: '#0369a1' },
  { x: 580, z: -440, w: 45, d: 60, h: 190, color: '#1e1b4b' },

  // Mid-Rise Outer Ring
  { x: 360, z: -220, w: 45, d: 40, h: 120, color: '#334155' },
  { x: 440, z: -200, w: 50, d: 45, h: 140, color: '#1e293b' },
  { x: 530, z: -210, w: 45, d: 50, h: 110, hasHelipad: true, color: '#334155' },
  { x: 620, z: -230, w: 40, d: 45, h: 90, color: '#1e293b' },

  // Waterfront / Coastal Towers
  { x: 320, z: -500, w: 45, d: 50, h: 130, color: '#0f172a' },
  { x: 410, z: -520, w: 50, d: 55, h: 160, color: '#0369a1' },
  { x: 500, z: -530, w: 60, d: 45, h: 200, hasHelipad: true, color: '#0284c7' },
  { x: 600, z: -520, w: 45, d: 50, h: 150, color: '#1e293b' },

  // South City Block
  { x: 400, z: -80, w: 40, d: 40, h: 80, color: '#334155' },
  { x: 470, z: -90, w: 45, d: 50, h: 100, color: '#1e293b' },
  { x: 560, z: -80, w: 40, d: 40, h: 75, color: '#334155' },

  // Mountain Overlook Landmark Tower
  { x: -500, z: -700, w: 50, d: 50, h: 140, hasHelipad: true, color: '#0f172a' }
];

export const City: React.FC = () => {
  const windowMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0369a1',
        emissive: '#38bdf8',
        emissiveIntensity: 0.25,
        roughness: 0.1,
        metalness: 0.8
      }),
    []
  );

  const concreteMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.85, metalness: 0.2 }),
    []
  );

  const helipadMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#ef4444' }),
    []
  );

  const whiteLineMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#ffffff' }),
    []
  );

  return (
    <group>
      {BUILDINGS.map((b, idx) => (
        <group key={`bldg_${idx}`} position={[b.x, 0, b.z]}>
          {/* Main Skyscraper Body */}
          <mesh position={[0, b.h / 2, 0]} material={windowMaterial} castShadow receiveShadow>
            <boxGeometry args={[b.w, b.h, b.d]} />
          </mesh>

          {/* Exterior Corner Structural Pillars */}
          <mesh position={[-b.w / 2, b.h / 2, -b.d / 2]} material={concreteMaterial}>
            <boxGeometry args={[2, b.h + 0.5, 2]} />
          </mesh>
          <mesh position={[b.w / 2, b.h / 2, -b.d / 2]} material={concreteMaterial}>
            <boxGeometry args={[2, b.h + 0.5, 2]} />
          </mesh>
          <mesh position={[-b.w / 2, b.h / 2, b.d / 2]} material={concreteMaterial}>
            <boxGeometry args={[2, b.h + 0.5, 2]} />
          </mesh>
          <mesh position={[b.w / 2, b.h / 2, b.d / 2]} material={concreteMaterial}>
            <boxGeometry args={[2, b.h + 0.5, 2]} />
          </mesh>

          {/* Rooftop Helipad */}
          {b.hasHelipad && (
            <group position={[0, b.h + 0.1, 0]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[14, 24]} />
                <primitive object={helipadMat} attach="material" />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[12, 13.5, 24]} />
                <primitive object={whiteLineMat} attach="material" />
              </mesh>
              {/* Helipad "H" */}
              <mesh position={[-3, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} material={whiteLineMat}>
                <planeGeometry args={[1.5, 10]} />
              </mesh>
              <mesh position={[3, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} material={whiteLineMat}>
                <planeGeometry args={[1.5, 10]} />
              </mesh>
              <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} material={whiteLineMat}>
                <planeGeometry args={[6, 1.5]} />
              </mesh>
            </group>
          )}

          {/* Rooftop Spire & Warning Beacon */}
          {b.hasSpire && (
            <group position={[0, b.h, 0]}>
              <mesh position={[0, 15, 0]} material={concreteMaterial}>
                <cylinderGeometry args={[0.3, 1.2, 30, 8]} />
              </mesh>
              <mesh position={[0, 30.5, 0]}>
                <sphereGeometry args={[0.5, 8, 8]} />
                <meshBasicMaterial color="#ef4444" />
              </mesh>
              <pointLight position={[0, 30.5, 0]} color="#ef4444" intensity={3} distance={60} />
            </group>
          )}
        </group>
      ))}
    </group>
  );
};
