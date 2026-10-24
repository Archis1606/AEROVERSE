import * as THREE from 'three';
import { VehicleCategory } from './vehicle';

export type MissionType = 'flight_school' | 'driving_school' | 'time_trials' | 'landing_challenge' | 'exploration';

export interface Checkpoint {
  id: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  radius: number;
  type: 'ring' | 'gate' | 'helipad' | 'runway_box';
  requiredSpeed?: number;
}

export interface MissionDefinition {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  type: MissionType;
  allowedCategory: VehicleCategory | 'any';
  targetTimeSec: number;
  goldTimeSec: number;
  silverTimeSec: number;
  spawnPoint: {
    position: [number, number, number];
    rotation: [number, number, number];
    initialSpeed?: number;
  };
  checkpoints: Checkpoint[];
}

export interface MissionRecord {
  missionId: string;
  bestTimeSec: number;
  completedAt: string;
  medal: 'gold' | 'silver' | 'bronze' | 'none';
}
