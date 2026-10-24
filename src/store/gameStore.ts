import { create } from 'zustand';
import { VehicleCategory, VehicleColors, VehicleDefinition, VehicleTelemetry } from '../types/vehicle';
import { CameraMode, TimeOfDay, UserSettings, WeatherPreset } from '../types/settings';
import { MissionDefinition, MissionRecord } from '../types/mission';
import { VEHICLE_CATALOG } from '../data/vehicles';
import { MISSION_CATALOG } from '../data/missions';
import { DEFAULT_SETTINGS } from '../data/defaultSettings';

export type AppScreen = 'menu' | 'garage' | 'game' | 'missions' | 'settings' | 'controls' | 'profile';

interface GameStoreState {
  // Navigation
  currentScreen: AppScreen;
  setScreen: (screen: AppScreen) => void;

  // Selected vehicle & customization
  selectedCategory: VehicleCategory;
  selectedVehicleId: string;
  setSelectedCategory: (category: VehicleCategory) => void;
  setSelectedVehicleId: (id: string) => void;
  
  // Customization mapping: vehicleId -> VehicleColors
  vehicleCustomizations: Record<string, VehicleColors>;
  updateVehicleColors: (vehicleId: string, colors: Partial<VehicleColors>) => void;
  resetVehicleColors: (vehicleId: string) => void;

  // Active Mission & Mode
  activeMission: MissionDefinition;
  setActiveMission: (mission: MissionDefinition) => void;
  isMissionRunning: boolean;
  missionStartTime: number;
  currentCheckpointIdx: number;
  missionElapsedTime: number;
  missionResult: { time: number; medal: 'gold' | 'silver' | 'bronze' | 'none'; success: boolean } | null;
  startMission: (mission?: MissionDefinition) => void;
  advanceCheckpoint: () => void;
  completeMission: (success: boolean) => void;
  resetMission: () => void;

  // Game session & environment
  isPaused: boolean;
  setPaused: (paused: boolean) => void;
  cameraMode: CameraMode;
  setCameraMode: (mode: CameraMode) => void;
  cycleCameraMode: () => void;
  timeOfDay: TimeOfDay;
  setTimeOfDay: (time: TimeOfDay) => void;
  weather: WeatherPreset;
  setWeather: (weather: WeatherPreset) => void;

  // Live simulation telemetry (consumed by HUD)
  telemetry: VehicleTelemetry;
  setTelemetry: (telemetry: Partial<VehicleTelemetry>) => void;

  // Settings & Persistent Records
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetSettings: () => void;
  missionRecords: Record<string, MissionRecord>;
  recordMissionScore: (missionId: string, timeSec: number, medal: 'gold' | 'silver' | 'bronze' | 'none') => void;

  // Helper getters
  getCurrentVehicle: () => VehicleDefinition;
  getCurrentColors: () => VehicleColors;
}

const STORAGE_KEYS = {
  SETTINGS: 'aeroverse_settings_v1',
  CUSTOMIZATIONS: 'aeroverse_customizations_v1',
  RECORDS: 'aeroverse_records_v1',
  LAST_VEHICLE: 'aeroverse_last_vehicle_v1'
};

const getStoredSettings = (): UserSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load settings', e);
  }
  return DEFAULT_SETTINGS;
};

const getStoredCustomizations = (): Record<string, VehicleColors> => {
  const initial: Record<string, VehicleColors> = {};
  VEHICLE_CATALOG.forEach(v => {
    initial[v.id] = { ...v.defaultColors };
  });
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMIZATIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...initial, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load customizations', e);
  }
  return initial;
};

const getStoredRecords = (): Record<string, MissionRecord> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load mission records', e);
  }
  return {};
};

const INITIAL_TELEMETRY: VehicleTelemetry = {
  speedKmh: 0,
  speedKnots: 0,
  speedMph: 0,
  altitudeM: 0,
  altitudeFt: 0,
  posX: 0,
  posZ: 0,
  verticalSpeedMs: 0,
  throttlePercent: 0,
  rpmPercent: 0,
  gear: '1',
  headingDeg: 0,
  pitchDeg: 0,
  rollDeg: 0,
  gForce: 1.0,
  afterburnerActive: false,
  landingGearDown: true,
  hoverAssistActive: true,
  tractionControlActive: true,
  driftAngleDeg: 0,
  isGrounded: true,
  isStalling: false,
  damagePercent: 0,
  engineRpm: 1000
};

export const useGameStore = create<GameStoreState>((set, get) => ({
  currentScreen: 'menu',
  setScreen: (screen) => set({ currentScreen: screen }),

  selectedCategory: 'jet',
  selectedVehicleId: 'f22_raptor',
  setSelectedCategory: (category) => {
    // Find first vehicle in this category
    const defaultInCat = VEHICLE_CATALOG.find(v => v.category === category);
    set({
      selectedCategory: category,
      selectedVehicleId: defaultInCat ? defaultInCat.id : get().selectedVehicleId
    });
  },
  setSelectedVehicleId: (id) => {
    const vehicle = VEHICLE_CATALOG.find(v => v.id === id);
    if (vehicle) {
      set({ selectedVehicleId: id, selectedCategory: vehicle.category });
      try {
        localStorage.setItem(STORAGE_KEYS.LAST_VEHICLE, id);
      } catch (e) { /* ignore */ }
    }
  },

  vehicleCustomizations: getStoredCustomizations(),
  updateVehicleColors: (vehicleId, colors) => {
    set(state => {
      const existing = state.vehicleCustomizations[vehicleId] || VEHICLE_CATALOG.find(v => v.id === vehicleId)?.defaultColors;
      const updated = {
        ...state.vehicleCustomizations,
        [vehicleId]: { ...existing, ...colors } as VehicleColors
      };
      try {
        localStorage.setItem(STORAGE_KEYS.CUSTOMIZATIONS, JSON.stringify(updated));
      } catch (e) { /* ignore */ }
      return { vehicleCustomizations: updated };
    });
  },
  resetVehicleColors: (vehicleId) => {
    const def = VEHICLE_CATALOG.find(v => v.id === vehicleId);
    if (def) {
      get().updateVehicleColors(vehicleId, def.defaultColors);
    }
  },

  activeMission: MISSION_CATALOG[0],
  setActiveMission: (mission) => set({ activeMission: mission }),
  isMissionRunning: false,
  missionStartTime: 0,
  currentCheckpointIdx: 0,
  missionElapsedTime: 0,
  missionResult: null,

  startMission: (mission) => {
    const chosenMission = mission || get().activeMission;
    set({
      activeMission: chosenMission,
      isMissionRunning: true,
      missionStartTime: performance.now(),
      currentCheckpointIdx: 0,
      missionElapsedTime: 0,
      missionResult: null,
      isPaused: false
    });
  },
  advanceCheckpoint: () => {
    const { activeMission, currentCheckpointIdx, missionStartTime } = get();
    const nextIdx = currentCheckpointIdx + 1;
    if (nextIdx >= activeMission.checkpoints.length) {
      // Completed all checkpoints!
      const totalTimeSec = (performance.now() - missionStartTime) / 1000;
      let medal: 'gold' | 'silver' | 'bronze' | 'none' = 'none';
      if (activeMission.goldTimeSec > 0 && totalTimeSec <= activeMission.goldTimeSec) medal = 'gold';
      else if (activeMission.silverTimeSec > 0 && totalTimeSec <= activeMission.silverTimeSec) medal = 'silver';
      else medal = 'bronze';

      get().recordMissionScore(activeMission.id, totalTimeSec, medal);
      set({
        currentCheckpointIdx: nextIdx,
        isMissionRunning: false,
        missionElapsedTime: totalTimeSec,
        missionResult: { time: totalTimeSec, medal, success: true }
      });
    } else {
      set({ currentCheckpointIdx: nextIdx });
    }
  },
  completeMission: (success) => {
    const { activeMission, missionStartTime } = get();
    const totalTimeSec = (performance.now() - missionStartTime) / 1000;
    set({
      isMissionRunning: false,
      missionElapsedTime: totalTimeSec,
      missionResult: { time: totalTimeSec, medal: success ? 'bronze' : 'none', success }
    });
  },
  resetMission: () => {
    set({
      isMissionRunning: false,
      missionStartTime: 0,
      currentCheckpointIdx: 0,
      missionElapsedTime: 0,
      missionResult: null
    });
  },

  isPaused: false,
  setPaused: (paused) => set({ isPaused: paused }),
  cameraMode: 'chase',
  setCameraMode: (mode) => set({ cameraMode: mode }),
  cycleCameraMode: () => {
    const modes: CameraMode[] = ['cockpit', 'chase', 'close', 'cinematic', 'orbit'];
    const current = get().cameraMode;
    const nextIdx = (modes.indexOf(current) + 1) % modes.length;
    set({ cameraMode: modes[nextIdx] });
  },

  timeOfDay: 'day',
  setTimeOfDay: (time) => set({ timeOfDay: time }),
  weather: 'clear',
  setWeather: (weather) => set({ weather }),

  telemetry: INITIAL_TELEMETRY,
  setTelemetry: (newTelemetry) => {
    set(state => ({
      telemetry: { ...state.telemetry, ...newTelemetry }
    }));
  },

  settings: getStoredSettings(),
  updateSettings: (newSettings) => {
    set(state => {
      const merged = { ...state.settings, ...newSettings };
      try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
      } catch (e) { /* ignore */ }
      return { settings: merged };
    });
  },
  resetSettings: () => {
    set({ settings: DEFAULT_SETTINGS });
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    } catch (e) { /* ignore */ }
  },

  missionRecords: getStoredRecords(),
  recordMissionScore: (missionId, timeSec, medal) => {
    set(state => {
      const current = state.missionRecords[missionId];
      if (!current || timeSec < current.bestTimeSec) {
        const updated = {
          ...state.missionRecords,
          [missionId]: {
            missionId,
            bestTimeSec: timeSec,
            completedAt: new Date().toLocaleDateString(),
            medal
          }
        };
        try {
          localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(updated));
        } catch (e) { /* ignore */ }
        return { missionRecords: updated };
      }
      return state;
    });
  },

  getCurrentVehicle: () => {
    const id = get().selectedVehicleId;
    return VEHICLE_CATALOG.find(v => v.id === id) || VEHICLE_CATALOG[0];
  },
  getCurrentColors: () => {
    const id = get().selectedVehicleId;
    const custom = get().vehicleCustomizations[id];
    if (custom) return custom;
    const def = VEHICLE_CATALOG.find(v => v.id === id);
    return def ? def.defaultColors : VEHICLE_CATALOG[0].defaultColors;
  }
}));
