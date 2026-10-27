import * as THREE from 'three';
import { ControlInputs, VehiclePhysicsState } from '../../types/physics';
import { VehicleDefinition } from '../../types/vehicle';
import { collisionSystem } from './CollisionSystem';

export class FlightPhysics {
  private def: VehicleDefinition;

  // Reusable vectors for zero GC overhead
  private forward = new THREE.Vector3();
  private up = new THREE.Vector3();
  private right = new THREE.Vector3();
  private liftForce = new THREE.Vector3();
  private dragForce = new THREE.Vector3();
  private thrustForce = new THREE.Vector3();
  private gravityForce = new THREE.Vector3();
  private totalForce = new THREE.Vector3();
  private tempVec = new THREE.Vector3();
  private invQuat = new THREE.Quaternion();
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
    dt = Math.min(0.04, Math.max(0.001, dt));

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
    // Support throttle axis (Shift/Ctrl) or pitch/forward on runway
    const throttleRate = 0.7;
    if (inputs.throttleAxis > 0.1 || (state.isGrounded && (inputs.pitchDown || inputs.forward))) {
      state.throttle = Math.min(1.0, state.throttle + throttleRate * dt);
    } else if (inputs.throttleAxis < -0.1) {
      state.throttle = Math.max(0.0, state.throttle - throttleRate * dt);
    }

    // Boost / Afterburner (Space)
    state.afterburner = inputs.boost;
    if (state.afterburner) {
      state.throttle = Math.min(1.0, state.throttle + 1.5 * dt);
    }

    // Velocity & Airspeed metrics
    const speed = state.velocity.length();
    const speedKmh = speed * 3.6;

    // Atmospheric dynamic pressure (air density drops with altitude)
    const altitude = Math.max(0, state.position.y);
    const airDensity = 1.225 * Math.exp(-altitude / 8500);
    const dynamicPressure = 0.5 * airDensity * (speed * speed);

    // Control authority: scales with dynamic pressure / airspeed
    const controlAuthority = Math.min(1.2, Math.max(0.25, speed / 45));

    // Calculate local velocity for true Angle of Attack (AoA) and sideslip (Beta)
    this.invQuat.copy(state.quaternion).invert();
    const localVel = this.tempVec.copy(state.velocity).applyQuaternion(this.invQuat);
    
    // In local space: nose is -Z, roof is +Y, right wing is +X
    // Angle of Attack (AoA): positive when airflow hits underside of wings
    let aoaRad = 0;
    if (speed > 5) {
      aoaRad = Math.atan2(-localVel.y, -localVel.z);
    }
    const aoaDeg = aoaRad * (180 / Math.PI);
    state.aoaDeg = aoaDeg;

    // Stall calculation: critical AoA ~ 22 degrees
    const stallAngleRad = 0.384; // ~22 degrees
    const isStalling = Math.abs(aoaRad) > stallAngleRad || (speed < 24 && !state.isGrounded && altitude > 8);
    state.stallRatio = isStalling ? Math.min(1.0, (Math.abs(aoaRad) - stallAngleRad) / 0.18 + 0.3) : 0;

    // Wing specifications
    const mass = this.def.specs.massKg;
    const wingArea = this.def.specs.wingAreaM2 || 75;

    // Aerodynamic Lift Coefficient (CL)
    // Small positive camber lift at AoA = 0
    const cl0 = 0.08;
    let cl = cl0 + 4.8 * aoaRad;
    if (Math.abs(aoaRad) > stallAngleRad) {
      cl = Math.sign(aoaRad) * (1.5 - (Math.abs(aoaRad) - stallAngleRad) * 2.2);
    }
    cl = Math.max(-1.4, Math.min(2.2, cl));

    // Lift Force: acts along aircraft local UP vector
    const liftScale = 0.95;
    const liftMagnitude = dynamicPressure * wingArea * cl * liftScale;
    this.liftForce.copy(this.up).multiplyScalar(liftMagnitude);
    state.liftN = liftMagnitude;

    // Aerodynamic Drag Coefficient (CD): Parasite + Induced + Gear Drag
    const cd0 = 0.019;
    const gearCd = state.landingGear ? 0.038 : 0.005;
    const inducedCd = (cl * cl) / (Math.PI * 3.6);
    const cd = cd0 + inducedCd + gearCd;
    const dragMagnitude = dynamicPressure * wingArea * cd * 0.52;
    if (speed > 0.1) {
      this.dragForce.copy(state.velocity).normalize().multiplyScalar(-dragMagnitude);
    } else {
      this.dragForce.set(0, 0, 0);
    }
    state.dragN = dragMagnitude;

    // Engine Thrust Force
    // Uses dry thrust ratings (e.g. 312 kN for F-22) and afterburner boost (450 kN)
    const dryKn = this.def.specs.thrustDryKn || 200;
    const abKn = this.def.specs.thrustAfterburnerKn || (dryKn * 1.45);
    const maxThrustN = (state.afterburner ? abKn : dryKn) * 1000;
    const currentThrustN = state.throttle * maxThrustN;
    this.thrustForce.copy(this.forward).multiplyScalar(currentThrustN);
    state.thrustN = currentThrustN;

    // Gravity Force
    this.gravityForce.set(0, -9.81 * mass, 0);

    // Sum Total Aerodynamic & Propulsion Forces
    this.totalForce.set(0, 0, 0);
    this.totalForce.add(this.thrustForce);
    this.totalForce.add(this.liftForce);
    this.totalForce.add(this.dragForce);
    this.totalForce.add(this.gravityForce);

    // Linear Acceleration
    const linearAcc = this.totalForce.divideScalar(mass);

    // Angular Torques (Pitch, Roll, Yaw)
    // S key (pitchUp) pulls stick back -> nose pitches UP (positive rotation around X axis)
    // W key (pitchDown) pushes stick forward -> nose pitches DOWN (negative rotation around X axis)
    const handling = this.def.specs.handling || 90;
    const pitchRate = (handling / 50) * 2.4 * controlAuthority;
    const rollRate = (handling / 50) * 3.8 * controlAuthority;
    const yawRate = (handling / 50) * 1.3 * controlAuthority;

    this.angularAcc.set(0, 0, 0);

    // Invert pitch axis from input manager (pitchAxis is negative for pitchUp)
    // We negate it so pitchUp creates POSITIVE torque -> nose rotates UP!
    this.angularAcc.x += -inputs.pitchAxis * pitchRate;
    // Roll
    this.angularAcc.z += -inputs.rollAxis * rollRate;
    // Yaw
    this.angularAcc.y += -inputs.yawAxis * yawRate;

    // Flight Stabilizer: auto-level wings when roll input is released
    if (assistEnabled && Math.abs(inputs.rollAxis) < 0.05 && speed > 25) {
      const bankAngle = Math.atan2(this.right.y, this.up.y);
      this.angularAcc.z += bankAngle * 2.2;
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

    // Collision & Runway Interaction
    const surface = collisionSystem.getSurfaceAt(state.position.x, state.position.z, state.position.y);
    state.surfaceType = surface.surfaceType;

    const gearClearance = 2.0;
    const groundLevel = surface.elevation + gearClearance;

    if (state.position.y <= groundLevel) {
      state.position.y = groundLevel;

      // Check if aircraft has enough vertical climb or lift to become airborne
      // Rotation takeoff: speed > 130 km/h and pulling stick back (pitching up) or net upward force
      const isPitchingUp = this.forward.y > 0.015;
      const verticalForceNet = this.totalForce.y;

      if (speedKmh > 135 && (isPitchingUp || verticalForceNet > 0)) {
        // Smooth liftoff!
        state.isGrounded = false;
        if (state.velocity.y < 2) {
          state.velocity.y = Math.max(state.velocity.y, (speedKmh / 160) * 5.5 * Math.max(0.3, this.forward.y * 8));
        }
      } else {
        // Firmly on ground: rolling down runway or taxiway
        state.isGrounded = true;
        if (state.velocity.y < 0) state.velocity.y = 0;

        // Ground roll friction (low resistance on runway, higher with brakes or off-road)
        let rollFriction = surface.friction;
        if (inputs.backward || (state.throttle < 0.1 && inputs.pitchDown)) {
          rollFriction = 0.94; // Wheel brakes applied
        }
        state.velocity.x *= rollFriction;
        state.velocity.z *= rollFriction;

        // On ground, prevent nose from digging into asphalt
        if (this.forward.y < -0.01) {
          state.angularVelocity.x *= 0.4;
        }
        // Keep wings level with ground while wheels have contact
        state.angularVelocity.z *= 0.55;
      }
    } else {
      state.isGrounded = false;
    }

    // Resolve lateral building collision
    collisionSystem.resolveBuildingCollision(state.position, state.velocity, 4.5);

    // Integrate position
    state.position.addScaledVector(state.velocity, dt);

    // Telemetry updates
    state.verticalSpeed = state.velocity.y;
    state.gForce = 1.0 + (speed * Math.abs(state.angularVelocity.x)) / 9.81;
  }
}
