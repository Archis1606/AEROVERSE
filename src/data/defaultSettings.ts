import { UserSettings } from '../types/settings';

export const DEFAULT_SETTINGS: UserSettings = {
  graphics: 'high',
  shadows: true,
  bloom: true,
  fov: 70,
  hudScale: 1.0,
  mouseSensitivity: 1.0,
  invertFlightPitch: false,
  units: 'kmh',
  masterVolume: 0.8,
  engineVolume: 0.75,
  fxVolume: 0.8,
  flightStabilizer: true,
  hoverAssistDefault: true,
  tractionControlDefault: true,
  absDefault: true,
  bindings: {
    // Car
    carAccelerate: 'KeyW',
    carBrake: 'KeyS',
    carSteerLeft: 'KeyA',
    carSteerRight: 'KeyD',
    carHandbrake: 'Space',
    carBoost: 'ShiftLeft',
    // Jet
    jetPitchDown: 'KeyW',
    jetPitchUp: 'KeyS',
    jetRollLeft: 'KeyA',
    jetRollRight: 'KeyD',
    jetYawLeft: 'KeyQ',
    jetYawRight: 'KeyE',
    jetThrottleUp: 'ShiftLeft',
    jetThrottleDown: 'ControlLeft',
    jetAfterburner: 'Space',
    jetLandingGear: 'KeyG',
    // Helicopter
    heliPitchForward: 'KeyW',
    heliPitchBack: 'KeyS',
    heliRollLeft: 'KeyA',
    heliRollRight: 'KeyD',
    heliYawLeft: 'KeyQ',
    heliYawRight: 'KeyE',
    heliCollectiveUp: 'ShiftLeft',
    heliCollectiveDown: 'ControlLeft',
    heliHoverAssist: 'KeyH',
    // Common
    cameraSwitch: 'KeyC',
    resetVehicle: 'KeyR',
    pauseGame: 'Escape'
  }
};
