import React, { useEffect, useRef, memo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGameStore } from '../store/gameStore';
import { InputManager } from './input/InputManager';
import { FlightPhysics } from './physics/FlightPhysics';
import { HelicopterPhysics } from './physics/HelicopterPhysics';
import { CarPhysics } from './physics/CarPhysics';
import { VehiclePhysicsState } from '../types/physics';
import { World } from './world/World';
import { VehicleRenderer } from './vehicles/VehicleRenderer';
import { CameraController } from './cameras/CameraController';
import { JetHud } from '../components/hud/JetHud';
import { HelicopterHud } from '../components/hud/HelicopterHud';
import { CarHud } from '../components/hud/CarHud';
import { MissionHud } from '../components/hud/MissionHud';
import { Minimap } from '../components/hud/Minimap';
import { soundSystem } from './audio/SoundSystem';
import { PauseMenu } from '../components/menus/PauseMenu';

export const GameCanvas: React.FC = () => {
  const currentVehicle = useGameStore(state => state.getCurrentVehicle());
  const currentColors = useGameStore(state => state.getCurrentColors());
  const activeMission = useGameStore(state => state.activeMission);
  const settings = useGameStore(state => state.settings);
  const isPaused = useGameStore(state => state.isPaused);
  const setPaused = useGameStore(state => state.setPaused);
  const cameraMode = useGameStore(state => state.cameraMode);
  const cycleCameraMode = useGameStore(state => state.cycleCameraMode);
  const telemetry = useGameStore(state => state.telemetry);
  const setTelemetry = useGameStore(state => state.setTelemetry);

  // References for zero-allocations 120+ FPS game loop
  const vehicleGroupRef = useRef<THREE.Group>(null);
  const vehiclePosRef = useRef<THREE.Vector3>(new THREE.Vector3(...activeMission.spawnPoint.position));

  const inputManagerRef = useRef<InputManager | null>(null);
  const physicsRef = useRef<FlightPhysics | HelicopterPhysics | CarPhysics | null>(null);
  const physicsStateRef = useRef<VehiclePhysicsState>({
    position: new THREE.Vector3(...activeMission.spawnPoint.position),
    velocity: new THREE.Vector3(0, 0, -(activeMission.spawnPoint.initialSpeed || 0) / 3.6),
    quaternion: new THREE.Quaternion(),
    angularVelocity: new THREE.Vector3(),
    acceleration: new THREE.Vector3(),
    isGrounded: true,
    throttle: currentVehicle.category === 'car' ? 0 : 0.45,
    steer: 0,
    pitchInput: 0,
    rollInput: 0,
    yawInput: 0,
    brake: 0,
    handbrake: false,
    afterburner: false,
    landingGear: true,
    hoverAssist: true,
    tractionControl: true,
    currentGear: 1,
    engineRpm: 1000,
    driftSlip: 0,
    driftAngleDeg: 0,
    damagePercent: 0,
    verticalSpeed: 0,
    gForce: 1.0,
    stallRatio: 0
  });

  // Sound Engine Setup & Cleanup
  useEffect(() => {
    soundSystem.init();
    soundSystem.setVolumes(settings.masterVolume, settings.engineVolume, settings.fxVolume);

    if (currentVehicle.category === 'jet') {
      soundSystem.startJet();
    } else if (currentVehicle.category === 'helicopter') {
      soundSystem.startHelicopter();
    } else if (currentVehicle.category === 'car') {
      soundSystem.startCar();
    }

    return () => {
      soundSystem.stopAllEngines();
    };
  }, [currentVehicle.category]);

  // Input Manager Attach
  useEffect(() => {
    const mgr = new InputManager(settings.bindings, currentVehicle.category, settings.invertFlightPitch);
    mgr.attach();
    inputManagerRef.current = mgr;

    return () => {
      mgr.detach();
    };
  }, [currentVehicle.category, settings.bindings, settings.invertFlightPitch]);

  // Physics Engine Setup
  useEffect(() => {
    if (currentVehicle.category === 'jet') {
      physicsRef.current = new FlightPhysics(currentVehicle);
    } else if (currentVehicle.category === 'helicopter') {
      physicsRef.current = new HelicopterPhysics(currentVehicle);
    } else {
      physicsRef.current = new CarPhysics(currentVehicle);
    }

    const rot = activeMission.spawnPoint.rotation;
    physicsStateRef.current.quaternion.setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2]));
    physicsStateRef.current.position.set(...activeMission.spawnPoint.position);
    physicsStateRef.current.velocity.set(0, 0, -(activeMission.spawnPoint.initialSpeed || 0) / 3.6);
    physicsStateRef.current.angularVelocity.set(0, 0, 0);

    if (vehicleGroupRef.current) {
      vehicleGroupRef.current.position.copy(physicsStateRef.current.position);
      vehicleGroupRef.current.quaternion.copy(physicsStateRef.current.quaternion);
    }
  }, [currentVehicle, activeMission]);

  // Inner 120+ FPS Simulation Loop
  const SimulationLoop = () => {
    const keyCooldown = useRef({ reset: 0, camera: 0, pause: 0 });
    const telemetryTimer = useRef(0);

    useFrame((_, delta) => {
      if (isPaused) return;

      const dt = Math.min(0.04, Math.max(0.001, delta));
      const inputs = inputManagerRef.current ? inputManagerRef.current.getInputs(dt) : null;
      if (!inputs) return;

      // Hotkey handlers
      keyCooldown.current.reset = Math.max(0, keyCooldown.current.reset - dt);
      keyCooldown.current.camera = Math.max(0, keyCooldown.current.camera - dt);
      keyCooldown.current.pause = Math.max(0, keyCooldown.current.pause - dt);

      if (inputs.resetVehicle && keyCooldown.current.reset <= 0) {
        physicsStateRef.current.position.set(...activeMission.spawnPoint.position);
        const rot = activeMission.spawnPoint.rotation;
        physicsStateRef.current.quaternion.setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2]));
        physicsStateRef.current.velocity.set(0, 0, -(activeMission.spawnPoint.initialSpeed || 0) / 3.6);
        physicsStateRef.current.angularVelocity.set(0, 0, 0);
        soundSystem.playClick();
        keyCooldown.current.reset = 0.6;
      }

      if (inputs.switchCamera && keyCooldown.current.camera <= 0) {
        cycleCameraMode();
        soundSystem.playClick();
        keyCooldown.current.camera = 0.4;
      }

      if (inputs.pause && keyCooldown.current.pause <= 0) {
        setPaused(true);
        soundSystem.playClick();
        keyCooldown.current.pause = 0.4;
      }

      // Physics Integration
      const state = physicsStateRef.current;
      if (currentVehicle.category === 'jet' && physicsRef.current instanceof FlightPhysics) {
        physicsRef.current.update(state, inputs, dt, settings.flightStabilizer);
        soundSystem.updateJet(state.throttle, state.afterburner, state.velocity.length() * 3.6);
      } else if (currentVehicle.category === 'helicopter' && physicsRef.current instanceof HelicopterPhysics) {
        physicsRef.current.update(state, inputs, dt, settings.hoverAssistDefault);
        soundSystem.updateHelicopter(state.throttle, state.engineRpm);
      } else if (currentVehicle.category === 'car' && physicsRef.current instanceof CarPhysics) {
        const carPhys = physicsRef.current as CarPhysics;
        carPhys.update(state, inputs, dt, settings.tractionControlDefault);
        soundSystem.updateCar(state.engineRpm, inputs.throttleAxis, state.driftSlip);
      }

      // Update 3D Vehicle Transform directly in WebGL memory
      if (vehicleGroupRef.current) {
        vehicleGroupRef.current.position.copy(state.position);
        vehicleGroupRef.current.quaternion.copy(state.quaternion);
      }
      vehiclePosRef.current.copy(state.position);

      // Throttled HUD Telemetry Updates (20 Hz)
      telemetryTimer.current += dt;
      if (telemetryTimer.current >= 0.05) {
        telemetryTimer.current = 0;

        const euler = new THREE.Euler().setFromQuaternion(state.quaternion, 'YXZ');
        const headingDeg = (euler.y * (180 / Math.PI)) % 360;
        const pitchDeg = euler.x * (180 / Math.PI);
        const rollDeg = euler.z * (180 / Math.PI);
        const speedKmh = state.velocity.length() * 3.6;

        setTelemetry({
          speedKmh,
          speedKnots: speedKmh * 0.539957,
          speedMph: speedKmh * 0.621371,
          altitudeM: state.position.y,
          altitudeFt: state.position.y * 3.28084,
          posX: state.position.x,
          posZ: state.position.z,
          verticalSpeedMs: state.verticalSpeed,
          throttlePercent: state.throttle * 100,
          rpmPercent: state.engineRpm,
          gear: state.currentGear,
          headingDeg,
          pitchDeg,
          rollDeg,
          gForce: state.gForce,
          afterburnerActive: state.afterburner,
          landingGearDown: state.landingGear,
          hoverAssistActive: state.hoverAssist,
          tractionControlActive: state.tractionControl,
          driftAngleDeg: state.driftAngleDeg,
          isGrounded: state.isGrounded,
          isStalling: state.stallRatio > 0.4,
          engineRpm: state.engineRpm
        });
      }
    });

    return null;
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950">
      {/* 3D WebGL Canvas */}
      <Canvas
        shadows={settings.shadows}
        dpr={[1, 1.5]}
        camera={{ position: [0, 10, 25], fov: settings.fov, near: 0.1, far: 8000 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <SimulationLoop />

        <CameraController
          physicsStateRef={physicsStateRef}
          category={currentVehicle.category}
          cameraMode={cameraMode}
          baseFov={settings.fov}
        />

        <World vehiclePosRef={vehiclePosRef} />

        {/* The Player's Vehicle Rig */}
        <group ref={vehicleGroupRef}>
          <VehicleRenderer
            vehicle={currentVehicle}
            colors={currentColors}
            telemetry={telemetry}
            isCockpitView={cameraMode === 'cockpit'}
          />
        </group>
      </Canvas>

      {/* In-Game HUD Overlays */}
      {currentVehicle.category === 'jet' && (
        <JetHud telemetry={telemetry} units={settings.units} scale={settings.hudScale} />
      )}
      {currentVehicle.category === 'helicopter' && (
        <HelicopterHud telemetry={telemetry} units={settings.units} scale={settings.hudScale} />
      )}
      {currentVehicle.category === 'car' && (
        <CarHud telemetry={telemetry} units={settings.units} scale={settings.hudScale} />
      )}

      {/* Mission Objectives & Time Overlay */}
      <MissionHud />

      {/* Minimap Navigation Radar */}
      <Minimap />

      {/* HUD Quick Camera & Reset Controls */}
      <div className="absolute top-6 right-48 flex items-center space-x-2 pointer-events-auto">
        <button
          onClick={() => {
            soundSystem.playClick();
            cycleCameraMode();
          }}
          className="glass-panel px-3 py-1.5 rounded-lg border border-cyan-500/30 hover:border-cyan-400 text-xs font-hud text-cyan-300 hover:text-white transition-all shadow-md flex items-center space-x-1.5"
        >
          <span>CAM [C]:</span>
          <span className="font-bold text-white uppercase">{cameraMode}</span>
        </button>

        <button
          onClick={() => {
            soundSystem.playClick();
            setPaused(true);
          }}
          className="glass-panel px-3 py-1.5 rounded-lg border border-cyan-500/30 hover:border-cyan-400 text-xs font-hud text-cyan-300 hover:text-white transition-all shadow-md"
        >
          PAUSE [ESC]
        </button>
      </div>

      {/* Pause Menu Modal */}
      {isPaused && (
        <PauseMenu
          onResume={() => setPaused(false)}
          onResetVehicle={() => {
            physicsStateRef.current.position.set(...activeMission.spawnPoint.position);
            const rot = activeMission.spawnPoint.rotation;
            physicsStateRef.current.quaternion.setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2]));
            physicsStateRef.current.velocity.set(0, 0, -(activeMission.spawnPoint.initialSpeed || 0) / 3.6);
            physicsStateRef.current.angularVelocity.set(0, 0, 0);
            if (vehicleGroupRef.current) {
              vehicleGroupRef.current.position.copy(physicsStateRef.current.position);
              vehicleGroupRef.current.quaternion.copy(physicsStateRef.current.quaternion);
            }
            setPaused(false);
          }}
        />
      )}
    </div>
  );
};
