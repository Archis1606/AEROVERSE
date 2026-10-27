import React, { useRef, useEffect } from 'react';
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
  sensitivity?: number;
}

export const CameraController: React.FC<CameraControllerProps> = ({
  physicsStateRef,
  category,
  cameraMode,
  baseFov,
  sensitivity = 1.0
}) => {
  const { camera, gl } = useThree();

  // Reusable vectors
  const currentPos = useRef(new THREE.Vector3(0, 10, 25));
  const currentTarget = useRef(new THREE.Vector3(0, 0, 0));
  const desiredPos = useRef(new THREE.Vector3());
  const desiredTarget = useRef(new THREE.Vector3());

  const forward = useRef(new THREE.Vector3());
  const up = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());

  // ---- RIGHT-CLICK MOUSE-LOOK STATE ----
  // Stored as Spherical offsets from the vehicle, orbiting around it.
  // Yaw = horizontal orbit; Pitch = vertical elevation angle.
  const isRightMouseDown = useRef(false);
  const mouseLookYaw = useRef(0);      // radians, horizontal orbit angle
  const mouseLookPitch = useRef(0.15); // radians, vertical look angle
  const prevMouseX = useRef(0);
  const prevMouseY = useRef(0);

  // Cockpit look pivot (separate from orbit)
  const cockpitYaw = useRef(0);
  const cockpitPitch = useRef(0);

  useEffect(() => {
    const canvas = gl.domElement;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2) {
        isRightMouseDown.current = true;
        prevMouseX.current = e.clientX;
        prevMouseY.current = e.clientY;
        // Prevent text selection during drag
        e.preventDefault();
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 2) {
        isRightMouseDown.current = false;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isRightMouseDown.current) return;

      const dx = e.clientX - prevMouseX.current;
      const dy = e.clientY - prevMouseY.current;
      prevMouseX.current = e.clientX;
      prevMouseY.current = e.clientY;

      const sensFactor = 0.004 * sensitivity;

      if (cameraMode === 'cockpit') {
        // Cockpit look: rotate view pivot, NOT the vehicle
        cockpitYaw.current -= dx * sensFactor;
        cockpitPitch.current -= dy * sensFactor;
        // Clamp pitch: -70° to +85°
        cockpitPitch.current = Math.max(-1.22, Math.min(1.48, cockpitPitch.current));
        // Clamp yaw: ±150° (can't look behind through cockpit structure)
        cockpitYaw.current = Math.max(-2.62, Math.min(2.62, cockpitYaw.current));
      } else {
        // Orbit camera: spin around vehicle
        mouseLookYaw.current -= dx * sensFactor;
        mouseLookPitch.current -= dy * sensFactor;
        // Clamp pitch: don't let camera go below vehicle or above zenith
        mouseLookPitch.current = Math.max(-0.3, Math.min(1.3, mouseLookPitch.current));
      }
    };

    // Suppress context menu only on the gameplay canvas
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Release mouse lock if window loses focus
    const handleBlur = () => {
      isRightMouseDown.current = false;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('blur', handleBlur);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('blur', handleBlur);
    };
  }, [gl.domElement, cameraMode, sensitivity]);

  // Reset cockpit look when switching to cockpit; reset orbit when leaving cockpit
  const prevCameraMode = useRef(cameraMode);
  useEffect(() => {
    if (cameraMode === 'cockpit' && prevCameraMode.current !== 'cockpit') {
      cockpitYaw.current = 0;
      cockpitPitch.current = 0;
    }
    prevCameraMode.current = cameraMode;
  }, [cameraMode]);

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

    // Dynamic FOV
    const perspectiveCam = camera as THREE.PerspectiveCamera;
    const speedFovBoost = Math.min(22, (speedKmh / 200) * 12);
    perspectiveCam.fov = THREE.MathUtils.lerp(perspectiveCam.fov, baseFov + speedFovBoost, dt * 4);
    perspectiveCam.updateProjectionMatrix();

    if (cameraMode === 'cockpit') {
      // Cockpit View with mouse-look pivot
      let eyeOffset = new THREE.Vector3(0, 0.9, -1.2);
      if (category === 'helicopter') eyeOffset.set(0, 0.95, -1.5);
      if (category === 'car') eyeOffset.set(-0.35, 0.85, -0.3);

      eyeOffset.applyQuaternion(vehicleQuat);
      desiredPos.current.copy(vehiclePos).add(eyeOffset);

      // Compute look direction using cockpit yaw/pitch offsets applied in vehicle local space
      // First: get vehicle forward direction
      const lookForward = forward.current.clone();
      // Apply cockpit yaw around world-up (so looking left/right doesn't tilt)
      const yawQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), cockpitYaw.current);
      // Apply cockpit pitch around vehicle's local right axis
      const pitchQuat = new THREE.Quaternion().setFromAxisAngle(right.current.clone().normalize(), cockpitPitch.current);
      lookForward.applyQuaternion(yawQuat).applyQuaternion(pitchQuat).normalize();

      desiredTarget.current.copy(desiredPos.current).addScaledVector(lookForward, 40);

      currentPos.current.lerp(desiredPos.current, Math.min(1, dt * 25));
      currentTarget.current.lerp(desiredTarget.current, Math.min(1, dt * 25));

    } else if (cameraMode === 'chase') {
      let dist = 14;
      let height = 4.2;
      if (category === 'helicopter') { dist = 18; height = 6.0; }
      else if (category === 'car') { dist = 7.5; height = 2.4; }

      const dynamicDist = dist + Math.min(10, speed * 0.12);

      // Compute orbit position using mouse-look yaw/pitch
      // Base offset is directly behind vehicle, then rotated by mouse yaw/pitch
      const baseOffset = new THREE.Vector3(0, height, dynamicDist);
      // Rotate by vehicle heading first, then by mouse yaw offset (world up)
      const vehicleYaw = new THREE.Euler().setFromQuaternion(vehicleQuat, 'YXZ').y;
      const totalYaw = vehicleYaw + mouseLookYaw.current;
      const orbitQuat = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(mouseLookPitch.current, totalYaw, 0, 'YXZ')
      );
      const offsetDir = new THREE.Vector3(0, 0, 1).applyQuaternion(orbitQuat);

      desiredPos.current.copy(vehiclePos).addScaledVector(offsetDir, dynamicDist);
      desiredPos.current.y = Math.max(vehiclePos.y + 1.5, desiredPos.current.y);

      // Always look at the vehicle
      desiredTarget.current.copy(vehiclePos).addScaledVector(forward.current, 3);

      const smoothSpeed = category === 'car' ? 14 : 9;
      currentPos.current.lerp(desiredPos.current, Math.min(1, dt * smoothSpeed));
      currentTarget.current.lerp(desiredTarget.current, Math.min(1, dt * smoothSpeed));

    } else if (cameraMode === 'close') {
      let dist = 8;
      let height = 2.8;
      if (category === 'car') { dist = 5.2; height = 1.7; }

      const vehicleYaw = new THREE.Euler().setFromQuaternion(vehicleQuat, 'YXZ').y;
      const totalYaw = vehicleYaw + mouseLookYaw.current;
      const orbitQuat = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(mouseLookPitch.current * 0.6, totalYaw, 0, 'YXZ')
      );
      const offsetDir = new THREE.Vector3(0, 0, 1).applyQuaternion(orbitQuat);

      desiredPos.current.copy(vehiclePos).addScaledVector(offsetDir, dist);
      desiredPos.current.y = Math.max(vehiclePos.y + 0.5, desiredPos.current.y);
      desiredTarget.current.copy(vehiclePos);

      currentPos.current.lerp(desiredPos.current, Math.min(1, dt * 18));
      currentTarget.current.lerp(desiredTarget.current, Math.min(1, dt * 18));

    } else if (cameraMode === 'cinematic') {
      // Cinematic Low Side Panning Angle — mouse yaw shifts side angle
      const cosY = Math.cos(mouseLookYaw.current);
      const sinY = Math.sin(mouseLookYaw.current);
      const sideOffset = right.current.clone().multiplyScalar(12 * cosY).addScaledVector(forward.current.clone().negate(), 8 * Math.abs(sinY));
      desiredPos.current
        .copy(vehiclePos)
        .add(sideOffset)
        .add(new THREE.Vector3(0, 2.5 + mouseLookPitch.current * 4, 0));

      desiredTarget.current.copy(vehiclePos);

      currentPos.current.lerp(desiredPos.current, Math.min(1, dt * 6));
      currentTarget.current.lerp(desiredTarget.current, Math.min(1, dt * 6));

    } else if (cameraMode === 'orbit') {
      // Full free orbit — fully mouse-driven
      const vehicleYaw = new THREE.Euler().setFromQuaternion(vehicleQuat, 'YXZ').y;
      const totalYaw = vehicleYaw + mouseLookYaw.current;
      const pitchClamped = Math.max(-0.3, Math.min(1.4, mouseLookPitch.current));
      const orbitDist = 20;

      const orbitQuat = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(pitchClamped, totalYaw, 0, 'YXZ')
      );
      const offsetDir = new THREE.Vector3(0, 0, 1).applyQuaternion(orbitQuat);

      desiredPos.current.copy(vehiclePos).addScaledVector(offsetDir, orbitDist);
      desiredTarget.current.copy(vehiclePos);

      currentPos.current.lerp(desiredPos.current, Math.min(1, dt * 8));
      currentTarget.current.lerp(desiredTarget.current, Math.min(1, dt * 8));
    }

    camera.position.copy(currentPos.current);
    camera.lookAt(currentTarget.current);
  });

  return null;
};
