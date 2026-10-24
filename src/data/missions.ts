import { MissionDefinition } from '../types/mission';

export const MISSION_CATALOG: MissionDefinition[] = [
  // --- FREE FLIGHT / DRIVE ---
  {
    id: 'free_roam',
    title: 'FREE EXPLORATION',
    subtitle: 'Open Sandbox World',
    description: 'Freely explore the island, airport, highways, mountain ranges, and city airspace with no time limit or restrictions.',
    type: 'exploration',
    allowedCategory: 'any',
    targetTimeSec: 0,
    goldTimeSec: 0,
    silverTimeSec: 0,
    spawnPoint: {
      position: [0, 2, 200], // Airport runway
      rotation: [0, 0, 0],
      initialSpeed: 0
    },
    checkpoints: []
  },

  // --- JET / FLIGHT MISSIONS ---
  {
    id: 'flight_school_takeoff',
    title: 'FLIGHT SCHOOL: AIRBORNE BASICS',
    subtitle: 'Takeoff, Climb & Navigation',
    description: 'Apply full military throttle on Runway 09, rotate at 200 km/h, climb through the coastal navigation waypoints, and maintain steady level flight.',
    type: 'flight_school',
    allowedCategory: 'jet',
    targetTimeSec: 90,
    goldTimeSec: 45,
    silverTimeSec: 65,
    spawnPoint: {
      position: [0, 2, 450], // Runway start
      rotation: [0, 0, 0],
      initialSpeed: 0
    },
    checkpoints: [
      { id: 'cp_1', position: [0, 20, 200], radius: 25, type: 'ring' },
      { id: 'cp_2', position: [0, 60, -100], radius: 30, type: 'ring' },
      { id: 'cp_3', position: [100, 120, -500], radius: 35, type: 'ring' },
      { id: 'cp_4', position: [300, 180, -900], radius: 40, type: 'ring' },
      { id: 'cp_5', position: [600, 220, -1300], radius: 45, type: 'ring' },
    ]
  },
  {
    id: 'jet_stunt_rings',
    title: 'SUPERSONIC CANYON SLALOM',
    subtitle: 'Aerobatic Ring Trial',
    description: 'Maneuver through high-speed aerobatic gates weaving between mountain peaks, downtown towers, and low-altitude bridges.',
    type: 'time_trials',
    allowedCategory: 'jet',
    targetTimeSec: 120,
    goldTimeSec: 55,
    silverTimeSec: 75,
    spawnPoint: {
      position: [0, 180, 800],
      rotation: [0, 0, 0],
      initialSpeed: 180
    },
    checkpoints: [
      { id: 'ring_1', position: [0, 150, 400], radius: 25, type: 'ring' },
      { id: 'ring_2', position: [-250, 120, 0], radius: 25, type: 'ring' },
      { id: 'ring_3', position: [-450, 90, -400], radius: 25, type: 'ring' },
      { id: 'ring_4', position: [-200, 110, -800], radius: 25, type: 'ring' },
      { id: 'ring_5', position: [200, 140, -1000], radius: 25, type: 'ring' },
      { id: 'ring_6', position: [500, 80, -600], radius: 25, type: 'ring' },
      { id: 'ring_7', position: [200, 50, -200], radius: 25, type: 'ring' },
    ]
  },
  {
    id: 'runway_landing_challenge',
    title: 'PRECISION RUNWAY TOUCHDOWN',
    subtitle: 'Instrument Approach & Flare',
    description: 'Line up on final approach to Runway 09, deploy landing gear [G], throttle down to flare speed, and touch down smoothly in the green touchdown zone.',
    type: 'landing_challenge',
    allowedCategory: 'jet',
    targetTimeSec: 80,
    goldTimeSec: 35,
    silverTimeSec: 50,
    spawnPoint: {
      position: [0, 120, 1200], // Final approach
      rotation: [0, 0, 0],
      initialSpeed: 100
    },
    checkpoints: [
      { id: 'glide_1', position: [0, 80, 800], radius: 25, type: 'gate' },
      { id: 'glide_2', position: [0, 40, 400], radius: 20, type: 'gate' },
      { id: 'touchdown_zone', position: [0, 2, -100], radius: 18, type: 'runway_box' },
    ]
  },

  // --- HELICOPTER MISSIONS ---
  {
    id: 'heli_rooftop_precision',
    title: 'SKYLINE ROOFTOP HOP',
    subtitle: 'Urban Helipad Precision',
    description: 'Take off from the airport apron, climb to skyscraper rooftop level, hover steadily, and touch down accurately on 3 designated rooftop helipads.',
    type: 'landing_challenge',
    allowedCategory: 'helicopter',
    targetTimeSec: 150,
    goldTimeSec: 70,
    silverTimeSec: 100,
    spawnPoint: {
      position: [80, 2, 250],
      rotation: [0, 0, 0],
      initialSpeed: 0
    },
    checkpoints: [
      { id: 'heli_cp1', position: [150, 70, 0], radius: 15, type: 'helipad' },
      { id: 'heli_cp2', position: [-200, 110, -350], radius: 15, type: 'helipad' },
      { id: 'heli_cp3', position: [-500, 140, -700], radius: 15, type: 'helipad' },
    ]
  },

  // --- CAR MISSIONS ---
  {
    id: 'car_time_trial_circuit',
    title: 'APEX TEST TRACK TIME TRIAL',
    subtitle: 'High-Speed Precision Lap',
    description: 'Push your vehicle to its limits around the high-speed asphalt circuit. Brake into hairpins, countersteer drifts, and nail apexes to set the record.',
    type: 'time_trials',
    allowedCategory: 'car',
    targetTimeSec: 90,
    goldTimeSec: 42,
    silverTimeSec: 55,
    spawnPoint: {
      position: [-100, 1.2, 300],
      rotation: [0, Math.PI, 0],
      initialSpeed: 0
    },
    checkpoints: [
      { id: 'lap_1', position: [-100, 1.5, 100], radius: 12, type: 'gate' },
      { id: 'lap_2', position: [-150, 1.5, -200], radius: 12, type: 'gate' },
      { id: 'lap_3', position: [-350, 1.5, -300], radius: 14, type: 'gate' },
      { id: 'lap_4', position: [-500, 1.5, -100], radius: 14, type: 'gate' },
      { id: 'lap_5', position: [-400, 1.5, 200], radius: 12, type: 'gate' },
      { id: 'lap_finish', position: [-100, 1.5, 300], radius: 14, type: 'gate' },
    ]
  },
  {
    id: 'car_driving_school_slalom',
    title: 'DRIVING SCHOOL: SLALOM & DRIFT',
    subtitle: 'Traction & Countersteering',
    description: 'Weave through the airport service slalom gates, utilize the handbrake to initiate controlled slides, and stop in the terminal stop-box.',
    type: 'driving_school',
    allowedCategory: 'car',
    targetTimeSec: 60,
    goldTimeSec: 28,
    silverTimeSec: 38,
    spawnPoint: {
      position: [50, 1.2, 500],
      rotation: [0, 0, 0],
      initialSpeed: 0
    },
    checkpoints: [
      { id: 'slalom_1', position: [30, 1.5, 350], radius: 10, type: 'gate' },
      { id: 'slalom_2', position: [70, 1.5, 220], radius: 10, type: 'gate' },
      { id: 'slalom_3', position: [30, 1.5, 100], radius: 10, type: 'gate' },
      { id: 'slalom_4', position: [70, 1.5, -20], radius: 10, type: 'gate' },
      { id: 'slalom_finish', position: [50, 1.5, -150], radius: 12, type: 'runway_box' },
    ]
  }
];
