import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export const Airport: React.FC = () => {
  const radarRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (radarRef.current) {
      radarRef.current.rotation.y += delta * 1.5;
    }
  });

  // Materials
  const runwayAsphalt = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.9, metalness: 0.1 }),
    []
  );
  const markingPaint = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#f8fafc' }),
    []
  );
  const yellowPaint = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#fbbf24' }),
    []
  );
  const buildingConcrete = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.8, metalness: 0.2 }),
    []
  );
  const glassMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.1, metalness: 0.8 }),
    []
  );
  const greenLight = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#22c55e' }),
    []
  );
  const whiteLight = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#f8fafc' }),
    []
  );

  return (
    <group position={[0, 0, 0]}>
      {/* --- MAIN RUNWAY 09/27 (1400m long x 60m wide) --- */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} material={runwayAsphalt} receiveShadow>
        <planeGeometry args={[65, 1400]} />
      </mesh>

      {/* Runway Centerline Stripes */}
      {Array.from({ length: 35 }).map((_, i) => (
        <mesh
          key={`stripe_${i}`}
          position={[0, 0.07, -650 + i * 38]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={markingPaint}
        >
          <planeGeometry args={[2.5, 20]} />
        </mesh>
      ))}

      {/* Runway Threshold Stripes (Piano Keys) - North End */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh
          key={`piano_n_${i}`}
          position={[-26 + i * 4.8, 0.07, -670]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={markingPaint}
        >
          <planeGeometry args={[2.2, 40]} />
        </mesh>
      ))}

      {/* Runway Threshold Stripes (Piano Keys) - South End */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh
          key={`piano_s_${i}`}
          position={[-26 + i * 4.8, 0.07, 670]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={markingPaint}
        >
          <planeGeometry args={[2.2, 40]} />
        </mesh>
      ))}

      {/* Touchdown Aiming Point Markers */}
      <mesh position={[-14, 0.07, -450]} rotation={[-Math.PI / 2, 0, 0]} material={markingPaint}>
        <planeGeometry args={[6, 45]} />
      </mesh>
      <mesh position={[14, 0.07, -450]} rotation={[-Math.PI / 2, 0, 0]} material={markingPaint}>
        <planeGeometry args={[6, 45]} />
      </mesh>
      <mesh position={[-14, 0.07, 450]} rotation={[-Math.PI / 2, 0, 0]} material={markingPaint}>
        <planeGeometry args={[6, 45]} />
      </mesh>
      <mesh position={[14, 0.07, 450]} rotation={[-Math.PI / 2, 0, 0]} material={markingPaint}>
        <planeGeometry args={[6, 45]} />
      </mesh>

      {/* Runway Edge Runway Lights */}
      {Array.from({ length: 28 }).map((_, i) => (
        <React.Fragment key={`lights_${i}`}>
          {/* Left Edge Light */}
          <mesh position={[-33.5, 0.4, -680 + i * 50]} material={whiteLight}>
            <sphereGeometry args={[0.25, 8, 8]} />
          </mesh>
          {/* Right Edge Light */}
          <mesh position={[33.5, 0.4, -680 + i * 50]} material={whiteLight}>
            <sphereGeometry args={[0.25, 8, 8]} />
          </mesh>
        </React.Fragment>
      ))}

      {/* --- PARALLEL TAXIWAY & CONNECTORS --- */}
      {/* Parallel Taxiway */}
      <mesh position={[75, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} material={runwayAsphalt} receiveShadow>
        <planeGeometry args={[35, 1200]} />
      </mesh>
      {/* Taxiway Centerline Yellow Stripe */}
      <mesh position={[75, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} material={yellowPaint}>
        <planeGeometry args={[0.8, 1180]} />
      </mesh>

      {/* High-Speed Taxiway Exits (Exit A, Exit B, Exit C) */}
      {[-400, 0, 400].map((z, idx) => (
        <mesh
          key={`connector_${idx}`}
          position={[37.5, 0.04, z]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={runwayAsphalt}
          receiveShadow
        >
          <planeGeometry args={[50, 30]} />
        </mesh>
      ))}

      {/* --- APRON & HELIPADS --- */}
      <mesh position={[140, 0.03, 100]} rotation={[-Math.PI / 2, 0, 0]} material={runwayAsphalt} receiveShadow>
        <planeGeometry args={[100, 400]} />
      </mesh>

      {/* Helipad 1 (Apron Ground) */}
      <group position={[140, 0.08, 200]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[14, 32]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[12, 13.5, 32]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* "H" Marker */}
        <mesh position={[-3.5, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} material={markingPaint}>
          <planeGeometry args={[1.6, 12]} />
        </mesh>
        <mesh position={[3.5, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} material={markingPaint}>
          <planeGeometry args={[1.6, 12]} />
        </mesh>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} material={markingPaint}>
          <planeGeometry args={[7, 1.6]} />
        </mesh>
      </group>

      {/* --- AIRPORT CONTROL TOWER --- */}
      <group position={[145, 0, -50]}>
        {/* Tower Base & Shaft */}
        <mesh position={[0, 25, 0]} material={buildingConcrete} castShadow receiveShadow>
          <cylinderGeometry args={[6, 9, 50, 16]} />
        </mesh>
        {/* Observation Cab Glass */}
        <mesh position={[0, 53, 0]} material={glassMaterial} castShadow>
          <cylinderGeometry args={[11, 7, 6, 16]} />
        </mesh>
        {/* Tower Roof */}
        <mesh position={[0, 57, 0]} material={buildingConcrete}>
          <cylinderGeometry args={[12, 12, 2, 16]} />
        </mesh>
        {/* Rotating Radar Antenna */}
        <group ref={radarRef} position={[0, 60, 0]}>
          <mesh position={[0, 1, 0]} material={buildingConcrete}>
            <cylinderGeometry args={[0.6, 0.6, 2, 8]} />
          </mesh>
          <mesh position={[0, 2.5, 0]} material={markingPaint}>
            <boxGeometry args={[7, 1.2, 0.4]} />
          </mesh>
        </group>
        {/* Red Beacon on Top */}
        <mesh position={[0, 63, 0]}>
          <sphereGeometry args={[0.4, 8, 8]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <pointLight position={[0, 63, 0]} color="#ef4444" intensity={2} distance={50} />
      </group>

      {/* --- AIRCRAFT HANGARS --- */}
      {[-250, -100, 50].map((z, idx) => (
        <group key={`hangar_${idx}`} position={[160, 0, z]}>
          {/* Main Hangar Arched Structure */}
          <mesh position={[0, 10, 0]} material={buildingConcrete} castShadow receiveShadow>
            <boxGeometry args={[65, 20, 55]} />
          </mesh>
          {/* Hangar Arched Roof */}
          <mesh position={[0, 20, 0]} rotation={[0, 0, 0]} material={buildingConcrete}>
            <cylinderGeometry args={[32.5, 32.5, 55, 16, 1, false, 0, Math.PI]} />
          </mesh>
          {/* Hangar Open Door Bay */}
          <mesh position={[-32.6, 9, 0]} rotation={[0, Math.PI / 2, 0]} material={runwayAsphalt}>
            <planeGeometry args={[45, 18]} />
          </mesh>
        </group>
      ))}

      {/* Secondary Mountain Airstrip (for short-field landings & high-altitude challenges) */}
      <group position={[-800, 35, -900]} rotation={[0, 0.4, 0]}>
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} material={runwayAsphalt} receiveShadow>
          <planeGeometry args={[45, 750]} />
        </mesh>
        {/* Centerline */}
        {Array.from({ length: 18 }).map((_, i) => (
          <mesh
            key={`mountain_stripe_${i}`}
            position={[0, 0.08, -320 + i * 36]}
            rotation={[-Math.PI / 2, 0, 0]}
            material={yellowPaint}
          >
            <planeGeometry args={[1.8, 18]} />
          </mesh>
        ))}
      </group>
    </group>
  );
};
