import * as THREE from 'three';
import { ControlInputs, VehiclePhysicsState } from '../../types/physics';
import { VehicleDefinition } from '../../types/vehicle';

export class FlightPhysics {
  private def: VehicleDefinition;

  // Reusable vectors for zero GC overhead
  private forward = new THREE.Vector3();
  private up = new THREE.Vector3();
  private right = new THREE.Vector3();
  private liftDir = new THREE.Vector3();
  private tempVec = new THREE.Vector3();
  private angularAcc = new THREE.Vector3();

  // Landing gear state
  private landingGearState: boolean = true;
  private gearCooldown: number = 0;

  constructor(def: VehicleDefinition) {
    this.def = def;
  }

  public update(
    state: VehiclePhysicsState,
    inputs: ControlInputs,
    dt: number,
    assistEnabled: boolean = true
  ) {
    dt = Math.min(0.04, Math.max(0.001, dt)); // Stable clamped timestep

    // Toggle landing gear (G key)
    this.gearCooldown = Math.max(0, this.gearCooldown - dt);
    if (inputs.gearToggle && this.gearCooldown <= 0) {
      this.landingGearState = !this.landingGearState;
      state.landingGear = this.landingGearState;
      this.gearCooldown = 0.5;
    }

    // Extract orientation vectors from quaternion
    this.forward.set(0, 0, -1).applyQuaternion(state.quaternion);
    this.up.set(0, 1, 0).applyQuaternion(state.quaternion);
    this.right.set(1, 0, 0).applyQuaternion(state.quaternion);

    // Throttle & Afterburner Controls
    // Also allow forward key (W) on runway to accelerate throttle
    const throttleRate = 0.6;
    if (inputs.throttleAxis > 0.1 || (state.isGrounded && inputs.forward)) {
      state.throttle = Math.min(1.0, state.throttle + throttleRate * dt);
    } else if (inputs.throttleAxis < -0.1) {
      state.throttle = Math.max(0.0, state.throttle - throttleRate * dt);
    }

    // Boost / Afterburner (Space)
    state.afterburner = inputs.boost;
    if (state.afterburner && state.throttle < 0.9) {
      state.throttle = Math.min(1.0, state.throttle + 1.2 * dt);
    }

    // Velocity metrics
    const speed = state.velocity.length();
    const speedKmh = speed * 3.6;
    const forwardSpeed = state.velocity.dot(this.forward);

    // Atmospheric dynamic pressure
    const airDensity = 1.225 * Math.exp(-Math.max(0, state.position.y) / 8500);
    const dynamicPressure = 0.5 * airDensity * (speed * speed);

    // Control authority: full authority once rolling > 60 km/h
    const controlAuthority = Math.min(1.0, Math.max(0.2, speed / 40));

    // Calculate Angle of Attack (AoA)
    let aoa = 0;
    if (speed > 8) {
      const velDir = this.tempVec.copy(state.velocity).normalize();
      const dotFwd = Math.max(-1, Math.min(1, velDir.dot(this.forward)));
      aoa = Math.acos(dotFwd);
      // Positive AoA when aircraft nose is pitched up relative to velocity vector
      if (velDir.dot(this.up) < 0) aoa = -aoa;
    }

    // Add wing incidence angle (camber gives lift even at 0 pitch)
    const effectiveAoA = aoa + 0.05; // ~2.9 degrees incidence

    // Stall calculation: stall when AoA > 26 degrees or speed < 70 km/h in mid-air
    const stallAngleRad = 0.45; // ~26 degrees
    const isStalling = Math.abs(aoa) > stallAngleRad || (speed < 20 && !state.isGrounded && state.position.y > 10);
    state.stallRatio = isStalling ? Math.min(1.0, (Math.abs(aoa) - stallAngleRad) / 0.2 + 0.3) : 0;

    // Aerodynamic Lift Coefficient: C_L curve
    let liftCoeff = 3.6 * effectiveAoA;
    if (Math.abs(aoa) > stallAngleRad) {
      liftCoeff *= 0.35; // Post-stall decay
    }
    liftCoeff = Math.max(-1.5, Math.min(2.5, liftCoeff));

    // Mass and Gravity
    const mass = this.def.specs.massKg;
    const gravityForce = new THREE.Vector3(0, -9.81 * mass, 0);

    // Aerodynamic Lift Force: Aligned with aircraft UP vector
    // Calibrated so takeoff occurs smoothly around 160-180 km/h when pitching up
    const wingArea = 72; // m^2
    const liftScale = 0.72;
    const liftMagnitude = dynamicPressure * wingArea * liftCoeff * liftScale;
    this.liftDir.copy(this.up).multiplyScalar(liftMagnitude);

    // Engine Thrust Force
    // F-22 has 2x 156 kN = 312 kN thrust (dry) and 450 kN with afterburner
    const baseThrustKn = parseFloat(this.def.specs.powerHpOrKn) || 160;
    let thrustN = state.throttle * baseThrustKn * 1200;
    if (state.afterburner) thrustN *= 1.7; // Afterburner multiplier

    const thrustForce = this.tempVec.copy(this.forward).multiplyScalar(thrustN);

    // Aerodynamic Drag Force (Parasitic + Induced + Gear Drag)
    const gearDrag = state.landingGear ? 0.04 : 0.01;
    const inducedDrag = (liftCoeff * liftCoeff) / (Math.PI * 3.8);
    const dragCoeff = 0.018 + inducedDrag + gearDrag;
    const dragN = dynamicPressure * wingArea * dragCoeff * 0.45;
    const dragForce = state.velocity.clone().normalize().multiplyScalar(-dragN);

    // Total Net Aerodynamic Forces
    const totalForce = new THREE.Vector3();
    totalForce.add(thrustForce);
    totalForce.add(this.liftDir);
    totalForce.add(dragForce);
    totalForce.add(gravityForce);

    // Linear Acceleration
    const linearAcc = totalForce.divideScalar(mass);

    // Angular Torques (Pitch, Roll, Yaw)
    // Pulling stick back (inputs.pitchUp / S key) rotates nose UP
    const pitchRate = (this.def.specs.handling / 50) * 2.2 * controlAuthority;
    const rollRate = (this.def.specs.handling / 50) * 3.8 * controlAuthority;
    const yawRate = (this.def.specs.handling / 50) * 1.2 * controlAuthority;

    this.angularAcc.set(0, 0, 0);

    // Pitch: inputs.pitchAxis is negative for pitch up (S key)
    this.angularAcc.x += inputs.pitchAxis * pitchRate;
    // Roll
    this.angularAcc.z += -inputs.rollAxis * rollRate;
    // Yaw
    this.angularAcc.y += -inputs.yawAxis * yawRate;

    // Flight Stabilizer: auto-level wings when roll input is released
    if (assistEnabled && Math.abs(inputs.rollAxis) < 0.05 && speed > 25) {
      const bankAngle = Math.atan2(this.right.y, this.up.y);
      this.angularAcc.z += bankAngle * 1.8;
    }

    // Angular damping
    const angularDamping = 0.92;
    state.angularVelocity.addScaledVector(this.angularAcc, dt);
    state.angularVelocity.multiplyScalar(angularDamping);

    // Apply rotation
    const rotEuler = new THREE.Euler(
      state.angularVelocity.x * dt,
      state.angularVelocity.y * dt,
      state.angularVelocity.z * dt,
      'ZYX'
    );
    const localDelta = new THREE.Quaternion().setFromEuler(rotEuler);
    state.quaternion.multiply(localDelta).normalize();

    // Integrate linear velocity
    state.velocity.addScaledVector(linearAcc, dt);

    // Ground Contact & Runway Interaction
    const groundHeight = 2.0;
    if (state.position.y <= groundHeight) {
      state.position.y = groundHeight;

      // Check if aircraft has enough upward lift/velocity to take off
      const verticalForceNet = totalForce.y;
      const isPitchingUp = this.forward.y > 0.03;

      if (speedKmh > 130 && (isPitchingUp || verticalForceNet > 0)) {
        // Takeoff transition: allow vertical climb!
        state.isGrounded = false;
        if (state.velocity.y < 2) {
          state.velocity.y = Math.max(state.velocity.y, (speedKmh / 160) * 6.0);
        }
      } else {
        // Firmly rolling on ground
        state.isGrounded = true;
        if (state.velocity.y < 0) state.velocity.y = 0;

        // Ground roll friction
        let groundFriction = 0.996;
        if (state.throttle < 0.1 || inputs.backward) {
          groundFriction = 0.95; // Brakes
        }
        state.velocity.x *= groundFriction;
        state.velocity.z *= groundFriction;

        // On ground, keep pitch bounded to realistic rotation angles (0 to 18 degrees)
        if (this.forward.y < -0.01) {
          // Prevent nose from digging into asphalt
          state.angularVelocity.x *= 0.5;
        }
        // Dampen roll on ground so wings stay level with runway
        state.angularVelocity.z *= 0.6;
      }
    } else {
      state.isGrounded = false;
    }

    // Integrate position
    state.position.addScaledVector(state.velocity, dt);

    // Telemetry updates
    state.verticalSpeed = state.velocity.y;
    state.gForce = 1.0 + (speed * Math.abs(state.angularVelocity.x)) / 9.81;
  }
}
