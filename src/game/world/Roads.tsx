import React, { useMemo } from 'react';
import * as THREE from 'three';

export const Roads: React.FC = () => {
  const roadAsphalt = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.85, metalness: 0.1 }),
    []
  );
  const whitePaint = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#f4f4f5' }),
    []
  );
  const yellowPaint = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#facc15' }),
    []
  );
  const redCurb = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.6 }),
    []
  );
  const whiteCurb = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.6 }),
    []
  );

  return (
    <group position={[0, 0, 0]}>
      {/* --- APEX TEST TRACK CIRCUIT (Loop) --- */}
      {/* Main Straight (Start/Finish) */}
      <mesh position={[-250, 0.05, 300]} rotation={[-Math.PI / 2, 0, 0]} material={roadAsphalt} receiveShadow>
        <planeGeometry args={[300, 22]} />
      </mesh>
      {/* Start/Finish Checkered Line */}
      <mesh position={[-100, 0.07, 300]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2, 22]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* East Turn 1 (Turn onto back straight) */}
      <mesh position={[-100, 0.05, 100]} rotation={[-Math.PI / 2, 0, 0]} material={roadAsphalt} receiveShadow>
        <planeGeometry args={[22, 400]} />
      </mesh>

      {/* North Hairpin Connector */}
      <mesh position={[-250, 0.05, -200]} rotation={[-Math.PI / 2, 0, 0]} material={roadAsphalt} receiveShadow>
        <planeGeometry args={[320, 22]} />
      </mesh>

      {/* Technical Infield Section */}
      <mesh position={[-400, 0.05, -50]} rotation={[-Math.PI / 2, 0, 0]} material={roadAsphalt} receiveShadow>
        <planeGeometry args={[22, 320]} />
      </mesh>
      <mesh position={[-500, 0.05, 120]} rotation={[-Math.PI / 2, 0, 0]} material={roadAsphalt} receiveShadow>
        <planeGeometry args={[220, 22]} />
      </mesh>
      <mesh position={[-400, 0.05, 210]} rotation={[-Math.PI / 2, 0, 0]} material={roadAsphalt} receiveShadow>
        <planeGeometry args={[22, 200]} />
      </mesh>

      {/* Red & White Apex Rumble Strips / Curbs on Curves */}
      {Array.from({ length: 14 }).map((_, i) => (
        <React.Fragment key={`curb_${i}`}>
          <mesh
            position={[-88, 0.12, -80 + i * 8]}
            rotation={[-Math.PI / 2, 0, 0]}
            material={i % 2 === 0 ? redCurb : whiteCurb}
          >
            <planeGeometry args={[2.5, 7.5]} />
          </mesh>
          <mesh
            position={[-412, 0.12, -180 + i * 8]}
            rotation={[-Math.PI / 2, 0, 0]}
            material={i % 2 === 0 ? redCurb : whiteCurb}
          >
            <planeGeometry args={[2.5, 7.5]} />
          </mesh>
        </React.Fragment>
      ))}

      {/* --- DOWNTOWN HIGHWAY (Connects Airport with City) --- */}
      {/* Main East-West Highway */}
      <mesh position={[240, 0.05, -150]} rotation={[-Math.PI / 2, 0, 0]} material={roadAsphalt} receiveShadow>
        <planeGeometry args={[450, 24]} />
      </mesh>
      {/* Highway Dashed Centerline */}
      {Array.from({ length: 24 }).map((_, i) => (
        <mesh
          key={`hw_line_${i}`}
          position={[40 + i * 18, 0.07, -150]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={yellowPaint}
        >
          <planeGeometry args={[10, 0.6]} />
        </mesh>
      ))}

      {/* Coastal Scenic Highway */}
      <mesh position={[500, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} material={roadAsphalt} receiveShadow>
        <planeGeometry args={[22, 600]} />
      </mesh>

      {/* Highway Streetlights with Light Beams */}
      {Array.from({ length: 8 }).map((_, i) => (
        <group key={`streetlight_${i}`} position={[60 + i * 55, 0, -165]}>
          <mesh position={[0, 5, 0]}>
            <cylinderGeometry args={[0.15, 0.18, 10, 8]} />
            <meshStandardMaterial color="#475569" roughness={0.5} />
          </mesh>
          <mesh position={[2, 9.8, 0]}>
            <boxGeometry args={[4, 0.2, 0.4]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          <mesh position={[3.8, 9.6, 0]}>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
        </group>
      ))}
    </group>
  );
};
