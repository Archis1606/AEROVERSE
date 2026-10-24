import * as THREE from 'three';
import { ControlInputs, VehiclePhysicsState } from '../../types/physics';
import { VehicleDefinition } from '../../types/vehicle';

export class HelicopterPhysics {
  private def: VehicleDefinition;

  // Reusable vectors
  private rotorShaft = new THREE.Vector3();
  private forward = new THREE.Vector3();
  private right = new THREE.Vector3();
  private tempVec = new THREE.Vector3();
  private angularAcc = new THREE.Vector3();

  // Rotor dynamics
  private rotorRpmRatio: number = 1.0;
  private hoverAssistCooldown: number = 0;

  constructor(def: VehicleDefinition) {
    this.def = def;
  }

  public update(
    state: VehiclePhysicsState,
    inputs: ControlInputs,
    dt: number,
    assistEnabled: boolean = true
  ) {
    dt = Math.min(0.05, Math.max(0.001, dt));

    // Toggle hover assist
    this.hoverAssistCooldown = Math.max(0, this.hoverAssistCooldown - dt);
    if (inputs.hoverToggle && this.hoverAssistCooldown <= 0) {
      state.hoverAssist = !state.hoverAssist;
      this.hoverAssistCooldown = 0.5;
    }

    // Extract orientation vectors
    this.rotorShaft.set(0, 1, 0).applyQuaternion(state.quaternion); // Up direction of main rotor mast
    this.forward.set(0, 0, -1).applyQuaternion(state.quaternion);
    this.right.set(1, 0, 0).applyQuaternion(state.quaternion);

    // Collective control (Thrust up/down along rotor shaft)
    const collectiveRate = 0.4;
    if (inputs.throttleAxis > 0.1) {
      state.throttle = Math.min(1.0, state.throttle + collectiveRate * dt);
    } else if (inputs.throttleAxis < -0.1) {
      state.throttle = Math.max(0.0, state.throttle - collectiveRate * dt);
    }

    // Rotor RPM spools up smoothly to ~100%
    this.rotorRpmRatio += (1.0 - this.rotorRpmRatio) * Math.min(1, dt * 1.5);
    state.engineRpm = this.rotorRpmRatio * 100;

    const mass = this.def.specs.massKg;
    const gravityNewtons = mass * 9.81;

    // Ground effect lift multiplier (cushion of air within 1 rotor diameter ~8m)
    let groundEffect = 1.0;
    if (state.position.y < 8.0) {
      const h = Math.max(1.0, state.position.y);
      groundEffect = 1.0 + 0.35 * (1.0 - (h / 8.0));
    }

    // Collective rotor thrust: neutral collective (~0.5) generates exactly 1.0G hover thrust
    // Max collective (1.0) gives 1.7G climb. Min collective (0.0) gives descent.
    const hoverCollective = 0.48;
    const maxThrust = gravityNewtons * 1.75;
    const currentRotorThrust = (state.throttle / hoverCollective) * gravityNewtons * this.rotorRpmRatio * groundEffect;

    const liftForce = this.tempVec.copy(this.rotorShaft).multiplyScalar(currentRotorThrust);

    // Aerodynamic fuselage drag (opposes velocity vector)
    const speed = state.velocity.length();
    const dragCoeff = 0.65;
    const dragForce = state.velocity.clone().multiplyScalar(-dragCoeff * speed * 25);

    // Total forces
    const totalForce = new THREE.Vector3();
    totalForce.add(liftForce);
    totalForce.add(new THREE.Vector3(0, -gravityNewtons, 0));
    totalForce.add(dragForce);

    // Linear Acceleration
    const linearAcc = totalForce.divideScalar(mass);

    // Cyclic and Anti-Torque Yaw Inputs
    const cyclicPitchSpeed = 2.4;
    const cyclicRollSpeed = 2.4;
    const yawSpeed = 2.0;

    this.angularAcc.set(0, 0, 0);

    // Cyclic Pitch: pushes nose down/up
    this.angularAcc.x += inputs.pitchAxis * cyclicPitchSpeed;
    // Cyclic Roll: banks left/right
    this.angularAcc.z += -inputs.rollAxis * cyclicRollSpeed;
    // Tail Rotor Anti-Torque Yaw
    this.angularAcc.y += -inputs.yawAxis * yawSpeed;

    // Hover Assist / Auto-Stabilization
    const isHoverAssist = state.hoverAssist && assistEnabled;
    if (isHoverAssist) {
      // Auto-level pitch and roll when controls are neutral
      if (Math.abs(inputs.pitchAxis) < 0.05) {
        const pitchTilt = -this.forward.y;
        this.angularAcc.x += pitchTilt * 3.5;
      }
      if (Math.abs(inputs.rollAxis) < 0.05) {
        const rollTilt = this.right.y;
        this.angularAcc.z += -rollTilt * 3.5;
      }
      // Auto vertical velocity dampener when collective is neutral
      if (Math.abs(inputs.throttleAxis) < 0.1 && state.position.y > 3.0) {
        linearAcc.y -= state.velocity.y * 1.5;
      }
    }

    // Angular Damping
    const angularDamping = 0.90;
    state.angularVelocity.addScaledVector(this.angularAcc, dt);
    state.angularVelocity.multiplyScalar(angularDamping);

    // Local delta rotation
    const localDelta = new THREE.Quaternion();
    const rotEuler = new THREE.Euler(
      state.angularVelocity.x * dt,
      state.angularVelocity.y * dt,
      state.angularVelocity.z * dt,
      'ZYX'
    );
    localDelta.setFromEuler(rotEuler);
    state.quaternion.multiply(localDelta).normalize();

    // Integrate Velocity & Position
    state.velocity.addScaledVector(linearAcc, dt);

    // Landing Skid Ground Contact
    const skidGroundHeight = 1.8;
    if (state.position.y <= skidGroundHeight) {
      state.position.y = skidGroundHeight;
      state.isGrounded = true;

      if (state.velocity.y < 0) state.velocity.y = 0;

      // Skid friction against ground
      state.velocity.x *= 0.92;
      state.velocity.z *= 0.92;

      // Level out attitude on ground
      state.angularVelocity.x *= 0.7;
      state.angularVelocity.z *= 0.7;
    } else {
      state.isGrounded = false;
    }

    state.position.addScaledVector(state.velocity, dt);

    state.verticalSpeed = state.velocity.y;
    state.gForce = 1.0 + (liftForce.length() - gravityNewtons) / gravityNewtons;
  }
}
