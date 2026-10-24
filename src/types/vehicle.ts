export type VehicleCategory = 'jet' | 'helicopter' | 'car';

export type PaintFinish = 'gloss' | 'matte' | 'metallic' | 'carbon';

export interface VehicleColors {
  primary: string;
  secondary: string;
  accent: string;
  wheelsOrRotor: string;
  neon: string;
  finish: PaintFinish;
}

export interface VehicleSpecs {
  topSpeed: number; // km/h (or equivalent)
  acceleration: number; // 0-100 rating 1-100
  handling: number; // rating 1-100
  massKg: number;
  powerHpOrKn: string;
  flightCeilingM?: number;
  description: string;
}

export interface VehicleDefinition {
  id: string;
  name: string;
  subtitle: string;
  category: VehicleCategory;
  specs: VehicleSpecs;
  defaultColors: VehicleColors;
  unlockedByDefault: boolean;
  modelVariant: string;
}

export interface VehicleTelemetry {
  speedKmh: number;
  speedKnots: number;
  speedMph: number;
  altitudeM: number;
  altitudeFt: number;
  posX: number;
  posZ: number;
  verticalSpeedMs: number;
  throttlePercent: number;
  rpmPercent: number;
  gear: number | string;
  headingDeg: number;
  pitchDeg: number;
  rollDeg: number;
  gForce: number;
  afterburnerActive: boolean;
  landingGearDown: boolean;
  hoverAssistActive: boolean;
  tractionControlActive: boolean;
  driftAngleDeg: number;
  isGrounded: boolean;
  isStalling: boolean;
  damagePercent: number;
  engineRpm: number;
}
