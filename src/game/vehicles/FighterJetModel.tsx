import React, { useMemo } from 'react';
import * as THREE from 'three';
import { VehicleColors } from '../../types/vehicle';

interface FighterJetModelProps {
  colors: VehicleColors;
  afterburnerActive: boolean;
  landingGearDown: boolean;
  throttle: number;
  variant?: string;
  isCockpitView?: boolean;
}

export const FighterJetModel: React.FC<FighterJetModelProps> = ({
  colors,
  afterburnerActive,
  landingGearDown,
  throttle,
  variant = 'multirole',
  isCockpitView = false
}) => {
  // Material parameters based on finish
  const { roughness, metalness, clearcoat } = useMemo(() => {
    switch (colors.finish) {
      case 'matte':
        return { roughness: 0.85, metalness: 0.15, clearcoat: 0 };
      case 'metallic':
        return { roughness: 0.25, metalness: 0.85, clearcoat: 0.6 };
      case 'carbon':
        return { roughness: 0.45, metalness: 0.5, clearcoat: 0.8 };
      case 'gloss':
      default:
        return { roughness: 0.2, metalness: 0.4, clearcoat: 1.0 };
    }
  }, [colors.finish]);

  const primaryMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: colors.primary,
        roughness,
        metalness,
        bumpScale: 0.05
      }),
    [colors.primary, roughness, metalness]
  );

  const secondaryMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: colors.secondary,
        roughness: 0.4,
        metalness: 0.6
      }),
    [colors.secondary]
  );

  const accentMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: colors.accent,
        emissive: colors.accent,
        emissiveIntensity: 0.35,
        roughness: 0.3,
        metalness: 0.8
      }),
    [colors.accent]
  );

  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#082f49',
        transparent: true,
        opacity: 0.55,
        roughness: 0.05,
        metalness: 0.1,
        transmission: 0.6,
        ior: 1.52
      }),
    []
  );

  const darkMetalMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#18181b',
        roughness: 0.6,
        metalness: 0.8
      }),
    []
  );

  return (
    <group dispose={null}>
      {/* --- FUSELAGE --- */}
      {/* Main Body Center */}
      <mesh position={[0, 0, 0]} material={primaryMaterial} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.9, 8.5]} />
      </mesh>

      {/* Aerodynamic Nose Cone (Radome) */}
      <mesh position={[0, -0.05, -5.4]} rotation={[Math.PI / 2, 0, 0]} material={secondaryMaterial} castShadow>
        <coneGeometry args={[0.75, 2.8, 16]} />
      </mesh>
      {/* Pitot Tube Needle */}
      <mesh position={[0, -0.05, -6.9]} rotation={[Math.PI / 2, 0, 0]} material={darkMetalMaterial}>
        <cylinderGeometry args={[0.02, 0.04, 0.7, 8]} />
      </mesh>

      {/* Cockpit Canopy Glass */}
      <mesh position={[0, 0.65, -1.8]} rotation={[0.15, 0, 0]} material={glassMaterial} castShadow>
        <capsuleGeometry args={[0.48, 1.8, 8, 16]} />
      </mesh>
      {/* Canopy Arch Frame */}
      <mesh position={[0, 0.67, -1.8]} material={secondaryMaterial}>
        <boxGeometry args={[0.98, 0.1, 0.15]} />
      </mesh>

      {/* Pilot Seat & Control Console */}
      <group position={[0, 0.3, -1.6]}>
        {/* Ejection Seat */}
        <mesh position={[0, 0.15, 0.2]} material={darkMetalMaterial}>
          <boxGeometry args={[0.45, 0.7, 0.45]} />
        </mesh>
        {/* Seat Headrest */}
        <mesh position={[0, 0.55, 0.1]} material={accentMaterial}>
          <boxGeometry args={[0.25, 0.2, 0.2]} />
        </mesh>
        {/* HUD Glass Plate */}
        <mesh position={[0, 0.45, -0.6]} rotation={[-0.3, 0, 0]}>
          <planeGeometry args={[0.3, 0.25]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* --- WINGS --- */}
      {/* Left Wing (Delta Swept) */}
      <mesh position={[-3.0, -0.05, 0.8]} rotation={[0, 0, -0.04]} material={primaryMaterial} castShadow receiveShadow>
        <boxGeometry args={[4.4, 0.12, 4.2]} />
      </mesh>
      {/* Left Wing Leading Edge Sweep Wedge */}
      <mesh position={[-2.2, -0.05, -1.5]} rotation={[0, -0.52, 0]} material={secondaryMaterial} castShadow>
        <boxGeometry args={[0.25, 0.12, 3.8]} />
      </mesh>
      {/* Left Wingtip Missile Rail & Accent Light */}
      <mesh position={[-5.2, -0.05, 1.2]} material={darkMetalMaterial}>
        <boxGeometry args={[0.1, 0.12, 2.2]} />
      </mesh>
      <mesh position={[-5.25, 0.05, 1.2]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#ef4444" /> {/* Red port nav light */}
      </mesh>

      {/* Right Wing (Delta Swept) */}
      <mesh position={[3.0, -0.05, 0.8]} rotation={[0, 0, 0.04]} material={primaryMaterial} castShadow receiveShadow>
        <boxGeometry args={[4.4, 0.12, 4.2]} />
      </mesh>
      {/* Right Wing Leading Edge Sweep Wedge */}
      <mesh position={[2.2, -0.05, -1.5]} rotation={[0, 0.52, 0]} material={secondaryMaterial} castShadow>
        <boxGeometry args={[0.25, 0.12, 3.8]} />
      </mesh>
      {/* Right Wingtip Missile Rail & Accent Light */}
      <mesh position={[5.2, -0.05, 1.2]} material={darkMetalMaterial}>
        <boxGeometry args={[0.1, 0.12, 2.2]} />
      </mesh>
      <mesh position={[5.25, 0.05, 1.2]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#10b981" /> {/* Green starboard nav light */}
      </mesh>

      {/* Twin Canted Vertical Stabilizers (Rudders) */}
      {/* Left Fin */}
      <mesh position={[-0.9, 1.2, 3.2]} rotation={[0, 0, -0.22]} material={primaryMaterial} castShadow>
        <boxGeometry args={[0.12, 1.8, 1.8]} />
      </mesh>
      {/* Left Rudder Accent Trim */}
      <mesh position={[-1.15, 1.6, 3.4]} rotation={[0, 0, -0.22]} material={accentMaterial}>
        <boxGeometry args={[0.14, 0.4, 0.6]} />
      </mesh>

      {/* Right Fin */}
      <mesh position={[0.9, 1.2, 3.2]} rotation={[0, 0, 0.22]} material={primaryMaterial} castShadow>
        <boxGeometry args={[0.12, 1.8, 1.8]} />
      </mesh>
      {/* Right Rudder Accent Trim */}
      <mesh position={[1.15, 1.6, 3.4]} rotation={[0, 0, 0.22]} material={accentMaterial}>
        <boxGeometry args={[0.14, 0.4, 0.6]} />
      </mesh>

      {/* Twin Horizontal Elevators / Stabilators */}
      <mesh position={[-1.6, -0.1, 4.0]} rotation={[0, -0.2, -0.05]} material={secondaryMaterial} castShadow>
        <boxGeometry args={[1.8, 0.1, 1.5]} />
      </mesh>
      <mesh position={[1.6, -0.1, 4.0]} rotation={[0, 0.2, 0.05]} material={secondaryMaterial} castShadow>
        <boxGeometry args={[1.8, 0.1, 1.5]} />
      </mesh>

      {/* --- TWIN JET ENGINES & EXHAUST --- */}
      {/* Left Engine Nacelle */}
      <mesh position={[-0.6, -0.1, 2.8]} rotation={[Math.PI / 2, 0, 0]} material={darkMetalMaterial} castShadow>
        <cylinderGeometry args={[0.42, 0.48, 3.5, 16]} />
      </mesh>
      {/* Right Engine Nacelle */}
      <mesh position={[0.6, -0.1, 2.8]} rotation={[Math.PI / 2, 0, 0]} material={darkMetalMaterial} castShadow>
        <cylinderGeometry args={[0.42, 0.48, 3.5, 16]} />
      </mesh>

      {/* Engine Exhaust Nozzles */}
      <mesh position={[-0.6, -0.1, 4.6]} rotation={[Math.PI / 2, 0, 0]} material={darkMetalMaterial}>
        <cylinderGeometry args={[0.4, 0.45, 0.6, 16]} />
      </mesh>
      <mesh position={[0.6, -0.1, 4.6]} rotation={[Math.PI / 2, 0, 0]} material={darkMetalMaterial}>
        <cylinderGeometry args={[0.4, 0.45, 0.6, 16]} />
      </mesh>

      {/* Dynamic Afterburner Flame & Exhaust Glow */}
      {(afterburnerActive || throttle > 0.1) && (
        <group position={[0, -0.1, 4.9]}>
          {/* Left Exhaust Flame Cone */}
          <mesh position={[-0.6, 0, afterburnerActive ? 1.6 : 0.6]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[afterburnerActive ? 0.38 : 0.25, afterburnerActive ? 3.4 : 1.2, 16]} />
            <meshBasicMaterial
              color={afterburnerActive ? '#38bdf8' : '#f97316'}
              transparent
              opacity={afterburnerActive ? 0.85 : 0.5}
            />
          </mesh>
          {/* Right Exhaust Flame Cone */}
          <mesh position={[0.6, 0, afterburnerActive ? 1.6 : 0.6]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[afterburnerActive ? 0.38 : 0.25, afterburnerActive ? 3.4 : 1.2, 16]} />
            <meshBasicMaterial
              color={afterburnerActive ? '#38bdf8' : '#f97316'}
              transparent
              opacity={afterburnerActive ? 0.85 : 0.5}
            />
          </mesh>
          {/* Dynamic Light from Afterburner */}
          {afterburnerActive && (
            <pointLight position={[0, 0, 2.5]} color="#38bdf8" intensity={4} distance={15} />
          )}
        </group>
      )}

      {/* --- RETRACTABLE LANDING GEAR --- */}
      {landingGearDown && (
        <group position={[0, -0.6, 0]}>
          {/* Front Tricycle Gear */}
          <group position={[0, -0.4, -2.8]}>
            {/* Strut */}
            <mesh material={darkMetalMaterial}>
              <cylinderGeometry args={[0.06, 0.06, 0.8, 8]} />
            </mesh>
            {/* Wheel */}
            <mesh position={[0, -0.4, 0]} rotation={[0, 0, Math.PI / 2]} material={darkMetalMaterial} castShadow>
              <cylinderGeometry args={[0.22, 0.22, 0.16, 16]} />
            </mesh>
          </group>

          {/* Left Main Gear */}
          <group position={[-1.2, -0.4, 1.2]}>
            <mesh material={darkMetalMaterial}>
              <cylinderGeometry args={[0.08, 0.08, 0.8, 8]} />
            </mesh>
            <mesh position={[0, -0.4, 0]} rotation={[0, 0, Math.PI / 2]} material={darkMetalMaterial} castShadow>
              <cylinderGeometry args={[0.32, 0.32, 0.2, 16]} />
            </mesh>
          </group>

          {/* Right Main Gear */}
          <group position={[1.2, -0.4, 1.2]}>
            <mesh material={darkMetalMaterial}>
              <cylinderGeometry args={[0.08, 0.08, 0.8, 8]} />
            </mesh>
            <mesh position={[0, -0.4, 0]} rotation={[0, 0, Math.PI / 2]} material={darkMetalMaterial} castShadow>
              <cylinderGeometry args={[0.32, 0.32, 0.2, 16]} />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
};
