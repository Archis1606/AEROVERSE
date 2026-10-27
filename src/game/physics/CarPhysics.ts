import * as THREE from 'three';
import { ControlInputs, VehiclePhysicsState } from '../../types/physics';
import { VehicleDefinition } from '../../types/vehicle';
import { collisionSystem } from './CollisionSystem';

export class CarPhysics {
  private def: VehicleDefinition;

  // Wheel orientation & visual outputs
  public wheelSteerAngle: number = 0;
  public wheelRotationAngle: number = 0;

  // Gear transmission ratios (6-speed + reverse)
  private gearRatios = [3.6, 2.4, 1.8, 1.3, 1.0, 0.8];
  private finalDrive = 3.5;
  private currentGear = 1;
  private engineRpm = 1000;

  // Reusable vectors
  private forward = new THREE.Vector3();
  private right = new THREE.Vector3();
  private up = new THREE.Vector3();
  private tempVec = new THREE.Vector3();

  constructor(def: VehicleDefinition) {
    this.def = def;
  }

  public update(
    state: VehiclePhysicsState,
    inputs: ControlInputs,
    dt: number,
    tractionControlEnabled: boolean = true
  ) {
    dt = Math.min(0.05, Math.max(0.001, dt));

    // Orientation vectors
    this.forward.set(0, 0, -1).applyQuaternion(state.quaternion);
    this.right.set(1, 0, 0).applyQuaternion(state.quaternion);
    this.up.set(0, 1, 0).applyQuaternion(state.quaternion);

    // Speed metrics
    const forwardSpeed = state.velocity.dot(this.forward);
    const lateralSpeed = state.velocity.dot(this.right);
    const speedKmh = Math.abs(forwardSpeed) * 3.6;

    // Steering with high-speed attenuation for realistic stability
    const maxSteerAngle = 0.55; // ~31 degrees at low speed
    const steerSpeedFactor = 1.0 / (1.0 + speedKmh * 0.015);
    const targetSteer = inputs.steeringAxis * maxSteerAngle * steerSpeedFactor;
    this.wheelSteerAngle += (targetSteer - this.wheelSteerAngle) * Math.min(1, dt * 14);

    // Drivetrain & Gears
    const isReversing = inputs.backward && forwardSpeed < 1.0 && !inputs.forward;
    if (isReversing) {
      this.currentGear = -1;
    } else {
      // Automatic transmission logic based on forward speed
      if (speedKmh < 45) this.currentGear = 1;
      else if (speedKmh < 85) this.currentGear = 2;
      else if (speedKmh < 135) this.currentGear = 3;
      else if (speedKmh < 195) this.currentGear = 4;
      else if (speedKmh < 265) this.currentGear = 5;
      else this.currentGear = 6;
    }

    state.currentGear = this.currentGear;

    // Calculate Engine RPM
    const wheelRadius = 0.35; // meters
    const wheelRps = Math.abs(forwardSpeed) / (2 * Math.PI * wheelRadius);
    const gearRatio = this.currentGear === -1 ? 3.2 : this.gearRatios[this.currentGear - 1];
    const targetRpm = Math.max(900, Math.min(8800, wheelRps * 60 * gearRatio * this.finalDrive));
    
    // Rev up faster when throttle is applied
    const throttle = inputs.throttleAxis;
    const idleOrThrottle = Math.max(throttle * 2500, targetRpm);
    this.engineRpm += (idleOrThrottle - this.engineRpm) * Math.min(1, dt * 10);
    state.engineRpm = this.engineRpm;

    // Acceleration Force
    const hp = parseFloat(this.def.specs.powerHpOrKn) || 600;
    const peakTorque = (hp * 745.7) / (5500 * (2 * Math.PI / 60)); // Newton-meters
    let driveForce = 0;

    if (inputs.forward) {
      driveForce = (peakTorque * gearRatio * this.finalDrive) / wheelRadius;
      if (inputs.boost) driveForce *= 1.45; // Nitrous / boost
    } else if (inputs.backward) {
      if (forwardSpeed > 2.0) {
        // Braking while moving forward
        driveForce = -15000; // Strong disc brakes
      } else {
        // Reverse acceleration
        driveForce = -(peakTorque * 3.2 * this.finalDrive * 0.7) / wheelRadius;
      }
    }

    // Traction Control System (TCS) prevents excessive wheel spin
    if (tractionControlEnabled && Math.abs(driveForce) > 18000 && speedKmh < 30) {
      driveForce *= 0.75;
      state.tractionControl = true;
    } else {
      state.tractionControl = false;
    }

    // Handbrake: breaks rear tire grip and induces drift
    state.handbrake = inputs.handbrake;
    let lateralFrictionCoeff = 0.95; // High grip
    if (state.handbrake) {
      lateralFrictionCoeff = 0.38; // Drift slip
      state.driftSlip = 0.9;
    } else {
      // Normal tire lateral slip curve
      state.driftSlip = Math.min(1.0, Math.abs(lateralSpeed) / 12.0);
    }

    // Aerodynamic Drag & Rolling Resistance
    const airDragCoeff = 0.34;
    const frontalArea = 2.1;
    const aeroDrag = 0.5 * 1.225 * airDragCoeff * frontalArea * forwardSpeed * forwardSpeed;
    const rollingResistance = 0.015 * this.def.specs.massKg * 9.81;
    const totalResistance = (aeroDrag + rollingResistance) * Math.sign(forwardSpeed);

    // Net Longitudinal Force
    const netDriveForce = driveForce - totalResistance;
    const mass = this.def.specs.massKg;
    const longitudinalAcc = netDriveForce / mass;

    // Cornering Yaw Force & Countersteer
    const corneringStiffness = 3.6 * (this.def.specs.handling / 50);
    let yawAcc = -this.wheelSteerAngle * forwardSpeed * corneringStiffness;

    // Drift yaw boost when handbrake is yanked while cornering
    if (state.handbrake && Math.abs(this.wheelSteerAngle) > 0.05) {
      yawAcc += Math.sign(this.wheelSteerAngle) * 6.5;
    }

    // Integrate Angular Yaw
    state.angularVelocity.y += yawAcc * dt;
    state.angularVelocity.y *= (state.handbrake ? 0.92 : 0.82); // Damping

    // Rotate vehicle quaternion horizontally
    const yawDelta = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      state.angularVelocity.y * dt
    );
    state.quaternion.multiply(yawDelta).normalize();

    // Wheel rotation animation (radians)
    const deltaDistance = forwardSpeed * dt;
    this.wheelRotationAngle += deltaDistance / wheelRadius;

    // Update Velocity Vector
    // Lateral velocity damped by tire grip
    const newForwardSpeed = forwardSpeed + longitudinalAcc * dt;
    const newLateralSpeed = lateralSpeed * (1.0 - (lateralFrictionCoeff * dt * 14));

    // Reconstruct velocity vector in world space
    state.velocity.set(0, 0, 0);
    state.velocity.addScaledVector(this.forward, newForwardSpeed);
    state.velocity.addScaledVector(this.right, newLateralSpeed);

    // Ground Contact & Terrain Height
    const surface = collisionSystem.getSurfaceAt(state.position.x, state.position.z, state.position.y);
    state.surfaceType = surface.surfaceType;
    const carGroundHeight = surface.elevation + 0.85;
    state.position.y = carGroundHeight; // Stay firmly grounded on roads and terrain
    state.isGrounded = true;

    // Building collision prevention
    collisionSystem.resolveBuildingCollision(state.position, state.velocity, 2.5);

    state.position.addScaledVector(state.velocity, dt);

    // Telemetry updates
    state.driftAngleDeg = Math.atan2(Math.abs(lateralSpeed), Math.max(0.1, Math.abs(forwardSpeed))) * (180 / Math.PI);
    state.gForce = 1.0 + Math.abs(lateralSpeed * state.angularVelocity.y) / 9.81;
    state.verticalSpeed = 0;
  }
}
