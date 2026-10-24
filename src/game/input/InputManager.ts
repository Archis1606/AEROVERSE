import { ControlInputs } from '../../types/physics';
import { VehicleCategory } from '../../types/vehicle';
import { KeyBindingsMap } from '../../types/settings';

export class InputManager {
  private activeKeys = new Set<string>();
  private bindings: KeyBindingsMap;
  private category: VehicleCategory = 'jet';
  private invertPitch: boolean = false;
  private enabled: boolean = true;

  // Smoothed analog values
  private currentSteer = 0;
  private currentPitch = 0;
  private currentRoll = 0;
  private currentThrottle = 0;

  constructor(bindings: KeyBindingsMap, category: VehicleCategory, invertPitch = false) {
    this.bindings = bindings;
    this.category = category;
    this.invertPitch = invertPitch;

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onBlur = this.onBlur.bind(this);
  }

  public attach() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
  }

  public detach() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    this.activeKeys.clear();
  }

  public updateConfig(bindings: KeyBindingsMap, category: VehicleCategory, invertPitch: boolean) {
    this.bindings = bindings;
    this.category = category;
    this.invertPitch = invertPitch;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.activeKeys.clear();
    }
  }

  private onKeyDown(e: KeyboardEvent) {
    if (!this.enabled) return;

    // Prevent page scrolling on Space, Arrows, Tab
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault();
    }

    this.activeKeys.add(e.code);
  }

  private onKeyUp(e: KeyboardEvent) {
    this.activeKeys.delete(e.code);
  }

  private onBlur() {
    this.activeKeys.clear();
    this.currentSteer = 0;
    this.currentPitch = 0;
    this.currentRoll = 0;
  }

  public getInputs(dt: number = 0.016): ControlInputs {
    const isKeyDown = (code: string) => this.activeKeys.has(code);

    // Read Gamepad if connected
    const gamepads = typeof navigator.getGamepads === 'function' ? navigator.getGamepads() : [];
    const gp = gamepads.find(g => g && g.connected);

    let gpX = 0;
    let gpY = 0;
    let gpThrottle = 0;
    let gpBrake = 0;
    let gpHandbrake = false;
    let gpBoost = false;

    if (gp) {
      // Standard mapping: Axis 0 = Left Stick X, Axis 1 = Left Stick Y, Axis 2 = Right Stick X, Axis 3 = Right Stick Y
      const deadzone = 0.12;
      const applyDeadzone = (v: number) => Math.abs(v) < deadzone ? 0 : v;

      gpX = applyDeadzone(gp.axes[0] || 0);
      gpY = applyDeadzone(gp.axes[1] || 0);

      // Triggers: buttons[6] (LT), buttons[7] (RT)
      gpBrake = gp.buttons[6]?.value || (gp.buttons[6]?.pressed ? 1 : 0);
      gpThrottle = gp.buttons[7]?.value || (gp.buttons[7]?.pressed ? 1 : 0);
      gpHandbrake = !!gp.buttons[0]?.pressed; // A button
      gpBoost = !!gp.buttons[1]?.pressed;     // B button
    }

    const inputs: ControlInputs = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      yawLeft: false,
      yawRight: false,
      pitchUp: false,
      pitchDown: false,
      rollLeft: false,
      rollRight: false,
      throttleUp: false,
      throttleDown: false,
      handbrake: false,
      boost: false,
      gearToggle: false,
      hoverToggle: false,
      resetVehicle: isKeyDown(this.bindings.resetVehicle),
      switchCamera: isKeyDown(this.bindings.cameraSwitch),
      pause: isKeyDown(this.bindings.pauseGame),
      steeringAxis: 0,
      throttleAxis: 0,
      brakeAxis: 0,
      pitchAxis: 0,
      rollAxis: 0,
      yawAxis: 0
    };

    if (!this.enabled) return inputs;

    const b = this.bindings;

    if (this.category === 'car') {
      inputs.forward = isKeyDown(b.carAccelerate);
      inputs.backward = isKeyDown(b.carBrake);
      inputs.left = isKeyDown(b.carSteerLeft);
      inputs.right = isKeyDown(b.carSteerRight);
      inputs.handbrake = isKeyDown(b.carHandbrake) || gpHandbrake;
      inputs.boost = isKeyDown(b.carBoost) || gpBoost;

      // Smooth steering keyboard
      let targetSteer = 0;
      if (inputs.left) targetSteer -= 1;
      if (inputs.right) targetSteer += 1;
      if (Math.abs(gpX) > 0.05) targetSteer = gpX;

      this.currentSteer += (targetSteer - this.currentSteer) * Math.min(1, dt * 12);
      inputs.steeringAxis = this.currentSteer;

      inputs.throttleAxis = (inputs.forward ? 1 : 0) || gpThrottle;
      inputs.brakeAxis = (inputs.backward ? 1 : 0) || gpBrake;

    } else if (this.category === 'jet') {
      const pitchInvertMult = this.invertPitch ? -1 : 1;
      inputs.pitchDown = isKeyDown(b.jetPitchDown);
      inputs.pitchUp = isKeyDown(b.jetPitchUp);
      inputs.rollLeft = isKeyDown(b.jetRollLeft);
      inputs.rollRight = isKeyDown(b.jetRollRight);
      inputs.yawLeft = isKeyDown(b.jetYawLeft);
      inputs.yawRight = isKeyDown(b.jetYawRight);
      inputs.throttleUp = isKeyDown(b.jetThrottleUp);
      inputs.throttleDown = isKeyDown(b.jetThrottleDown);
      inputs.boost = isKeyDown(b.jetAfterburner) || gpBoost;
      inputs.gearToggle = isKeyDown(b.jetLandingGear);

      let targetPitch = 0;
      if (inputs.pitchDown) targetPitch += 1 * pitchInvertMult; // Nose down
      if (inputs.pitchUp) targetPitch -= 1 * pitchInvertMult;   // Nose up
      if (Math.abs(gpY) > 0.05) targetPitch = gpY * pitchInvertMult;

      let targetRoll = 0;
      if (inputs.rollLeft) targetRoll -= 1;
      if (inputs.rollRight) targetRoll += 1;
      if (Math.abs(gpX) > 0.05) targetRoll = gpX;

      let targetYaw = 0;
      if (inputs.yawLeft) targetYaw -= 1;
      if (inputs.yawRight) targetYaw += 1;

      this.currentPitch += (targetPitch - this.currentPitch) * Math.min(1, dt * 14);
      this.currentRoll += (targetRoll - this.currentRoll) * Math.min(1, dt * 14);

      inputs.pitchAxis = this.currentPitch;
      inputs.rollAxis = this.currentRoll;
      inputs.yawAxis = targetYaw;

      let targetThrottle = 0;
      if (inputs.throttleUp) targetThrottle += 1;
      if (inputs.throttleDown) targetThrottle -= 1;
      inputs.throttleAxis = targetThrottle;

    } else if (this.category === 'helicopter') {
      inputs.pitchDown = isKeyDown(b.heliPitchForward);
      inputs.pitchUp = isKeyDown(b.heliPitchBack);
      inputs.rollLeft = isKeyDown(b.heliRollLeft);
      inputs.rollRight = isKeyDown(b.heliRollRight);
      inputs.yawLeft = isKeyDown(b.heliYawLeft);
      inputs.yawRight = isKeyDown(b.heliYawRight);
      inputs.throttleUp = isKeyDown(b.heliCollectiveUp);
      inputs.throttleDown = isKeyDown(b.heliCollectiveDown);
      inputs.hoverToggle = isKeyDown(b.heliHoverAssist);

      let targetPitch = 0;
      if (inputs.pitchDown) targetPitch += 1; // Tilt forward
      if (inputs.pitchUp) targetPitch -= 1;   // Tilt back
      if (Math.abs(gpY) > 0.05) targetPitch = gpY;

      let targetRoll = 0;
      if (inputs.rollLeft) targetRoll -= 1;
      if (inputs.rollRight) targetRoll += 1;
      if (Math.abs(gpX) > 0.05) targetRoll = gpX;

      let targetYaw = 0;
      if (inputs.yawLeft) targetYaw -= 1;
      if (inputs.yawRight) targetYaw += 1;

      this.currentPitch += (targetPitch - this.currentPitch) * Math.min(1, dt * 10);
      this.currentRoll += (targetRoll - this.currentRoll) * Math.min(1, dt * 10);

      inputs.pitchAxis = this.currentPitch;
      inputs.rollAxis = this.currentRoll;
      inputs.yawAxis = targetYaw;

      let targetCollective = 0;
      if (inputs.throttleUp) targetCollective += 1;
      if (inputs.throttleDown) targetCollective -= 1;
      inputs.throttleAxis = targetCollective;
    }

    return inputs;
  }
}
