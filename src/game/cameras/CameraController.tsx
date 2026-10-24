import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { CameraMode } from '../../types/settings';
import { VehicleCategory } from '../../types/vehicle';
import { VehiclePhysicsState } from '../../types/physics';

interface CameraControllerProps {
  physicsStateRef: React.MutableRefObject<VehiclePhysicsState>;
  category: VehicleCategory;
  cameraMode: CameraMode;
  baseFov: number;
}

export const CameraController: React.FC<CameraControllerProps> = ({
  physicsStateRef,
  category,
  cameraMode,
  baseFov
}) => {
  const { camera } = useThree();

  // Reusable vectors to avoid allocations
  const currentPos = useRef(new THREE.Vector3(0, 10, 25));
  const currentTarget = useRef(new THREE.Vector3(0, 0, 0));
  const desiredPos = useRef(new THREE.Vector3());
  const desiredTarget = useRef(new THREE.Vector3());

  const forward = useRef(new THREE.Vector3());
  const up = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const dt = Math.min(0.04, Math.max(0.001, delta));
    const state = physicsStateRef.current;
    const vehiclePos = state.position;
    const vehicleQuat = state.quaternion;
    const vehicleVel = state.velocity;

    const speed = vehicleVel.length();
    const speedKmh = speed * 3.6;

    // Extract orientation vectors
    forward.current.set(0, 0, -1).applyQuaternion(vehicleQuat);
    up.current.set(0, 1, 0).applyQuaternion(vehicleQuat);
    right.current.set(1, 0, 0).applyQuaternion(vehicleQuat);

    // Compute dynamic camera FOV (stretches at high speeds for warp sensation)
    const perspectiveCam = camera as THREE.PerspectiveCamera;
    const speedFovBoost = Math.min(22, (speedKmh / 200) * 12);
    perspectiveCam.fov = THREE.MathUtils.lerp(perspectiveCam.fov, baseFov + speedFovBoost, dt * 4);
    perspectiveCam.updateProjectionMatrix();

    if (cameraMode === 'cockpit') {
      // Cockpit View
      let eyeOffset = new THREE.Vector3(0, 0.9, -1.2);
      if (category === 'helicopter') eyeOffset.set(0, 0.95, -1.5);
      if (category === 'car') eyeOffset.set(-0.35, 0.85, -0.3);

      eyeOffset.applyQuaternion(vehicleQuat);
      desiredPos.current.copy(vehiclePos).add(eyeOffset);

      // Look forward along vehicle nose
      desiredTarget.current.copy(desiredPos.current).add(forward.current.clone().multiplyScalar(40));

      currentPos.current.lerp(desiredPos.current, Math.min(1, dt * 25));
      currentTarget.current.lerp(desiredTarget.current, Math.min(1, dt * 25));

    } else if (cameraMode === 'chase') {
      // Third-person Chase Camera (Dynamic follow distance)
      let dist = 14;
      let height = 4.2;

      if (category === 'helicopter') {
        dist = 18;
        height = 6.0;
      } else if (category === 'car') {
        dist = 7.5;
        height = 2.4;
      }

      // Add speed lag distance
      const dynamicDist = dist + Math.min(10, speed * 0.12);

      desiredPos.current
        .copy(vehiclePos)
        .sub(forward.current.clone().multiplyScalar(dynamicDist))
        .add(up.current.clone().multiplyScalar(height));

      desiredTarget.current.copy(vehiclePos).add(forward.current.clone().multiplyScalar(10));

      // Smooth camera interpolation
      const smoothSpeed = category === 'car' ? 14 : 10;
      currentPos.current.lerp(desiredPos.current, Math.min(1, dt * smoothSpeed));
      currentTarget.current.lerp(desiredTarget.current, Math.min(1, dt * smoothSpeed));

    } else if (cameraMode === 'close') {
      // Close Follow Camera
      let dist = 8;
      let height = 2.8;

      if (category === 'car') {
        dist = 5.2;
        height = 1.7;
      }

      desiredPos.current
        .copy(vehiclePos)
        .sub(forward.current.clone().multiplyScalar(dist))
        .add(up.current.clone().multiplyScalar(height));

      desiredTarget.current.copy(vehiclePos).add(forward.current.clone().multiplyScalar(15));

      currentPos.current.lerp(desiredPos.current, Math.min(1, dt * 18));
      currentTarget.current.lerp(desiredTarget.current, Math.min(1, dt * 18));

    } else if (cameraMode === 'cinematic') {
      // Cinematic Low Side Panning Angle
      const sideOffset = right.current.clone().multiplyScalar(12);
      const rearOffset = forward.current.clone().multiplyScalar(-8);
      desiredPos.current
        .copy(vehiclePos)
        .add(sideOffset)
        .add(rearOffset)
        .add(new THREE.Vector3(0, 2.5, 0));

      desiredTarget.current.copy(vehiclePos);

      currentPos.current.lerp(desiredPos.current, Math.min(1, dt * 6));
      currentTarget.current.lerp(desiredTarget.current, Math.min(1, dt * 6));

    } else if (cameraMode === 'orbit') {
      // Orbit / Free Camera
      desiredPos.current.copy(vehiclePos).add(new THREE.Vector3(0, 8, 18));
      desiredTarget.current.copy(vehiclePos);

      currentPos.current.lerp(desiredPos.current, Math.min(1, dt * 8));
      currentTarget.current.lerp(desiredTarget.current, Math.min(1, dt * 8));
    }

    camera.position.copy(currentPos.current);
    camera.lookAt(currentTarget.current);
  });

  return null;
};
