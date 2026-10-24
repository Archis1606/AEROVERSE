import React, { useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useGameStore } from '../store/gameStore';
import { VehicleRenderer } from './vehicles/VehicleRenderer';

export const ShowroomCanvas: React.FC = () => {
  const currentVehicle = useGameStore(state => state.getCurrentVehicle());
  const currentColors = useGameStore(state => state.getCurrentColors());

  const dummyTelemetry = {
    speedKmh: 0,
    speedKnots: 0,
    speedMph: 0,
    altitudeM: 0,
    altitudeFt: 0,
    posX: 0,
    posZ: 0,
    verticalSpeedMs: 0,
    throttlePercent: 0,
    rpmPercent: 80, // Show spinning rotors in garage
    gear: 'N',
    headingDeg: 0,
    pitchDeg: 0,
    rollDeg: 0,
    gForce: 1.0,
    afterburnerActive: false,
    landingGearDown: true,
    hoverAssistActive: true,
    tractionControlActive: true,
    driftAngleDeg: 0,
    isGrounded: true,
    isStalling: false,
    damagePercent: 0,
    engineRpm: 1200
  };

  const pedestalRef = useRef<THREE.Group>(null);

  const Turntable = () => {
    useFrame((_, delta) => {
      if (pedestalRef.current) {
        pedestalRef.current.rotation.y += delta * 0.15;
      }
    });

    return (
      <group ref={pedestalRef} position={[0, -0.6, 0]}>
        {/* Glowing Showroom Turntable */}
        <mesh position={[0, -0.1, 0]} receiveShadow>
          <cylinderGeometry args={[7.5, 8, 0.4, 48]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Outer Cyan Ring */}
        <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[7.1, 7.35, 48]} />
          <meshBasicMaterial color="#06b6d4" />
        </mesh>

        {/* Inner Neon Ring */}
        <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[4.2, 4.35, 48]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>

        {/* Target Vehicle */}
        <group position={[0, 0.6, 0]}>
          <VehicleRenderer
            vehicle={currentVehicle}
            colors={currentColors}
            telemetry={dummyTelemetry}
            wheelSteerAngle={0}
            wheelRotationAngle={0}
          />
        </group>
      </group>
    );
  };

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        shadows
        camera={{ position: [9, 4, 11], fov: 45 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#030712']} />

        {/* Studio Lighting Rig */}
        <ambientLight intensity={0.65} color="#e2e8f0" />
        <directionalLight
          position={[12, 18, 12]}
          intensity={2.8}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-12, 12, -10]} intensity={1.5} color="#38bdf8" />
        <pointLight position={[0, -0.2, 0]} intensity={2.5} color={currentColors.neon} distance={12} />

        <Turntable />

        {/* User Orbit Controls */}
        <OrbitControls
          enablePan={false}
          minDistance={5}
          maxDistance={22}
          maxPolarAngle={Math.PI / 2 - 0.05}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
};
