import * as THREE from 'three';

export interface VehiclePhysicsState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  quaternion: THREE.Quaternion;
  angularVelocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  isGrounded: boolean;
  throttle: number; // 0 to 1
  steer: number;    // -1 to 1
  pitchInput: number; // -1 to 1
  rollInput: number;  // -1 to 1
  yawInput: number;   // -1 to 1
  brake: number;      // 0 to 1
  handbrake: boolean;
  afterburner: boolean;
  landingGear: boolean; // true = extended, false = retracted
  hoverAssist: boolean;
  tractionControl: boolean;
  currentGear: number;
  engineRpm: number;
  driftSlip: number;
  driftAngleDeg: number;
  damagePercent: number;
  verticalSpeed: number;
  gForce: number;
  stallRatio: number; // 0 = normal, 1 = full stall
}

export interface ControlInputs {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  yawLeft: boolean;
  yawRight: boolean;
  pitchUp: boolean;
  pitchDown: boolean;
  rollLeft: boolean;
  rollRight: boolean;
  throttleUp: boolean;
  throttleDown: boolean;
  handbrake: boolean;
  boost: boolean;
  gearToggle: boolean;
  hoverToggle: boolean;
  resetVehicle: boolean;
  switchCamera: boolean;
  pause: boolean;
  // Analog values from gamepad (or smoothed keyboard)
  steeringAxis: number;
  throttleAxis: number;
  brakeAxis: number;
  pitchAxis: number;
  rollAxis: number;
  yawAxis: number;
}
