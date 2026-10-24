import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { VehicleColors } from '../../types/vehicle';

interface HelicopterModelProps {
  colors: VehicleColors;
  rotorRpmPercent: number;
  variant?: string;
}

export const HelicopterModel: React.FC<HelicopterModelProps> = ({
  colors,
  rotorRpmPercent,
  variant = 'attack'
}) => {
  const mainRotorRef = useRef<THREE.Group>(null);
  const tailRotorRef = useRef<THREE.Group>(null);

  // Animate main & tail rotors smoothly
  useFrame((_, delta) => {
    const speed = (rotorRpmPercent / 100) * 35;
    if (mainRotorRef.current) {
      mainRotorRef.current.rotation.y += speed * delta;
    }
    if (tailRotorRef.current) {
      tailRotorRef.current.rotation.x += speed * 4 * delta;
    }
  });

  const { roughness, metalness } = useMemo(() => {
    switch (colors.finish) {
      case 'matte':
        return { roughness: 0.85, metalness: 0.15 };
      case 'metallic':
        return { roughness: 0.25, metalness: 0.85 };
      case 'carbon':
        return { roughness: 0.45, metalness: 0.5 };
      case 'gloss':
      default:
        return { roughness: 0.2, metalness: 0.4 };
    }
  }, [colors.finish]);

  const primaryMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: colors.primary, roughness, metalness }),
    [colors.primary, roughness, metalness]
  );

  const secondaryMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: colors.secondary, roughness: 0.5, metalness: 0.6 }),
    [colors.secondary]
  );

  const accentMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: colors.accent,
        emissive: colors.accent,
        emissiveIntensity: 0.4,
        roughness: 0.3
      }),
    [colors.accent]
  );

  const rotorMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: colors.wheelsOrRotor, roughness: 0.3, metalness: 0.8 }),
    [colors.wheelsOrRotor]
  );

  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#0369a1',
        transparent: true,
        opacity: 0.55,
        roughness: 0.05,
        transmission: 0.7
      }),
    []
  );

  const darkMetalMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#1c1917', roughness: 0.6, metalness: 0.8 }),
    []
  );

  return (
    <group dispose={null}>
      {/* --- FUSELAGE CABIN --- */}
      {/* Main Body */}
      <mesh position={[0, 0.4, -0.2]} material={primaryMaterial} castShadow receiveShadow>
        <boxGeometry args={[1.6, 1.4, 5.2]} />
      </mesh>
      {/* Tapered Nose */}
      <mesh position={[0, 0.25, -3.2]} rotation={[Math.PI / 2, 0, 0]} material={secondaryMaterial} castShadow>
        <coneGeometry args={[0.8, 1.6, 8]} />
      </mesh>
      {/* FLIR Sensor Turret Sphere */}
      <mesh position={[0, -0.15, -3.8]} material={darkMetalMaterial}>
        <sphereGeometry args={[0.3, 16, 16]} />
      </mesh>
      <mesh position={[0, -0.15, -4.05]} material={accentMaterial}>
        <sphereGeometry args={[0.1, 8, 8]} />
      </mesh>

      {/* Stepped Tandem Cockpit Glass Canopy */}
      <mesh position={[0, 0.85, -1.8]} rotation={[-0.25, 0, 0]} material={glassMaterial} castShadow>
        <boxGeometry args={[1.2, 0.85, 2.4]} />
      </mesh>

      {/* Turboshaft Engine Cowlings (Upper Deck) */}
      <mesh position={[-0.55, 1.15, 0.2]} rotation={[Math.PI / 2, 0, 0]} material={secondaryMaterial} castShadow>
        <cylinderGeometry args={[0.32, 0.35, 2.6, 12]} />
      </mesh>
      <mesh position={[0.55, 1.15, 0.2]} rotation={[Math.PI / 2, 0, 0]} material={secondaryMaterial} castShadow>
        <cylinderGeometry args={[0.32, 0.35, 2.6, 12]} />
      </mesh>

      {/* Stub Weapon Wings */}
      <mesh position={[0, 0.4, -0.2]} material={secondaryMaterial} castShadow>
        <boxGeometry args={[3.8, 0.15, 0.8]} />
      </mesh>
      {/* Left Rocket Pod */}
      <mesh position={[-1.7, 0.2, -0.2]} rotation={[Math.PI / 2, 0, 0]} material={darkMetalMaterial} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 1.4, 12]} />
      </mesh>
      {/* Right Rocket Pod */}
      <mesh position={[1.7, 0.2, -0.2]} rotation={[Math.PI / 2, 0, 0]} material={darkMetalMaterial} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 1.4, 12]} />
      </mesh>

      {/* --- MAIN ROTOR ASSEMBLY --- */}
      {/* Mast & Swashplate */}
      <mesh position={[0, 1.4, 0]} material={darkMetalMaterial}>
        <cylinderGeometry args={[0.1, 0.12, 0.8, 12]} />
      </mesh>
      <group ref={mainRotorRef} position={[0, 1.8, 0]}>
        {/* Rotor Hub */}
        <mesh material={darkMetalMaterial}>
          <cylinderGeometry args={[0.35, 0.35, 0.15, 12]} />
        </mesh>
        {/* 4 Rotor Blades (Length ~11m diameter) */}
        {/* Blade 1 */}
        <mesh position={[0, 0.05, 3.2]} material={rotorMaterial} castShadow>
          <boxGeometry args={[0.28, 0.04, 6.0]} />
        </mesh>
        {/* Blade 2 */}
        <mesh position={[0, 0.05, -3.2]} material={rotorMaterial} castShadow>
          <boxGeometry args={[0.28, 0.04, 6.0]} />
        </mesh>
        {/* Blade 3 */}
        <mesh position={[3.2, 0.05, 0]} rotation={[0, Math.PI / 2, 0]} material={rotorMaterial} castShadow>
          <boxGeometry args={[0.28, 0.04, 6.0]} />
        </mesh>
        {/* Blade 4 */}
        <mesh position={[-3.2, 0.05, 0]} rotation={[0, Math.PI / 2, 0]} material={rotorMaterial} castShadow>
          <boxGeometry args={[0.28, 0.04, 6.0]} />
        </mesh>
        {/* Rotor Blade Tips with Accent Glow */}
        <mesh position={[0, 0.05, 6.1]} material={accentMaterial}>
          <boxGeometry args={[0.28, 0.05, 0.2]} />
        </mesh>
        <mesh position={[0, 0.05, -6.1]} material={accentMaterial}>
          <boxGeometry args={[0.28, 0.05, 0.2]} />
        </mesh>
        <mesh position={[6.1, 0.05, 0]} rotation={[0, Math.PI / 2, 0]} material={accentMaterial}>
          <boxGeometry args={[0.28, 0.05, 0.2]} />
        </mesh>
        <mesh position={[-6.1, 0.05, 0]} rotation={[0, Math.PI / 2, 0]} material={accentMaterial}>
          <boxGeometry args={[0.28, 0.05, 0.2]} />
        </mesh>
      </group>

      {/* --- TAIL BOOM & TAIL ROTOR --- */}
      {/* Tapered Tail Boom */}
      <mesh position={[0, 0.55, 3.8]} rotation={[-0.05, 0, 0]} material={primaryMaterial} castShadow>
        <boxGeometry args={[0.6, 0.65, 4.2]} />
      </mesh>
      {/* Vertical Tail Fin */}
      <mesh position={[0, 1.25, 5.8]} material={secondaryMaterial} castShadow>
        <boxGeometry args={[0.12, 1.5, 1.1]} />
      </mesh>
      {/* Horizontal Stabilizer Fin */}
      <mesh position={[0, 0.7, 5.2]} material={secondaryMaterial} castShadow>
        <boxGeometry args={[1.8, 0.08, 0.6]} />
      </mesh>
      {/* High-Speed Tail Rotor */}
      <group ref={tailRotorRef} position={[0.22, 1.45, 6.0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} material={darkMetalMaterial}>
          <cylinderGeometry args={[0.1, 0.1, 0.15, 8]} />
        </mesh>
        <mesh position={[0, 0, 0]} material={rotorMaterial}>
          <boxGeometry args={[0.04, 1.5, 0.14]} />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} material={rotorMaterial}>
          <boxGeometry args={[0.04, 1.5, 0.14]} />
        </mesh>
      </group>

      {/* --- TUBULAR LANDING SKIDS --- */}
      <group position={[0, -0.4, 0]}>
        {/* Left Skid */}
        <mesh position={[-1.0, -0.3, -0.2]} rotation={[Math.PI / 2, 0, 0]} material={darkMetalMaterial} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 4.4, 12]} />
        </mesh>
        {/* Left Front Curved Tip */}
        <mesh position={[-1.0, -0.15, -2.4]} rotation={[0.5, 0, 0]} material={darkMetalMaterial}>
          <cylinderGeometry args={[0.06, 0.06, 0.6, 12]} />
        </mesh>
        {/* Right Skid */}
        <mesh position={[1.0, -0.3, -0.2]} rotation={[Math.PI / 2, 0, 0]} material={darkMetalMaterial} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 4.4, 12]} />
        </mesh>
        {/* Right Front Curved Tip */}
        <mesh position={[1.0, -0.15, -2.4]} rotation={[0.5, 0, 0]} material={darkMetalMaterial}>
          <cylinderGeometry args={[0.06, 0.06, 0.6, 12]} />
        </mesh>
        {/* Cross Struts */}
        <mesh position={[0, -0.15, -1.2]} rotation={[0, 0, Math.PI / 2]} material={darkMetalMaterial}>
          <cylinderGeometry args={[0.05, 0.05, 2.0, 8]} />
        </mesh>
        <mesh position={[0, -0.15, 0.8]} rotation={[0, 0, Math.PI / 2]} material={darkMetalMaterial}>
          <cylinderGeometry args={[0.05, 0.05, 2.0, 8]} />
        </mesh>
      </group>
    </group>
  );
};
