import { VehicleDefinition } from '../types/vehicle';

export const VEHICLE_CATALOG: VehicleDefinition[] = [
  // --- JETS ---
  {
    id: 'f22_raptor',
    name: 'F-22 RAPTOR',
    subtitle: 'Air Dominance Multirole Fighter',
    category: 'jet',
    modelVariant: 'multirole',
    unlockedByDefault: true,
    specs: {
      topSpeed: 2410, // km/h (Mach 2.25)
      acceleration: 96,
      handling: 94,
      massKg: 19700,
      powerHpOrKn: '2x 156 kN Thrust',
      flightCeilingM: 20000,
      description: '5th-generation stealth air superiority fighter with thrust vectoring, supercruise capability, and unmatched pitch agility.'
    },
    defaultColors: {
      primary: '#374151', // Dark graphite
      secondary: '#1f2937',
      accent: '#06b6d4', // Cyan neon accents
      wheelsOrRotor: '#111827',
      neon: '#06b6d4',
      finish: 'metallic'
    }
  },
  {
    id: 'f35_lightning',
    name: 'F-35A LIGHTNING II',
    subtitle: 'Next-Gen Stealth Multirole',
    category: 'jet',
    modelVariant: 'stealth',
    unlockedByDefault: true,
    specs: {
      topSpeed: 1960, // km/h (Mach 1.6)
      acceleration: 88,
      handling: 86,
      massKg: 13200,
      powerHpOrKn: '1x 191 kN Thrust',
      flightCeilingM: 15200,
      description: 'All-weather stealth combat aircraft engineered for precision sensor fusion and high internal payload capacity.'
    },
    defaultColors: {
      primary: '#1e293b',
      secondary: '#0f172a',
      accent: '#38bdf8',
      wheelsOrRotor: '#0f172a',
      neon: '#38bdf8',
      finish: 'matte'
    }
  },
  {
    id: 'su57_felon',
    name: 'SU-57 FELON',
    subtitle: 'Super-Maneuverable Interceptor',
    category: 'jet',
    modelVariant: 'interceptor',
    unlockedByDefault: true,
    specs: {
      topSpeed: 2600, // km/h
      acceleration: 98,
      handling: 99,
      massKg: 18500,
      powerHpOrKn: '2x 176 kN Thrust',
      flightCeilingM: 20000,
      description: 'Heavy tactical fighter capable of extreme post-stall angles of attack and Pugachev Cobra maneuvers.'
    },
    defaultColors: {
      primary: '#334155',
      secondary: '#475569',
      accent: '#f59e0b',
      wheelsOrRotor: '#1e293b',
      neon: '#f59e0b',
      finish: 'metallic'
    }
  },
  {
    id: 'aurora_sr91',
    name: 'SR-91 AURORA',
    subtitle: 'Experimental Hypersonic Scramjet',
    category: 'jet',
    modelVariant: 'experimental',
    unlockedByDefault: true,
    specs: {
      topSpeed: 4200, // km/h (Mach 3.5+)
      acceleration: 99,
      handling: 78,
      massKg: 28000,
      powerHpOrKn: 'Pulse Detonation Hybrid',
      flightCeilingM: 30000,
      description: 'Black-project delta-wing atmospheric research platform with scramjet propulsion and extreme edge-of-space velocity.'
    },
    defaultColors: {
      primary: '#090d16',
      secondary: '#1e1e24',
      accent: '#ef4444',
      wheelsOrRotor: '#05070a',
      neon: '#ef4444',
      finish: 'carbon'
    }
  },

  // --- HELICOPTERS ---
  {
    id: 'ah64_apache',
    name: 'AH-64D GUARDIAN',
    subtitle: 'Tandem Cockpit Attack Helicopter',
    category: 'helicopter',
    modelVariant: 'attack',
    unlockedByDefault: true,
    specs: {
      topSpeed: 293, // km/h
      acceleration: 90,
      handling: 92,
      massKg: 5160,
      powerHpOrKn: '2x 1890 shp Turboshaft',
      flightCeilingM: 6400,
      description: 'Twin-turboshaft attack helicopter featuring target acquisition sensors, stub wings, and aggressive low-altitude cyclic response.'
    },
    defaultColors: {
      primary: '#1c1917',
      secondary: '#292524',
      accent: '#10b981',
      wheelsOrRotor: '#111827',
      neon: '#10b981',
      finish: 'matte'
    }
  },
  {
    id: 'uh60_blackhawk',
    name: 'UH-60M VALKYRIE',
    subtitle: 'Tactical Utility Transport',
    category: 'helicopter',
    modelVariant: 'utility',
    unlockedByDefault: true,
    specs: {
      topSpeed: 280, // km/h
      acceleration: 84,
      handling: 85,
      massKg: 5675,
      powerHpOrKn: '2x 1994 shp Turboshaft',
      flightCeilingM: 5790,
      description: 'Four-blade, twin-engine medium-lift utility helicopter built for rock-solid stability and heavy sling load transport.'
    },
    defaultColors: {
      primary: '#1e293b',
      secondary: '#334155',
      accent: '#06b6d4',
      wheelsOrRotor: '#0f172a',
      neon: '#06b6d4',
      finish: 'gloss'
    }
  },
  {
    id: 'ch47_chinook',
    name: 'CH-47F TITAN',
    subtitle: 'Heavy Tandem-Rotor Transport',
    category: 'helicopter',
    modelVariant: 'heavy',
    unlockedByDefault: true,
    specs: {
      topSpeed: 315, // km/h
      acceleration: 75,
      handling: 72,
      massKg: 11150,
      powerHpOrKn: '2x 4733 shp Turboshaft',
      flightCeilingM: 6100,
      description: 'Massive tandem-rotor heavy-lift aircraft with dual counter-rotating rotors providing exceptional high-altitude lift capability.'
    },
    defaultColors: {
      primary: '#27272a',
      secondary: '#3f3f46',
      accent: '#f97316',
      wheelsOrRotor: '#18181b',
      neon: '#f97316',
      finish: 'matte'
    }
  },

  // --- CARS ---
  {
    id: 'venom_gt',
    name: 'APEX VENOM GT',
    subtitle: 'Twin-Turbocharged Hypercar',
    category: 'car',
    modelVariant: 'hypercar',
    unlockedByDefault: true,
    specs: {
      topSpeed: 435, // km/h
      acceleration: 99,
      handling: 91,
      massKg: 1244,
      powerHpOrKn: '1244 HP V8 Bi-Turbo',
      description: 'Carbon-fiber lightweight monocoque hypercar designed to break land-speed records with active aerodynamics.'
    },
    defaultColors: {
      primary: '#0284c7', // Radiant Blue
      secondary: '#0f172a',
      accent: '#38bdf8',
      wheelsOrRotor: '#e2e8f0', // Silver wheels
      neon: '#0284c7',
      finish: 'gloss'
    }
  },
  {
    id: 'gt3_rs',
    name: 'NEBULA GT3 TRACK',
    subtitle: 'Naturally Aspirated Track Weapon',
    category: 'car',
    modelVariant: 'sport',
    unlockedByDefault: true,
    specs: {
      topSpeed: 296, // km/h
      acceleration: 94,
      handling: 98,
      massKg: 1430,
      powerHpOrKn: '525 HP 4.0L Boxer',
      description: 'Circuit-focused homologation special with razor-sharp steering, swan-neck rear wing, and competition suspension.'
    },
    defaultColors: {
      primary: '#dc2626', // Racing Red
      secondary: '#171717',
      accent: '#ffffff',
      wheelsOrRotor: '#ffd700', // Gold wheels
      neon: '#ef4444',
      finish: 'metallic'
    }
  },
  {
    id: 'defender_apex',
    name: 'DAKAR APEX 4X4',
    subtitle: 'All-Terrain Trophy Trophy Truck',
    category: 'car',
    modelVariant: 'offroad',
    unlockedByDefault: true,
    specs: {
      topSpeed: 210, // km/h
      acceleration: 82,
      handling: 79,
      massKg: 2150,
      powerHpOrKn: '600 HP Supercharged V8',
      description: 'Baja-tested rally raid truck with massive suspension travel, locking differentials, and high-traction beadlock tires.'
    },
    defaultColors: {
      primary: '#d97706', // Desert Amber
      secondary: '#292524',
      accent: '#facc15',
      wheelsOrRotor: '#1c1917',
      neon: '#d97706',
      finish: 'matte'
    }
  }
];

export const PRESET_LIVERIES = [
  { name: 'Factory Stealth', primary: '#1e293b', secondary: '#0f172a', accent: '#06b6d4', neon: '#06b6d4', finish: 'matte' as const },
  { name: 'Cyber Cyan', primary: '#082f49', secondary: '#0c4a6e', accent: '#22d3ee', neon: '#06b6d4', finish: 'metallic' as const },
  { name: 'Apex Racing', primary: '#b91c1c', secondary: '#18181b', accent: '#ffffff', neon: '#ef4444', finish: 'gloss' as const },
  { name: 'Desert Camo', primary: '#78350f', secondary: '#451a03', accent: '#fbbf24', neon: '#f59e0b', finish: 'matte' as const },
  { name: 'Carbon Black', primary: '#18181b', secondary: '#09090b', accent: '#a1a1aa', neon: '#ffffff', finish: 'carbon' as const },
  { name: 'Electric Emerald', primary: '#064e3b', secondary: '#022c22', accent: '#34d399', neon: '#10b981', finish: 'metallic' as const },
];
