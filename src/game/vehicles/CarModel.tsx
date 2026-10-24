import React, { useMemo } from 'react';
import * as THREE from 'three';
import { VehicleColors } from '../../types/vehicle';

interface CarModelProps {
  colors: VehicleColors;
  wheelSteerAngle: number;
  wheelRotationAngle: number;
  isBraking?: boolean;
  variant?: string;
  isCockpitView?: boolean;
}

export const CarModel: React.FC<CarModelProps> = ({
  colors,
  wheelSteerAngle,
  wheelRotationAngle,
  isBraking = false,
  variant = 'hypercar',
  isCockpitView = false
}) => {
  const { roughness, metalness, clearcoat } = useMemo(() => {
    switch (colors.finish) {
      case 'matte':
        return { roughness: 0.85, metalness: 0.15, clearcoat: 0 };
      case 'metallic':
        return { roughness: 0.2, metalness: 0.88, clearcoat: 0.7 };
      case 'carbon':
        return { roughness: 0.45, metalness: 0.5, clearcoat: 0.8 };
      case 'gloss':
      default:
        return { roughness: 0.15, metalness: 0.45, clearcoat: 1.0 };
    }
  }, [colors.finish]);

  const primaryMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: colors.primary, roughness, metalness }),
    [colors.primary, roughness, metalness]
  );

  const secondaryMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: colors.secondary, roughness: 0.4, metalness: 0.7 }),
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

  const wheelMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: colors.wheelsOrRotor,
        roughness: 0.25,
        metalness: 0.9
      }),
    [colors.wheelsOrRotor]
  );

  const tireRubberMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.9, metalness: 0.1 }),
    []
  );

  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#0f172a',
        transparent: true,
        opacity: 0.65,
        roughness: 0.05,
        metalness: 0.2,
        transmission: 0.5
      }),
    []
  );

  const neonMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: colors.neon
      }),
    [colors.neon]
  );

  const brakeLightMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: isBraking ? '#ff0000' : '#880000'
      }),
    [isBraking]
  );

  // Wheel subcomponent
  const Wheel = ({ isFront, isLeft }: { isFront: boolean; isLeft: boolean }) => (
    <group
      position={[isLeft ? -1.05 : 1.05, 0.36, isFront ? -1.5 : 1.45]}
      rotation={[0, isFront ? wheelSteerAngle : 0, 0]}
    >
      <group rotation={[wheelRotationAngle * (isLeft ? 1 : 1), 0, 0]}>
        {/* Rubber Tire */}
        <mesh rotation={[0, 0, Math.PI / 2]} material={tireRubberMaterial} castShadow>
          <cylinderGeometry args={[0.36, 0.36, 0.32, 24]} />
        </mesh>
        {/* Alloy Rim */}
        <mesh rotation={[0, 0, Math.PI / 2]} material={wheelMaterial}>
          <cylinderGeometry args={[0.26, 0.26, 0.33, 16]} />
        </mesh>
        {/* Center Nut */}
        <mesh position={[isLeft ? -0.17 : 0.17, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={accentMaterial}>
          <cylinderGeometry args={[0.07, 0.07, 0.04, 6]} />
        </mesh>
      </group>
      {/* Brake Caliper (does not rotate with wheel) */}
      <mesh position={[isLeft ? -0.08 : 0.08, 0.15, 0]} material={accentMaterial}>
        <boxGeometry args={[0.1, 0.14, 0.18]} />
      </mesh>
    </group>
  );

  return (
    <group dispose={null}>
      {/* --- LOWER CHASSIS & FLOORPAN --- */}
      <mesh position={[0, 0.3, 0]} material={secondaryMaterial} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.25, 4.8]} />
      </mesh>

      {/* --- MAIN AERODYNAMIC BODYWORK --- */}
      {/* Center Body Hood & Rear Deck */}
      <mesh position={[0, 0.55, 0]} material={primaryMaterial} castShadow receiveShadow>
        <boxGeometry args={[1.95, 0.45, 4.5]} />
      </mesh>

      {/* Sleek Slanted Nose & Hood */}
      <mesh position={[0, 0.48, -1.9]} rotation={[0.16, 0, 0]} material={primaryMaterial} castShadow>
        <boxGeometry args={[1.9, 0.32, 1.4]} />
      </mesh>

      {/* Front Carbon Fiber Splitter */}
      <mesh position={[0, 0.2, -2.4]} material={secondaryMaterial} castShadow>
        <boxGeometry args={[2.05, 0.06, 0.5]} />
      </mesh>
      {/* Front Splitter Winglets */}
      <mesh position={[-1.02, 0.28, -2.4]} material={secondaryMaterial}>
        <boxGeometry args={[0.04, 0.16, 0.4]} />
      </mesh>
      <mesh position={[1.02, 0.28, -2.4]} material={secondaryMaterial}>
        <boxGeometry args={[0.04, 0.16, 0.4]} />
      </mesh>

      {/* Front Grille & Intake Ducts */}
      <mesh position={[0, 0.35, -2.42]} material={secondaryMaterial}>
        <boxGeometry args={[1.4, 0.2, 0.1]} />
      </mesh>

      {/* Cockpit Cabin Greenhouse (Glass Canopy) */}
      <mesh position={[0, 0.95, -0.1]} rotation={[-0.1, 0, 0]} material={glassMaterial} castShadow>
        <boxGeometry args={[1.5, 0.55, 2.3]} />
      </mesh>
      {/* Roof Panel */}
      <mesh position={[0, 1.22, -0.1]} material={primaryMaterial} castShadow>
        <boxGeometry args={[1.35, 0.06, 1.6]} />
      </mesh>

      {/* Cockpit Interior Steering Wheel & Dashboard */}
      <group position={[0, 0.75, -0.4]}>
        {/* Dashboard */}
        <mesh position={[0, 0.05, -0.3]} material={secondaryMaterial}>
          <boxGeometry args={[1.3, 0.25, 0.4]} />
        </mesh>
        {/* Steering Wheel */}
        <mesh position={[-0.35, 0.1, -0.1]} rotation={[0.4, 0, 0]} material={secondaryMaterial}>
          <torusGeometry args={[0.14, 0.02, 8, 16]} />
        </mesh>
        {/* Driver Seat */}
        <mesh position={[-0.35, -0.05, 0.2]} material={secondaryMaterial}>
          <boxGeometry args={[0.45, 0.5, 0.45]} />
        </mesh>
      </group>

      {/* Side Air Intakes */}
      <mesh position={[-0.98, 0.55, 0.6]} rotation={[0, -0.15, 0]} material={secondaryMaterial}>
        <boxGeometry args={[0.1, 0.35, 0.8]} />
      </mesh>
      <mesh position={[0.98, 0.55, 0.6]} rotation={[0, 0.15, 0]} material={secondaryMaterial}>
        <boxGeometry args={[0.1, 0.35, 0.8]} />
      </mesh>

      {/* Rear Engine Cover Vents & Louvers */}
      <mesh position={[0, 0.78, 1.1]} rotation={[0.08, 0, 0]} material={secondaryMaterial}>
        <boxGeometry args={[1.2, 0.08, 1.3]} />
      </mesh>

      {/* Rear High-Downforce GT Wing / Spoiler */}
      <group position={[0, 1.1, 2.1]}>
        {/* Wing Airfoil Blade */}
        <mesh position={[0, 0.2, 0]} material={secondaryMaterial} castShadow>
          <boxGeometry args={[2.1, 0.06, 0.5]} />
        </mesh>
        {/* Endplates */}
        <mesh position={[-1.05, 0.2, 0]} material={accentMaterial}>
          <boxGeometry args={[0.04, 0.28, 0.55]} />
        </mesh>
        <mesh position={[1.05, 0.2, 0]} material={accentMaterial}>
          <boxGeometry args={[0.04, 0.28, 0.55]} />
        </mesh>
        {/* Swan Neck Wing Mount Uprights */}
        <mesh position={[-0.5, 0.05, -0.05]} rotation={[0.2, 0, 0]} material={secondaryMaterial}>
          <boxGeometry args={[0.06, 0.35, 0.12]} />
        </mesh>
        <mesh position={[0.5, 0.05, -0.05]} rotation={[0.2, 0, 0]} material={secondaryMaterial}>
          <boxGeometry args={[0.06, 0.35, 0.12]} />
        </mesh>
      </group>

      {/* Rear Diffuser & Quad Exhaust Tips */}
      <mesh position={[0, 0.24, 2.3]} material={secondaryMaterial}>
        <boxGeometry args={[1.9, 0.25, 0.4]} />
      </mesh>
      {/* Exhaust Pipes */}
      <mesh position={[-0.4, 0.28, 2.45]} rotation={[Math.PI / 2, 0, 0]} material={accentMaterial}>
        <cylinderGeometry args={[0.07, 0.07, 0.15, 12]} />
      </mesh>
      <mesh position={[-0.22, 0.28, 2.45]} rotation={[Math.PI / 2, 0, 0]} material={accentMaterial}>
        <cylinderGeometry args={[0.07, 0.07, 0.15, 12]} />
      </mesh>
      <mesh position={[0.22, 0.28, 2.45]} rotation={[Math.PI / 2, 0, 0]} material={accentMaterial}>
        <cylinderGeometry args={[0.07, 0.07, 0.15, 12]} />
      </mesh>
      <mesh position={[0.4, 0.28, 2.45]} rotation={[Math.PI / 2, 0, 0]} material={accentMaterial}>
        <cylinderGeometry args={[0.07, 0.07, 0.15, 12]} />
      </mesh>

      {/* --- LIGHTS --- */}
      {/* LED Projector Headlights */}
      <mesh position={[-0.7, 0.52, -2.25]}>
        <boxGeometry args={[0.35, 0.1, 0.2]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.7, 0.52, -2.25]}>
        <boxGeometry args={[0.35, 0.1, 0.2]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Headlight Forward Glow */}
      <pointLight position={[0, 0.6, -3.5]} color="#ffffff" intensity={2.0} distance={20} />

      {/* Continuous Red LED Taillight Bar */}
      <mesh position={[0, 0.6, 2.38]} material={brakeLightMaterial}>
        <boxGeometry args={[1.7, 0.08, 0.05]} />
      </mesh>

      {/* Neon Underglow Tubes */}
      <group position={[0, 0.15, 0]}>
        {/* Left Side Glow */}
        <mesh position={[-0.95, 0, 0]} material={neonMaterial}>
          <boxGeometry args={[0.06, 0.04, 3.2]} />
        </mesh>
        {/* Right Side Glow */}
        <mesh position={[0.95, 0, 0]} material={neonMaterial}>
          <boxGeometry args={[0.06, 0.04, 3.2]} />
        </mesh>
        {/* Front & Rear Underglow */}
        <mesh position={[0, 0, -2.1]} material={neonMaterial}>
          <boxGeometry args={[1.5, 0.04, 0.06]} />
        </mesh>
        <mesh position={[0, 0, 2.1]} material={neonMaterial}>
          <boxGeometry args={[1.5, 0.04, 0.06]} />
        </mesh>
        <pointLight color={colors.neon} intensity={2.0} distance={4} />
      </group>

      {/* --- 4 WHEELS --- */}
      <Wheel isFront={true} isLeft={true} />
      <Wheel isFront={true} isLeft={false} />
      <Wheel isFront={false} isLeft={true} />
      <Wheel isFront={false} isLeft={false} />
    </group>
  );
};
