export type CameraMode = 'cockpit' | 'chase' | 'close' | 'cinematic' | 'orbit';
export type SpeedUnit = 'kmh' | 'mph' | 'knots';
export type GraphicsQuality = 'ultra' | 'high' | 'medium' | 'low';
export type TimeOfDay = 'day' | 'sunset' | 'night';
export type WeatherPreset = 'clear' | 'foggy' | 'overcast';

export interface KeyBindingsMap {
  // Car
  carAccelerate: string;
  carBrake: string;
  carSteerLeft: string;
  carSteerRight: string;
  carHandbrake: string;
  carBoost: string;
  // Jet
  jetPitchDown: string;
  jetPitchUp: string;
  jetRollLeft: string;
  jetRollRight: string;
  jetYawLeft: string;
  jetYawRight: string;
  jetThrottleUp: string;
  jetThrottleDown: string;
  jetAfterburner: string;
  jetLandingGear: string;
  // Helicopter
  heliPitchForward: string;
  heliPitchBack: string;
  heliRollLeft: string;
  heliRollRight: string;
  heliYawLeft: string;
  heliYawRight: string;
  heliCollectiveUp: string;
  heliCollectiveDown: string;
  heliHoverAssist: string;
  // Common
  cameraSwitch: string;
  resetVehicle: string;
  pauseGame: string;
}

export interface UserSettings {
  graphics: GraphicsQuality;
  shadows: boolean;
  bloom: boolean;
  fov: number;
  hudScale: number;
  mouseSensitivity: number;
  invertFlightPitch: boolean;
  units: SpeedUnit;
  masterVolume: number;
  engineVolume: number;
  fxVolume: number;
  flightStabilizer: boolean;
  hoverAssistDefault: boolean;
  tractionControlDefault: boolean;
  absDefault: boolean;
  bindings: KeyBindingsMap;
}
